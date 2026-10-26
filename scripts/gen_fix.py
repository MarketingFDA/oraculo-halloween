import asyncio, edge_tts, os
JOBS = [
 ("f-intro1", "pt-BR-FranciscaNeural", "-14Hz", "+6%", "Olha só... Quem ousa entrar no meu reino, nesta noite de Halloween?"),
 ("t-intro1", "pt-BR-ThalitaMultilingualNeural", "-12Hz", "+4%", "Olha só... Quem ousa entrar no meu reino, nesta noite de Halloween?"),
 ("f-reveal", "pt-BR-FranciscaNeural", "-14Hz", "+6%", "As cartas estão girando. Não desvie o olhar."),
 ("t-reveal", "pt-BR-ThalitaMultilingualNeural", "-12Hz", "+4%", "As cartas estão girando. Não desvie o olhar."),
]
async def one(name, voice, pitch, rate, text):
    out = os.path.join("audio", name + ".mp3")
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(out)
    print(out, os.path.getsize(out))
async def main(): await asyncio.gather(*(one(*j) for j in JOBS))
asyncio.run(main())
