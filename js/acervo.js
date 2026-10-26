const grade = document.getElementById("grade");
const vazio = document.getElementById("vazio");
const contagem = document.getElementById("contagem");
const campoBusca = document.getElementById("busca");
const selectDecada = document.getElementById("fDecada");
const selectTipo = document.getElementById("fTipo");
const selectOrdem = document.getElementById("fOrdem");
const botaoFavoritos = document.getElementById("fFav");
const botaoBrasil = document.getElementById("fBr");

const parametros = new URLSearchParams(location.search);
let textoBusca = parametros.get("q") || "";
let filtroDecada = parametros.get("decada") || "";
let filtroTipo = parametros.get("tipo") || "";
let ordem = "ano-asc";
let soFavoritos = parametros.get("favoritos") === "1";
let soBrasil = false;

function tirarAcentos(texto) {
  return texto.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
}

function filtrarPecas() {
  const resultado = [];
  const busca = tirarAcentos(textoBusca.trim());

  for (let i = 0; i < ACERVO.length; i++) {
    const peca = ACERVO[i];
    const textoPeca = tirarAcentos(peca.nome + " " + peca.fabricante + " " + peca.pais + " " + peca.cpu);

    if (busca !== "" && !textoPeca.includes(busca)) {
      continue;
    }
    if (filtroDecada !== "" && Math.floor(peca.ano / 10) * 10 !== Number(filtroDecada)) {
      continue;
    }
    if (filtroTipo !== "" && peca.tipo !== filtroTipo) {
      continue;
    }
    if (soFavoritos && !ehFavorito(peca.id)) {
      continue;
    }
    if (soBrasil && !peca.brasil) {
      continue;
    }
    resultado.push(peca);
  }

  resultado.sort(function (a, b) {
    if (ordem === "nome") {
      return a.nome.localeCompare(b.nome, "pt-BR");
    }
    if (ordem === "ano-desc") {
      return b.ano - a.ano;
    }
    return a.ano - b.ano;
  });

  return resultado;
}

function atualizarUrl() {
  const novos = new URLSearchParams();
  if (textoBusca !== "") {
    novos.set("q", textoBusca);
  }
  if (filtroDecada !== "") {
    novos.set("decada", filtroDecada);
  }
  if (filtroTipo !== "") {
    novos.set("tipo", filtroTipo);
  }
  if (soFavoritos) {
    novos.set("favoritos", "1");
  }
  const texto = novos.toString();
  if (texto === "") {
    history.replaceState(null, "", location.pathname);
  } else {
    history.replaceState(null, "", "?" + texto);
  }
}

function desenhar() {
  const lista = filtrarPecas();
  desenharPecas(grade, lista);
  vazio.hidden = lista.length > 0;
  contagem.textContent = "Mostrando " + lista.length + " de " + ACERVO.length + " peças";
  botaoFavoritos.setAttribute("aria-pressed", soFavoritos);
  botaoBrasil.setAttribute("aria-pressed", soBrasil);
  atualizarUrl();
}

function aoMudarFavoritos() {
  if (soFavoritos) {
    desenhar();
  }
}

function limparFiltros() {
  textoBusca = "";
  filtroDecada = "";
  filtroTipo = "";
  ordem = "ano-asc";
  soFavoritos = false;
  soBrasil = false;
  campoBusca.value = "";
  selectDecada.value = "";
  selectTipo.value = "";
  selectOrdem.value = "ano-asc";
  desenhar();
  mostrarToast("Filtros limpos");
}

campoBusca.value = textoBusca;
selectDecada.value = filtroDecada;
selectTipo.value = filtroTipo;

campoBusca.addEventListener("input", function () {
  textoBusca = campoBusca.value;
  desenhar();
});

selectDecada.addEventListener("change", function () {
  filtroDecada = selectDecada.value;
  desenhar();
});

selectTipo.addEventListener("change", function () {
  filtroTipo = selectTipo.value;
  desenhar();
});

selectOrdem.addEventListener("change", function () {
  ordem = selectOrdem.value;
  desenhar();
});

botaoFavoritos.addEventListener("click", function () {
  soFavoritos = !soFavoritos;
  desenhar();
});

botaoBrasil.addEventListener("click", function () {
  soBrasil = !soBrasil;
  desenhar();
});

document.getElementById("fLimpar").addEventListener("click", limparFiltros);

desenhar();
