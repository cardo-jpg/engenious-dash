let D, M, todasDatas, DMIN, DMAX, ini, fim;
const BRAND='#2F3DDA', BRAND_W='rgba(47,61,218,.10)', PH='#A21CAF', PH_W='rgba(162,28,175,.10)',
      INK3='#7B86A6', LINE='#DFE5F4';
const RAMP=['#8E97E9','#7A85E5','#616EE1','#4855DD','#2F3DDA','#1A22A6'];
const BOOSTER='Career Booster';

/* ============ IDIOMA ============ */
const LANG = (function(){
  const q=new URLSearchParams(location.search).get('lang');
  if(q==='en'||q==='pt'){ try{localStorage.setItem('lang',q);}catch(e){} return q; }
  try{ const g=localStorage.getItem('lang'); if(g==='en'||g==='pt') return g; }catch(e){}
  return (navigator.language||'').toLowerCase().startsWith('pt') ? 'pt' : 'pt';
})();
const PT = LANG==='pt';
const LOC = PT ? 'pt-BR' : 'en-US';
document.documentElement.lang = PT ? 'pt-BR' : 'en';

const nf  = n => (n||0).toLocaleString(LOC);
const pf  = (a,b) => b ? (100*a/b).toLocaleString(LOC,{minimumFractionDigits:2,maximumFractionDigits:2})+'%' : '—';
const din = v => (v===null||v===undefined) ? '—'
  : '$'+v.toLocaleString(LOC,{minimumFractionDigits:2,maximumFractionDigits:2});
const raz = (a,b) => b ? a/b : null;
const br  = d => PT ? d.split('-').reverse().join('/')
                    : new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
const eixoData = d => PT ? d.slice(8,10)+'/'+d.slice(5,7)
                         : new Date(d+'T12:00:00').toLocaleDateString('en-US',{month:'short',day:'numeric'});
const plural = (n,um,muitos) => n===1 ? um : muitos;

