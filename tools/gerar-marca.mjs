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

const placa = (largura, altura, miolo) =>
  `<defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff"/><stop offset="1" stop-color="#cfe4fb"/></linearGradient></defs>` +
  `<rect x="1" y="1" width="${largura - 2}" height="${altura - 2}" rx="6" fill="url(#g)" stroke="#5a86bd" stroke-width="2"/>` +
  miolo;

writeFileSync(
  join(raiz, "logo.svg"),
  svg("0 0 72 48", placa(72, 48, palavra(4, "#1b6ad0", 7, 12) + R(54, 36, 12, 4, "#2bb3e8")))
);

writeFileSync(
  join(raiz, "favicon.svg"),
  svg("0 0 32 32", placa(32, 32, pixels(letraB, 4, 5, 4, "#1b6ad0") + R(23, 24, 5, 4, "#2bb3e8")))
);

const hero =
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 400">` +
  `<defs>` +
  `<linearGradient id="ceu" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#4fa6ee"/><stop offset=".55" stop-color="#9fd3fa"/><stop offset="1" stop-color="#e6f4ff"/></linearGradient>` +
  `<linearGradient id="vidro" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffffff" stop-opacity=".92"/><stop offset=".48" stop-color="#cfe3f8" stop-opacity=".9"/><stop offset=".52" stop-color="#b3d2f3" stop-opacity=".92"/><stop offset="1" stop-color="#e3effc" stop-opacity=".95"/></linearGradient>` +
  `<linearGradient id="barra" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#5d86b9"/><stop offset=".48" stop-color="#2c5388"/><stop offset=".52" stop-color="#1b3d70"/><stop offset="1" stop-color="#2f5e98"/></linearGradient>` +
  `<radialGradient id="orbe" cx=".35" cy=".3" r=".8"><stop offset="0" stop-color="#e5f6ff"/><stop offset=".5" stop-color="#4a9cf0"/><stop offset="1" stop-color="#0e4fa8"/></radialGradient>` +
  `<linearGradient id="fechar" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f2aa9e"/><stop offset=".5" stop-color="#d9563f"/><stop offset=".52" stop-color="#c0301a"/><stop offset="1" stop-color="#e0704f"/></linearGradient>` +
  `</defs>` +
  `<rect width="640" height="400" fill="url(#ceu)"/>` +
  `<polygon points="0,0 220,0 90,400 0,400" fill="#fff" opacity=".14"/>` +
  `<polygon points="300,0 420,0 250,400 150,400" fill="#fff" opacity=".1"/>` +
  `<circle cx="560" cy="70" r="90" fill="#fff" opacity=".18"/><circle cx="90" cy="300" r="60" fill="#fff" opacity=".14"/>` +
  `<rect x="96" y="46" width="448" height="262" rx="9" fill="url(#vidro)" stroke="#4d7bb5" stroke-width="2"/>` +
  `<rect x="98" y="48" width="444" height="258" rx="8" fill="none" stroke="#fff" stroke-opacity=".7"/>` +
  `<text x="116" y="70" font-family="Segoe UI, Open Sans, Tahoma, sans-serif" font-size="14" font-weight="600" fill="#10294a">Museu do Bit</text>` +
  `<rect x="476" y="46" width="52" height="22" rx="4" fill="url(#fechar)" stroke="#7a2a1d"/>` +
  `<text x="497" y="62" font-family="Segoe UI, sans-serif" font-size="13" font-weight="700" fill="#fff">✕</text>` +
  `<rect x="108" y="82" width="424" height="214" fill="#fff" stroke="#8aa7c8"/>` +
  `<rect x="108" y="82" width="424" height="26" fill="#eef4fb" stroke="#d3e0f0"/>` +
  `<rect x="120" y="91" width="70" height="8" fill="#9db9d8"/><rect x="200" y="91" width="54" height="8" fill="#9db9d8"/><rect x="264" y="91" width="64" height="8" fill="#9db9d8"/>` +
  `<rect x="108" y="108" width="110" height="188" fill="#f2f7fd" stroke="#d3e0f0"/>` +
  `<rect x="120" y="124" width="70" height="8" fill="#1b6ad0"/><rect x="120" y="144" width="86" height="8" fill="#9db9d8"/><rect x="120" y="164" width="60" height="8" fill="#9db9d8"/><rect x="120" y="184" width="78" height="8" fill="#9db9d8"/>` +
  `<g transform="translate(240 126)">` +
  [0, 1, 2, 3, 4, 5]
    .map((i) => `<rect x="${(i % 3) * 96}" y="${Math.floor(i / 3) * 80}" width="72" height="54" fill="#dcebfb" stroke="#8aa7c8"/><rect x="${(i % 3) * 96 + 8}" y="${Math.floor(i / 3) * 80 + 8}" width="56" height="30" fill="${["#1b6ad0", "#2bb3e8", "#2e9d3a", "#f2a900", "#1b6ad0", "#2bb3e8"][i]}"/><rect x="${(i % 3) * 96 + 8}" y="${Math.floor(i / 3) * 80 + 42}" width="40" height="5" fill="#8aa7c8"/>`)
    .join("") +
  `</g>` +
  `<rect x="0" y="352" width="640" height="48" fill="url(#barra)"/><rect x="0" y="352" width="640" height="1" fill="#fff" opacity=".5"/>` +
  `<circle cx="34" cy="376" r="20" fill="url(#orbe)" stroke="#0a3d82" stroke-width="2"/>` +
  `<rect x="26" y="368" width="7" height="7" fill="#fff" opacity=".95"/><rect x="35" y="368" width="7" height="7" fill="#fff" opacity=".95"/><rect x="26" y="377" width="7" height="7" fill="#fff" opacity=".95"/><rect x="35" y="377" width="7" height="7" fill="#fff" opacity=".95"/>` +
  `<rect x="76" y="360" width="38" height="32" rx="4" fill="#fff" opacity=".22" stroke="#fff" stroke-opacity=".5"/>` +
  `<rect x="122" y="360" width="38" height="32" rx="4" fill="#fff" opacity=".12" stroke="#fff" stroke-opacity=".35"/>` +
  `<rect x="168" y="360" width="38" height="32" rx="4" fill="#fff" opacity=".12" stroke="#fff" stroke-opacity=".35"/>` +
  `<rect x="560" y="366" width="60" height="20" rx="3" fill="#fff" opacity=".18"/>` +
  `</svg>`;
writeFileSync(join(raiz, "hero-janela.svg"), hero);

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
