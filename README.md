# Engenious · Funil de Aquisição

**No ar:** https://cardo-jpg.github.io/engenious-dash/

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