const DIC = {
pt:{
  periodoMidia:d=>'Desde '+d+' · com mídia', ult30:'Últimos 30 dias', ult7:'Últimos 7 dias',
  tudo:n=>'Período inteiro ('+n+' dias)',
  atualizado:(d,h)=>'Atualizado em '+d+' às '+h,
  semDado:c=>'<tr><td colspan="'+c+'" class="dim">Sem dado no período.</td></tr>',
  semVenda:'<tr><td colspan="5" class="dim">Nenhuma venda no período.</td></tr>',
  nadaDescartado:'<tr><td colspan="3" class="dim">Nada foi descartado neste período.</td></tr>',
  semEtiqueta:'(sem etiqueta)', semDadoAparelho:'sem dado',
  /* mídia */
  kInvest:'Investimento', kImpr:'Impressões', kCliques:'Cliques no link', kCpc:'Custo por clique',
  dDias:(n,v)=>n+' '+plural(n,'dia','dias')+' · '+v+'/dia', dCpm:v=>'CPM '+v, dCtr:v=>'CTR '+v,
  dCpcMedio:'CPC médio',
  kVisitasPg:'Visitas na página', dChegaram:p=>p+' dos cliques chegaram',
  kCustoVisita:'Custo por visita', dCustoVisita:'o que custa trazer uma pessoa',
  kCktMeta:'Checkouts (Meta)', kVendasMeta:'Vendas (Meta)', dAtribuidos:'atribuídos à campanha',
  dAtribuidas:'atribuídas à campanha',
  semMidiaK:'Sem dado de mídia', semMidiaD:d=>'A exportação da Meta começa em '+d+'.',
  midiaNota:(camps,moeda,ini,fim,n)=>'<b>Escopo destes números:</b> campanha '+camps+', de '+ini+' a '
    +fim+' ('+n+' '+plural(n,'dia','dias')+'), valores em '+moeda+'. É o que veio na exportação do '
    +'gerenciador — <b>se a conta tiver outras campanhas, ou se houver uma segunda conta de anúncios, '
    +'elas não estão aqui</b>. Este não é o investimento total da Engenious na Meta.'
    +'<br><br>Clique e visita são coisas diferentes: o clique é a Meta que registra, a visita só conta '
    +'quando a página carrega — a distância entre os dois é abandono na chegada.',
  /* cruzamento */
  kCliquesMeta:'Cliques · Meta', dCobrou:'a Meta cobrou por estes',
  kChegadasMeta:'Chegadas atribuídas · Meta', dEntregue:'ela diz ter entregue',
  kVisitasPh:'Visitas na página · PostHog', dRegistrou:'o site registrou',
  kFbclid:'Com fbclid · PostHog', dCarregavam:'carregavam identificador de clique',
  kPerdaA:'Clique vira visita rastreada', dPerdaA:'dos cliques da Meta chegam com rastro',
  kPerdaB:'Chegada vira visita medida', dPerdaB:'do que a Meta atribui o site enxerga',
  kCktM:'Checkouts · Meta', kCktP:'Checkouts · PostHog', dNaPagina:'registrados na página',
  semMidiaTit:'Escolha um período com mídia', semMidiaTxt:'A comparação precisa dos dois lados.',
  tagSemDado:'Sem dado',
  perda1tag:'Perda 1 · atravessar a fronteira',
  perda1tit:p=>p+' das chegadas viram visita medida',
  perda1txt:(mv,pv)=>'A Meta diz ter entregue <b>'+mv+'</b> chegadas na página. O site registrou '
    +'<b>'+pv+'</b>. Some gente entre o clique e o primeiro evento: quem recusa consentimento, '
    +'quem usa bloqueador, quem sai antes do script carregar. <b>Essa perda a gente reduz, não elimina.</b>',
  perda2tag:'Perda 2 · o rastro dentro do site',
  perda2tit:(fb,pv)=>'Só '+fb+' de '+pv+' visitas guardam de onde vieram',
  perda2txt:'Entre as pessoas que o site <b>conseguiu registrar</b>, boa parte já não carrega o '
    +'<code>fbclid</code>. Isso não é consentimento nem bloqueador — é o identificador se perdendo '
    +'na navegação, provavelmente porque o roteador da aplicação reescreve a URL antes da captura. '
    +'<b>Essa perda tem conserto, e é do lado do site.</b>',
  naoMede:'não mede',
  etImpr:'Impressões', obsImpr:'Só a Meta mede — o site não sabe quem viu o anúncio.',
  etCliques:'Cliques no anúncio', obsCliques:'Só a Meta mede — o clique acontece dentro do app dela.',
  etChegada:'Chegada na página', obsChegada:'As duas medem, e é aqui que a conta não fecha.',
  etFbclid:'Chegada com fbclid', obsFbclid:'Só o site mede — é o que sobra do rastro depois da navegação.',
  etTag:'Chegada com a nossa etiqueta',
  obsTag:'Zero enquanto o campo de parâmetros de URL do gerenciador estiver vazio.',
  etCkt:'Checkout iniciado', obsCkt:'O site registra, a Meta não recebia. Corrigido pelo dev em 27/08.',
  etVenda:'Venda do Career Booster',
  obsVenda:'Assinatura de US$299 — vem de subscription_started, não de purchase_completed.',
  igual:'igual',
  cruzNota:(clq,fb,p)=>'A Meta cobra por <b>'+clq+' cliques</b>. Dessas pessoas, o site consegue '
    +'identificar a origem de <b>'+fb+'</b> — '+p+'. <b>Enquanto os anúncios não carregarem parâmetro '
    +'de URL, nenhuma venda pode ser ligada a uma campanha por nenhuma das duas fontes.</b>',
  cruzNotaSem:'Escolha um período a partir de 19/08 para comparar as duas fontes.',
  diaNota:(a,b)=>'A proporção varia de <b>'+a+'%</b> a <b>'+b+'%</b> entre os dias do período. '
    +'Diferença só de critério de contagem produziria uma proporção estável. Essa oscilação indica '
    +'<b>perda real, variando com o tipo de tráfego de cada dia</b>.',
  diaNotaSem:'Sem dado suficiente para comparar dia a dia.',
  recSemTit:'Nada a reconciliar neste período', recSemTxt:d=>'A camada de mídia só existe a partir de '+d+'.',
  recOkTag:'Conferido', recOkTit:'As duas fontes concordam nos checkouts',
  recOkTxt:(m,p)=>'A Meta registrou <b>'+m+'</b> checkouts atribuídos e o site registrou <b>'+p+'</b> '
    +'na página do Booster.',
  recBadTag:'Divergência', recBadTit:'A Meta não vê os checkouts que o site registra',
  recBadTxt:p=>'No período, a Meta reporta <b>zero</b> checkouts atribuídos à campanha, enquanto o '
    +'PostHog registra <b>'+p+'</b> na mesma página. O dev encontrou e corrigiu a causa em 27/08 — '
    +'de lá para frente essa linha deve começar a fechar. <b>O período anterior à correção não serve '
    +'para julgar a campanha</b>, porque o resultado não estava sendo medido.',
  origNota:p=>'<b>'+p+'</b> do tráfego chega sem nenhuma etiqueta de origem. Não se resolve sozinho: '
    +'depende de convenção de UTM aplicada em todo link, em todo canal.',
  metaNotaZero:fb=>'<b>'+fb+'</b> pessoas chegaram com identificador de clique da Meta e <b>nenhuma</b> '
    +'carregava a nossa etiqueta. Por isso a série clara não aparece no gráfico.',
  metaNota:p=>'<b>'+p+'</b> das chegadas da Meta vieram identificadas.',
  legChegaram:'Chegaram da Meta', legComTag:'Com a nossa etiqueta',
  legMetaEntregue:'Meta diz ter entregue', legSiteRegistrou:'O site registrou',
  /* descarte */
  motSemHost:'sem host (servidor ou robô)', motDev:'ambiente de desenvolvimento', motOutro:'outro',
  expSemHost:'Não têm host, nem biblioteca, nem geolocalização. São requisição de servidor ou robô, não pessoa.',
  expDev:'Vieram de <code>dev.university.engenious.io</code> — o ambiente de teste do time deles.',
  expOutro:'Fora do host de produção.',
  descPv:n=>nf(n)+' pageviews',
  descVendaLin:(d,v)=>'Venda de '+d+', '+v, descVendaN:'1 venda',
  compraFora:'Fora de produção ou com sessão Stripe em modo de teste. Nenhuma cobrou de ninguém.',
  compraLabel:m=>'Compras de <code>'+m+'</code>', compraN:n=>nf(n)+' '+plural(n,'compra','compras'),
  /* topo e site */
  gInvestido:'Investido', gdGerenciador:'gerenciador da Meta', gCliques:'Cliques',
  gVisitantes:'Visitantes no site', gdSoProd:'só produção',
  gCkt:'Checkouts iniciados', gdRegistrados:'registrados pelo site',
  gVendasB:'Vendas do Booster', gdProdutoNosso:v=>v+' · o produto que anunciamos',
  gdNenhuma:'nenhuma no período',
  kVisitantes:'Visitantes', dPessoasDia:'pessoas por dia, somadas',
  kCta:'Cliques em CTA', kCadastro:'Iniciaram cadastro', kCktIni:'Iniciaram checkout',
  dDosVisitantes:p=>p+' dos visitantes',
  fVisitaram:'Visitaram o site', fCta:'Clicaram em CTA', fLead:'Viraram lead',
  fCadastro:'Iniciaram cadastro', fCkt:'Iniciaram checkout', fCompraram:'Compraram o Booster',
  topoFunil:'topo do funil', ficam:p=>'ficam '+p+' da etapa anterior',
  siteNota:t=>'De cada 100 pessoas que abrem o site, <b>'+t+'</b> chegam a iniciar um checkout. '
    +'Números de <b>produção apenas</b>: evento de servidor, robô e ambiente de desenvolvimento '
    +'estão fora — veja a aba Qualidade do dado.',
  siteNotaExtra:(n,v,b)=>' No período houve <b>'+n+'</b> '+plural(n,'venda','vendas')+' no total ('+v
    +'), mas só <b>'+b+'</b> '+plural(b,'é','são')+' do Career Booster — o resto é de outro produto, '
    +'que não está no nosso escopo.',
  vendaNota:(n,v,semTag)=>'<b>'+n+'</b> '+plural(n,'venda','vendas')+' do Career Booster no período, '
    +v+' em receita. '+(semTag?'<b>'+semTag+'</b> '+plural(semTag,'chegou','chegaram')+' sem etiqueta '
    +'de origem, então não dá para dizer de onde '+plural(semTag,'veio','vieram')+'. ':'')
    +'Nenhuma venda até agora carrega etiqueta de mídia paga.',
  vendaNotaZero:'Nenhuma venda do Career Booster no período selecionado.',
  /* booster */
  kVisitantesPg:'Visitantes na página', fVisitaramPg:'Visitaram a página',
  boostNota:p=>'<b>'+p+'</b> dos visitantes desta página chegam a iniciar um checkout. ',
  boostNotaMeta:v=>'A Meta diz ter mandado <b>'+v+'</b> visitas para cá no mesmo período — '
    +'compare na aba Meta × PostHog.',
  dispSem:'Sem dado de aparelho no período',
  dispNota:(x,n)=>'Desktop converte <b>'+x+'×</b> mais que mobile. O aparelho só é registrado em parte '
    +'dos eventos — '+n+' visitantes ficaram sem essa informação, então leia como direção, não como '
    +'número absoluto.',
  dispNotaSem:'Dado de aparelho insuficiente no período selecionado.',
  deVisitantes:(a,b)=>a+' de '+b+' visitantes',
  erroTit:'Não consegui carregar os dados',
  erroTxt:m=>m+'. Se você abriu este arquivo direto do disco, publique-o num servidor — o navegador '
    +'bloqueia leitura local por segurança.'
},
en:{
  periodoMidia:d=>'Since '+d+' · with media', ult30:'Last 30 days', ult7:'Last 7 days',
  tudo:n=>'Full period ('+n+' days)',
  atualizado:(d,h)=>'Updated '+d+' at '+h,
  semDado:c=>'<tr><td colspan="'+c+'" class="dim">No data in this period.</td></tr>',
  semVenda:'<tr><td colspan="5" class="dim">No sales in this period.</td></tr>',
  nadaDescartado:'<tr><td colspan="3" class="dim">Nothing was discarded in this period.</td></tr>',
  semEtiqueta:'(untagged)', semDadoAparelho:'no data',
  kInvest:'Spend', kImpr:'Impressions', kCliques:'Link clicks', kCpc:'Cost per click',
  dDias:(n,v)=>n+' '+plural(n,'day','days')+' · '+v+'/day', dCpm:v=>'CPM '+v, dCtr:v=>'CTR '+v,
  dCpcMedio:'average CPC',
  kVisitasPg:'Landing page visits', dChegaram:p=>p+' of clicks made it through',
  kCustoVisita:'Cost per visit', dCustoVisita:'what one person costs to bring in',
  kCktMeta:'Checkouts (Meta)', kVendasMeta:'Sales (Meta)', dAtribuidos:'attributed to the campaign',
  dAtribuidas:'attributed to the campaign',
  semMidiaK:'No media data', semMidiaD:d=>'The Meta export starts on '+d+'.',
  midiaNota:(camps,moeda,ini,fim,n)=>'<b>Scope of these numbers:</b> campaign '+camps+', from '+ini
    +' to '+fim+' ('+n+' '+plural(n,'day','days')+'), values in '+moeda+'. This is what came in the ads '
    +'manager export — <b>if the account has other campaigns, or if there is a second ad account, they '
    +'are not here</b>. This is not Engenious total spend on Meta.'
    +'<br><br>A click and a visit are different things: Meta records the click, while a visit only '
    +'counts once the page loads — the gap between the two is people dropping off on arrival.',
  kCliquesMeta:'Clicks · Meta', dCobrou:'Meta charged for these',
  kChegadasMeta:'Attributed arrivals · Meta', dEntregue:'what Meta says it delivered',
  kVisitasPh:'Page visits · PostHog', dRegistrou:'what the site recorded',
  kFbclid:'With fbclid · PostHog', dCarregavam:'carried a click identifier',
  kPerdaA:'Click becomes tracked visit', dPerdaA:'of Meta clicks arrive with a trail',
  kPerdaB:'Arrival becomes measured visit', dPerdaB:'of what Meta attributes the site can see',
  kCktM:'Checkouts · Meta', kCktP:'Checkouts · PostHog', dNaPagina:'recorded on the page',
  semMidiaTit:'Pick a period with media data', semMidiaTxt:'The comparison needs both sides.',
  tagSemDado:'No data',
  perda1tag:'Loss 1 · crossing the border',
  perda1tit:p=>p+' of arrivals become a measured visit',
  perda1txt:(mv,pv)=>'Meta says it delivered <b>'+mv+'</b> arrivals on the page. The site recorded '
    +'<b>'+pv+'</b>. People vanish between the click and the first event: those who decline consent, '
    +'those running blockers, those who leave before the script loads. <b>This loss can be reduced, '
    +'not eliminated.</b>',
  perda2tag:'Loss 2 · the trail inside the site',
  perda2tit:(fb,pv)=>'Only '+fb+' of '+pv+' visits remember where they came from',
  perda2txt:'Among the people the site <b>did manage to record</b>, a large share no longer carries the '
    +'<code>fbclid</code>. This is not consent and not a blocker — it is the identifier getting lost '
    +'during navigation, most likely because the app router rewrites the URL before capture. '
    +'<b>This loss is fixable, and the fix is on the site side.</b>',
  naoMede:'not measured',
  etImpr:'Impressions', obsImpr:'Only Meta measures this — the site never knows who saw the ad.',
  etCliques:'Ad clicks', obsCliques:'Only Meta measures this — the click happens inside its app.',
  etChegada:'Arrival on the page', obsChegada:'Both measure it, and this is where the numbers stop matching.',
  etFbclid:'Arrival carrying fbclid', obsFbclid:'Only the site measures it — what is left of the trail after navigation.',
  etTag:'Arrival carrying our tag',
  obsTag:'Zero for as long as the URL parameters field in the ads manager stays empty.',
  etCkt:'Checkout started', obsCkt:'The site records it, Meta was not receiving it. Fixed by the dev on Aug 27.',
  etVenda:'Career Booster sale',
  obsVenda:'A US$299 subscription — it comes from subscription_started, not purchase_completed.',
  igual:'same',
  cruzNota:(clq,fb,p)=>'Meta charges for <b>'+clq+' clicks</b>. Of those people, the site can identify '
    +'the origin of <b>'+fb+'</b> — '+p+'. <b>Until the ads carry URL parameters, no sale can be tied '
    +'to a campaign by either source.</b>',
  cruzNotaSem:'Pick a period starting Aug 19 to compare the two sources.',
  diaNota:(a,b)=>'The ratio swings from <b>'+a+'%</b> to <b>'+b+'%</b> across the days in this period. '
    +'A difference in counting method alone would produce a stable ratio. This swing points to '
    +'<b>real loss, varying with the kind of traffic each day brings</b>.',
  diaNotaSem:'Not enough data to compare day by day.',
  recSemTit:'Nothing to reconcile in this period', recSemTxt:d=>'The media layer only exists from '+d+' onward.',
  recOkTag:'Checked', recOkTit:'Both sources agree on checkouts',
  recOkTxt:(m,p)=>'Meta recorded <b>'+m+'</b> attributed checkouts and the site recorded <b>'+p+'</b> '
    +'on the Booster page.',
  recBadTag:'Mismatch', recBadTit:"Meta can't see the checkouts the site records",
  recBadTxt:p=>'In this period Meta reports <b>zero</b> checkouts attributed to the campaign, while '
    +'PostHog records <b>'+p+'</b> on that same page. The dev found and fixed the cause on Aug 27 — '
    +'from there on this line should start to close. <b>The period before the fix cannot be used to '
    +'judge the campaign</b>, because the result was not being measured.',
  origNota:p=>'<b>'+p+'</b> of traffic arrives with no source tag at all. This does not fix itself: '
    +'it depends on a UTM convention applied to every link, on every channel.',
  metaNotaZero:fb=>'<b>'+fb+'</b> people arrived carrying a Meta click identifier and <b>none</b> '
    +'carried our tag. That is why the lighter series does not appear on the chart.',
  metaNota:p=>'<b>'+p+'</b> of Meta arrivals came in identified.',
  legChegaram:'Arrived from Meta', legComTag:'Carrying our tag',
  legMetaEntregue:'Meta says it delivered', legSiteRegistrou:'The site recorded',
  motSemHost:'no host (server or bot)', motDev:'development environment', motOutro:'other',
  expSemHost:'No host, no library, no geolocation. These are server requests or bots, not people.',
  expDev:'They came from <code>dev.university.engenious.io</code> — their team’s test environment.',
  expOutro:'Outside the production host.',
  descPv:n=>nf(n)+' pageviews',
  descVendaLin:(d,v)=>'Sale on '+d+', '+v, descVendaN:'1 sale',
  compraFora:'Outside production, or with a Stripe session in test mode. None of these charged anyone.',
  compraLabel:m=>'Purchases from <code>'+m+'</code>', compraN:n=>nf(n)+' '+plural(n,'purchase','purchases'),
  gInvestido:'Spend', gdGerenciador:'Meta ads manager', gCliques:'Clicks',
  gVisitantes:'Site visitors', gdSoProd:'production only',
  gCkt:'Checkouts started', gdRegistrados:'recorded by the site',
  gVendasB:'Booster sales', gdProdutoNosso:v=>v+' · the product we advertise',
  gdNenhuma:'none in this period',
  kVisitantes:'Visitors', dPessoasDia:'unique people per day, summed',
  kCta:'CTA clicks', kCadastro:'Started signup', kCktIni:'Started checkout',
  dDosVisitantes:p=>p+' of visitors',
  fVisitaram:'Visited the site', fCta:'Clicked a CTA', fLead:'Became a lead',
  fCadastro:'Started signup', fCkt:'Started checkout', fCompraram:'Bought the Booster',
  topoFunil:'top of funnel', ficam:p=>p+' survive the previous stage',
  siteNota:t=>'Out of every 100 people who open the site, <b>'+t+'</b> get as far as starting a '
    +'checkout. <b>Production only</b>: server events, bots and the development environment are '
    +'excluded — see the Data quality tab.',
  siteNotaExtra:(n,v,b)=>' This period had <b>'+n+'</b> '+plural(n,'sale','sales')+' in total ('+v
    +'), but only <b>'+b+'</b> of them '+plural(b,'is','are')+' Career Booster — the rest is a '
    +'different product, outside our scope.',
  vendaNota:(n,v,semTag)=>'<b>'+n+'</b> Career Booster '+plural(n,'sale','sales')+' in this period, '
    +v+' in revenue. '+(semTag?'<b>'+semTag+'</b> of them arrived with no source tag, so there is no '
    +'way to say where '+plural(semTag,'it came','they came')+' from. ':'')
    +'No sale so far carries a paid-media tag.',
  vendaNotaZero:'No Career Booster sales in the selected period.',
  kVisitantesPg:'Page visitors', fVisitaramPg:'Visited the page',
  boostNota:p=>'<b>'+p+'</b> of this page’s visitors get as far as starting a checkout. ',
  boostNotaMeta:v=>'Meta says it sent <b>'+v+'</b> visits here over the same period — compare on the '
    +'Meta × PostHog tab.',
  dispSem:'No device data in this period',
  dispNota:(x,n)=>'Desktop converts <b>'+x+'×</b> better than mobile. Device type is only recorded on '
    +'part of the events — '+n+' visitors came through without it, so read this as direction, not as '
    +'a hard number.',
  dispNotaSem:'Not enough device data in the selected period.',
  deVisitantes:(a,b)=>a+' of '+b+' visitors',
  erroTit:'Could not load the data',
  erroTxt:m=>m+'. If you opened this file straight from disk, publish it to a server — browsers block '
    +'local file reads for security.'
}};
const T = DIC[LANG];

