(() => {
  const { $, $$, toast } = Bit;

  const sons = $$(".som");
  const tela = $("#visualizador");
  const ctx2d = tela.getContext("2d");
  const volume = $("#volume");
  const volumeSaida = $("#volumeSaida");
  const videos = $$("video");

  const formatar = (s) => {
    if (!isFinite(s)) return "0:00";
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
  };

  let audioCtx = null;
  let analisador = null;
  let dados = null;
  const fontes = new WeakMap();
  const usaAnalisador = location.protocol.startsWith("http") && "AudioContext" in window;

  const prepararAnalisador = (audio) => {
    if (!usaAnalisador) return;
    try {
      if (!audioCtx) {
        audioCtx = new AudioContext();
        analisador = audioCtx.createAnalyser();
        analisador.fftSize = 128;
        analisador.connect(audioCtx.destination);
        dados = new Uint8Array(analisador.frequencyBinCount);
      }
      if (!fontes.has(audio)) {
        const fonte = audioCtx.createMediaElementSource(audio);
        fonte.connect(analisador);
        fontes.set(audio, fonte);
      }
      if (audioCtx.state === "suspended") audioCtx.resume();
    } catch {
      analisador = null;
    }
  };

  let tocando = null;
  let fase = 0;

  const ajustarTela = () => {
    const razao = window.devicePixelRatio || 1;
    const caixa = tela.getBoundingClientRect();
    tela.width = Math.round(caixa.width * razao);
    tela.height = Math.round(caixa.height * razao);
  };

  const desenhar = () => {
    const w = tela.width;
    const h = tela.height;
    const cor = getComputedStyle(document.documentElement).getPropertyValue("--ciano").trim() || "#2bb3e8";
    ctx2d.clearRect(0, 0, w, h);
    const barras = 32;
    const larg = w / barras;
    fase += 0.12;
    if (analisador && tocando) analisador.getByteFrequencyData(dados);
    for (let i = 0; i < barras; i++) {
      let valor = 0.04;
      if (tocando) {
        valor = analisador
          ? dados[Math.floor((i / barras) * dados.length * 0.7)] / 255
          : 0.25 + 0.55 * Math.abs(Math.sin(fase + i * 0.45) * Math.cos(fase * 0.6 + i * 0.2));
      }
      const alto = Math.max(4, valor * h * 0.92);
      const blocos = Math.max(1, Math.floor(alto / (larg * 0.9)));
      for (let b = 0; b < blocos; b++) {
        ctx2d.globalAlpha = 0.35 + (b / Math.max(blocos, 1)) * 0.65;
        ctx2d.fillStyle = cor;
        ctx2d.fillRect(i * larg + 2, h - (b + 1) * larg * 0.9, larg - 4, larg * 0.9 - 3);
      }
    }
    ctx2d.globalAlpha = 1;
    requestAnimationFrame(desenhar);
  };

  const pararTudo = (exceto) => {
    sons.forEach((s) => {
      const audio = $("audio", s);
      if (audio !== exceto && !audio.paused) audio.pause();
    });
    videos.forEach((v) => v !== exceto && !v.paused && v.pause());
  };

  sons.forEach((cartao) => {
    const audio = $("audio", cartao);
    const botao = $(".som__tocar", cartao);
    const prog = $(".som__prog", cartao);
    const tempo = $(".som__tempo", cartao);

    botao.addEventListener("click", () => {
      if (audio.paused) {
        pararTudo(audio);
        prepararAnalisador(audio);
        audio.play().catch(() => toast("Não foi possível reproduzir o áudio"));
      } else {
        audio.pause();
      }
    });

    audio.addEventListener("play", () => {
      tocando = audio;
      sons.forEach((s) => s.classList.toggle("som--ativo", s === cartao));
      botao.setAttribute("aria-label", `Pausar ${cartao.dataset.titulo}`);
      botao.textContent = "❚❚";
    });
    const aoParar = () => {
      if (tocando === audio) tocando = null;
      cartao.classList.remove("som--ativo");
      botao.setAttribute("aria-label", `Tocar ${cartao.dataset.titulo}`);
      botao.textContent = "▶";
    };
    audio.addEventListener("pause", aoParar);
    audio.addEventListener("ended", aoParar);

    audio.addEventListener("loadedmetadata", () => {
      tempo.textContent = `0:00 / ${formatar(audio.duration)}`;
    });
    audio.addEventListener("timeupdate", () => {
      prog.value = audio.duration ? (audio.currentTime / audio.duration) * 100 : 0;
      tempo.textContent = `${formatar(audio.currentTime)} / ${formatar(audio.duration)}`;
    });
    prog.addEventListener("input", () => {
      if (audio.duration) audio.currentTime = (prog.value / 100) * audio.duration;
    });
  });

  volume.addEventListener("input", () => {
    const v = Number(volume.value) / 100;
    sons.forEach((s) => ($("audio", s).volume = v));
    volumeSaida.textContent = `${volume.value}%`;
  });
  sons.forEach((s) => ($("audio", s).volume = Number(volume.value) / 100));

  $$(".video-caixa").forEach((caixa) => {
    const video = $("video", caixa);
    const botaoCrt = $(".video__crt", caixa);
    const botaoVel = $(".video__vel", caixa);
    const velocidades = [1, 1.5, 2, 0.5];
    let v = 0;

    video.addEventListener("play", () => pararTudo(video));
    botaoCrt.addEventListener("click", () => {
      const ligado = caixa.classList.toggle("video-caixa--crt");
      botaoCrt.setAttribute("aria-pressed", ligado);
    });
    botaoVel.addEventListener("click", () => {
      v = (v + 1) % velocidades.length;
      video.playbackRate = velocidades[v];
      botaoVel.textContent = `Velocidade ${velocidades[v]}×`;
    });
  });

  addEventListener("resize", ajustarTela);
  ajustarTela();
  desenhar();
})();
