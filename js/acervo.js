(() => {
  const { $, $$, toast, desenharPecas, favoritos, pecaPorId, TIPOS } = Bit;

  const grade = $("#grade");
  const vazio = $("#vazio");
  const contagem = $("#contagem");
  const campoBusca = $("#busca");
  const selDecada = $("#fDecada");
  const selTipo = $("#fTipo");
  const selOrdem = $("#fOrdem");
  const btnFav = $("#fFav");
  const btnBr = $("#fBr");
  const barra = $("#comparador");
  const dlg = $("#dlgComparar");

  const params = new URLSearchParams(location.search);
  const estado = {
    q: params.get("q") || "",
    decada: params.get("decada") || "",
    tipo: params.get("tipo") || "",
    ordem: "ano-asc",
    soFav: params.get("favoritos") === "1",
    soBr: false,
  };
  const comparando = new Set();

  const normalizar = (t) => t.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");

  const filtrar = () => {
    const termo = normalizar(estado.q.trim());
    const lista = ACERVO.filter((p) => {
      if (termo && !normalizar(`${p.nome} ${p.fabricante} ${p.pais} ${p.cpu}`).includes(termo)) return false;
      if (estado.decada && Math.floor(p.ano / 10) * 10 !== Number(estado.decada)) return false;
      if (estado.tipo && p.tipo !== estado.tipo) return false;
      if (estado.soFav && !favoritos.tem(p.id)) return false;
      if (estado.soBr && !p.brasil) return false;
      return true;
    });
    const ordens = {
      "ano-asc": (a, b) => a.ano - b.ano || a.nome.localeCompare(b.nome),
      "ano-desc": (a, b) => b.ano - a.ano || a.nome.localeCompare(b.nome),
      nome: (a, b) => a.nome.localeCompare(b.nome, "pt-BR"),
    };
    return lista.sort(ordens[estado.ordem]);
  };

  const sincronizarUrl = () => {
    const p = new URLSearchParams();
    if (estado.q) p.set("q", estado.q);
    if (estado.decada) p.set("decada", estado.decada);
    if (estado.tipo) p.set("tipo", estado.tipo);
    if (estado.soFav) p.set("favoritos", "1");
    const texto = p.toString();
    history.replaceState(null, "", texto ? `?${texto}` : location.pathname);
  };

  const atualizarBarra = () => {
    const ids = [...comparando];
    barra.hidden = ids.length === 0;
    $("#compChips", barra).innerHTML = ids
      .map((id) => `<span class="chip"><img src="img/maquinas/${id}.svg" alt="" width="32" height="24">${pecaPorId(id).nome}</span>`)
      .join("");
    $("#compInfo", barra).textContent = ids.length === 1 ? "Escolha mais uma peça" : "Pronto para comparar";
    $("#compAbrir", barra).disabled = ids.length < 2;
  };

  const renderizar = () => {
    const lista = filtrar();
    desenharPecas(grade, lista, { comparar: true });
    $$("[data-comparar]", grade).forEach((c) => (c.checked = comparando.has(c.dataset.comparar)));
    vazio.hidden = lista.length > 0;
    contagem.textContent = `Mostrando ${lista.length} de ${ACERVO.length} peças`;
    btnFav.setAttribute("aria-pressed", estado.soFav);
    btnBr.setAttribute("aria-pressed", estado.soBr);
    sincronizarUrl();
  };

  campoBusca.value = estado.q;
  selDecada.value = estado.decada;
  selTipo.value = estado.tipo;

  campoBusca.addEventListener("input", () => {
    estado.q = campoBusca.value;
    renderizar();
  });
  selDecada.addEventListener("change", () => {
    estado.decada = selDecada.value;
    renderizar();
  });
  selTipo.addEventListener("change", () => {
    estado.tipo = selTipo.value;
    renderizar();
  });
  selOrdem.addEventListener("change", () => {
    estado.ordem = selOrdem.value;
    renderizar();
  });
  btnFav.addEventListener("click", () => {
    estado.soFav = !estado.soFav;
    renderizar();
  });
  btnBr.addEventListener("click", () => {
    estado.soBr = !estado.soBr;
    renderizar();
  });
  $("#fLimpar").addEventListener("click", () => {
    Object.assign(estado, { q: "", decada: "", tipo: "", ordem: "ano-asc", soFav: false, soBr: false });
    campoBusca.value = "";
    selDecada.value = "";
    selTipo.value = "";
    selOrdem.value = "ano-asc";
    renderizar();
    toast("Filtros limpos");
  });
  document.addEventListener("bit:favoritos", () => estado.soFav && renderizar());

  grade.addEventListener("change", (e) => {
    const caixa = e.target.closest("[data-comparar]");
    if (!caixa) return;
    const id = caixa.dataset.comparar;
    if (caixa.checked) {
      if (comparando.size >= 2) {
        caixa.checked = false;
        return toast("Compare até 2 peças por vez");
      }
      comparando.add(id);
    } else {
      comparando.delete(id);
    }
    atualizarBarra();
  });

  $("#compLimpar", barra).addEventListener("click", () => {
    comparando.clear();
    $$("[data-comparar]", grade).forEach((c) => (c.checked = false));
    atualizarBarra();
  });

  $("#compAbrir", barra).addEventListener("click", () => {
    const [a, b] = [...comparando].map(pecaPorId);
    const linhas = [
      ["Fabricante", a.fabricante, b.fabricante],
      ["Ano", a.ano, b.ano],
      ["País", a.pais, b.pais],
      ["Tipo", TIPOS[a.tipo], TIPOS[b.tipo]],
      ["Processador", a.cpu, b.cpu],
      ["Memória", a.memoria, b.memoria],
      ["Mídia", a.midia, b.midia],
    ];
    const diferenca = Math.abs(a.ano - b.ano);
    $("#compTabela", dlg).innerHTML = `
      <thead>
        <tr>
          <th></th>
          ${[a, b].map((p) => `<th scope="col"><img src="img/maquinas/${p.id}.svg" alt="" width="160" height="120"><span>${p.nome}</span></th>`).join("")}
        </tr>
      </thead>
      <tbody>
        ${linhas.map(([k, x, y]) => `<tr><th scope="row">${k}</th><td>${x}</td><td>${y}</td></tr>`).join("")}
      </tbody>`;
    $("#compResumo", dlg).textContent =
      diferenca === 0 ? "Chegaram ao mercado no mesmo ano." : `${diferenca} ${diferenca === 1 ? "ano" : "anos"} separam os dois lançamentos.`;
    dlg.showModal();
  });

  dlg.addEventListener("click", (e) => {
    if (e.target === dlg || e.target.closest("[data-fechar]")) dlg.close();
  });

  renderizar();
  atualizarBarra();
})();