const dtIni=document.getElementById('dtIni'), dtFim=document.getElementById('dtFim');
const btnAplicar=document.getElementById('btnAplicar'), mesSel=document.getElementById('mesSel');
const nomeMes = m => { const s=new Date(m+'-02').toLocaleDateString(LOC,{month:'long',year:'numeric'});
                       return s.charAt(0).toUpperCase()+s.slice(1); };

const noPeriodo = r => r.d>=ini && r.d<=fim;
const somaEv = (arr,ev) => arr.filter(r=>noPeriodo(r)&&r.e===ev).reduce((s,r)=>s+(r.p||0),0);
const somaB  = ev => D.booster.filter(r=>noPeriodo(r)&&r.e===ev).reduce((s,r)=>s+r.p,0);
const vendasDe = prod => (D.venda||[]).filter(r=>noPeriodo(r) && (!prod || r.produto===prod));
const nVend = prod => vendasDe(prod).length;
const vVend = prod => vendasDe(prod).reduce((s,r)=>s+r.valor,0);

/* aplica o idioma nos textos fixos do HTML */
function aplicaIdioma(){
  if(PT) return;
  document.querySelectorAll('[data-t]').forEach(function(e){
    const v = TXT[e.dataset.t];
    if(v!==undefined) e.innerHTML = v;
  });
  document.title = 'Engenious · Acquisition Funnel';
}

