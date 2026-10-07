const TIPOS = { computador: "Computador", console: "Console", portatil: "Portátil" };

let temporizadorToast;
let modal;
let idAberto = null;
let listaNavegacao = [];

function lerStorage(chave, padrao) {
  try {
    const valor = localStorage.getItem(chave);
    if (valor === null) {
      return padrao;
    }
    return JSON.parse(valor);
  } catch (erro) {
    return padrao;
  }
}

function salvarStorage(chave, valor) {
  try {
    localStorage.setItem(chave, JSON.stringify(valor));
  } catch (erro) {
    console.log("não foi possível salvar");
  }
}

function buscarPeca(id) {
  for (let i = 0; i < ACERVO.length; i++) {
    if (ACERVO[i].id === id) {
      return ACERVO[i];
    }
  }
  return null;
}

function numeroDaPeca(id) {
  for (let i = 0; i < ACERVO.length; i++) {
    if (ACERVO[i].id === id) {
      return String(i + 1).padStart(4, "0");
    }
  }
  return "0000";
}

function mostrarToast(mensagem) {
  const toast = document.getElementById("toast");
  if (toast === null) {
    return;
  }
  toast.textContent = mensagem;
  toast.classList.add("ativo");
  clearTimeout(temporizadorToast);
  temporizadorToast = setTimeout(function () {
    toast.classList.remove("ativo");
  }, 2600);
}

function pegarFavoritos() {
  return lerStorage("bit-favoritos", []);
}

function ehFavorito(id) {
  return pegarFavoritos().includes(id);
}

function alternarFavorito(id) {
  const favoritos = pegarFavoritos();
  const peca = buscarPeca(id);
  const posicao = favoritos.indexOf(id);

  if (posicao === -1) {
    favoritos.push(id);
    mostrarToast(peca.nome + " guardado nos favoritos");
  } else {
    favoritos.splice(posicao, 1);
    mostrarToast(peca.nome + " saiu dos favoritos");
  }

  salvarStorage("bit-favoritos", favoritos);
  atualizarFavoritos();
  if (typeof aoMudarFavoritos === "function") {
    aoMudarFavoritos();
  }
}

function atualizarFavoritos() {
  const total = pegarFavoritos().length;
  const selo = document.getElementById("contFav");
  if (selo !== null) {
    selo.textContent = total;
    selo.dataset.zero = total === 0 ? "true" : "false";
  }

  const botoes = document.querySelectorAll("[data-fav-id]");
  for (let i = 0; i < botoes.length; i++) {
    const botao = botoes[i];
    const ativo = ehFavorito(botao.dataset.favId);
    botao.setAttribute("aria-pressed", ativo);
    if (botao.classList.contains("btn")) {
      botao.textContent = ativo ? "♥ Nos favoritos" : "♡ Favoritar";
    }
  }
}

function aplicarTema(tema) {
  document.documentElement.dataset.tema = tema;
  salvarStorage("bit-tema-aero", tema);
}

function iniciarTema() {
  let tema = lerStorage("bit-tema-aero", "claro");
  aplicarTema(tema);

  const botao = document.getElementById("btnTema");
  botao.addEventListener("click", function () {
    if (document.documentElement.dataset.tema === "escuro") {
      aplicarTema("claro");
      mostrarToast("Tema claro");
    } else {
      aplicarTema("escuro");
      mostrarToast("Tema escuro");
    }
  });
}

function aplicarCrt(ligado) {
  document.body.classList.toggle("crt", ligado);
  document.getElementById("btnCrt").setAttribute("aria-pressed", ligado);
  salvarStorage("bit-crt", ligado);
}

function iniciarCrt() {
  aplicarCrt(lerStorage("bit-crt", false));
  document.getElementById("btnCrt").addEventListener("click", function () {
    const ligado = !document.body.classList.contains("crt");
    aplicarCrt(ligado);
    if (ligado) {
      mostrarToast("Efeito CRT ligado");
    } else {
      mostrarToast("Efeito CRT desligado");
    }
  });
}

function abrirMenu(aberto) {
  const menu = document.getElementById("menu");
  const botao = document.getElementById("btnMenu");
  menu.classList.toggle("menu--aberto", aberto);
  botao.setAttribute("aria-expanded", aberto);
  botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
  document.body.classList.toggle("sem-rolagem", aberto);
}

