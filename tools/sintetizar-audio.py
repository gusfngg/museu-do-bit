import math
import random
import struct
import subprocess
import wave
from pathlib import Path

TAXA = 22050
pasta = Path(__file__).resolve().parent.parent / "audio"
pasta.mkdir(exist_ok=True)

random.seed(7)


def onda(tipo, fase):
    f = fase % 1.0
    if tipo == "quadrada":
        return 1.0 if f < 0.5 else -1.0
    if tipo == "pulso":
        return 1.0 if f < 0.25 else -1.0
    if tipo == "serra":
        return 2.0 * f - 1.0
    if tipo == "triangulo":
        return 4.0 * abs(f - 0.5) - 1.0
    return math.sin(2 * math.pi * f)


def nota(freq, dur, tipo="quadrada", vol=0.4, ataque=0.005, soltura=0.05, vibrato=0.0):
    n = int(dur * TAXA)
    saida = []
    fase = 0.0
    for i in range(n):
        t = i / TAXA
        f = freq * (1 + vibrato * math.sin(2 * math.pi * 6 * t))
        fase += f / TAXA
        env = min(1.0, t / ataque) if ataque else 1.0
        resto = dur - t
        if resto < soltura:
            env *= resto / soltura
        saida.append(onda(tipo, fase) * vol * env)
    return saida


def varredura(f0, f1, dur, tipo="quadrada", vol=0.35):
    n = int(dur * TAXA)
    saida = []
    fase = 0.0
    for i in range(n):
        t = i / n
        fase += (f0 + (f1 - f0) * t) / TAXA
        env = min(1.0, i / 200) * min(1.0, (n - i) / 400)
        saida.append(onda(tipo, fase) * vol * env)
    return saida


def silencio(dur):
    return [0.0] * int(dur * TAXA)


def ruido(dur, vol=0.2):
    return [(random.random() * 2 - 1) * vol for _ in range(int(dur * TAXA))]


def misturar(*faixas):
    tam = max(len(f) for f in faixas)
    return [sum(f[i] for f in faixas if i < len(f)) for i in range(tam)]


def gravar(nome, amostras):
    pico = max(abs(a) for a in amostras) or 1.0
    escala = 0.85 / max(pico, 0.85)
    wav = pasta / f"{nome}.wav"
    with wave.open(str(wav), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(TAXA)
        w.writeframes(b"".join(struct.pack("<h", int(max(-1, min(1, a * escala)) * 32767)) for a in amostras))
    mp3 = pasta / f"{nome}.mp3"
    subprocess.run(
        ["ffmpeg", "-loglevel", "error", "-y", "-i", str(wav), "-codec:a", "libmp3lame", "-b:a", "64k", str(mp3)],
        check=True,
    )
    wav.unlink()


def hz(semitons):
    return 440.0 * 2 ** ((semitons - 9) / 12)


boot = []
boot += nota(1000, 0.18, "quadrada", 0.35)
boot += silencio(0.35)
boot += ruido(0.6, 0.05)
for k in range(8):
    boot += nota(180 + k * 4, 0.06, "serra", 0.18)
    boot += silencio(0.06)
boot += silencio(0.3)
boot += nota(hz(0), 0.12, "triangulo", 0.4) + nota(hz(4), 0.12, "triangulo", 0.4) + nota(hz(7), 0.12, "triangulo", 0.4)
boot += nota(hz(12), 0.5, "triangulo", 0.45, soltura=0.3)
gravar("boot-pc", boot)

melodia = [0, 4, 7, 12, 7, 4, 0, 4, 7, 12, 16, 12, 7, 4]
baixo = [-12, -12, -5, -5, -12, -12, -7, -7]
arpejo = []
for _ in range(2):
    for s in melodia:
        arpejo += nota(hz(s + 12), 0.09, "pulso", 0.3, soltura=0.02)
trilha_baixo = []
for _ in range(2):
    for s in baixo:
        trilha_baixo += nota(hz(s), 0.31, "triangulo", 0.45, soltura=0.05)
gravar("chiptune-8bit", misturar(arpejo, trilha_baixo))

modem = silencio(0.2)
modem += misturar(nota(350, 0.9, "seno", 0.3), nota(440, 0.9, "seno", 0.3))
modem += silencio(0.15)
for f1, f2 in [(1200, 2200), (980, 1650), (1500, 2100), (1080, 1750), (1300, 2000), (1700, 2300)]:
    modem += misturar(nota(f1, 0.11, "seno", 0.28), nota(f2, 0.11, "seno", 0.28))
modem += silencio(0.2)
modem += misturar(nota(2100, 0.6, "seno", 0.3), ruido(0.6, 0.06))
modem += ruido(1.4, 0.35)
modem += misturar(varredura(900, 1800, 0.6, "seno", 0.25), ruido(0.6, 0.18))
modem += ruido(0.5, 0.25)
gravar("modem-discado", modem)

sid_notas = [
    (7, 0.18), (10, 0.18), (14, 0.18), (19, 0.36),
    (17, 0.18), (14, 0.18), (10, 0.18), (14, 0.36),
    (12, 0.18), (15, 0.18), (19, 0.18), (24, 0.36),
    (22, 0.18), (19, 0.18), (15, 0.18), (19, 0.54),
]
lead = []
pulso = []
for s, d in sid_notas:
    lead += nota(hz(s), d, "serra", 0.32, soltura=0.04, vibrato=0.01)
    pulso += nota(hz(s - 12), d, "pulso", 0.22, soltura=0.04)
gravar("sid-melodia", misturar(lead, pulso))

print("4 áudios gerados")