function boot(){
  todasDatas=[...new Set(D.site.map(r=>r.d))].sort();
  DMIN=todasDatas[0]; DMAX=todasDatas[todasDatas.length-1];
  dtIni.min=dtFim.min=DMIN; dtIni.max=dtFim.max=DMAX;

  const meses=[...new Set(todasDatas.map(d=>d.slice(0,7)))].sort().reverse();
  mesSel.innerHTML = (M&&M.corte ? '<option value="__midia">'+T.periodoMidia(br(M.corte))+'</option>' : '')
    +'<option value="__30">'+T.ult30+'</option><option value="__7">'+T.ult7+'</option>'
    + meses.map(m=>'<option value="'+m+'">'+nomeMes(m)+'</option>').join('')
    +'<option value="">'+T.tudo(todasDatas.length)+'</option>';

  const at=new Date(D.atualizado_em);
  document.getElementById('atualizado').textContent = T.atualizado(
    at.toLocaleDateString(LOC), at.toLocaleTimeString(LOC,{hour:'2-digit',minute:'2-digit'}));
  if(M) document.getElementById('corteTxt').textContent = br(M.corte);

  fim=DMAX;
  const temMidia = M && M.corte && M.corte<=DMAX;
  ini = temMidia ? M.corte : todasDatas[Math.max(0,todasDatas.length-30)];
  if(temMidia) mesSel.value='__midia';
  dtIni.value=ini; dtFim.value=fim;
  render(); observaReveal();
}

