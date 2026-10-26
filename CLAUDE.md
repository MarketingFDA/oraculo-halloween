# Oráculo do Halloween

Página HTML (artefato Claude) da campanha interna de Halloween: uma bruxa fala com o colaborador, sorteia DOCES ou TRAVESSURAS e gera um cupom para apresentar ao seu gestor.

- Artefato publicado (sempre republicar neste mesmo link): https://claude.ai/artifact/QtyVWdXknEC437aGc3FjLd
- Fonte: `oraculo-halloween.html` (áudios embutidos em base64 em `window.ORACULO_AUDIO`).
- Áudios originais: `audio/` (f-* = Francisca, t-* = Thalita, laugh.wav / witch_cackle.ogg = gargalhada CC0).
- Scripts de geração de voz (edge-tts): `scripts/` — rodar com `python -P` e `python -m edge_tts`.
- Verificar sintaxe JS: `sed -n '/^<script>$/,/^<\/script>$/p' oraculo-halloween.html | grep -v "ORACULO_AUDIO\|^<script>$\|^</script>$\|falas da bruxa" > check.js && node --check check.js`

Regras de texto: dizer "o seu gestor" (nunca "chefe da sua filial"); abertura "Olha só…" (nunca "Ora, ora"). Voz padrão: Francisca (pt-BR).
