# -*- coding: utf-8 -*-
"""Engenious - puxa PostHog e grava data.json com granularidade diaria."""
import datetime, json, os, sys, urllib.request

KEY     = os.environ.get("POSTHOG_API_KEY", "")
PROJECT = os.environ.get("POSTHOG_PROJECT_ID", "34225")
DIAS    = int(os.environ.get("JANELA_DIAS", "120"))
HOST    = "https://us.posthog.com"
BOOSTER = "/paths/career-booster"
EVENTOS = "'page_viewed','cta_clicked','registration_started','checkout_started','purchase_completed','lead_created','subscription_started','payment_attempt_failed'"

if not KEY:
    print("POSTHOG_API_KEY nao definida", file=sys.stderr); sys.exit(1)

def q(sql):
    body = json.dumps({"query": {"kind": "HogQLQuery", "query": sql}}).encode()
    req = urllib.request.Request(f"{HOST}/api/projects/{PROJECT}/query/", data=body,
        headers={"Authorization": f"Bearer {KEY}", "Content-Type": "application/json"})
    with urllib.request.urlopen(req, timeout=240) as r:
        d = json.loads(r.read().decode())
    if d.get("error"):
        print("ERRO:", d["error"], file=sys.stderr); return []
    return d.get("results", [])

o = {"janela_dias": DIAS}

# funil do site, por dia e evento
o["site"] = [{"d": str(r[0]), "e": r[1], "p": r[2], "n": r[3]} for r in q(f"""
  SELECT toDate(timestamp) AS d, event, count(DISTINCT person_id) AS p, count() AS n
  FROM events WHERE timestamp > now() - INTERVAL {DIAS} DAY AND event IN ({EVENTOS})
  GROUP BY d, event ORDER BY d LIMIT 50000""")]

# funil da pagina do booster, por dia e evento
o["booster"] = [{"d": str(r[0]), "e": r[1], "p": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, event, count(DISTINCT person_id) AS p
  FROM events WHERE timestamp > now() - INTERVAL {DIAS} DAY
    AND properties.$pathname = '{BOOSTER}' AND event IN ({EVENTOS})
  GROUP BY d, event ORDER BY d LIMIT 50000""")]

# chegadas vindas da Meta, por dia
o["meta"] = [{"d": str(r[0]), "total": r[1], "tag": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, count(DISTINCT person_id) AS t,
         countIf(DISTINCT person_id, properties.utm_source='meta') AS m
  FROM events WHERE event='page_viewed' AND timestamp > now() - INTERVAL {DIAS} DAY
    AND properties.$current_url ILIKE '%fbclid%' GROUP BY d ORDER BY d LIMIT 50000""")]

# dispositivo, por dia
o["disp"] = [{"d": str(r[0]), "tipo": r[1] or "sem dado", "vis": r[2], "ckt": r[3]} for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.$device_type AS t,
         countIf(DISTINCT person_id, event='page_viewed') AS v,
         countIf(DISTINCT person_id, event='checkout_started') AS c
  FROM events WHERE timestamp > now() - INTERVAL {DIAS} DAY
  GROUP BY d, t ORDER BY d LIMIT 50000""")]

# origens, por dia
o["origem"] = [{"d": str(r[0]), "src": r[1] or "(sem etiqueta)", "med": r[2] or "", "p": r[3]} for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.initial_utm_source AS s,
         properties.initial_utm_medium AS m, count(DISTINCT person_id) AS p
  FROM events WHERE event='page_viewed' AND timestamp > now() - INTERVAL {DIAS} DAY
  GROUP BY d, s, m HAVING p > 0 ORDER BY d LIMIT 50000""")]

# paginas, por dia
o["pagina"] = [{"d": str(r[0]), "pg": r[1] or "/", "p": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.$pathname AS pg, count(DISTINCT person_id) AS p
  FROM events WHERE event='page_viewed' AND timestamp > now() - INTERVAL {DIAS} DAY
  GROUP BY d, pg HAVING p >= 3 ORDER BY d LIMIT 50000""")]

# compras, por dia e pais
o["compra"] = [{"d": str(r[0]), "pais": r[1] or "desconhecido", "n": r[2]} for r in q(f"""
  SELECT toDate(timestamp) AS d, properties.$geoip_country_name AS c, count() AS n
  FROM events WHERE event='purchase_completed' AND timestamp > now() - INTERVAL {DIAS} DAY
  GROUP BY d, c ORDER BY d LIMIT 50000""")]

o["atualizado_em"] = datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")

p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "data.json")
json.dump(o, open(p, "w", encoding="utf-8"), ensure_ascii=False, separators=(",", ":"))
print("gravado:", p, os.path.getsize(p), "bytes")
for k, v in o.items():
    if isinstance(v, list): print(f"  {k}: {len(v)} registros")