/* ---------- mídia (Meta) ---------- */
function totMidia(){
  const t={inv:0,imp:0,clk:0,vis:0,ckt:0,vendas:0,fat:0,dias:0};
  if(!M) return t;
  M.dia.filter(noPeriodo).forEach(r=>{ t.dias++; for(const k in t) if(k!=='dias') t[k]+=r[k]||0; });
  return t;
}
function agrupaMidia(linhas, chave){
  const a={};
  linhas.filter(noPeriodo).forEach(r=>{
    const k=r[chave]||'—';
    if(!a[k]) a[k]={inv:0,imp:0,clk:0,vis:0,ckt:0};
    for(const c in a[k]) a[k][c]+=r[c]||0;
  });
  return Object.entries(a).sort((x,y)=>y[1].inv-x[1].inv);
}
const linhaMidia = (nome,t) => '<tr><td class="mono">'+nome+'</td>'
  +'<td class="n">'+din(t.inv)+'</td><td class="n">'+nf(Math.round(t.imp))+'</td>'
  +'<td class="n">'+nf(Math.round(t.clk))+'</td><td class="n">'+pf(t.clk,t.imp)+'</td>'
  +'<td class="n">'+din(raz(t.inv,t.clk))+'</td><td class="n">'+nf(Math.round(t.vis))+'</td>'
  +'<td class="n">'+din(raz(t.inv,t.vis))+'</td></tr>';

const cardStat = s => '<div class="stat"><div class="k">'+s.k+'</div>'
  +'<div class="n'+(s.c?' '+s.c:'')+'">'+s.n+'</div><div class="d">'+s.d+'</div></div>';

function renderMidia(){
  const temM = M && M.dia.some(noPeriodo);
  if(M) document.getElementById('moedaTag').textContent = M.moeda;

  if(!temM){
    document.getElementById('statsMidia').innerHTML =
      '<div class="stat" style="grid-column:1/-1"><div class="k">'+T.semMidiaK+'</div>'
      +'<div class="n" style="font-size:1.3rem">—</div>'
      +'<div class="d">'+T.semMidiaD(M?br(M.corte):'19/08')+'</div></div>';
    document.getElementById('statsMidia2').innerHTML = '';
    document.getElementById('midiaNote').textContent = '';
    document.querySelector('#tbCri tbody').innerHTML = T.semDado(8);
    document.querySelector('#tbPub tbody').innerHTML = T.semDado(8);
    return;
  }

  const t=totMidia();
  document.getElementById('statsMidia').innerHTML=[
    {k:T.kInvest, n:din(t.inv), d:T.dDias(t.dias, din(t.inv/t.dias)), c:'br'},
    {k:T.kImpr, n:nf(Math.round(t.imp)), d:T.dCpm(din(raz(t.inv*1000,t.imp)))},
    {k:T.kCliques, n:nf(Math.round(t.clk)), d:T.dCtr(pf(t.clk,t.imp))},
    {k:T.kCpc, n:din(raz(t.inv,t.clk)), d:T.dCpcMedio}
  ].map(cardStat).join('');
  document.getElementById('statsMidia2').innerHTML=[
    {k:T.kVisitasPg, n:nf(Math.round(t.vis)), d:T.dChegaram(pf(t.vis,t.clk))},
    {k:T.kCustoVisita, n:din(raz(t.inv,t.vis)), d:T.dCustoVisita},
    {k:T.kCktMeta, n:nf(Math.round(t.ckt)), d:T.dAtribuidos, c:t.ckt?'br':'bad'},
    {k:T.kVendasMeta, n:nf(Math.round(t.vendas)), d:T.dAtribuidas, c:t.vendas?'gd':'bad'}
  ].map(cardStat).join('');
  const diasM = M.dia.filter(noPeriodo);
  document.getElementById('midiaNote').innerHTML =
    T.midiaNota(M.campanhas.map(c=>'<code>'+c+'</code>').join(', '), M.moeda,
                br(diasM[0].d), br(diasM[diasM.length-1].d), t.dias);

  document.querySelector('#tbCri tbody').innerHTML =
    agrupaMidia(M.criativo,'cri').map(e=>linhaMidia(e[0],e[1])).join('');
  document.querySelector('#tbPub tbody').innerHTML =
    agrupaMidia(M.publico,'pub').map(e=>linhaMidia(e[0],e[1])).join('');
}

