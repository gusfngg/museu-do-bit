const cartoesSom = document.querySelectorAll(".som");
const controleVolume = document.getElementById("volume");
const textoVolume = document.getElementById("volumeSaida");
const videos = document.querySelectorAll("video");

function formatarTempo(segundos) {
  if (!isFinite(segundos)) {
    return "0:00";
  }
  const minutos = Math.floor(segundos / 60);
  const resto = Math.floor(segundos % 60);
  return minutos + ":" + String(resto).padStart(2, "0");
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
      audio.play().catch(function () {
        mostrarToast("Não foi possível reproduzir o áudio");
      });
    } else {
      audio.pause();
    }
  });

  audio.addEventListener("play", function () {
    for (let i = 0; i < cartoesSom.length; i++) {
      cartoesSom[i].classList.toggle("som--ativo", cartoesSom[i] === cartao);
    }
    botao.setAttribute("aria-label", "Pausar " + titulo);
    botao.textContent = "❚❚";
  });

  function aoParar() {
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
