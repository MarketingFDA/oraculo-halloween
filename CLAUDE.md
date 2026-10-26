# Oráculo do Halloween

## Objetivo
Página da campanha interna de Halloween (grupo Fradema): o colaborador informa nome e filial, a bruxa revela DOCES ou TRAVESSURAS e gera um cupom para apresentar ao seu gestor.

## Links
- Página oficial (GitHub Pages): https://marketingfda.github.io/oraculo-halloween/
- Repositório: https://github.com/MarketingFDA/oraculo-halloween (conta GitHub MarketingFDA)
- Servidor (Cloudflare Worker, conta Cloudflare própria da usuária): https://oraculo-halloween.oraculo-fradema.workers.dev
- Artefato antigo https://claude.ai/artifact/QtyVWdXknEC437aGc3FjLd agora só leva à página oficial (fonte: artefato-redirecionamento.html).

## Decisões
- 26/10/2026: cotas fechadas por filial, 70% DOCES / 30% TRAVESSURAS (Math.round), sorteio entre os brindes restantes. Lista de filiais e pessoas em `servidor/src/index.js` (FILIAIS_INICIAIS); depois de publicado, ajustar pelo painel admin (“Salvar quantidades”).
- Identificação: janela com nome completo + filial antes da bruxa falar. Mesmo nome (sem acentos/maiúsculas) + mesma filial = mesmo resultado e código.
- Painel admin (lua ☾) protegido por senha (segredo ADMIN_SENHA no Worker; cópia local em servidor/senha-admin.txt, fora do git).
- Textos: "o seu gestor" (nunca "chefe da sua filial"); abertura "Olha só…" (nunca "Ora, ora"). Voz padrão Francisca.

## Arquivos
- `index.html`: página publicada (áudios em base64). `oraculo-halloween.html` = mesmo conteúdo sem o invólucro <html>.
- `servidor/`: Worker + Durable Object. Publicar com `cd servidor && npx wrangler deploy`.
- Verificar sintaxe JS: `sed -n '/^<script>$/,/^<\/script>$/p' index.html | grep -v "ORACULO_AUDIO\|^<script>$\|^</script>$\|falas da bruxa" > check.js && node --check check.js`

## Status
- 26/10/2026: tudo publicado e testado de ponta a ponta (navegador real, cupom, admin). Participações zeradas, pronto para uso.