/* ---------- cruzamento ---------- */
function renderCruz(){
  const t=totMidia();
  const bVis=somaB('page_viewed'), bCkt=somaB('checkout_started');
  const temM = M && M.dia.some(noPeriodo);
  const mt=D.meta.filter(noPeriodo);
  const fbclid=mt.reduce((s,r)=>s+r.total,0), comTag=mt.reduce((s,r)=>s+r.tag,0);

  document.getElementById('statsCruz').innerHTML=[
    {k:T.kCliquesMeta, n:temM?nf(Math.round(t.clk)):'—', d:T.dCobrou, c:'br'},
    {k:T.kChegadasMeta, n:temM?nf(Math.round(t.vis)):'—', d:T.dEntregue, c:'br'},
    {k:T.kVisitasPh, n:nf(bVis), d:T.dRegistrou, c:'pp'},
    {k:T.kFbclid, n:nf(fbclid), d:T.dCarregavam, c:'pp'}
  ].map(cardStat).join('');

  const perdaA = temM ? raz(fbclid, t.clk) : null;
  const perdaB = temM ? raz(bVis, t.vis) : null;
  document.getElementById('statsCruz2').innerHTML=[
    {k:T.kPerdaA, n:perdaA===null?'—':pf(fbclid,t.clk), d:T.dPerdaA,
     c:(perdaA!==null&&perdaA<.5)?'bad':''},
    {k:T.kPerdaB, n:perdaB===null?'—':pf(bVis,t.vis), d:T.dPerdaB,
     c:(perdaB!==null&&perdaB<.5)?'bad':''},
    {k:T.kCktM, n:temM?nf(Math.round(t.ckt)):'—', d:T.dAtribuidos, c:(temM&&t.ckt)?'br':'bad'},
    {k:T.kCktP, n:nf(bCkt), d:T.dNaPagina, c:bCkt?'pp':'bad'}
  ].map(cardStat).join('');

  const semTagCall = '<span class="tag">'+T.tagSemDado+'</span><h3>'+T.semMidiaTit+'</h3><p>'
    +T.semMidiaTxt+'</p>';
  document.getElementById('perda1').innerHTML = !temM ? semTagCall
    : '<span class="tag">'+T.perda1tag+'</span><h3>'+T.perda1tit(pf(bVis,t.vis))+'</h3><p>'
      +T.perda1txt(nf(Math.round(t.vis)), nf(bVis))+'</p>';
  document.getElementById('perda2').innerHTML = !temM ? semTagCall
    : '<span class="tag">'+T.perda2tag+'</span><h3>'+T.perda2tit(nf(fbclid), nf(bVis))+'</h3><p>'
      +T.perda2txt+'</p>';

  const cel=(v,cls)=> v===null ? '<td class="n dim">'+T.naoMede+'</td>' : '<td class="n '+cls+'">'+v+'</td>';
  const linhas=[
    {et:T.etImpr, mn:temM?t.imp:null, pn:null, obs:T.obsImpr},
    {et:T.etCliques, mn:temM?t.clk:null, pn:null, obs:T.obsCliques},
    {et:T.etChegada, mn:temM?t.vis:null, pn:bVis, obs:T.obsChegada},
    {et:T.etFbclid, mn:null, pn:fbclid, obs:T.obsFbclid},
    {et:T.etTag, mn:null, pn:comTag, obs:T.obsTag},
    {et:T.etCkt, mn:temM?t.ckt:null, pn:bCkt, obs:T.obsCkt},
    {et:T.etVenda, mn:temM?t.vendas:null, pn:nVend(BOOSTER), obs:T.obsVenda}
  ];
  document.querySelector('#tbCruz tbody').innerHTML = linhas.map(function(l){
    const mv = l.mn===null?null:nf(Math.round(l.mn));
    const pv = l.pn===null?null:nf(l.pn);
    const dif = (l.mn===null||l.pn===null) ? '<td class="n dim">—</td>'
      : '<td class="n">' + (Math.round(l.mn)===l.pn ? T.igual
          : (l.pn>l.mn?'+':'−') + nf(Math.abs(Math.round(l.mn)-l.pn))) + '</td>';
    return '<tr><td>'+l.et+'</td>'+cel(mv,'m')+cel(pv,'p')+dif+'<td class="dim">'+l.obs+'</td></tr>';
  }).join('');

  document.getElementById('cruzNote').innerHTML = temM
    ? T.cruzNota(nf(Math.round(t.clk)), nf(fbclid), pf(fbclid,t.clk)) : T.cruzNotaSem;

  const dm = temM ? M.dia.filter(noPeriodo) : [];
  const razoes = dm.filter(function(r){return r.vis>0;}).map(function(r){
    const b=D.booster.find(function(x){return x.d===r.d && x.e==='page_viewed';});
    return 100*((b?b.p:0)/r.vis);
  });
  document.getElementById('cruzDiaNote').innerHTML = razoes.length
    ? T.diaNota(Math.min.apply(null,razoes).toFixed(0), Math.max.apply(null,razoes).toFixed(0))
    : T.diaNotaSem;

  const rec=document.getElementById('reconcilia');
  const ok = temM && t.ckt>0;
  rec.className='call '+(ok?'gd':'bad');
  rec.innerHTML = !temM
    ? '<span class="tag">'+T.tagSemDado+'</span><h3>'+T.recSemTit+'</h3><p>'
      +T.recSemTxt(M?br(M.corte):'19/08')+'</p>'
    : ok
    ? '<span class="tag">'+T.recOkTag+'</span><h3>'+T.recOkTit+'</h3><p>'
      +T.recOkTxt(nf(Math.round(t.ckt)), nf(bCkt))+'</p>'
    : '<span class="tag">'+T.recBadTag+'</span><h3>'+T.recBadTit+'</h3><p>'+T.recBadTxt(nf(bCkt))+'</p>';

  const oAgg={};
  D.origem.filter(noPeriodo).forEach(function(r){
    const k=(r.src==='(sem etiqueta)'?T.semEtiqueta:r.src)+'|'+r.med;
    oAgg[k]=(oAgg[k]||0)+r.p; });
  const oTot=Object.values(oAgg).reduce(function(s,v){return s+v;},0);
  document.querySelector('#tbOrig tbody').innerHTML =
    Object.entries(oAgg).sort(function(a,b){return b[1]-a[1];}).slice(0,12).map(function(e){
      const p=e[0].split('|');
      return '<tr><td class="mono">'+p[0]+'</td><td class="dim">'+(p[1]||'—')+'</td>'
        + '<td class="n">'+nf(e[1])+'</td><td class="n">'+pf(e[1],oTot)+'</td></tr>';
    }).join('') || T.semDado(4);
  const semTag=oAgg[T.semEtiqueta+'|']||0;
  document.getElementById('origNote').innerHTML = T.origNota(pf(semTag,oTot));

  document.getElementById('metaNote').innerHTML = comTag===0
    ? T.metaNotaZero(nf(fbclid)) : T.metaNota(pf(comTag,fbclid));
}

/* ---------- descarte ---------- */
function renderDescarte(){
  const MOT={'sem host (servidor ou robo)':[T.motSemHost,T.expSemHost],
             'ambiente de desenvolvimento':[T.motDev,T.expDev],
             'outro':[T.motOutro,T.expOutro]};
  const por={};
  (D.descarte||[]).filter(noPeriodo).forEach(r=>{ por[r.motivo]=(por[r.motivo]||0)+r.n; });
  const compras={};
  (D.compra_descartada||[]).filter(noPeriodo).forEach(r=>{ compras[r.motivo]=(compras[r.motivo]||0)+r.n; });

  const linhas=[];
  Object.entries(por).sort((a,b)=>b[1]-a[1]).forEach(function(e){
    const m = MOT[e[0]] || [e[0], T.expOutro];
    linhas.push('<tr><td>'+m[0]+'</td><td class="n">'+T.descPv(e[1])+'</td>'
      +'<td class="dim">'+m[1]+'</td></tr>');
  });
  Object.entries(compras).sort((a,b)=>b[1]-a[1]).forEach(function(e){
    linhas.push('<tr><td>'+T.compraLabel(e[0].replace('ambiente ',''))+'</td>'
      +'<td class="n">'+T.compraN(e[1])+'</td><td class="dim">'+T.compraFora+'</td></tr>');
  });
  (D.venda_excluida||[]).filter(noPeriodo).forEach(function(v){
    linhas.push('<tr><td>'+T.descVendaLin(br(v.d), din(v.valor))+'</td>'
      +'<td class="n">'+T.descVendaN+'</td><td class="dim">'+((PT?v.motivo:v.motivo_en)||v.motivo)+'</td></tr>');
  });
  document.querySelector('#tbDescarte tbody').innerHTML = linhas.join('') || T.nadaDescartado;
}

