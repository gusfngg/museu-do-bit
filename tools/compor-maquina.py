"""Compõe a foto real de uma máquina sobre um fundo temático (1280x960, JPEG).

Uso:
  python3 tools/compor-maquina.py FOTO ID --cores "#1d2b53,#7e2553" --motivo grade [--modo recorte|moldura] [--tolerancia 28]

Motivos: grade, listras, pixels, scanlines, madeira, bandeira, basic
Modo recorte: remove o fundo claro/liso da foto (flood fill a partir das bordas).
Modo moldura: mantém a foto inteira dentro de um quadro com sombra.
"""
import argparse
import random
from pathlib import Path

from PIL import Image, ImageChops, ImageDraw, ImageFilter

L, A = 1280, 960
SAIDA = Path(__file__).resolve().parent.parent / "img" / "maquinas"


def hex_rgb(h):
    h = h.strip().lstrip("#")
    return tuple(int(h[i:i + 2], 16) for i in (0, 2, 4))


def gradiente(c1, c2):
    topo, base = Image.new("RGB", (L, A), c1), Image.new("RGB", (L, A), c2)
    mascara = Image.linear_gradient("L").resize((L, A))
    return Image.composite(base, topo, mascara)


def motivo(fundo, nome, cores):
    d = ImageDraw.Draw(fundo, "RGBA")
    rnd = random.Random(nome)
    claro = (255, 255, 255)
    if nome == "grade":  # chão em perspectiva, estilo synthwave
        horiz = int(A * 0.58)
        for i in range(1, 18):
            y = horiz + int((A - horiz) * (i / 17) ** 2)
            d.line([(0, y), (L, y)], fill=claro + (40,), width=2)
        for i in range(-12, 13):
            d.line([(L / 2 + i * 30, horiz), (L / 2 + i * 260, A)], fill=claro + (40,), width=2)
        d.ellipse([L / 2 - 230, horiz - 300, L / 2 + 230, horiz + 160], fill=cores[-1] + (90,))
    elif nome == "listras":  # arco-íris diagonal (Spectrum, Apple)
        arco = [(230, 40, 40), (245, 160, 30), (245, 220, 40), (60, 190, 70), (40, 150, 230), (150, 70, 200)]
        for i, c in enumerate(arco):
            x = L - 520 + i * 46
            d.polygon([(x, A), (x + 46, A), (x + 46 + 420, A - 420), (x + 420, A - 420)], fill=c + (200,))
    elif nome == "pixels":  # blocos de pixel espalhados
        for _ in range(140):
            t = rnd.choice([16, 24, 32, 48])
            x, y = rnd.randrange(0, L, 16), rnd.randrange(0, A, 16)
            c = rnd.choice(cores + [claro])
            d.rectangle([x, y, x + t, y + t], fill=c + (rnd.randint(25, 70),))
    elif nome == "scanlines":  # brilho de tubo CRT
        d.ellipse([L * 0.1, A * 0.05, L * 0.9, A * 0.95], fill=cores[-1] + (60,))
        for y in range(0, A, 4):
            d.line([(0, y), (L, y)], fill=(0, 0, 0, 45))
    elif nome == "madeira":  # painel de madeira dos anos 70
        for x in range(0, L, 64):
            tom = rnd.randint(-14, 14)
            c = tuple(max(0, min(255, v + tom)) for v in cores[0])
            d.rectangle([x, 0, x + 62, int(A * 0.62)], fill=c + (255,))
            for _ in range(6):
                gx = x + rnd.randint(4, 58)
                d.line([(gx, 0), (gx + rnd.randint(-6, 6), int(A * 0.62))], fill=(0, 0, 0, 35), width=2)
        d.rectangle([0, int(A * 0.62), L, A], fill=cores[-1] + (255,))
    elif nome == "bandeira":  # verde e amarelo, máquinas brasileiras
        d.polygon([(L / 2, 80), (L - 80, A / 2), (L / 2, A - 80), (80, A / 2)], fill=(250, 210, 40, 70))
        d.ellipse([L / 2 - 250, A / 2 - 250, L / 2 + 250, A / 2 + 250], fill=(30, 60, 160, 60))
    elif nome == "basic":  # linhas de código ao fundo, tela de BASIC
        for y in range(60, A, 34):
            x = 60
            while x < L - 60:
                w = rnd.choice([40, 60, 90, 140])
                d.rectangle([x, y, x + w, y + 14], fill=claro + (28,))
                x += w + 20
                if rnd.random() < 0.25:
                    break
    return fundo


