# -*- coding: utf-8 -*-
"""Monta o index.html final: marca os textos do HTML com data-t, injeta o
dicionario EN e substitui o bloco de script pela versao com idioma.

Casa apenas texto entre tags ('>texto<') para nao acertar dentro de atributo -
foi assim que 'Aplicar' quase virou id="btn<span...>Aplicar</span>".
"""
import importlib.util
import json
import sys

BASE = r"C:/Users/eleut/AppData/Local/Temp/claude/c--Users-eleut-claudinho/31a0d411-af2b-4ecc-bf81-605d93b1f84c/scratchpad"
F = BASE + "/repo-dash/index.html"

spec = importlib.util.spec_from_file_location("i18n", BASE + "/i18n_html.py")
mod = importlib.util.module_from_spec(spec)
try:
    spec.loader.exec_module(mod)
except SystemExit:
    pass

# dedup por texto PT: chaves diferentes com o mesmo texto viram uma so
vistos, PARES = {}, []
for chave, pt, en in mod.M:
    if pt in vistos:
        if vistos[pt] != en:
            sys.exit("mesmo texto PT com traducoes diferentes: " + pt[:60])
        continue
    vistos[pt] = en
    PARES.append((chave, pt, en))

s = open(F, encoding="utf-8").read()

dic, faltou, relatorio = {}, [], []
for chave, pt, en in PARES:
    alvo = ">" + pt + "<"
    n = s.count(alvo)
    if n == 0:
        faltou.append((chave, " ".join(pt.split())[:60]))
        continue
    s = s.replace(alvo, '><span data-t="%s">%s</span><' % (chave, pt))
    dic[chave] = en
    relatorio.append((chave, n))

if faltou:
    print("NAO ENCONTRADOS (%d):" % len(faltou), file=sys.stderr)
    for k, t in faltou:
        print("   %-14s %s" % (k, t), file=sys.stderr)
    sys.exit(1)

multiplos = [(k, n) for k, n in relatorio if n > 1]
if multiplos:
    print("chaves com mais de uma ocorrencia (traducao identica em todas):")
    for k, n in multiplos:
        print("   %-14s %dx" % (k, n))

# botao de idioma na nav
assert '<button class="df-apply" id="btnAplicar">' in s, "botao aplicar intacto?"
antes = '</div>\n  </div>\n</nav>'
assert antes in s
s = s.replace(antes, '</div>\n    <button class="btlang" id="btLang">EN</button>\n  </div>\n</nav>', 1)

s = s.replace('/* ---------- SEÇÕES ---------- */',
""".btlang{font-family:var(--mono);font-size:.66rem;font-weight:700;letter-spacing:.1em;
   background:var(--surface);border:1px solid var(--line);border-radius:20px;color:var(--ink-2);
   padding:8px 13px;cursor:pointer;transition:.15s;margin-left:8px}
.btlang:hover{border-color:var(--brand);color:var(--brand);background:var(--brand-wash)}
@media(max-width:640px){.btlang{margin-left:0;order:1}}

/* ---------- SEÇÕES ---------- */""", 1)

js = open(BASE + "/novo_js.js", encoding="utf-8").read()
ini = s.rindex("<script>")
fim = s.rindex("</script>")
s = s[:ini] + "<script>\nconst TXT = " + json.dumps(dic, ensure_ascii=False, indent=0) + ";\n\n" \
    + js + "\n" + s[fim:]

open(F, "w", encoding="utf-8").write(s)
print("montado: %d chaves, %d bytes" % (len(dic), len(s)))
