# Engenious · Funil de Aquisição

Dashboard do comportamento no site da Engenious University, lida do PostHog.

**No ar:** https://cardo-jpg.github.io/engenious-dash/

## Como funciona

`fetch.py` consulta o PostHog (HogQL) com granularidade diária numa janela de 120
dias e grava `data.json`. A página lê esse arquivo no navegador e faz todo o
filtro de período do lado do cliente — por isso trocar de mês é instantâneo.

O GitHub Actions roda às 8h de Brasília e só commita se o dado mudou.

## Chave de API

Vive em **Settings → Secrets → Actions** como `POSTHOG_API_KEY`.
Nunca no repositório, nunca na página.

## Rodar na mão

```bash
export POSTHOG_API_KEY=phx_...
python fetch.py
python -m http.server 8000   # a página precisa de servidor: fetch() não lê do disco
```

## Ressalvas do dado

Estão na aba "Qualidade do dado" da própria página — é lá que elas precisam ser
lidas, não aqui. A mais grave: os anúncios não carregam parâmetro de URL, então
nenhum tráfego pago é atribuível às campanhas.

---
Cardô Marketing