def vinheta(img):
    m = Image.new("L", (L, A), 0)
    ImageDraw.Draw(m).ellipse([-L * 0.25, -A * 0.25, L * 1.25, A * 1.25], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(160))
    return Image.composite(img, Image.new("RGB", (L, A), (0, 0, 0)), m)


def recortar(foto, tol):
    """Fundo liso vira transparente: flood fill a partir de pontos da borda."""
    if foto.mode in ("RGBA", "LA", "P") and foto.convert("RGBA").getextrema()[3][0] < 255:
        rgba = foto.convert("RGBA")  # PNG já recortado: usa a transparência dele
        return rgba.crop(rgba.getchannel("A").getbbox())
    rgb = foto.convert("RGB")
    marcada = rgb.copy()
    alvo = (255, 0, 255)
    w, h = rgb.size
    pontos = [(x, 0) for x in range(0, w, max(1, w // 40))] + [(x, h - 1) for x in range(0, w, max(1, w // 40))]
    pontos += [(0, y) for y in range(0, h, max(1, h // 40))] + [(w - 1, y) for y in range(0, h, max(1, h // 40))]
    for p in pontos:
        if marcada.getpixel(p) != alvo:
            ImageDraw.floodfill(marcada, p, alvo, thresh=tol)
    dif = ImageChops.difference(marcada, Image.new("RGB", (w, h), alvo)).convert("L")
    alfa = dif.point(lambda v: 255 if v > 8 else 0).filter(ImageFilter.MinFilter(3)).filter(ImageFilter.GaussianBlur(1.2))
    rgba = rgb.convert("RGBA")
    rgba.putalpha(alfa)
    return rgba.crop(alfa.getbbox())


def encaixar(img, larg, alt):
    img = img.copy()
    img.thumbnail((larg, alt), Image.LANCZOS)
    return img


def compor(args):
    cores = [hex_rgb(c) for c in args.cores.split(",")]
    fundo = vinheta(motivo(gradiente(cores[0], cores[-1]), args.motivo, cores))
    foto = Image.open(args.foto)
    if args.modo == "recorte":
        peca = encaixar(recortar(foto, args.tolerancia), int(L * 0.8), int(A * 0.72))
        x, y = (L - peca.width) // 2, int(A * 0.9) - peca.height
        sombra = Image.new("L", (L, A), 0)
        ImageDraw.Draw(sombra).ellipse([x + peca.width * 0.05, y + peca.height - 30, x + peca.width * 0.95, y + peca.height + 40], fill=170)
        fundo = Image.composite(Image.new("RGB", (L, A), (0, 0, 0)), fundo, sombra.filter(ImageFilter.GaussianBlur(28)))
        fundo.paste(peca, (x, y), peca)
    else:
        peca = encaixar(foto.convert("RGB"), int(L * 0.78), int(A * 0.74))
        x, y = (L - peca.width) // 2, (A - peca.height) // 2
        sombra = Image.new("L", (L, A), 0)
        ImageDraw.Draw(sombra).rectangle([x + 10, y + 24, x + peca.width + 10, y + peca.height + 24], fill=190)
        fundo = Image.composite(Image.new("RGB", (L, A), (0, 0, 0)), fundo, sombra.filter(ImageFilter.GaussianBlur(26)))
        ImageDraw.Draw(fundo).rectangle([x - 12, y - 12, x + peca.width + 11, y + peca.height + 11], fill=(245, 243, 236))
        fundo.paste(peca, (x, y))
    destino = SAIDA / f"{args.id}.jpg"
    fundo.save(destino, "JPEG", quality=84, optimize=True, progressive=True)
    print(destino)


if __name__ == "__main__":
    p = argparse.ArgumentParser()
    p.add_argument("foto")
    p.add_argument("id")
    p.add_argument("--cores", required=True)
    p.add_argument("--motivo", default="pixels")
    p.add_argument("--modo", choices=["recorte", "moldura"], default="recorte")
    p.add_argument("--tolerancia", type=int, default=28)
    compor(p.parse_args())
