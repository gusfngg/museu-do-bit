const grade = document.getElementById("grade");
const vazio = document.getElementById("vazio");
const contagem = document.getElementById("contagem");
const campoBusca = document.getElementById("busca");
const selectDecada = document.getElementById("fDecada");
const selectTipo = document.getElementById("fTipo");
const selectOrdem = document.getElementById("fOrdem");
const botaoFavoritos = document.getElementById("fFav");
const botaoBrasil = document.getElementById("fBr");
const barraComparador = document.getElementById("comparador");
const dialogComparar = document.getElementById("dlgComparar");

const parametros = new URLSearchParams(location.search);
let textoBusca = parametros.get("q") || "";
let filtroDecada = parametros.get("decada") || "";
let filtroTipo = parametros.get("tipo") || "";
let ordem = "ano-asc";
let soFavoritos = parametros.get("favoritos") === "1";
let soBrasil = false;
let comparando = [];

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

function atualizarBarraComparador() {
  barraComparador.hidden = comparando.length === 0;

  let chips = "";
  for (let i = 0; i < comparando.length; i++) {
    const peca = buscarPeca(comparando[i]);
    chips += '<span class="chip"><img src="img/maquinas/' + peca.id + '.svg" alt="" width="32" height="24">' + peca.nome + "</span>";
  }
  document.getElementById("compChips").innerHTML = chips;

  if (comparando.length === 1) {
    document.getElementById("compInfo").textContent = "Escolha mais uma peça";
  } else {
    document.getElementById("compInfo").textContent = "Pronto para comparar";
  }
  document.getElementById("compAbrir").disabled = comparando.length < 2;
}

function desenhar() {
  const lista = filtrarPecas();
  desenharPecas(grade, lista, true);

  const caixas = grade.querySelectorAll("[data-comparar]");
  for (let i = 0; i < caixas.length; i++) {
    caixas[i].checked = comparando.includes(caixas[i].dataset.comparar);
  }

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

function abrirComparacao() {
  const a = buscarPeca(comparando[0]);
  const b = buscarPeca(comparando[1]);
  const linhas = [
    ["Fabricante", a.fabricante, b.fabricante],
    ["Ano", a.ano, b.ano],
    ["País", a.pais, b.pais],
    ["Tipo", TIPOS[a.tipo], TIPOS[b.tipo]],
    ["Processador", a.cpu, b.cpu],
    ["Memória", a.memoria, b.memoria],
    ["Mídia", a.midia, b.midia],
  ];

  let tabela = "<thead><tr><th></th>";
  tabela += '<th scope="col"><img src="img/maquinas/' + a.id + '.svg" alt="" width="160" height="120"><span>' + a.nome + "</span></th>";
  tabela += '<th scope="col"><img src="img/maquinas/' + b.id + '.svg" alt="" width="160" height="120"><span>' + b.nome + "</span></th>";
  tabela += "</tr></thead><tbody>";
  for (let i = 0; i < linhas.length; i++) {
    tabela += '<tr><th scope="row">' + linhas[i][0] + "</th><td>" + linhas[i][1] + "</td><td>" + linhas[i][2] + "</td></tr>";
  }
  tabela += "</tbody>";
  document.getElementById("compTabela").innerHTML = tabela;

  const diferenca = Math.abs(a.ano - b.ano);
  let resumo = "";
  if (diferenca === 0) {
    resumo = "Chegaram ao mercado no mesmo ano.";
  } else if (diferenca === 1) {
    resumo = "1 ano separa os dois lançamentos.";
  } else {
    resumo = diferenca + " anos separam os dois lançamentos.";
  }
  document.getElementById("compResumo").textContent = resumo;
  dialogComparar.showModal();
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

grade.addEventListener("change", function (e) {
  const caixa = e.target.closest("[data-comparar]");
  if (caixa === null) {
    return;
  }
  const id = caixa.dataset.comparar;

  if (caixa.checked) {
    if (comparando.length >= 2) {
      caixa.checked = false;
      mostrarToast("Compare até 2 peças por vez");
      return;
    }
    comparando.push(id);
  } else {
    comparando.splice(comparando.indexOf(id), 1);
  }
  atualizarBarraComparador();
});

document.getElementById("compLimpar").addEventListener("click", function () {
  comparando = [];
  const caixas = grade.querySelectorAll("[data-comparar]");
  for (let i = 0; i < caixas.length; i++) {
    caixas[i].checked = false;
  }
  atualizarBarraComparador();
});

document.getElementById("compAbrir").addEventListener("click", abrirComparacao);

dialogComparar.addEventListener("click", function (e) {
  if (e.target === dialogComparar || e.target.closest("[data-fechar]")) {
    dialogComparar.close();
  }
});

desenhar();
atualizarBarraComparador();