function iniciarMenu() {
  const menu = document.getElementById("menu");
  const botao = document.getElementById("btnMenu");

  botao.addEventListener("click", function () {
    const estaAberto = botao.getAttribute("aria-expanded") === "true";
    abrirMenu(!estaAberto);
  });

  menu.addEventListener("click", function (e) {
    if (e.target.closest("a")) {
      abrirMenu(false);
    }
  });

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      abrirMenu(false);
    }
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth > 860) {
      abrirMenu(false);
    }
  });

  let paginaAtual = location.pathname.split("/").pop();
  if (paginaAtual === "") {
    paginaAtual = "index.html";
  }
  const links = menu.querySelectorAll(".menu__link");
  for (let i = 0; i < links.length; i++) {
    if (links[i].getAttribute("href") === paginaAtual) {
      links[i].setAttribute("aria-current", "page");
    }
  }
}

function animarContador(elemento) {
  const final = Number(elemento.dataset.contar);
  let atual = 0;
  const passo = Math.max(1, Math.round(final / 40));
  const intervalo = setInterval(function () {
    atual = atual + passo;
    if (atual >= final) {
      atual = final;
      clearInterval(intervalo);
    }
    elemento.textContent = atual;
  }, 40);
}

function revelarElementos() {
  const limite = window.innerHeight * 0.92;
  const escondidos = document.querySelectorAll("[data-revelar]:not(.revelado)");
  let ordem = 0;
  for (let i = 0; i < escondidos.length; i++) {
    if (escondidos[i].getBoundingClientRect().top < limite) {
      escondidos[i].style.setProperty("--atraso", ordem * 70 + "ms");
      escondidos[i].classList.add("revelado");
      ordem++;
    }
  }

  const contadores = document.querySelectorAll("[data-contar]");
  for (let i = 0; i < contadores.length; i++) {
    if (contadores[i].dataset.contando !== "sim" && contadores[i].getBoundingClientRect().top < limite) {
      contadores[i].dataset.contando = "sim";
      animarContador(contadores[i]);
    }
  }
}

function aoRolar() {
  const barra = document.getElementById("progresso");
  const botaoTopo = document.getElementById("voltarTopo");
  const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
  let porcentagem = 0;
  if (alturaTotal > 0) {
    porcentagem = window.scrollY / alturaTotal;
  }
  barra.style.transform = "scaleX(" + porcentagem + ")";
  botaoTopo.classList.toggle("visivel", window.scrollY > 700);
  revelarElementos();
}

function iniciarRolagem() {
  window.addEventListener("scroll", aoRolar);
  document.getElementById("voltarTopo").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  aoRolar();
}

function criarCartao(peca, comparar) {
  let html = '<article class="peca" data-id="' + peca.id + '" data-revelar>';
  if (peca.brasil) {
    html += '<span class="peca__tag">Brasil</span>';
  }
  html += '<button class="peca__fav" data-fav-id="' + peca.id + '" aria-pressed="false" aria-label="Favoritar ' + peca.nome + '">♥</button>';
  html += '<button class="peca__abrir" data-abrir="' + peca.id + '" aria-label="Ver detalhes de ' + peca.nome + '">';
  html += '<div class="peca__palco"><img src="img/maquinas/' + peca.id + '.svg" alt="Ilustração do ' + peca.nome + '" width="320" height="240" loading="lazy"></div>';
  html += '<div class="peca__placa">';
  html += '<span class="peca__no">Nº ' + numeroDaPeca(peca.id) + " · " + TIPOS[peca.tipo].toUpperCase() + "</span>";
  html += "<h3>" + peca.nome + "</h3>";
  html += "<p>" + peca.fabricante + " · " + peca.ano + "</p>";
  html += "</div></button>";
  if (comparar) {
    html += '<label class="peca__comparar"><input type="checkbox" data-comparar="' + peca.id + '"> Comparar</label>';
  }
  html += "</article>";
  return html;
}

function desenharPecas(container, lista, comparar) {
  let html = "";
  for (let i = 0; i < lista.length; i++) {
    html += criarCartao(lista[i], comparar);
  }
  container.innerHTML = html;
  atualizarFavoritos();
  revelarElementos();
}

