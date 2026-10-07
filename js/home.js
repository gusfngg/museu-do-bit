const saida = document.getElementById("termSaida");
const formTerminal = document.getElementById("termForm");
const entrada = document.getElementById("termEntrada");
const historico = [];
let posicaoHistorico = 0;

function sortearDestaques() {
  const copia = ACERVO.slice();
  const sorteadas = [];
  for (let i = 0; i < 3; i++) {
    const indice = Math.floor(Math.random() * copia.length);
    sorteadas.push(copia[indice]);
    copia.splice(indice, 1);
  }
  desenharPecas(document.getElementById("destaques"), sorteadas, false);
}

function escrever(texto, classe) {
  const linha = document.createElement("div");
  linha.className = "term__linha";
  if (classe) {
    linha.classList.add(classe);
  }
  linha.textContent = texto;
  saida.appendChild(linha);
  saida.scrollTop = saida.scrollHeight;
}

function tocarSom(arquivo) {
  const audio = new Audio(arquivo);
  audio.play().catch(function () {
    escrever("(o navegador bloqueou o áudio, clique na página e tente de novo)", "erro");
  });
}

function procurarPeca(termo) {
  termo = termo.toLowerCase();
  for (let i = 0; i < ACERVO.length; i++) {
    if (ACERVO[i].id === termo || ACERVO[i].nome.toLowerCase().includes(termo)) {
      return ACERVO[i];
    }
  }
  return null;
}

function comandoHelp() {
  escrever("help            lista os comandos");
  escrever("ls [tipo]       lista o acervo (computador, console, portatil)");
  escrever("info <nome>     ficha técnica de uma máquina");
  escrever("open <nome>     abre a peça no museu");
  escrever("random          sorteia uma peça");
  escrever("boot            liga o PC (som incluso)");
  escrever("modem           disca para a internet de 1995");
  escrever("sid             toca a melodia do chip de som");
  escrever("fav             mostra seus favoritos");
  escrever("tema            alterna claro/escuro");
  escrever("crt             liga/desliga o efeito CRT");
  escrever("clear           limpa a tela");
}

function comandoLs(tipo) {
  tipo = tipo.toLowerCase();
  let total = 0;
  for (let i = 0; i < ACERVO.length; i++) {
    const peca = ACERVO[i];
    if (tipo === "" || peca.tipo === tipo) {
      escrever(peca.ano + "  " + peca.id.padEnd(16, " ") + " " + peca.nome);
      total++;
    }
  }
  if (total === 0) {
    escrever('nenhum item do tipo "' + tipo + '"', "erro");
  } else {
    escrever(total + " item(ns)", "dim");
  }
}

function comandoInfo(nome) {
  const peca = procurarPeca(nome);
  if (peca === null) {
    escrever("informe uma máquina: info commodore", "erro");
    return;
  }
  escrever(peca.nome.toUpperCase() + " (" + peca.ano + ") - " + peca.fabricante + ", " + peca.pais);
  escrever("cpu: " + peca.cpu);
  escrever("memória: " + peca.memoria);
  escrever("mídia: " + peca.midia);
  escrever("> " + peca.curiosidade, "dim");
}

function comandoOpen(nome) {
  const peca = procurarPeca(nome);
  if (peca === null) {
    escrever("informe uma máquina: open game boy", "erro");
    return;
  }
  escrever("abrindo " + peca.nome + "...", "dim");
  abrirPeca(peca.id, []);
}

function comandoRandom() {
  const peca = ACERVO[Math.floor(Math.random() * ACERVO.length)];
  escrever("sorteado: " + peca.nome + " (" + peca.ano + ")");
}

function comandoBoot() {
  tocarSom("audio/boot-pc.mp3");
  const mensagens = [
    "BIOS v1.0 (c) 1981",
    "Testando memória... 640K OK",
    "Detectando disquete A:... OK",
    "Carregando MUSEU.COM",
    "Bem-vindo ao Museu do Bit.",
  ];
  for (let i = 0; i < mensagens.length; i++) {
    setTimeout(function () {
      escrever(mensagens[i], "dim");
    }, i * 380);
  }
}

