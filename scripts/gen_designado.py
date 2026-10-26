# Regrava as falas de resultado trocando "o seu gestor" por "a pessoa designada da sua filial" (26/10/2026).
import asyncio, edge_tts, os
DOCES = "A doçura está ao seu lado. As cartas decidiram que hoje você merece uma pequena recompensa. Pegue o seu cupom e procure a pessoa designada da sua filial... antes que eu mude de ideia."
TRAV = "A travessura escolheu você. As sombras se moveram, a vela se apagou, e o seu destino tomou outro rumo. Pegue o seu cupom e descubra o que lhe espera com a pessoa designada da sua filial."
JOBS = [
 ("f-doces", "pt-BR-FranciscaNeural", "-14Hz", "+6%", DOCES),
 ("t-doces", "pt-BR-ThalitaMultilingualNeural", "-12Hz", "+4%", DOCES),
 ("f-trav", "pt-BR-FranciscaNeural", "-14Hz", "+6%", TRAV),
 ("t-trav", "pt-BR-ThalitaMultilingualNeural", "-12Hz", "+4%", TRAV),
]
async def one(name, voice, pitch, rate, text):
    out = os.path.join("audio", name + ".mp3")
    await edge_tts.Communicate(text, voice, rate=rate, pitch=pitch).save(out)
    print(out, os.path.getsize(out))
async def main():
    for j in JOBS: await one(*j)  # um por vez: em paralelo o serviço recusa a Thalita
asyncio.run(main())
