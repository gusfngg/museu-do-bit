import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..", "img");
mkdirSync(join(raiz, "eras"), { recursive: true });

const R = (x, y, w, h, f, extra = "") =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${f}" ${extra}/>`;
const svg = (vb, corpo) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" shape-rendering="crispEdges">${corpo}</svg>`;

const letraB = ["1110", "1001", "1110", "1001", "1001", "1110"];
const letraI = ["111", "010", "010", "010", "010", "111"];
const letraT = ["111", "010", "010", "010", "010", "010"];

const pixels = (mapa, x, y, t, cor) =>
  mapa
    .map((linha, j) => [...linha].map((c, i) => (c === "1" ? R(x + i * t, y + j * t, t, t, cor) : "")).join(""))
    .join("");

const palavra = (t, cor, x0, y0) =>
  pixels(letraB, x0, y0, t, cor) + pixels(letraI, x0 + 5 * t, y0, t, cor) + pixels(letraT, x0 + 9 * t, y0, t, cor);

writeFileSync(
  join(raiz, "logo.svg"),
  svg("0 0 72 48", R(0, 0, 72, 48, "#14120e") + palavra(4, "#ffb000", 4, 12) + R(52, 36, 14, 4, "#ffb000"))
);

writeFileSync(
  join(raiz, "favicon.svg"),
  svg("0 0 32 32", R(0, 0, 32, 32, "#14120e") + pixels(letraB, 4, 5, 4, "#ffb000") + R(24, 25, 4, 4, "#ffb000"))
);

let hero = R(0, 0, 640, 400, "#0c0b09");
for (let i = 0; i < 40; i++) hero += R(0, i * 10, 640, 1, "#ffb000", 'opacity=".05"');
hero += R(120, 40, 400, 270, "#2a261f") + R(120, 40, 400, 8, "#fff", 'opacity=".12"');
hero += R(144, 64, 352, 214, "#050403") + R(152, 72, 336, 198, "#1a1204");
[[16, 22, 160], [16, 44, 220], [16, 66, 120], [16, 88, 260], [16, 110, 90]].forEach(
  ([x, y, w]) => (hero += R(152 + x, 72 + y, w, 6, "#ffb000"))
);
hero += R(168, 222, 18, 12, "#ffb000");
hero += R(240, 310, 160, 20, "#2a261f") + R(200, 330, 240, 12, "#2a261f");
hero += R(140, 350, 360, 24, "#cdbd9d");
for (let i = 0; i < 20; i++) hero += R(150 + i * 17, 356, 12, 10, "#7a5d46");
writeFileSync(join(raiz, "hero-crt.svg"), svg("0 0 640 400", hero));

let e70 = R(0, 0, 400, 240, "#2a1708");
const cores70 = ["#f2a900", "#e86a1d", "#b83a14", "#7a2410"];
for (let i = 0; i < 14; i++) e70 += R(0, 20 + i * 14, 400, 8 + (i % 3) * 2, cores70[i % 4]);
e70 += R(150, 70, 100, 100, "#2a1708") + R(160, 80, 80, 80, "#f2a900") + R(176, 96, 48, 48, "#2a1708");
writeFileSync(join(raiz, "eras", "era-70.svg"), svg("0 0 400 240", e70));

let e80 = R(0, 0, 400, 240, "#1a0b2e") + R(0, 120, 400, 120, "#2a0f4a");
for (let i = 0; i < 9; i++) e80 += R(0, 120 + i * i * 1.6, 400, 2, "#ff4fd8");
for (let i = -10; i <= 10; i++)
  e80 += `<line x1="${200 + i * 8}" y1="120" x2="${200 + i * 60}" y2="240" stroke="#ff4fd8" stroke-width="2"/>`;
e80 += R(150, 40, 100, 70, "#ffb000") + R(150, 70, 100, 6, "#1a0b2e") + R(150, 86, 100, 8, "#1a0b2e") + R(150, 100, 100, 10, "#1a0b2e");
writeFileSync(join(raiz, "eras", "era-80.svg"), svg("0 0 400 240", e80));

let e90 = R(0, 0, 400, 240, "#0a2a33");
for (let j = 0; j < 8; j++)
  for (let i = 0; i < 14; i++) e90 += R(i * 30, j * 30, 28, 28, (i + j) % 2 ? "#0f4a58" : "#12616f");
e90 += R(110, 60, 180, 120, "#c0c0c0") + R(114, 64, 172, 14, "#000080") + R(114, 82, 172, 94, "#fff");
e90 += R(124, 96, 80, 6, "#000") + R(124, 110, 120, 6, "#000") + R(124, 124, 60, 6, "#000") + R(240, 150, 36, 18, "#c0c0c0");
writeFileSync(join(raiz, "eras", "era-90.svg"), svg("0 0 400 240", e90));

console.log("marca e eras geradas");
