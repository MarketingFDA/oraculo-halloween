import asyncio, edge_tts, os
LINES = {
 "intro1": "Ora, ora... Quem ousa entrar no meu reino, nesta noite de Halloween?",
 "intro2": "Vejo que você veio me visitar neste Dia das Bruxas.",
 "intro3": "Aproxime-se da minha bola de cristal. As cartas estão ansiosas para revelar o seu destino.",
 "intro4": "Diga-me... Você acha que vai ganhar doces? Ou sofrer uma travessura?",
 "reveal": "As cartas giram. Não desvie o olhar.",
 "doces": "A doçura está ao seu lado. As cartas decidiram que hoje você merece uma pequena recompensa. Pegue o seu cupom e procure o seu gestor... antes que eu mude de ideia.",
 "trav": "Oh, oh, oh... A travessura escolheu você. As sombras se moveram, a vela se apagou, e o seu destino tomou outro rumo. Pegue o seu cupom e descubra o que lhe espera com o seu gestor.",
}
VOICES = {"f": ("pt-BR-FranciscaNeural", "-14Hz", "+6%"), "t": ("pt-BR-ThalitaMultilingualNeural", "-12Hz", "+4%")}
async def one(key, text, tag, voice, pitch, rate):
    out = os.path.join("audio", f"{tag}-{key}.mp3")
    com = edge_tts.Communicate(text, voice, rate=rate, pitch=pitch)
    await com.save(out)
    print(out, os.path.getsize(out))
async def main():
    tasks = [one(k, t, tag, *VOICES[tag]) for tag in VOICES for k, t in LINES.items()]
    await asyncio.gather(*tasks)
asyncio.run(main())
