const cartoesSom = document.querySelectorAll(".som");
const canvas = document.getElementById("visualizador");
const contexto = canvas.getContext("2d");
const controleVolume = document.getElementById("volume");
const textoVolume = document.getElementById("volumeSaida");
const videos = document.querySelectorAll("video");

const usaAnalisador = location.protocol.startsWith("http");
let audioContext = null;
let analisador = null;
let dadosFrequencia = null;
let audioTocando = null;
let fase = 0;
const fontesCriadas = [];

function formatarTempo(segundos) {
  if (!isFinite(segundos)) {
    return "0:00";
  }
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return minutos + ":" + String(resto).padStart(2, "0");
}

function prepararAnalisador(audio) {
  if (!usaAnalisador) {
    return;
  }
  try {
    if (audioContext === null) {
      audioContext = new AudioContext();
      analisador = audioContext.createAnalyser();
      analisador.fftSize = 128;
      analisador.connect(audioContext.destination);
      dadosFrequencia = new Uint8Array(analisador.frequencyBinCount);
    }
    if (!fontesCriadas.includes(audio)) {
      const fonte = audioContext.createMediaElementSource(audio);
      fonte.connect(analisador);
      fontesCriadas.push(audio);
    }
    if (audioContext.state === "suspended") {
      audioContext.resume();
    }
  } catch (erro) {
    analisador = null;
  }
}

function ajustarCanvas() {
  const caixa = canvas.getBoundingClientRect();
  canvas.width = caixa.width;
  canvas.height = caixa.height;
}

function desenharBarras() {
  const largura = canvas.width;
  const altura = canvas.height;
  const cor = getComputedStyle(document.documentElement).getPropertyValue("--ciano").trim() || "#2bb3e8";
  const quantidade = 32;
  const larguraBarra = largura / quantidade;

  contexto.clearRect(0, 0, largura, altura);
  fase = fase + 0.12;

  if (analisador !== null && audioTocando !== null) {
    analisador.getByteFrequencyData(dadosFrequencia);
  }

  for (let i = 0; i < quantidade; i++) {
    let valor = 0.04;
    if (audioTocando !== null) {
      if (analisador !== null) {
        valor = dadosFrequencia[Math.floor((i / quantidade) * dadosFrequencia.length * 0.7)] / 255;
      } else {
        valor = 0.25 + 0.55 * Math.abs(Math.sin(fase + i * 0.45) * Math.cos(fase * 0.6 + i * 0.2));
      }
    }

    const alturaBarra = Math.max(4, valor * altura * 0.92);
    let blocos = Math.floor(alturaBarra / (larguraBarra * 0.9));
    if (blocos < 1) {
      blocos = 1;
    }

    for (let b = 0; b < blocos; b++) {
      contexto.globalAlpha = 0.35 + (b / blocos) * 0.65;
      contexto.fillStyle = cor;
      contexto.fillRect(i * larguraBarra + 2, altura - (b + 1) * larguraBarra * 0.9, larguraBarra - 4, larguraBarra * 0.9 - 3);
    }
  }
  contexto.globalAlpha = 1;
  requestAnimationFrame(desenharBarras);
}

function pararOutros(mediaAtual) {
  for (let i = 0; i < cartoesSom.length; i++) {
    const audio = cartoesSom[i].querySelector("audio");
    if (audio !== mediaAtual && !audio.paused) {
      audio.pause();
    }
  }
  for (let i = 0; i < videos.length; i++) {
    if (videos[i] !== mediaAtual && !videos[i].paused) {
      videos[i].pause();
    }
  }
}

function configurarPlayer(cartao) {
  const audio = cartao.querySelector("audio");
  const botao = cartao.querySelector(".som__tocar");
  const barra = cartao.querySelector(".som__prog");
  const tempo = cartao.querySelector(".som__tempo");
  const titulo = cartao.dataset.titulo;

  botao.addEventListener("click", function () {
    if (audio.paused) {
      pararOutros(audio);
      prepararAnalisador(audio);
      audio.play().catch(function () {
        mostrarToast("Não foi possível reproduzir o áudio");
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", function () {
    audioTocando = audio;
    for (let i = 0; i < cartoesSom.length; i++) {
      cartoesSom[i].classList.toggle("som--ativo", cartoesSom[i] === cartao);
    }
    botao.setAttribute("aria-label", "Pausar " + titulo);
    botao.textContent = "❚❚";
  });

  function aoParar() {
    if (audioTocando === audio) {
      audioTocando = null;
    }
    cartao.classList.remove("som--ativo");
    botao.setAttribute("aria-label", "Tocar " + titulo);
    botao.textContent = "▶";
  }
  audio.addEventListener("pause", aoParar);
  audio.addEventListener("ended", aoParar);

  audio.addEventListener("loadedmetadata", function () {
    tempo.textContent = "0:00 / " + formatarTempo(audio.duration);
  });

  audio.addEventListener("timeupdate", function () {
    if (audio.duration) {
      barra.value = (audio.currentTime / audio.duration) * 100;
    }
    tempo.textContent = formatarTempo(audio.currentTime) + " / " + formatarTempo(audio.duration);
  });

  barra.addEventListener("input", function () {
    if (audio.duration) {
      audio.currentTime = (barra.value / 100) * audio.duration;
    }
  });
}

function mudarVolume() {
  const volume = Number(controleVolume.value) / 100;
  for (let i = 0; i < cartoesSom.length; i++) {
    cartoesSom[i].querySelector("audio").volume = volume;
  }
  textoVolume.textContent = controleVolume.value + "%";
}

function configurarVideo(caixa) {
  const video = caixa.querySelector("video");
  const botaoCrt = caixa.querySelector(".video__crt");
  const botaoVelocidade = caixa.querySelector(".video__vel");
  const velocidades = [1, 1.5, 2, 0.5];
  let indice = 0;

  video.addEventListener("play", function () {
    pararOutros(video);
  });

  botaoCrt.addEventListener("click", function () {
    const ligado = caixa.classList.toggle("video-caixa--crt");
    botaoCrt.setAttribute("aria-pressed", ligado);
  });

  botaoVelocidade.addEventListener("click", function () {
    indice++;
    if (indice >= velocidades.length) {
      indice = 0;
    }
    video.playbackRate = velocidades[indice];
    botaoVelocidade.textContent = "Velocidade " + velocidades[indice] + "×";
  });
}

for (let i = 0; i < cartoesSom.length; i++) {
  configurarPlayer(cartoesSom[i]);
}

const caixasVideo = document.querySelectorAll(".video-caixa");
for (let i = 0; i < caixasVideo.length; i++) {
  configurarVideo(caixasVideo[i]);
}

controleVolume.addEventListener("input", mudarVolume);
mudarVolume();

window.addEventListener("resize", ajustarCanvas);
ajustarCanvas();
desenharBarras();