function criarModal() {
  modal = document.createElement("dialog");
  modal.className = "modal";
  modal.setAttribute("aria-labelledby", "modalTitulo");
  modal.innerHTML =
    '<div class="modal__barra">' +
    '<img src="img/logo.svg" alt="" width="72" height="48">' +
    '<span id="modalBarra">Museu do Bit</span>' +
    '<button class="modal__fechar" data-fechar type="button" aria-label="Fechar detalhes">✕</button>' +
    "</div>" +
    '<div class="modal__corpo">' +
    '<div class="modal__palco"><img id="modalImg" alt="" width="320" height="240"></div>' +
    '<div class="modal__info">' +
    '<span class="rotulo" id="modalNo"></span>' +
    '<h2 id="modalTitulo"></h2>' +
    '<p class="lead" id="modalDescricao"></p>' +
    '<dl class="ficha" id="modalFicha"></dl>' +
    '<blockquote class="curio" id="modalCurio"></blockquote>' +
    '<div class="modal__acoes">' +
    '<button class="btn" id="modalFav" type="button"></button>' +
    '<a class="btn btn--fantasma" id="modalLinha" href="#">Ver na linha do tempo</a>' +
    "</div>" +
    '<div class="modal__nav">' +
    '<button class="btn btn--fantasma btn--pequeno" data-nav="-1" type="button">‹ Anterior</button>' +
    '<button class="btn btn--fantasma btn--pequeno" data-nav="1" type="button">Próxima ›</button>' +
    "</div></div></div>";
  document.body.appendChild(modal);

  modal.addEventListener("click", function (e) {
    if (e.target === modal || e.target.closest("[data-fechar]")) {
      modal.close();
    }
    const botaoNav = e.target.closest("[data-nav]");
    if (botaoNav) {
      navegarModal(Number(botaoNav.dataset.nav));
    }
  });

  modal.addEventListener("close", function () {
    idAberto = null;
  });

  modal.addEventListener("keydown", function (e) {
    if (e.key === "ArrowRight") {
      navegarModal(1);
    }
    if (e.key === "ArrowLeft") {
      navegarModal(-1);
    }
  });

  document.getElementById("modalFav").addEventListener("click", function () {
    alternarFavorito(idAberto);
  });
}

function preencherModal(peca) {
  idAberto = peca.id;
  document.getElementById("modalImg").src = "img/maquinas/" + peca.id + ".svg";
  document.getElementById("modalImg").alt = "Ilustração do " + peca.nome;
  document.getElementById("modalNo").textContent = "Nº " + numeroDaPeca(peca.id) + " · " + TIPOS[peca.tipo];
  document.getElementById("modalTitulo").textContent = peca.nome;
  document.getElementById("modalBarra").textContent = "Museu do Bit - " + peca.nome;
  document.getElementById("modalDescricao").textContent = peca.descricao;

  const campos = [
    ["Fabricante", peca.fabricante],
    ["Ano", peca.ano],
    ["País", peca.pais],
    ["Processador", peca.cpu],
    ["Memória", peca.memoria],
    ["Mídia", peca.midia],
  ];
  let ficha = "";
  for (let i = 0; i < campos.length; i++) {
    ficha += "<div><dt>" + campos[i][0] + "</dt><dd>" + campos[i][1] + "</dd></div>";
  }
  document.getElementById("modalFicha").innerHTML = ficha;
  document.getElementById("modalCurio").innerHTML = "<b>Você sabia?</b> " + peca.curiosidade;
  document.getElementById("modalFav").dataset.favId = peca.id;
  document.getElementById("modalLinha").href = "linha-do-tempo.html#ano-" + peca.ano;
  atualizarFavoritos();
}

function navegarModal(passo) {
  let lista = listaNavegacao;
  if (lista.length === 0) {
    lista = [];
    for (let i = 0; i < ACERVO.length; i++) {
      lista.push(ACERVO[i].id);
    }
  }
  const posicao = lista.indexOf(idAberto);
  if (posicao === -1) {
    return;
  }
  let nova = posicao + passo;
  if (nova < 0) {
    nova = lista.length - 1;
  }
  if (nova >= lista.length) {
    nova = 0;
  }
  preencherModal(buscarPeca(lista[nova]));
}

function abrirPeca(id, lista) {
  const peca = buscarPeca(id);
  if (peca === null) {
    return;
  }
  if (modal === undefined) {
    criarModal();
  }
  listaNavegacao = lista || [];
  preencherModal(peca);
  if (!modal.open) {
    modal.showModal();
  }
}

function cliqueNoDocumento(e) {
  const botaoFav = e.target.closest(".peca__fav");
  if (botaoFav) {
    alternarFavorito(botaoFav.dataset.favId);
    return;
  }

  const botaoAbrir = e.target.closest("[data-abrir]");
  if (botaoAbrir) {
    const grade = botaoAbrir.closest(".grade-pecas");
    const ids = [];
    if (grade) {
      const cartoes = grade.querySelectorAll(".peca");
      for (let i = 0; i < cartoes.length; i++) {
        ids.push(cartoes[i].dataset.id);
      }
    }
    abrirPeca(botaoAbrir.dataset.abrir, ids);
  }
}

function iniciarSite() {
  iniciarTema();
  iniciarCrt();
  iniciarMenu();
  iniciarRolagem();
  atualizarFavoritos();
  document.addEventListener("click", cliqueNoDocumento);
  document.getElementById("anoAtual").textContent = new Date().getFullYear();
}

iniciarSite();