/* ---------- render ---------- */
let charts={};
function render(){
  const vis=somaEv(D.site,'page_viewed'), cta=somaEv(D.site,'cta_clicked'),
        lead=somaEv(D.site,'lead_created'), reg=somaEv(D.site,'registration_started'),
        ckt=somaEv(D.site,'checkout_started');
  const vBoost=nVend(BOOSTER), rBoost=vVend(BOOSTER);
  const vTodas=nVend(null), rTodas=vVend(null);
  const t=totMidia();
  const temM = M && M.dia.some(noPeriodo);

  document.getElementById('statsSite').innerHTML=[
    {k:T.kVisitantes, n:nf(vis), d:T.dPessoasDia},
    {k:T.kCta, n:nf(cta), d:T.dDosVisitantes(pf(cta,vis))},
    {k:T.kCadastro, n:nf(reg), d:T.dDosVisitantes(pf(reg,vis))},
    {k:T.kCktIni, n:nf(ckt), d:T.dDosVisitantes(pf(ckt,vis)), c:'pp'},
    {k:T.gVendasB, n:nf(vBoost), d:vBoost?din(rBoost):'—', c:vBoost?'gd':'bad'}
  ].map(cardStat).join('');
  funil('funSite',[[T.fVisitaram,vis],[T.fCta,cta],[T.fLead,lead],
    [T.fCadastro,reg],[T.fCkt,ckt],[T.fCompraram,vBoost]].map(x=>({r:x[0],v:x[1]})));
  document.getElementById('siteNote').innerHTML =
    T.siteNota((100*ckt/(vis||1)).toLocaleString(LOC,{maximumFractionDigits:1}))
    + (vTodas>vBoost ? T.siteNotaExtra(vTodas, din(rTodas), vBoost) : '');

  /* vendas por produto e origem */
  const vAgg={};
  vendasDe(null).forEach(function(r){
    const o=(r.origem==='(sem etiqueta)'?T.semEtiqueta:r.origem)+(r.meio?' / '+r.meio:'');
    const k=[r.produto,o,r.ev].join('|');
    if(!vAgg[k]) vAgg[k]={n:0,v:0};
    vAgg[k].n+=1; vAgg[k].v+=r.valor;
  });
  document.querySelector('#tbVenda tbody').innerHTML =
    Object.entries(vAgg).sort((a,b)=>b[1].v-a[1].v).map(function(e){
      const p=e[0].split('|');
      const nosso = p[0]===BOOSTER;
      return '<tr><td class="'+(nosso?'p':'dim')+'">'+p[0]+'</td><td class="mono">'+p[1]+'</td>'
        +'<td class="dim mono">'+p[2]+'</td><td class="n">'+nf(e[1].n)+'</td>'
        +'<td class="n">'+din(e[1].v)+'</td></tr>';
    }).join('') || T.semVenda;
  const semTagV = vendasDe(BOOSTER).filter(r=>r.origem==='(sem etiqueta)').length;
  document.getElementById('vendaNote').innerHTML = vBoost
    ? T.vendaNota(vBoost, din(rBoost), semTagV) : T.vendaNotaZero;

  /* booster */
  const bv=somaB('page_viewed'), bc=somaB('cta_clicked'),
        brg=somaB('registration_started'), bk=somaB('checkout_started');
  document.getElementById('statsB').innerHTML=[
    {k:T.kVisitantesPg, n:nf(bv), d:T.dPessoasDia},
    {k:T.kCta, n:nf(bc), d:T.dDosVisitantes(pf(bc,bv))},
    {k:T.kCadastro, n:nf(brg), d:T.dDosVisitantes(pf(brg,bv))},
    {k:T.kCktIni, n:nf(bk), d:T.dDosVisitantes(pf(bk,bv)), c:'pp'}
  ].map(cardStat).join('');
  funil('funBoost',[[T.fVisitaramPg,bv],[T.fCta,bc],[T.fCadastro,brg],[T.fCkt,bk]]
    .map(x=>({r:x[0],v:x[1]})));
  document.getElementById('boostNote').innerHTML = T.boostNota(pf(bk,bv))
    + (temM ? T.boostNotaMeta(nf(Math.round(t.vis))) : '');

  /* dispositivo */
  const dAgg={};
  D.disp.filter(noPeriodo).forEach(function(r){
    if(!dAgg[r.tipo]) dAgg[r.tipo]={vis:0,ckt:0};
    dAgg[r.tipo].vis+=r.vis; dAgg[r.tipo].ckt+=r.ckt;});
  const dIt=['Desktop','Mobile','Tablet'].filter(x=>dAgg[x]&&dAgg[x].vis).map(function(x){
    return {r:x, v:100*dAgg[x].ckt/dAgg[x].vis, txt:pf(dAgg[x].ckt,dAgg[x].vis),
            rt:T.deVisitantes(nf(dAgg[x].ckt), nf(dAgg[x].vis))};});
  funil('funDisp', dIt.length?dIt:[{r:T.dispSem,v:0,txt:'—',rt:''}]);
  const dk=dAgg.Desktop, mb=dAgg.Mobile, sd=dAgg['sem dado'];
  document.getElementById('dispNote').innerHTML = (dk&&mb&&mb.vis&&dk.vis&&mb.ckt)
    ? T.dispNota(((dk.ckt/dk.vis)/(mb.ckt/mb.vis)).toLocaleString(LOC,{maximumFractionDigits:1}),
                 nf(sd?sd.vis:0))
    : T.dispNotaSem;

  /* páginas */
  const pAgg={};
  D.pagina.filter(noPeriodo).forEach(r=>{pAgg[r.pg]=(pAgg[r.pg]||0)+r.p;});
  document.querySelector('#tbPag tbody').innerHTML =
    Object.entries(pAgg).sort((a,b)=>b[1]-a[1]).slice(0,10)
      .map(e=>'<tr><td class="mono">'+e[0]+'</td><td class="n">'+nf(e[1])+'</td></tr>').join('')
    || T.semDado(2);

  renderMidia(); renderCruz(); renderDescarte(); desenhaGraficos();
}

function funil(id, itens){
  const max=Math.max(...itens.map(i=>i.v),1);
  document.getElementById(id).innerHTML=itens.map(function(it,i){
    const prev=i>0?itens[i-1].v:null;
    const rt = it.rt!==undefined ? it.rt
      : (prev!==null ? T.ficam(pf(it.v,prev)) : T.topoFunil);
    const w=Math.max(100*it.v/max, it.v>0?6:0);
    return '<div class="fstep"><div class="lab"><span class="nmm">'+it.r+'</span>'
      +'<span class="rt">'+rt+'</span></div><div class="ftrack"><div class="fbar" style="width:'+w
      +'%;background:'+RAMP[Math.min(i,RAMP.length-1)]+'">'+(it.txt||nf(it.v))+'</div></div></div>';
  }).join('');
}

