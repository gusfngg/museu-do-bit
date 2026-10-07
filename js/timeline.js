const trilho = document.getElementById("trilho");
const slider = document.getElementById("sliderAno");
const saidaAno = document.getElementById("anoSaida");
const barraProgresso = document.getElementById("linhaBarra");
const botaoAnterior = document.getElementById("linhaAnt");
const botaoProximo = document.getElementById("linhaProx");

let itens = [];
let usandoSlider = false;
let arrastando = false;
let inicioX = 0;
let inicioScroll = 0;

function desenharEventos() {
  const anosVistos = [];
  let html = "";

  for (let i = 0; i < EVENTOS.length; i++) {
    const evento = EVENTOS[i];
    let id = "ano-" + evento.ano;
    if (anosVistos.includes(evento.ano)) {
      id = "ano-" + evento.ano + "-" + i;
    }
    anosVistos.push(evento.ano);

    html += '<li class="evento" id="' + id + '" data-ano="' + evento.ano + '">';
    html += '<span class="evento__ponto" aria-hidden="true"></span>';
    html += '<div class="evento__cartao">';
    html += '<span class="evento__ano">' + evento.ano + "</span>";
    html += "<h3>" + evento.titulo + "</h3>";
    html += "<p>" + evento.texto + "</p>";
    if (evento.maquina) {
      const peca = buscarPeca(evento.maquina);
      html += '<button class="btn btn--fantasma btn--pequeno" type="button" data-maquina="' + peca.id + '">Ver ' + peca.nome + "</button>";
    }
    html += "</div></li>";
  }

  trilho.innerHTML = html;
  itens = trilho.querySelectorAll(".evento");
  slider.min = EVENTOS[0].ano;
  slider.max = EVENTOS[EVENTOS.length - 1].ano;
}

function centralizar(item, suave) {
  const posicao = item.offsetLeft - (trilho.clientWidth - item.offsetWidth) / 2;
  trilho.scrollTo({ left: posicao, behavior: suave ? "smooth" : "auto" });
}

function itemDoCentro() {
  const centro = trilho.scrollLeft + trilho.clientWidth / 2;
  let melhor = itens[0];
  let menorDistancia = 999999;

  for (let i = 0; i < itens.length; i++) {
    const meio = itens[i].offsetLeft + itens[i].offsetWidth / 2;
    const distancia = Math.abs(meio - centro);
    if (distancia < menorDistancia) {
      menorDistancia = distancia;
      melhor = itens[i];
    }
  }
  return melhor;
}

function atualizarTimeline() {
  const atual = itemDoCentro();
  for (let i = 0; i < itens.length; i++) {
    itens[i].classList.toggle("evento--ativo", itens[i] === atual);
  }

  const maximo = trilho.scrollWidth - trilho.clientWidth;
  if (maximo > 0) {
    barraProgresso.style.transform = "scaleX(" + trilho.scrollLeft / maximo + ")";
  }

  if (!usandoSlider) {
    slider.value = atual.dataset.ano;
    saidaAno.textContent = atual.dataset.ano;
  }

  botaoAnterior.disabled = trilho.scrollLeft <= 4;
  botaoProximo.disabled = trilho.scrollLeft >= maximo - 4;
}

function irParaAno() {
  usandoSlider = true;
  const ano = Number(slider.value);
  let alvo = itens[itens.length - 1];
  for (let i = 0; i < itens.length; i++) {
    if (Number(itens[i].dataset.ano) >= ano) {
      alvo = itens[i];
      break;
    }
  }
  saidaAno.textContent = slider.value;
  centralizar(alvo, true);
}

function andar(direcao) {
  let posicao = 0;
  const atual = itemDoCentro();
  for (let i = 0; i < itens.length; i++) {
    if (itens[i] === atual) {
      posicao = i;
    }
  }
  let nova = posicao + direcao;
  if (nova < 0) {
    nova = 0;
  }
  if (nova > itens.length - 1) {
    nova = itens.length - 1;
  }
  usandoSlider = false;
  centralizar(itens[nova], true);
}

function irParaHash() {
  if (location.hash === "") {
    return;
  }
  const alvo = document.getElementById(location.hash.substring(1));
  if (alvo !== null && alvo.classList.contains("evento")) {
    trilho.scrollIntoView({ block: "center" });
    centralizar(alvo, false);
  }
}

desenharEventos();

trilho.addEventListener("click", function (e) {
  const botao = e.target.closest("[data-maquina]");
  if (botao) {
    abrirPeca(botao.dataset.maquina, []);
  }
});

trilho.addEventListener("scroll", atualizarTimeline);

slider.addEventListener("input", irParaAno);
slider.addEventListener("change", function () {
  setTimeout(function () {
    usandoSlider = false;
  }, 700);
});

botaoAnterior.addEventListener("click", function () {
  andar(-1);
});
botaoProximo.addEventListener("click", function () {
  andar(1);
});

trilho.addEventListener("keydown", function (e) {
  if (e.key === "ArrowRight") {
    andar(1);
  }
  if (e.key === "ArrowLeft") {
    andar(-1);
  }
});

trilho.addEventListener("mousedown", function (e) {
  if (e.target.closest("button")) {
    return;
  }
  arrastando = true;
  inicioX = e.clientX;
  inicioScroll = trilho.scrollLeft;
  trilho.classList.add("arrastando");
});

window.addEventListener("mousemove", function (e) {
  if (arrastando) {
    trilho.scrollLeft = inicioScroll - (e.clientX - inicioX);
  }
});

window.addEventListener("mouseup", function () {
  arrastando = false;
  trilho.classList.remove("arrastando");
});

window.addEventListener("hashchange", irParaHash);

irParaHash();
atualizarTimeline();
