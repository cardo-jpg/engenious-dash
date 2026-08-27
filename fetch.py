# -*- coding: utf-8 -*-
"""
Engenious - puxa o PostHog e grava data.json com granularidade diaria.

IMPORTANTE: o projeto do PostHog recebe eventos de varias origens misturadas.
Este script deixa passar SO producao, e registra o que descartou em `descarte`
para a dash poder mostrar o tamanho do lixo em vez de esconder.

O que entra:
  - eventos de navegador com $host = university.engenious.io
  - compras com environment = 'production' e sessao Stripe ao vivo

O que fica de fora, e por que:
  - eventos sem $host  -> nao tem $lib nem geoip; sao servidor/robo, e inflavam
                          a contagem de visitantes em ~8x
  - dev.university.engenious.io -> ambiente de desenvolvimento do time deles
  - environment = local / develop / posthog-dashboard-fixture -> teste e carga historica
  - sessao Stripe cs_test_* -> compra em modo de teste, nao vendeu nada
  - venda com valor zero -> evento incompleto, sem sessao e sem status
"""
import datetime
import json
import os
import sys
import urllib.error
import urllib.request

KEY     = os.environ.get("POSTHOG_API_KEY", "")
PROJECT = os.environ.get("POSTHOG_PROJECT_ID", "34225")
DIAS    = int(os.environ.get("JANELA_DIAS", "120"))
PROD    = os.environ.get("HOST_PRODUCAO", "university.engenious.io")
HOST    = "https://us.posthog.com"
BOOSTER = "/paths/career-booster"
EVENTOS = ("'page_viewed','cta_clicked','registration_started','checkout_started',"
           "'purchase_completed','lead_created','subscription_started','payment_attempt_failed'")

# so navegador, so producao
SO_PROD = f"properties.$host = '{PROD}'"
# so compra de verdade: ambiente de producao e sessao Stripe ao vivo
SO_VENDA = ("properties.environment = 'production' AND NOT "
            "startsWith(coalesce(toString(properties.stripe_checkout_session_id), ''), 'cs_test_')")

if not KEY:
    print("POSTHOG_API_KEY nao definida", file=sys.stderr)
    sys.exit(1)


def q(sql):
    body = json.dumps({"query": {"kind": "HogQLQuery", "query": sql}}).encode()
    req = urllib.request.Request(
        f"{HOST}/api/projects/{PROJECT}/query/", data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=240) as r:
            d = json.loads(r.read().decode())
    except urllib.error.HTTPError as e:
        print("HTTP", e.code, e.read().decode()[:400], file=sys.stderr)
        print("  na consulta:", " ".join(sql.split())[:160], file=sys.stderr)
        return []
    if d.get("error"):
        print("ERRO:", d["error"], file=sys.stderr)
        return []
    return d.get("results", [])


JANELA = f"timestamp > now() - INTERVAL {DIAS} DAY"
o = {"janela_dias": DIAS, "host_producao": PROD}

# ---------- funil do site (producao) ----------
o["site"] = [{"d": str(r[0]), "e": r[1], "p": r[2], "n": r[3]} for r in q(f"""
  SELECT toDate(timestamp) AS d, event, count(DISTINCT person_id) AS p, count() AS n
  FROM events
  WHERE {JANELA} AND event IN ({EVENTOS})
    AND ({SO_PROD} OR (event = 'purchase_completed' AND {SO_VENDA}))
  GROUP BY d, event ORDER BY d LIMIT 50000""")]

# ---------- funil da pagina do booster (producao) ----------
o["booster"] = [{"d": str(r[0]), "e": r[1], "p": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, event, count(DISTINCT person_id) AS p
  FROM events
  WHERE {JANELA} AND {SO_PROD} AND event IN ({EVENTOS})
    AND properties.$current_url LIKE '%{BOOSTER}%'
  GROUP BY d, event ORDER BY d LIMIT 50000""")]

# ---------- chegadas vindas da Meta ----------
o["meta"] = [{"d": str(r[0]), "total": r[1], "tag": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, count(DISTINCT person_id) AS t,
         countIf(DISTINCT person_id, properties.utm_source = 'meta') AS m
  FROM events
  WHERE event = 'page_viewed' AND {JANELA} AND {SO_PROD}
    AND properties.$current_url ILIKE '%fbclid%'
  GROUP BY d ORDER BY d LIMIT 50000""")]

