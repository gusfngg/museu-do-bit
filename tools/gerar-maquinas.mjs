import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const saida = join(dirname(fileURLToPath(import.meta.url)), "..", "img", "maquinas");
mkdirSync(saida, { recursive: true });

const R = (x, y, w, h, f, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`;
const C = (x, y, r, f) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${f}"/>`;
const T = (x, y, s, f, t, extra = "") =>
  `<text x="${x}" y="${y}" font-family="Courier New, monospace" font-size="${s}" font-weight="700" fill="${f}" ${extra}>${t}</text>`;

const brilho = (x, y, w) => R(x, y, w, 5, "#fff", 'opacity=".22"');
const base = (x, y, w) => R(x, y, w, 6, "#000", 'opacity=".22"');

const grade = (x, y, cols, rows, w, h, gap, cor, corAlt = null, altCada = 0) => {
  let s = "";
  for (let j = 0; j < rows; j++)
    for (let i = 0; i < cols; i++) {
      const alt = corAlt && altCada && (i + j) % altCada === 0;
      s += R(x + i * (w + gap), y + j * (h + gap), w, h, alt ? corAlt : cor);
    }
  return s;
};

const moldura = (conteudo, rx) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 240" shape-rendering="crispEdges" role="img">` +
  `<ellipse cx="160" cy="220" rx="${rx}" ry="8" fill="#000" opacity=".4"/>${conteudo}</svg>`;

const tela = (x, y, w, h, fundo, linhas, cor) => {
  let s = R(x, y, w, h, fundo);
  linhas.forEach(([lx, ly, lw]) => (s += R(x + lx, y + ly, lw, 3, cor)));
  return s + R(x, y, w, 3, "#fff", 'opacity=".07"');
};

const monitor = (x, y, w, h, corCaixa, corTela, corTexto, pe = true) => {
  let s = R(x, y, w, h, corCaixa) + brilho(x, y, w);
  s += R(x + 10, y + 10, w - 20, h - 24, "#15130f");
  s += tela(x + 14, y + 14, w - 28, h - 32, corTela, [
    [6, 8, 54], [6, 18, 38], [6, 28, 66], [6, 38, 22], [32, 38, 8],
  ], corTexto);
  if (pe) s += R(x + w / 2 - 22, y + h, 44, 8, corCaixa) + R(x + w / 2 - 34, y + h + 8, 68, 6, corCaixa);
  return s;
};

const teclado = ({ corca, corte, linhas, fita = [], placa = "", corPlaca = "#fff", larg = 250, y = 130, h = 70 }) => {
  const x = (320 - larg) / 2;
  let s = R(x, y, larg, h, corca) + brilho(x, y, larg) + base(x, y + h, larg);
  const cols = Math.floor((larg - 28) / 15);
  s += grade(x + 14, y + 16, cols, linhas, 12, 9, 3, corte);
  fita.forEach((cor, i) => (s += R(x + larg - 70 + i * 12, y + 4, 12, 4, cor)));
  if (placa) s += T(x + 14, y + 11, 8, corPlaca, placa);
  return s;
};

const controle = (x, y, cor, botoes) => {
  let s = R(x, y, 70, 22, cor);
  s += R(x + 8, y + 8, 14, 5, "#2d2a26") + R(x + 12, y + 4, 6, 13, "#2d2a26");
  return s + botoes.map((b, i) => C(x + 46 + i * 9, y + 11, 3.5, b)).join("");
};

const maquinas = {};

maquinas["altair-8800"] = () => {
  let s = R(36, 96, 248, 104, "#2d3a52") + R(36, 86, 248, 12, "#4a5d82");
  s += R(44, 106, 232, 84, "#cdd3dd");
  for (let i = 0; i < 16; i++) {
    const x = 58 + i * 13;
    s += R(x - 1, 115, 9, 9, "#e0392b", 'opacity=".28"') + R(x, 116, 7, 7, "#e0392b");
    s += R(x, 140, 7, 18, "#1c2433") + R(x, 140, 7, 6, "#f4f1e8");
  }
  for (let g = 0; g < 5; g++) s += R(54 + g * 39, 164, 36, 4, g % 2 ? "#2d3a52" : "#e0392b");
  s += T(60, 182, 10, "#2d3a52", "ALTAIR 8800");
  return moldura(s, 130);
};

maquinas["apple-ii"] = () => {
  let s = monitor(96, 22, 128, 100, "#d6ccb2", "#1a2f1a", "#7cff8a");
  s += R(40, 150, 240, 58, "#d9cfb6") + brilho(40, 150, 240) + R(40, 206, 240, 6, "#a99f86");
  s += grade(58, 162, 14, 3, 12, 9, 3, "#3b3631");
  s += R(110, 196, 100, 4, "#3b3631");
  s += R(52, 154, 6, 4, "#e0392b") + R(60, 154, 6, 4, "#f2a900") + R(68, 154, 6, 4, "#34a853") + R(76, 154, 6, 4, "#2b6fe0");
  return moldura(s, 130);
};

maquinas["ibm-pc-5150"] = () => {
  let s = monitor(86, 14, 100, 84, "#c9c2ad", "#0f1d12", "#6bff9a", false);
  s += R(120, 98, 32, 8, "#c9c2ad");
  s += R(40, 106, 240, 50, "#d3ccb7") + brilho(40, 106, 240);
  s += R(54, 120, 70, 8, "#2d2a26") + R(54, 136, 70, 8, "#2d2a26") + R(134, 120, 6, 6, "#34a853");
  s += R(206, 114, 62, 34, "#bdb5a0") + grade(210, 118, 8, 1, 6, 26, 1, "#a39b86");
  s += R(40, 154, 240, 3, "#8b8470");
  s += R(60, 176, 200, 28, "#2d2a26") + grade(66, 181, 16, 3, 9, 5, 2, "#8c867a", "#bdb5a0", 6);
  return moldura(s, 126);
};

maquinas["commodore-64"] = () => {
  let s = teclado({ corca: "#cdbd9d", corte: "#7a5d46", linhas: 4, placa: "COMMODORE 64", corPlaca: "#4a3a2c" });
  s += R(60, 182, 140, 10, "#e6e0cf") + R(236, 140, 6, 6, "#e0392b");
  return moldura(s, 132);
};

maquinas["zx-spectrum"] = () =>
  moldura(
    teclado({
      corca: "#1c1c1f", corte: "#8e8e94", linhas: 4, larg: 220, y: 140, h: 62,
      fita: ["#e0392b", "#f2c200", "#34a853", "#2fb7e6"], placa: "ZX Spectrum", corPlaca: "#d9d9de",
    }),
    118
  );

maquinas["tk-90x"] = () =>
  moldura(
    teclado({
      corca: "#262629", corte: "#9a9aa0", linhas: 4, larg: 224, y: 138, h: 64,
      fita: ["#e0392b", "#f2c200", "#34a853", "#2b6fe0"], placa: "TK 90X", corPlaca: "#e0392b",
    }),
    120
  );

maquinas["expert-msx"] = () => {
  let s = teclado({ corca: "#d7d9dc", corte: "#4b4f57", linhas: 4, larg: 250, y: 140, h: 62, placa: "EXPERT  MSX", corPlaca: "#2b6fe0" });
  s += R(220, 118, 62, 22, "#2f3236") + R(226, 124, 50, 10, "#0f1215") + R(60, 188, 70, 6, "#2b6fe0");
  return moldura(s, 132);
};

maquinas["amiga-500"] = () => {
  let s = R(92, 40, 136, 88, "#d9d0ba") + R(102, 50, 116, 62, "#15130f");
  s += tela(106, 54, 108, 54, "#2f4f9a", [[8, 10, 60], [8, 20, 40], [8, 30, 76]], "#f2f2f2") + R(148, 128, 24, 8, "#d9d0ba");
  s += R(36, 140, 248, 68, "#ddd4be") + brilho(36, 140, 248) + base(36, 208, 248);
  s += grade(52, 154, 15, 3, 11, 9, 3, "#4d463b") + R(52, 192, 96, 6, "#4d463b");
  s += R(250, 150, 22, 36, "#bdb49e") + R(255, 158, 12, 3, "#2d2a26") + R(252, 192, 4, 4, "#e0392b");
  return moldura(s, 130);
};

maquinas["macintosh-128k"] = () => {
  let s = R(100, 20, 120, 168, "#d9d1bb") + brilho(100, 20, 120);
  s += R(112, 34, 96, 84, "#15130f") + R(116, 38, 88, 76, "#e9efe0");
  s += R(142, 58, 36, 30, "#15130f") + R(150, 66, 6, 6, "#e9efe0") + R(164, 66, 6, 6, "#e9efe0") + R(148, 78, 24, 3, "#e9efe0");
  s += R(130, 132, 60, 4, "#2d2a26") + R(160, 150, 20, 4, "#a29a84");
  s += R(104, 188, 112, 10, "#cfc7b0") + R(90, 198, 140, 8, "#cfc7b0");
  return moldura(s, 120);
};

maquinas["game-boy"] = () => {
  let s = R(98, 12, 124, 206, "#c5c1b4") + brilho(98, 12, 124) + base(98, 212, 124);
  s += R(108, 24, 104, 80, "#6b6a74") + R(122, 38, 76, 60, "#0f380f") + R(126, 42, 68, 52, "#9bbc0f");
  s += R(132, 50, 14, 14, "#306230") + R(150, 50, 40, 4, "#306230") + R(150, 58, 28, 4, "#306230") + R(132, 72, 52, 4, "#306230");
  s += R(114, 62, 4, 4, "#e0392b") + R(114, 70, 4, 4, "#34a853");
  s += T(112, 118, 9, "#2b3a8a", "Nintendo GAME BOY", 'textLength="96"');
  s += R(116, 140, 36, 12, "#2d2a26") + R(128, 128, 12, 36, "#2d2a26");
  s += C(184, 150, 9, "#9d1f52") + C(202, 140, 9, "#9d1f52");
  s += R(122, 182, 22, 5, "#7b7768") + R(152, 182, 22, 5, "#7b7768");
  for (let i = 0; i < 5; i++) s += R(176 + i * 7, 196, 3, 14, "#9d9886");
  return moldura(s, 100);
};

maquinas["atari-2600"] = () => {
  let s = R(44, 96, 232, 26, "#2a2824") + R(44, 96, 232, 4, "#6e4a2c");
  for (let i = 0; i < 12; i++) s += R(60 + i * 14, 104, 8, 14, "#0f0e0d");
  s += R(44, 122, 232, 72, "#1b1a18") + R(44, 122, 232, 5, "#fff", 'opacity=".12"');
  s += R(44, 128, 232, 44, "#7a4e2a") + R(44, 128, 232, 4, "#a06b3d");
  for (let i = 0; i < 4; i++) s += R(60 + i * 24, 148, 14, 18, "#1b1a18") + R(63 + i * 24, 148, 8, 7, "#d9d9d9");
  s += R(170, 142, 90, 6, "#1b1a18") + T(172, 164, 10, "#e8d9bd", "ATARI");
  s += R(110, 194, 100, 14, "#0f0e0d");
  return moldura(s, 134);
};

maquinas["nes"] = () => {
  let s = R(46, 92, 228, 94, "#bdbab0") + brilho(46, 92, 228) + base(46, 186, 228);
  s += R(60, 108, 200, 10, "#2d2a26") + R(60, 126, 120, 36, "#2d2a26") + R(66, 132, 108, 4, "#6c6a64");
  s += R(190, 126, 70, 36, "#d1cec4") + R(198, 134, 20, 8, "#e0392b") + R(224, 134, 28, 8, "#2d2a26");
  s += R(198, 148, 20, 8, "#9a978c") + R(224, 148, 28, 8, "#9a978c") + R(60, 170, 40, 4, "#e0392b");
  s += controle(125, 196, "#cfccc2", ["#c0182f", "#c0182f"]);
  return moldura(s, 130);
};

maquinas["mega-drive"] = () => {
  let s = R(76, 62, 108, 32, "#0e0e11") + R(82, 68, 96, 22, "#3a3a42") + R(90, 74, 80, 10, "#e0392b");
  s += R(60, 94, 140, 16, "#232328");
  s += R(50, 108, 220, 80, "#1b1b1f") + R(50, 108, 220, 5, "#fff", 'opacity=".12"');
  s += R(62, 122, 196, 6, "#c0182f") + T(70, 148, 12, "#f0f0f0", "MEGA DRIVE", 'textLength="110"');
  s += R(190, 136, 12, 12, "#34a853") + R(210, 136, 12, 12, "#2b6fe0") + R(60, 166, 160, 6, "#0e0e11");
  s += controle(125, 196, "#26262c", ["#c0182f", "#c0182f", "#c0182f"]);
  return moldura(s, 130);
};

maquinas["snes"] = () => {
  let s = R(42, 100, 236, 84, "#cfcdd2") + brilho(42, 100, 236) + base(42, 184, 236);
  s += R(52, 112, 216, 10, "#a9a7b0") + R(76, 130, 168, 30, "#b8b6bf") + R(84, 138, 152, 6, "#3e3d46");
  s += R(52, 166, 30, 10, "#7a77a8") + R(90, 166, 30, 10, "#7a77a8") + R(210, 166, 30, 10, "#7a77a8") + C(256, 170, 4, "#34a853");
  s += R(122, 194, 76, 18, "#cfcdd2");
  s += R(130, 200, 12, 5, "#2d2a26") + C(160, 203, 3, "#2b6fe0") + C(172, 203, 3, "#c0182f") + C(184, 203, 3, "#f2c200");
  return moldura(s, 132);
};

maquinas["playstation"] = () => {
  let s = R(88, 80, 144, 32, "#a9a9ae") + C(160, 92, 22, "#8e8e94") + C(160, 92, 8, "#2a2a30");
  s += R(44, 108, 232, 80, "#b9b9bd") + brilho(44, 108, 232) + base(44, 188, 232);
  s += R(60, 130, 200, 4, "#7e7e84") + R(60, 142, 90, 6, "#2a2a30");
  s += R(210, 136, 40, 10, "#d5d5d9") + R(218, 138, 8, 6, "#2d2a26") + R(232, 138, 8, 6, "#e0392b");
  s += R(60, 160, 30, 14, "#2a2a30") + R(96, 160, 30, 14, "#2a2a30") + R(154, 156, 106, 4, "#7e7e84");
  s += R(112, 196, 96, 14, "#b9b9bd");
  s += R(122, 200, 16, 6, "#3d6fe0") + R(142, 200, 16, 6, "#34a853") + R(162, 200, 16, 6, "#c0182f") + R(182, 200, 16, 6, "#f2c200");
  return moldura(s, 130);
};

for (const [id, desenhar] of Object.entries(maquinas)) {
  writeFileSync(join(saida, `${id}.svg`), desenhar());
}
console.log(Object.keys(maquinas).length + " ilustrações geradas");
