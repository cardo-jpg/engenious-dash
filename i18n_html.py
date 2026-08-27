# -*- coding: utf-8 -*-
"""Marca os blocos de texto do HTML com data-t e monta o dicionario EN."""
import io
import json
import re
import sys

F = r"C:/Users/eleut/AppData/Local/Temp/claude/c--Users-eleut-claudinho/31a0d411-af2b-4ecc-bf81-605d93b1f84c/scratchpad/repo-dash/index.html"
s = open(F, encoding="utf-8").read()

# (chave, trecho PT exato no HTML, traducao EN)
# O trecho PT e o innerHTML completo do elemento, com as tags internas.
M = [
("heroLede",
 "Duas fontes, dois papéis. Todo número aqui carrega o selo de onde veio,\n       porque <b>elas não concordam</b> — e a discordância é o achado mais importante deste período.",
 "Two sources, two jobs. Every number here carries a badge saying where it came from, because <b>they don't agree</b> — and that disagreement is the most important finding of this period."),

("fonteMeta",
 "Exportação do <b>gerenciador de anúncios</b>. Manda em tudo que é campanha:\n           investimento, impressões, cliques, e o que a Meta consegue atribuir aos anúncios.\n           Começa em <b id=\"corteTxt\">19/08</b>, quando o gatilho de checkout mudou.",
 "Export from the <b>ads manager</b>. It owns everything campaign-related: spend, impressions, clicks, and whatever Meta manages to attribute to the ads. Starts on <b id=\"corteTxt\">Aug 19</b>, when the checkout trigger changed."),

("fontePh",
 "Instrumentação do <b>site</b>. Manda em tudo que é comportamento: quem visitou,\n           clicou, se cadastrou, comprou. Só <b>produção</b> — ambiente de teste e evento\n           de servidor ficam de fora.",
 "The <b>site's</b> instrumentation. It owns everything behavioural: who visited, clicked, signed up, bought. <b>Production only</b> — test environments and server-side events are excluded."),

("tabMidia", "Mídia", "Media"),
("tabCruz",  "Meta × PostHog", "Meta × PostHog"),
("tabSite",  "Site", "Site"),
("tabBoost", "Booster", "Booster"),
("tabQual",  "Qualidade do dado", "Data quality"),
("btAplicar", "Aplicar", "Apply"),

("m1h", "O que a campanha entregou", "What the campaign delivered"),
("m1p", "Tudo nesta aba vem <b>direto do gerenciador</b>. Nenhum número aqui passou pelo site.",
        "Everything on this tab comes <b>straight from the ads manager</b>. No number here went through the site."),
("m2h", "Investimento e cliques por dia", "Spend and clicks per day"),
("m2a", "Investimento", "Spend"),
("m2b", "Cliques no link", "Link clicks"),
("m3h", "Por criativo", "By creative"),
("m3p", "Ordenado por investimento. O custo por visita separa criativo que trabalha\n         de criativo que só gasta.",
        "Sorted by spend. Cost per visit is what separates a creative that works from one that only spends."),
("m4h", "Por público", "By audience"),

("thCriativo","Criativo","Creative"), ("thPublico","Público","Audience"),
("thInvestido","Investido","Spend"), ("thImpressoes","Impressões","Impressions"),
("thCliques","Cliques","Clicks"), ("thVisitas","Visitas","Visits"),
("thCustoVisita","Custo/visita","Cost/visit"),

("c1h", "Duas fontes, dois números", "Two sources, two numbers"),
("c1p", "A Meta mede o que acontece <b>dentro dela</b>: quem viu, quem clicou, e quantas\n         chegadas ela conseguiu atribuir. O PostHog mede o que acontece <b>dentro do site</b>.\n         Entre uma coisa e outra existe uma fronteira, e é atravessando essa fronteira que\n         o rastro se perde.",
        "Meta measures what happens <b>inside Meta</b>: who saw, who clicked, and how many arrivals it managed to attribute. PostHog measures what happens <b>inside the site</b>. Between the two there is a border, and it is crossing that border that the trail is lost."),
("c2h", "São duas perdas, não uma", "There are two losses, not one"),
("c2p", "Elas têm causas diferentes e se resolvem de formas diferentes. Vale separar\n         antes de tentar consertar.",
        "They have different causes and different fixes. Worth separating them before trying to solve anything."),
("c3h", "Dia a dia", "Day by day"),
("c3p", "Se a diferença fosse só forma de contar, a proporção seria estável.\n         <b>Ela oscila muito</b> — e isso indica perda de verdade, não critério.",
        "If the difference were only a matter of counting method, the ratio would be stable. <b>It swings widely</b> — which points to real loss, not methodology."),
("c3t", "Chegadas na página do Booster", "Arrivals on the Booster page"),
("c3s", "as duas fontes", "both sources"),
("c4h", "Etapa por etapa", "Stage by stage"),
("c4p", "Cada linha traz a fonte que mede aquela etapa. Onde as duas medem, a diferença\n         está explicitada.",
        "Each row carries the source that measures that stage. Where both measure, the gap is spelled out."),
("thEtapa","Etapa","Stage"), ("thMetaDiz","Meta diz","Meta says"),
("thPhDiz","PostHog diz","PostHog says"), ("thDiferenca","Diferença","Gap"),
("thSignifica","O que isso significa","What it means"),
("c5h", "O buraco na atribuição", "The attribution gap"),
("c6h", "Por que elas nunca vão bater exatamente", "Why they will never match exactly"),
("c6p", "Parte da diferença é esperada e não tem conserto. A outra parte tem, e é\n         nela que vale trabalhar.",
        "Part of the difference is expected and cannot be fixed. The other part can, and that is where the work belongs."),
("thMotivo","Motivo","Reason"), ("thConserto","Tem conserto?","Fixable?"),
("thFazer","O que fazer","What to do"),

("r1a","Anúncios sem parâmetro de URL","Ads with no URL parameters"),
("r1b","Sim, hoje","Yes, today"),
("r1c","Preencher o campo de parâmetros de URL no gerenciador. Sem isso\n                nenhuma venda pode ser ligada a uma campanha, por nenhuma das duas fontes.",
       "Fill in the URL parameters field in the ads manager. Without it no sale can be tied to a campaign, by either source."),
("r2a","Identificador de clique perdido na navegação","Click identifier lost during navigation"),
("r2b","Sim","Yes"),
("r2c","O site é uma aplicação de página única. Se o roteador reescreve\n                a URL antes do PostHog registrar, o <code>fbclid</code> some. Vale o dev conferir\n                a ordem entre roteador e captura.",
       "The site is a single-page app. If the router rewrites the URL before PostHog captures it, the <code>fbclid</code> disappears. Worth the dev checking the order between router and capture."),
("r3a","Consentimento recusado","Consent declined"),
("r3b","Parcial","Partial"),
("r3c","Sem consentimento o PostHog não registra nada. A Meta registra\n                o clique de qualquer forma. Essa diferença é estrutural.",
       "With no consent PostHog records nothing. Meta records the click either way. This difference is structural."),
("r4a","Saída antes do script carregar","Bounce before the script loads"),
("r4b","Parcial","Partial"),
("r4c","Quem fecha a página em menos de 1 ou 2 segundos conta como clique\n                para a Meta e não conta como visita para o PostHog. Depende da velocidade da página.",
       "Anyone who closes the page within a second or two counts as a click for Meta and does not count as a visit for PostHog. This depends on page speed."),
("r5a","Bloqueador de anúncio e rastreamento","Ad and tracking blockers"),
("r5b","Não","No"),
("r5c","Público técnico, de QA e desenvolvimento, usa bloqueador acima da média.\n                É esperado que a perda aqui seja maior que num público comum.",
       "A technical audience — QA and engineering — uses blockers well above average. Loss here is expected to be higher than with a general audience."),
("r6a","Critério de contagem diferente","Different counting method"),
("r6b","Não","No"),
("r6c","A Meta conta clique e atribui por janela própria; o PostHog conta pessoa\n                única por dia. Uma diferença de base sempre existe.",
       "Meta counts clicks and attributes on its own window; PostHog counts unique people per day. A baseline difference always exists."),

("c7h", "Chegadas da Meta vistas pelo site", "Meta arrivals as the site sees them"),
("c7p", "Quem chegou com o identificador de clique na URL. A série clara seria a parcela\n         carregando <b>a nossa etiqueta de campanha</b>.",
        "People who arrived carrying the click identifier in the URL. The lighter series would be the share carrying <b>our campaign tag</b>."),
("c8h", "De onde vem o tráfego", "Where traffic comes from"),
("thOrigem","Origem","Source"), ("thMeio","Meio","Medium"),
("thPessoas","Pessoas","People"), ("thPart","Participação","Share"),

("s1h", "Onde as pessoas param", "Where people stop"),
("s1p", "Site inteiro, <b>só produção</b>. Pessoas únicas por dia, somadas no período.\n         A taxa à direita é quanto sobrevive da etapa anterior.",
        "Whole site, <b>production only</b>. Unique people per day, summed across the period. The rate on the right is how much survives from the previous stage."),
("s2h", "Movimento no tempo", "Movement over time"),
("s2p", "Visitantes e checkouts vivem em escalas diferentes, por isso em gráficos separados.",
        "Visitors and checkouts live on very different scales, which is why they get separate charts."),
("s2a", "Visitantes por dia", "Visitors per day"),
("s2b", "Checkouts iniciados", "Checkouts started"),
("s3h", "Cada venda, com produto e origem", "Every sale, with product and source"),
("s3p", "A Engenious vende <b>dois produtos por caminhos diferentes</b>. Nossa campanha vende\n         só o Career Booster, de US$299, que é assinatura e chega pelo evento\n         <code>subscription_started</code>. O AI Career Accelerator, de US$2.497 a US$3.997,\n         é curso avulso e vem por <code>purchase_completed</code> — <b>está fora do nosso escopo</b>.\n         Somar os dois num número só inventa resultado que não é nosso.",
        "Engenious sells <b>two products through different paths</b>. Our campaign sells only the Career Booster at US$299, which is a subscription and arrives through the <code>subscription_started</code> event. The AI Career Accelerator, US$2,497 to US$3,997, is a one-off course and comes through <code>purchase_completed</code> — <b>it is outside our scope</b>. Adding both into one number invents a result that isn't ours."),
("thProduto","Produto","Product"), ("thEvento","Evento","Event"),
("thVendas","Vendas","Sales"), ("thReceita","Receita","Revenue"),
("s4h", "Páginas mais visitadas", "Most visited pages"),
("thPagina","Página","Page"),

("b1h", "A página que recebe a mídia", "The page that receives the media"),
("b1p", "O funil de <code>/paths/career-booster</code>, isolado do resto do site. É aqui que o dinheiro cai.",
        "The funnel for <code>/paths/career-booster</code>, isolated from the rest of the site. This is where the money lands."),
("b2h", "Desktop contra mobile", "Desktop against mobile"),
("b2p", "Percentual de visitantes do site que chegam a iniciar um checkout, por tipo de aparelho.",
        "Share of site visitors who get as far as starting a checkout, by device type."),

("q1h", "O que foi jogado fora, e por quê", "What was thrown out, and why"),
("q1p", "O projeto do PostHog recebe eventos de várias origens misturadas. Estes <b>não entram\n         em nenhum número desta dash</b> — mas ficam registrados, porque esconder lixo é pior\n         que mostrar.",
        "The PostHog project receives events from several mixed sources. These <b>do not enter any number on this dashboard</b> — but they stay on the record, because hiding junk is worse than showing it."),
("thDescartado","O que foi descartado","What was discarded"),
("thVolume","Volume no período","Volume in the period"),
("thPorque","Por quê","Why"),
("q1n1", "Vendas marcadas como teste nosso saem por lista explícita em\n       <code>excluir.json</code>, não por regra automática — assim dá para conferir uma a uma\n       o que foi tirado e por quê.",
         "Sales marked as our own tests are removed through an explicit list in <code>excluir.json</code>, not by an automatic rule — so what was taken out, and why, can be checked one by one."),
("q1n2", "As vendas, especificamente, vêm de <code>purchase_completed</code> —\n       o webhook do Stripe, disparado pelo servidor deles. Só entram as que têm\n       <code>environment = production</code> e sessão Stripe ao vivo. Tudo que é\n       <code>cs_test_</code>, <code>develop</code>, <code>local</code> ou\n       <code>posthog-dashboard-fixture</code> fica de fora.",
         "Sales specifically come from <code>purchase_completed</code> and <code>subscription_started</code> — the Stripe webhooks fired by their backend. Only those with <code>environment = production</code> and a live Stripe session count. Anything <code>cs_test_</code>, <code>develop</code>, <code>local</code> or <code>posthog-dashboard-fixture</code> stays out."),
("q2h", "O que confiar, e o que não", "What to trust, and what not to"),
("thAchado","Achado","Finding"), ("thFonte","Fonte","Source"),
("thEfeito","Efeito","Effect"), ("thSituacao","Situação","Status"),

("f1a","Anúncios sem parâmetro de URL","Ads with no URL parameters"),
("f1b","Nenhum tráfego pago é atribuível às campanhas","No paid traffic is attributable to the campaigns"),
("f1c","Crítico","Critical"),
("f2a","Meta reporta zero checkout onde o site registra checkout","Meta reports zero checkouts where the site records checkouts"),
("f2b","Ambas","Both"),
("f2c","Ou o evento não chega na Meta, ou ela não consegue atribuir","Either the event never reaches Meta, or Meta can't attribute it"),
("f2d","Crítico","Critical"),
("f3a","Venda do Booster não usa o mesmo evento do outro produto","Booster sales don't use the same event as the other product"),
("f3b","Booster é assinatura (<code>subscription_started</code>), Accelerator é curso avulso\n                (<code>purchase_completed</code>). Contar só um dos dois zera o produto que anunciamos",
       "Booster is a subscription (<code>subscription_started</code>), Accelerator is a one-off course (<code>purchase_completed</code>). Counting only one of them zeroes out the product we advertise"),
("f3c","Corrigido aqui","Fixed here"),
("f4a","Ambiente de desenvolvimento escreve no mesmo projeto","The development environment writes to the same project"),
("f4b","Compras de teste do Stripe apareciam como venda real","Stripe test purchases showed up as real sales"),
("f4c","Filtrado aqui","Filtered here"),
("f5a","Eventos sem host, sem lib e sem geolocalização","Events with no host, no library and no geolocation"),
("f5b","Servidor ou robô. Inflavam a contagem de visitantes em cerca de 8×","Server or bot. They inflated the visitor count by roughly 8×"),
("f5c","Filtrado aqui","Filtered here"),
("f6a","Carga histórica marcada como <code>fixture</code>","Historical seed data labelled <code>fixture</code>"),
("f6b","240 \"compras\" do Brazil em abril e maio que nunca existiram","240 \"purchases\" from Brazil in April and May that never existed"),
("f6c","Filtrado aqui","Filtered here"),
("f7a","Tipo de aparelho ausente em boa parte dos eventos","Device type missing on a large share of events"),
("f7b","Mobile × desktop vale como direção, não como número","Mobile × desktop is directional, not a hard number"),
("f7c","Parcial","Partial"),
("f8a","Pixel duplicado removido","Duplicate pixel removed"),
("f8b","Números pararam de vir dobrados — a correção <code>/2</code> ficou obsoleta","Numbers stopped coming in doubled — the <code>/2</code> correction in the analyses is now obsolete"),
("f8c","Resolvido","Resolved"),

("rodape","Cardô Marketing · Engenious University","Cardô Marketing · Engenious University"),
]

# 240 "compras" do Brasil -> o texto real usa "Brasil"
M = [(k, pt.replace('do Brazil', 'do Brasil'), en) for k, pt, en in M]

dic = {}
faltou = []
for chave, pt, en in M:
    if pt not in s:
        faltou.append((chave, pt[:70]))
        continue
    s = s.replace(pt, '<span data-t="%s">%s</span>' % (chave, pt)
                  if False else pt, 1)  # marcacao feita abaixo
    dic[chave] = en

if faltou:
    print("NAO ENCONTRADOS NO HTML (%d):" % len(faltou), file=sys.stderr)
    for k, t in faltou:
        print("   %-14s %s" % (k, " ".join(t.split())), file=sys.stderr)
    sys.exit(1)

print("todos os %d trechos localizados no HTML" % len(dic))
json.dump({k: v for k, v in dic.items()}, open(
    r"C:/Users/eleut/AppData/Local/Temp/claude/c--Users-eleut-claudinho/31a0d411-af2b-4ecc-bf81-605d93b1f84c/scratchpad/dic_en.json",
    "w", encoding="utf-8"), ensure_ascii=False, indent=1)
print("dicionario gravado em dic_en.json")