# ---------- dispositivo ----------
o["disp"] = [{"d": str(r[0]), "tipo": r[1] or "sem dado", "vis": r[2], "ckt": r[3]}
             for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.$device_type AS t,
         countIf(DISTINCT person_id, event = 'page_viewed') AS v,
         countIf(DISTINCT person_id, event = 'checkout_started') AS c
  FROM events WHERE {JANELA} AND {SO_PROD}
  GROUP BY d, t ORDER BY d LIMIT 50000""")]

# ---------- origens ----------
o["origem"] = [{"d": str(r[0]), "src": r[1] or "(sem etiqueta)", "med": r[2] or "", "p": r[3]}
               for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.initial_utm_source AS s,
         properties.initial_utm_medium AS m, count(DISTINCT person_id) AS p
  FROM events WHERE event = 'page_viewed' AND {JANELA} AND {SO_PROD}
  GROUP BY d, s, m HAVING p > 0 ORDER BY d LIMIT 50000""")]

# ---------- paginas ----------
o["pagina"] = [{"d": str(r[0]), "pg": r[1] or "/", "p": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.$pathname AS pg, count(DISTINCT person_id) AS p
  FROM events WHERE event = 'page_viewed' AND {JANELA} AND {SO_PROD}
  GROUP BY d, pg HAVING p >= 2 ORDER BY d LIMIT 50000""")]

# ---------- vendas de verdade ----------
# Sao DOIS eventos, nao um:
#   purchase_completed  -> curso avulso (AI Career Accelerator, 2.497 a 3.997)
#   subscription_started -> assinatura, e e ai que mora o Career Booster (299)
# Contar so purchase_completed mostra zero venda do produto que a gente anuncia.
# Eventos com valor zero sao lixo e ficam de fora.
PRODUTO = """multiIf(
  toString(properties.product_key) = 'career_booster', 'Career Booster',
  toString(properties.product_key) = 'ai_accelerator', 'AI Career Accelerator',
  toFloat64OrNull(toString(properties.amount)) BETWEEN 100 AND 500, 'Career Booster',
  toFloat64OrNull(toString(properties.amount)) >= 1000, 'AI Career Accelerator',
  'outro')"""

o["venda"] = [{"d": str(r[0]), "ev": r[1], "produto": r[2],
               "origem": r[3] or "(sem etiqueta)", "meio": r[4] or "",
               "n": r[5], "valor": round(r[6] or 0, 2)} for r in q(f"""
  SELECT toDate(timestamp) AS d, event, {PRODUTO} AS produto,
         properties.latest_utm_source AS origem,
         properties.latest_utm_medium AS meio,
         count() AS n,
         sum(toFloat64OrNull(toString(properties.amount))) AS valor
  FROM events
  WHERE {JANELA} AND event IN ('purchase_completed','subscription_started')
    AND properties.environment = 'production'
    AND toFloat64OrNull(toString(properties.amount)) > 0
    AND NOT startsWith(coalesce(toString(properties.stripe_checkout_session_id), ''), 'cs_test_')
  GROUP BY d, event, produto, origem, meio ORDER BY d LIMIT 50000""")]

# ---------- consentimento: quanto do trafego o PostHog chega a ver ----------
o["consentimento"] = [{"d": str(r[0]), "viu": r[1], "optin": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d,
         countIf(DISTINCT person_id, event = 'page_viewed') AS viu,
         countIf(DISTINCT person_id, event = '$opt_in') AS optin
  FROM events WHERE {JANELA} AND {SO_PROD}
  GROUP BY d ORDER BY d LIMIT 50000""")]

# ---------- o que foi descartado, por dia e motivo ----------
o["descarte"] = [{"d": str(r[0]), "motivo": r[1], "n": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d,
         multiIf(
           isNull(properties.$host), 'sem host (servidor ou robo)',
           properties.$host != '{PROD}', 'ambiente de desenvolvimento',
           'outro') AS motivo,
         count() AS n
  FROM events
  WHERE {JANELA} AND event = 'page_viewed' AND NOT ({SO_PROD})
  GROUP BY d, motivo ORDER BY d LIMIT 50000""")]

o["compra_descartada"] = [{"d": str(r[0]), "motivo": r[1], "n": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d,
         multiIf(
           toFloat64OrNull(toString(properties.amount)) = 0 OR isNull(properties.amount),
             'evento de venda com valor zero',
           startsWith(coalesce(toString(properties.stripe_checkout_session_id), ''), 'cs_test_'),
             'sessao Stripe em modo de teste',
           concat('ambiente ', coalesce(toString(properties.environment), 'sem etiqueta'))
         ) AS motivo,
         count() AS n
  FROM events
  WHERE {JANELA} AND event IN ('purchase_completed','subscription_started')
    AND NOT (properties.environment = 'production'
             AND toFloat64OrNull(toString(properties.amount)) > 0
             AND NOT startsWith(coalesce(toString(properties.stripe_checkout_session_id), ''), 'cs_test_'))
  GROUP BY d, motivo ORDER BY d LIMIT 50000""")]

o["atualizado_em"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
json.dump(o, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("gravado:", p, os.path.getsize(p), "bytes")
for k, v in o.items():
    if isinstance(v, list):
        print(f"  {k}: {len(v)} registros")