/* ---------- gráficos ---------- */
function opcoes(){
  return {responsive:true, maintainAspectRatio:false,
    interaction:{mode:'index',intersect:false},
    plugins:{legend:{display:false},
      tooltip:{backgroundColor:'#111838',padding:11,cornerRadius:9,displayColors:false,
        titleFont:{family:"'JetBrains Mono',monospace",size:11,weight:'400'},
        bodyFont:{family:"'Inter',sans-serif",size:13,weight:'600'}}},
    scales:{
      x:{grid:{display:false},border:{color:LINE},
         ticks:{color:INK3,font:{family:"'JetBrains Mono',monospace",size:10},maxRotation:0,autoSkipPadding:24}},
      y:{beginAtZero:true,grid:{color:LINE},border:{display:false},
         ticks:{color:INK3,font:{family:"'JetBrains Mono',monospace",size:10},precision:0,maxTicksLimit:6}}}};
}
function comLegenda(o){
  o.plugins.legend={display:true,position:'top',align:'end',
    labels:{color:'#4B5678',boxWidth:9,boxHeight:9,usePointStyle:true,pointStyle:'circle',
            padding:16,font:{family:"'Inter',sans-serif",size:11}}};
  o.plugins.tooltip.displayColors=true;
  return o;
}
function desenhaGraficos(){
  Object.values(charts).forEach(c=>c.destroy()); charts={};
  const dias=todasDatas.filter(d=>d>=ini&&d<=fim);
  const rot=dias.map(eixoData);
  const serie=ev=>dias.map(function(d){
    const r=D.site.find(x=>x.d===d&&x.e===ev); return r?(r.p||0):0;});

  charts.vis=new Chart(document.getElementById('chVis'),{type:'line',
    data:{labels:rot,datasets:[{data:serie('page_viewed'),borderColor:PH,backgroundColor:PH_W,
      borderWidth:2,fill:true,tension:.25,pointRadius:0,pointHoverRadius:5,
      pointHoverBackgroundColor:PH,pointHoverBorderColor:'#fff',pointHoverBorderWidth:2}]},
    options:opcoes()});
  charts.ckt=new Chart(document.getElementById('chCkt'),{type:'bar',
    data:{labels:rot,datasets:[{data:serie('checkout_started'),backgroundColor:PH,
      borderRadius:3,borderSkipped:false,maxBarThickness:16}]},options:opcoes()});

  if(M){
    const dm=M.dia.filter(noPeriodo);
    const rm=dm.map(r=>eixoData(r.d));
    const oi=opcoes(); oi.plugins.tooltip.callbacks={label:c=>din(c.parsed.y)};
    charts.inv=new Chart(document.getElementById('chInv'),{type:'bar',
      data:{labels:rm,datasets:[{data:dm.map(r=>r.inv),backgroundColor:BRAND,
        borderRadius:3,borderSkipped:false,maxBarThickness:26}]},options:oi});
    charts.clk=new Chart(document.getElementById('chClk'),{type:'bar',
      data:{labels:rm,datasets:[{data:dm.map(r=>r.clk),backgroundColor:'#8E97E9',
        borderRadius:3,borderSkipped:false,maxBarThickness:26}]},options:opcoes()});

    const phDia=dm.map(function(r){
      const b=D.booster.find(x=>x.d===r.d && x.e==='page_viewed'); return b?b.p:0; });
    charts.cruz=new Chart(document.getElementById('chCruz'),{type:'bar',
      data:{labels:rm,datasets:[
        {label:T.legMetaEntregue,data:dm.map(r=>r.vis),backgroundColor:BRAND,
         borderRadius:3,borderSkipped:false,maxBarThickness:22},
        {label:T.legSiteRegistrou,data:phDia,backgroundColor:PH,
         borderRadius:3,borderSkipped:false,maxBarThickness:22}
      ]},options:comLegenda(opcoes())});
  }

  const md=dias.map(d=>D.meta.find(x=>x.d===d)||{total:0,tag:0});
  charts.meta=new Chart(document.getElementById('chMeta'),{type:'bar',
    data:{labels:rot,datasets:[
      {label:T.legChegaram,data:md.map(r=>r.total),backgroundColor:PH,
       borderRadius:3,borderSkipped:false,maxBarThickness:16},
      {label:T.legComTag,data:md.map(r=>r.tag),backgroundColor:'#D4A0DE',
       borderRadius:3,borderSkipped:false,maxBarThickness:16}]},options:comLegenda(opcoes())});
}

/* ---------- reveal ---------- */
function observaReveal(){
  if(!('IntersectionObserver' in window) ||
     window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    document.querySelectorAll('.reveal').forEach(e=>e.classList.add('in')); return; }
  const io=new IntersectionObserver(es=>es.forEach(function(e){
    if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }}),
    {rootMargin:'0px 0px -60px 0px'});
  document.querySelectorAll('.reveal').forEach(e=>io.observe(e));
}

/* ---------- controles ---------- */
btnAplicar.onclick=function(){
  if(dtIni.value) ini=dtIni.value;
  if(dtFim.value) fim=dtFim.value;
  if(ini>fim){const x=ini; ini=fim; fim=x;}
  dtIni.value=ini; dtFim.value=fim;
  btnAplicar.classList.remove('pending'); render();
};
[dtIni,dtFim].forEach(el=>el.oninput=()=>btnAplicar.classList.add('pending'));
mesSel.onchange=function(e){
  const v=e.target.value;
  if(!v){ ini=DMIN; fim=DMAX; }
  else if(v==='__midia'){ fim=DMAX; ini=M.corte; }
  else if(v==='__30'){ fim=DMAX; ini=todasDatas[Math.max(0,todasDatas.length-30)]; }
  else if(v==='__7'){ fim=DMAX; ini=todasDatas[Math.max(0,todasDatas.length-7)]; }
  else { const ds=todasDatas.filter(d=>d.startsWith(v)); ini=ds[0]; fim=ds[ds.length-1]; }
  dtIni.value=ini; dtFim.value=fim;
  btnAplicar.classList.remove('pending'); render();
};
document.querySelector('.topo').onclick=function(e){
  const b=e.target.closest('.tab'); if(!b) return;
  document.querySelectorAll('.tab').forEach(x=>x.classList.remove('active'));
  document.querySelectorAll('.pane').forEach(x=>x.classList.remove('active'));
  b.classList.add('active');
  const pane=document.getElementById('p-'+b.dataset.p);
  pane.classList.add('active');
  pane.querySelectorAll('.reveal').forEach(x=>x.classList.add('in'));
  Object.values(charts).forEach(c=>c.resize());
  window.scrollTo({top:0,behavior:'smooth'});
};
document.getElementById('btLang').onclick=function(){
  const u=new URL(location.href);
  u.searchParams.set('lang', PT?'en':'pt');
  location.href=u.toString();
};
document.getElementById('btLang').textContent = PT ? 'EN' : 'PT';

/* ---------- carga ---------- */
aplicaIdioma();
const _v='?v='+Date.now();
Promise.all([
  fetch('data.json'+_v).then(r=>{ if(!r.ok) throw new Error('data.json HTTP '+r.status); return r.json(); }),
  fetch('midia.json'+_v).then(r=>r.ok?r.json():null).catch(()=>null)
]).then(function(a){ D=a[0]; M=a[1]; boot(); })
 .catch(function(e){
   document.querySelector('.wrap').insertAdjacentHTML('afterbegin',
     '<div class="call bad" style="margin:40px 0"><span class="tag">Erro</span><h3>'
     +T.erroTit+'</h3><p>'+T.erroTxt(e.message)+'</p></div>');
 });
