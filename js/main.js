const Bit = (() => {
  const $ = (seletor, raiz = document) => raiz.querySelector(seletor);
  const $$ = (seletor, raiz = document) => [...raiz.querySelectorAll(seletor)];

  const guardar = {
    ler(chave, padrao) {
      try {
        const bruto = localStorage.getItem(chave);
        return bruto === null ? padrao : JSON.parse(bruto);
      } catch {
        return padrao;
      }
    },
    gravar(chave, valor) {
      try {
        localStorage.setItem(chave, JSON.stringify(valor));
      } catch {}
    },
  };

  const TIPOS = { computador: "Computador", console: "Console", portatil: "Portátil" };
  const pad = (n) => String(n).padStart(4, "0");
  const pecaPorId = (id) => (typeof ACERVO !== "undefined" ? ACERVO.find((p) => p.id === id) : null);
  const numeroDe = (id) => pad(ACERVO.findIndex((p) => p.id === id) + 1);

  let temporizadorToast;
  const toast = (mensagem) => {
    const caixa = $("#toast");
    if (!caixa) return;
    caixa.textContent = mensagem;
    caixa.classList.add("ativo");
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => caixa.classList.remove("ativo"), 2600);
  };

  const favoritos = {
    lista: () => guardar.ler("bit-favoritos", []),
    tem(id) {
      return this.lista().includes(id);
    },
    alternar(id) {
      const atual = this.lista();
      const existe = atual.includes(id);
      const nova = existe ? atual.filter((x) => x !== id) : [...atual, id];
      guardar.gravar("bit-favoritos", nova);
      document.dispatchEvent(new CustomEvent("bit:favoritos", { detail: { id, ativo: !existe } }));
      const peca = pecaPorId(id);
      if (peca) toast(existe ? `${peca.nome} saiu dos favoritos` : `${peca.nome} guardado nos favoritos`);
      return !existe;
    },
  };

  const atualizarFavoritosUI = () => {
    const total = favoritos.lista().length;
    const selo = $("#contFav");
    if (selo) {
      selo.textContent = total;
      selo.dataset.zero = total === 0;
    }
    $$("[data-fav-id]").forEach((botao) => {
      const ativo = favoritos.tem(botao.dataset.favId);
      botao.setAttribute("aria-pressed", ativo);
      if (botao.classList.contains("btn")) botao.textContent = ativo ? "♥ Nos favoritos" : "♡ Favoritar";
    });
  };

  const aplicarTema = (tema) => {
    document.documentElement.dataset.tema = tema;
    guardar.gravar("bit-tema-aero", tema);
  };

  const iniciarTema = () => {
    const salvo = guardar.ler("bit-tema-aero", null);
    aplicarTema(salvo || "claro");
    const botao = $("#btnTema");
    if (botao)
      botao.addEventListener("click", () => {
        const novo = document.documentElement.dataset.tema === "escuro" ? "claro" : "escuro";
        aplicarTema(novo);
        toast(`Tema ${novo}`);
      });
  };

  const iniciarCrt = () => {
    const botao = $("#btnCrt");
    const aplicar = (ligado) => {
      document.body.classList.toggle("crt", ligado);
      if (botao) botao.setAttribute("aria-pressed", ligado);
      guardar.gravar("bit-crt", ligado);
    };
    aplicar(guardar.ler("bit-crt", false));
    if (botao)
      botao.addEventListener("click", () => {
        const ligado = !document.body.classList.contains("crt");
        aplicar(ligado);
        toast(ligado ? "Efeito CRT ligado" : "Efeito CRT desligado");
      });
  };

  const iniciarMenu = () => {
    const botao = $("#btnMenu");
    const menu = $("#menu");
    if (!botao || !menu) return;
    const definir = (aberto) => {
      menu.classList.toggle("menu--aberto", aberto);
      botao.setAttribute("aria-expanded", aberto);
      botao.setAttribute("aria-label", aberto ? "Fechar menu" : "Abrir menu");
      document.body.classList.toggle("sem-rolagem", aberto);
    };
    botao.addEventListener("click", () => definir(botao.getAttribute("aria-expanded") !== "true"));
    menu.addEventListener("click", (e) => {
      if (e.target.closest("a")) definir(false);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") definir(false);
    });
    window.matchMedia("(min-width: 861px)").addEventListener("change", (e) => e.matches && definir(false));
    const atual = location.pathname.split("/").pop() || "index.html";
    $$(".menu__link", menu).forEach((link) => {
      if (link.getAttribute("href") === atual) link.setAttribute("aria-current", "page");
    });
  };

  const iniciarRolagem = () => {
    const barra = $("#progresso");
    const topo = $("#voltarTopo");
    let esperando = false;
    const atualizar = () => {
      esperando = false;
      const alto = document.documentElement.scrollHeight - innerHeight;
      if (barra) barra.style.transform = `scaleX(${alto > 0 ? scrollY / alto : 0})`;
      if (topo) topo.classList.toggle("visivel", scrollY > 700);
    };
    addEventListener(
      "scroll",
      () => {
        if (!esperando) {
          esperando = true;
          requestAnimationFrame(atualizar);
        }
      },
      { passive: true }
    );
    atualizar();
    if (topo) topo.addEventListener("click", () => scrollTo({ top: 0, behavior: "smooth" }));
  };

  const iniciarRevelar = () => {
    const alvos = $$("[data-revelar]");
    if (!("IntersectionObserver" in window)) return alvos.forEach((a) => a.classList.add("revelado"));
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revelado");
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.12 }
    );
    alvos.forEach((a, i) => {
      a.style.setProperty("--atraso", `${(i % 6) * 70}ms`);
      obs.observe(a);
    });
  };

  const iniciarContadores = () => {
    const alvos = $$("[data-contar]");
    const rodar = (el) => {
      const fim = Number(el.dataset.contar);
      const sufixo = el.dataset.sufixo || "";
      const inicio = performance.now();
      const duracao = 1600;
      const passo = (agora) => {
        const t = Math.min(1, (agora - inicio) / duracao);
        const suave = 1 - Math.pow(1 - t, 4);
        el.textContent = Math.round(fim * suave).toLocaleString("pt-BR") + sufixo;
        if (t < 1) requestAnimationFrame(passo);
      };
      requestAnimationFrame(passo);
    };
    if (!("IntersectionObserver" in window)) return alvos.forEach((a) => (a.textContent = a.dataset.contar + (a.dataset.sufixo || "")));
    const obs = new IntersectionObserver(
      (entradas) =>
        entradas.forEach((e) => {
          if (e.isIntersecting) {
            rodar(e.target);
            obs.unobserve(e.target);
          }
        }),
      { threshold: 0.6 }
    );
    alvos.forEach((a) => obs.observe(a));
  };

  const cartaoPeca = (peca, opcoes = {}) => `
    <article class="peca" data-id="${peca.id}" data-revelar>
      ${peca.brasil ? '<span class="peca__tag">Brasil</span>' : ""}
      <button class="peca__fav" data-fav-id="${peca.id}" aria-pressed="false" aria-label="Favoritar ${peca.nome}">♥</button>
      <button class="peca__abrir" data-abrir="${peca.id}" aria-label="Ver detalhes de ${peca.nome}">
        <div class="peca__palco"><img src="img/maquinas/${peca.id}.svg" alt="Ilustração do ${peca.nome}" width="320" height="240" loading="lazy"></div>
        <div class="peca__placa">
          <span class="peca__no">Nº ${numeroDe(peca.id)} · ${TIPOS[peca.tipo].toUpperCase()}</span>
          <h3>${peca.nome}</h3>
          <p>${peca.fabricante} · ${peca.ano}</p>
        </div>
      </button>
      ${opcoes.comparar ? `<label class="peca__comparar"><input type="checkbox" data-comparar="${peca.id}"> Comparar</label>` : ""}
    </article>`;

  let modal;
  let idAberto = null;
  let listaNavegacao = [];

  const montarModal = () => {
    modal = document.createElement("dialog");
    modal.className = "modal";
    modal.setAttribute("aria-labelledby", "modalTitulo");
    modal.innerHTML = `
      <div class="modal__barra">
        <img src="img/logo.svg" alt="" width="72" height="48">
        <span id="modalBarra">Museu do Bit</span>
        <button class="modal__fechar" data-fechar type="button" aria-label="Fechar detalhes">✕</button>
      </div>
      <div class="modal__corpo">
        <div class="modal__palco"><img id="modalImg" alt="" width="320" height="240"></div>
        <div class="modal__info">
          <span class="rotulo" id="modalNo"></span>
          <h2 id="modalTitulo"></h2>
          <p class="lead" id="modalDescricao"></p>
          <dl class="ficha" id="modalFicha"></dl>
          <blockquote class="curio" id="modalCurio"></blockquote>
          <div class="modal__acoes">
            <button class="btn" id="modalFav" type="button"></button>
            <a class="btn btn--fantasma" id="modalLinha" href="#">Ver na linha do tempo</a>
          </div>
          <div class="modal__nav">
            <button class="btn btn--fantasma btn--pequeno" data-nav="-1" type="button">‹ Anterior</button>
            <button class="btn btn--fantasma btn--pequeno" data-nav="1" type="button">Próxima ›</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(modal);
    modal.addEventListener("click", (e) => {
      if (e.target === modal || e.target.closest("[data-fechar]")) modal.close();
      const nav = e.target.closest("[data-nav]");
      if (nav) navegarModal(Number(nav.dataset.nav));
    });
    modal.addEventListener("close", () => (idAberto = null));
    modal.addEventListener("keydown", (e) => {
      if (e.key === "ArrowRight") navegarModal(1);
      if (e.key === "ArrowLeft") navegarModal(-1);
    });
    $("#modalFav", modal).addEventListener("click", () => favoritos.alternar(idAberto));
  };

  const preencherModal = (peca) => {
    idAberto = peca.id;
    $("#modalImg", modal).src = `img/maquinas/${peca.id}.svg`;
    $("#modalImg", modal).alt = `Ilustração do ${peca.nome}`;
    $("#modalNo", modal).textContent = `Nº ${numeroDe(peca.id)} · ${TIPOS[peca.tipo]}`;
    $("#modalTitulo", modal).textContent = peca.nome;
    $("#modalBarra", modal).textContent = `Museu do Bit - ${peca.nome}`;
    $("#modalDescricao", modal).textContent = peca.descricao;
    $("#modalFicha", modal).innerHTML = [
      ["Fabricante", peca.fabricante],
      ["Ano", peca.ano],
      ["País", peca.pais],
      ["Processador", peca.cpu],
      ["Memória", peca.memoria],
      ["Mídia", peca.midia],
    ]
      .map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`)
      .join("");
    $("#modalCurio", modal).innerHTML = `<b>Você sabia?</b> ${peca.curiosidade}`;
    const botaoFav = $("#modalFav", modal);
    botaoFav.dataset.favId = peca.id;
    $("#modalLinha", modal).href = `linha-do-tempo.html#ano-${peca.ano}`;
    atualizarFavoritosUI();
  };

  const navegarModal = (passo) => {
    const lista = listaNavegacao.length ? listaNavegacao : ACERVO.map((p) => p.id);
    const indice = lista.indexOf(idAberto);
    if (indice < 0) return;
    const proximo = lista[(indice + passo + lista.length) % lista.length];
    preencherModal(pecaPorId(proximo));
  };

  const abrirPeca = (id, lista = []) => {
    const peca = pecaPorId(id);
    if (!peca) return;
    if (!modal) montarModal();
    listaNavegacao = lista;
    preencherModal(peca);
    if (!modal.open) modal.showModal();
  };

  const iniciarCliquesPecas = () => {
    document.addEventListener("click", (e) => {
      const fav = e.target.closest(".peca__fav");
      if (fav) return favoritos.alternar(fav.dataset.favId);
      const abrir = e.target.closest("[data-abrir]");
      if (abrir) {
        const grade = abrir.closest(".grade-pecas");
        const visiveis = grade ? $$(".peca:not([hidden])", grade).map((c) => c.dataset.id) : [];
        abrirPeca(abrir.dataset.abrir, visiveis);
      }
    });
    document.addEventListener("bit:favoritos", atualizarFavoritosUI);
  };

  const desenharPecas = (container, lista, opcoes = {}) => {
    container.innerHTML = lista.map((p) => cartaoPeca(p, opcoes)).join("");
    atualizarFavoritosUI();
    iniciarRevelar();
  };

  const iniciar = () => {
    iniciarTema();
    iniciarCrt();
    iniciarMenu();
    iniciarRolagem();
    iniciarRevelar();
    iniciarContadores();
    iniciarCliquesPecas();
    atualizarFavoritosUI();
    const ano = $("#anoAtual");
    if (ano) ano.textContent = new Date().getFullYear();
  };

  return { iniciar, $, $$, guardar, favoritos, toast, abrirPeca, desenharPecas, cartaoPeca, pecaPorId, numeroDe, TIPOS, atualizarFavoritosUI, iniciarRevelar };
})();

Bit.iniciar();