function comandoModem() {
  tocarSom("audio/modem-discado.mp3");
  escrever("ATDT 0800-BIT ... conectando a 28.8 kbps", "dim");
}

function comandoSid() {
  tocarSom("audio/sid-melodia.mp3");
  escrever("tocando melodia sintetizada...", "dim");
}

function comandoFav() {
  const favoritos = pegarFavoritos();
  if (favoritos.length === 0) {
    escrever("nenhum favorito ainda. Visite o acervo!", "dim");
    return;
  }
  for (let i = 0; i < favoritos.length; i++) {
    escrever("♥ " + buscarPeca(favoritos[i]).nome);
  }
}

function executarComando(texto) {
  escrever("C:\\Museu> " + texto, "eco");
  const partes = texto.trim().split(" ");
  const comando = partes[0].toLowerCase();
  const argumento = partes.slice(1).join(" ");

  if (comando === "") {
    return;
  } else if (comando === "help") {
    comandoHelp();
  } else if (comando === "ls") {
    comandoLs(argumento);
  } else if (comando === "info") {
    comandoInfo(argumento);
  } else if (comando === "open") {
    comandoOpen(argumento);
  } else if (comando === "random") {
    comandoRandom();
  } else if (comando === "boot") {
    comandoBoot();
  } else if (comando === "modem") {
    comandoModem();
  } else if (comando === "sid") {
    comandoSid();
  } else if (comando === "fav") {
    comandoFav();
  } else if (comando === "tema") {
    document.getElementById("btnTema").click();
  } else if (comando === "crt") {
    document.getElementById("btnCrt").click();
  } else if (comando === "clear") {
    saida.innerHTML = "";
  } else if (comando === "whoami") {
    escrever("visitante nº " + Math.floor(1000 + Math.random() * 8999));
  } else if (comando === "sudo") {
    escrever("boa tentativa. Aqui o curador sou eu.", "erro");
  } else {
    escrever("comando não encontrado: " + comando + ". Digite help.", "erro");
  }
}

function iniciarTerminal() {
  escrever("Museu do Bit [Versão 1.0]", "dim");
  escrever("Copyright (c) Museu do Bit. Digite help para começar.", "dim");

  formTerminal.addEventListener("submit", function (e) {
    e.preventDefault();
    const texto = entrada.value;
    if (texto.trim() !== "") {
      historico.push(texto);
      posicaoHistorico = historico.length;
    }
    entrada.value = "";
    executarComando(texto);
  });

  entrada.addEventListener("keydown", function (e) {
    if (e.key === "ArrowUp" && historico.length > 0) {
      e.preventDefault();
      if (posicaoHistorico > 0) {
        posicaoHistorico--;
      }
      entrada.value = historico[posicaoHistorico];
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      if (posicaoHistorico < historico.length) {
        posicaoHistorico++;
      }
      entrada.value = historico[posicaoHistorico] || "";
    }
  });

  document.getElementById("terminal").addEventListener("click", function () {
    entrada.focus();
  });
}

const perguntas = [
  {
    texto: "Num sábado livre, você prefere...",
    opcoes: [
      ["jogos", "Jogar com os amigos até tarde"],
      ["programar", "Mexer em código ou desmontar algo"],
      ["criar", "Desenhar, compor ou editar alguma coisa"],
      ["trabalho", "Organizar planilhas e planos"],
    ],
  },
  {
    texto: "Seu superpoder seria...",
    opcoes: [
      ["jogos", "Reflexos de campeão"],
      ["programar", "Resolver qualquer bug"],
      ["criar", "Imaginação sem limites"],
      ["trabalho", "Produtividade absurda"],
    ],
  },
  {
    texto: "Escolha uma trilha sonora",
    opcoes: [
      ["jogos", "Fase de chefão em 8 bits"],
      ["programar", "Silêncio e o zumbido do ventilador"],
      ["criar", "Sintetizadores caóticos"],
      ["trabalho", "Jazz suave de escritório"],
    ],
  },
  {
    texto: "Qual época tem a sua cara?",
    decada: true,
    opcoes: [
      [1975, "Anos 70, a pré-história"],
      [1985, "Anos 80, a era de ouro"],
      [1994, "Anos 90, o salto para o 3D"],
    ],
  },
];

