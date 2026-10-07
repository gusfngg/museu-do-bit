(() => {
  const { $, $$, abrirPeca, pecaPorId } = Bit;

  const trilho = $("#trilho");
  const slider = $("#sliderAno");
  const saida = $("#anoSaida");
  const barra = $("#linhaBarra");
  const anterior = $("#linhaAnt");
  const proximo = $("#linhaProx");

  const vistos = new Set();
  trilho.innerHTML = EVENTOS.map((e, i) => {
    const id = vistos.has(e.ano) ? `ano-${e.ano}-${i}` : `ano-${e.ano}`;
    vistos.add(e.ano);
    const peca = e.maquina ? pecaPorId(e.maquina) : null;
    return `
      <li class="evento" id="${id}" data-ano="${e.ano}">
        <span class="evento__ponto" aria-hidden="true"></span>
        <div class="evento__cartao">
          <span class="evento__ano">${e.ano}</span>
          <h3>${e.titulo}</h3>
          <p>${e.texto}</p>
          ${peca ? `<button class="btn btn--fantasma btn--pequeno" type="button" data-maquina="${peca.id}">Ver ${peca.nome}</button>` : ""}
        </div>
      </li>`;
  }).join("");

  const itens = $$(".evento", trilho);
  slider.min = EVENTOS[0].ano;
  slider.max = EVENTOS[EVENTOS.length - 1].ano;

  trilho.addEventListener("click", (e) => {
    const botao = e.target.closest("[data-maquina]");
    if (botao) abrirPeca(botao.dataset.maquina);
  });

  const centralizar = (item, suave = true) => {
    const alvo = item.offsetLeft - (trilho.clientWidth - item.offsetWidth) / 2;
    trilho.scrollTo({ left: alvo, behavior: suave ? "smooth" : "auto" });
  };

  const maisProximo = () => {
    const centro = trilho.scrollLeft + trilho.clientWidth / 2;
    return itens.reduce((melhor, item) => {
      const dist = Math.abs(item.offsetLeft + item.offsetWidth / 2 - centro);
      return dist < melhor.dist ? { item, dist } : melhor;
    }, { item: itens[0], dist: Infinity }).item;
  };

  let ignorar = false;
  let esperando = false;
  const atualizar = () => {
    esperando = false;
    const atual = maisProximo();
    itens.forEach((i) => i.classList.toggle("evento--ativo", i === atual));
    const max = trilho.scrollWidth - trilho.clientWidth;
    barra.style.transform = `scaleX(${max > 0 ? trilho.scrollLeft / max : 0})`;
    if (!ignorar) slider.value = atual.dataset.ano;
    saida.textContent = ignorar ? slider.value : atual.dataset.ano;
    anterior.disabled = trilho.scrollLeft <= 4;
    proximo.disabled = trilho.scrollLeft >= max - 4;
  };

  trilho.addEventListener(
    "scroll",
    () => {
      if (!esperando) {
        esperando = true;
        requestAnimationFrame(atualizar);
      }
    },
    { passive: true }
  );

  slider.addEventListener("input", () => {
    ignorar = true;
    const ano = Number(slider.value);
    const alvo = itens.find((i) => Number(i.dataset.ano) >= ano) || itens[itens.length - 1];
    saida.textContent = slider.value;
    centralizar(alvo);
  });
  slider.addEventListener("change", () => setTimeout(() => (ignorar = false), 700));

  const passo = (direcao) => {
    const atual = itens.indexOf(maisProximo());
    const novo = Math.min(itens.length - 1, Math.max(0, atual + direcao));
    ignorar = false;
    centralizar(itens[novo]);
  };
  anterior.addEventListener("click", () => passo(-1));
  proximo.addEventListener("click", () => passo(1));

  trilho.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") passo(1);
    if (e.key === "ArrowLeft") passo(-1);
  });

  let arrastando = false;
  let inicioX = 0;
  let inicioScroll = 0;
  trilho.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.target.closest("button")) return;
    arrastando = true;
    inicioX = e.clientX;
    inicioScroll = trilho.scrollLeft;
    trilho.classList.add("arrastando");
  });
  addEventListener("pointermove", (e) => {
    if (arrastando) trilho.scrollLeft = inicioScroll - (e.clientX - inicioX);
  });
  addEventListener("pointerup", () => {
    arrastando = false;
    trilho.classList.remove("arrastando");
  });

  const irParaHash = () => {
    const alvo = location.hash && document.getElementById(location.hash.slice(1));
    if (alvo && alvo.classList.contains("evento")) {
      trilho.scrollIntoView({ block: "center" });
      centralizar(alvo, false);
    }
  };
  irParaHash();
  addEventListener("hashchange", irParaHash);
  atualizar();
})();
