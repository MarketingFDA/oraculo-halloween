# Oráculo do Halloween

Página da campanha interna de Halloween do grupo Fradema. O colaborador informa nome e filial, a bruxa revela **DOCES** ou **TRAVESSURAS** e gera um cupom para ele apresentar ao seu gestor.

- **Página:** https://marketingfda.github.io/oraculo-halloween/
- `index.html`: a página publicada no GitHub Pages (áudios embutidos em base64).
- `servidor/`: o servidor (Cloudflare Worker + Durable Object) que guarda as cotas e as participações.
- `audio/`: as falas originais da bruxa (edge-tts, vozes Francisca e Thalita) e a gargalhada (CC0, OpenGameArt "witch cackle").
- `scripts/`: os scripts que geram as vozes.

## Regras do sorteio

- Cada filial tem uma cota fechada: 70% DOCES e 30% TRAVESSURAS do número de pessoas (arredondado).
- O sorteio é aleatório entre os brindes que ainda restam na filial, então os totais saem exatos.
- Uma participação por pessoa: o mesmo nome na mesma filial (sem diferenciar maiúsculas e acentos) recebe sempre o mesmo resultado e código.
- Quando a cota da filial acaba, a página avisa que os brindes se esgotaram.

## Painel admin

A lua ☾ no canto da página abre os bastidores. Com a senha da organização, mostra os brindes por filial, a lista de participantes e permite ajustar o número de pessoas, remover uma participação, encerrar ou reativar a campanha e zerar tudo.

## Atualizar o servidor

```
cd servidor
npx wrangler deploy
```