const caixaQuiz = document.getElementById("quizCaixa");
let etapa = 0;
let pontos = { jogos: 0, programar: 0, criar: 0, trabalho: 0 };
let anoDesejado = 1985;

function mostrarResultado() {
  let melhorPerfil = "jogos";
  for (const perfil in pontos) {
    if (pontos[perfil] > pontos[melhorPerfil]) {
      melhorPerfil = perfil;
    }
  }

  let escolhida = null;
  let menorDiferenca = 9999;
  for (let i = 0; i < ACERVO.length; i++) {
    if (ACERVO[i].perfil === melhorPerfil) {
      const diferenca = Math.abs(ACERVO[i].ano - anoDesejado);
      if (diferenca < menorDiferenca) {
        menorDiferenca = diferenca;
        escolhida = ACERVO[i];
      }
    }
  }

  caixaQuiz.innerHTML =
    '<div class="quiz__resultado">' +
    '<div class="quiz__img"><img src="img/maquinas/' + escolhida.id + '.svg" alt="Ilustração do ' + escolhida.nome + '" width="320" height="240"></div>' +
    "<div>" +
    '<span class="rotulo">Seu resultado</span>' +
    "<h3>Você é o " + escolhida.nome + "</h3>" +
    "<p>" + escolhida.descricao + "</p>" +
    '<div class="hero__acoes">' +
    '<button class="btn" type="button" id="quizVer">Ver ficha completa</button>' +
    '<button class="btn btn--fantasma" type="button" id="quizRefazer">Refazer o quiz</button>' +
    "</div></div></div>";

  document.getElementById("quizVer").addEventListener("click", function () {
    abrirPeca(escolhida.id, []);
  });
  document.getElementById("quizRefazer").addEventListener("click", function () {
    etapa = 0;
    pontos = { jogos: 0, programar: 0, criar: 0, trabalho: 0 };
    mostrarPergunta();
  });
}

function responder(valor) {
  if (perguntas[etapa].decada) {
    anoDesejado = Number(valor);
  } else {
    pontos[valor]++;
  }
  etapa++;
  if (etapa < perguntas.length) {
    mostrarPergunta();
  } else {
    mostrarResultado();
  }
}

function mostrarPergunta() {
  const pergunta = perguntas[etapa];
  let html = '<p class="quiz__passo mono">Pergunta ' + (etapa + 1) + " de " + perguntas.length + "</p>";
  html += '<div class="quiz__barra"><span style="width:' + (etapa / perguntas.length) * 100 + '%"></span></div>';
  html += "<h3>" + pergunta.texto + "</h3>";
  html += '<div class="quiz__opcoes">';
  for (let i = 0; i < pergunta.opcoes.length; i++) {
    html += '<button class="quiz__opcao" type="button" data-valor="' + pergunta.opcoes[i][0] + '">' + pergunta.opcoes[i][1] + "</button>";
  }
  html += "</div>";
  caixaQuiz.innerHTML = html;

  const botoes = caixaQuiz.querySelectorAll(".quiz__opcao");
  for (let i = 0; i < botoes.length; i++) {
    botoes[i].addEventListener("click", function () {
      responder(botoes[i].dataset.valor);
    });
  }
}

sortearDestaques();
iniciarTerminal();
mostrarPergunta();
