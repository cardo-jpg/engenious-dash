# Engenious · Funil de Aquisição

**No ar:**
- Português — https://cardo-jpg.github.io/engenious-dash/
- English — https://cardo-jpg.github.io/engenious-dash/en.html

Um arquivo só, com dicionário de idioma. O botão EN/PT no canto da navegação
troca e guarda a escolha; `?lang=en` força o inglês. `en.html` é só um redirecionamento,
para ter um link limpo de mandar para o cliente.

### Como mexer

`index.html` é **gerado**, não editado. Nunca mexa nele direto.

| Arquivo | O que é |
|---|---|
| `index.src.html` | a fonte, em português — estrutura e conteúdo |
| `textos.py` | os textos fixos do HTML: `(chave, português, inglês)` |
| `novo_js.js` | a lógica, com o dicionário `DIC` das mensagens montadas em código |
| `montar.py` | junta os três e escreve `index.html` |

```bash
python montar.py
```

Rodar duas vezes dá o mesmo resultado. O script **falha se algum texto ficar sem
tradução** — é de propósito: meia dash em inglês é pior que nenhuma.

Mensagem que mistura texto com número vira **função** no dicionário, recebendo o
número como argumento. Traduzir pedaço de frase não funciona, a ordem das palavras muda.

Duas fontes, dois papéis, sem misturar:

| Arquivo | Fonte | O que responde |
|---|---|---|
| `data.json`  | PostHog (HogQL, 120 dias) | o que as pessoas fazem no site |
| `midia.json` | planilha do Meta via Stract | o que a campanha custou e entregou |

Os números de campanha vêm **100% do gerenciador da Meta**, nunca do PostHog.
A série de mídia começa em **19/08/2026**, quando o gatilho de checkout mudou —
antes dessa data nada é comparável.

## Scripts

- `fetch.py` → consulta o PostHog com granularidade diária e grava `data.json`
- `fetch_midia.py` → baixa a planilha, filtra campanhas `EN_` a partir do corte e grava `midia.json`

A página lê os dois arquivos no navegador e filtra o período do lado do cliente,
por isso trocar de data é instantâneo.

O GitHub Actions roda às 8h de Brasília e só commita se o dado mudou.

## Excluir uma venda de teste

Vendas de teste nossas saem por lista explicita em `excluir.json`, nunca por regra
automatica — assim da para auditar o que foi tirado:

```json
[{"ts": "2026-08-19T18:25:57", "motivo": "teste do Jose"}]
```

Casa por `ts`, `cliente` (id do Stripe), `fatura` ou `sessao` — o que estiver
preenchido, por prefixo. O que sai aparece na aba "Qualidade do dado" com o motivo.

Nao da para identificar teste por geolocalizacao: todo evento de venda chega do
servidor deles na AWS, entao tudo geolocaliza em Columbus, Ohio.

## Segredos

Em **Settings → Secrets → Actions**:

- `POSTHOG_API_KEY` — chave pessoal do PostHog
- `PLANILHA_ID` — id da planilha do Stract

Nunca no repositório, nunca na página.

## Rodar na mão

```bash
pip install -r requirements.txt
export POSTHOG_API_KEY=phx_...
python fetch.py
python fetch_midia.py
python -m http.server 8000   # precisa de servidor: fetch() não lê do disco
```

## Ressalvas

Estão na aba "Qualidade do dado" da própria página — é lá que precisam ser lidas.
A mais grave: os anúncios não carregam parâmetro de URL, então nenhum tráfego pago
é atribuível às campanhas.

---
Cardô Marketing
