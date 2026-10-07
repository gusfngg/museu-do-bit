(() => {
  const { $, $$, abrirPeca, desenharPecas, favoritos } = Bit;

  const destaques = $("#destaques");
  if (destaques) {
    const escolhidos = [...ACERVO].sort(() => Math.random() - 0.5).slice(0, 3);
    desenharPecas(destaques, escolhidos);
  }

  const saida = $("#termSaida");
  const form = $("#termForm");
  const entrada = $("#termEntrada");
  const historico = [];
  let posicao = 0;

  const tocar = (arquivo) => {
    const audio = new Audio(arquivo);
    audio.play().catch(() => escrever("(o navegador bloqueou o áudio: clique na página e tente de novo)", "erro"));
  };

  function escrever(texto, classe = "") {
    const linha = document.createElement("div");
    linha.className = `term__linha ${classe}`.trim();
    linha.textContent = texto;
    saida.appendChild(linha);
    saida.scrollTop = saida.scrollHeight;
  }

  const buscar = (termo) => {
    const t = termo.toLowerCase();
    return ACERVO.find((p) => p.id === t || p.nome.toLowerCase().includes(t));
  };

  const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

  const comandos = {
    help() {
      [
        "help            lista os comandos",
        "ls [tipo]       lista o acervo (computador, console, portatil)",
        "info <nome>     ficha técnica de uma máquina",
        "open <nome>     abre a peça no museu",
        "random          sorteia uma peça",
        "boot            liga o PC (som incluso)",
        "modem           disca para a internet de 1995",
        "sid             toca a melodia do chip de som",
        "fav             mostra seus favoritos",
        "tema            alterna claro/escuro",
        "crt             liga/desliga o efeito CRT",
        "clear           limpa a tela",
      ].forEach((l) => escrever(l));
    },
    ls(arg) {
      const filtro = (arg || "").toLowerCase().replace("ó", "o");
      const lista = ACERVO.filter((p) => !filtro || p.tipo === filtro);
      if (!lista.length) return escrever(`nenhum item do tipo "${arg}"`, "erro");
      lista.forEach((p) => escrever(`${p.ano}  ${p.id.padEnd(16, " ")} ${p.nome}`));
      escrever(`${lista.length} item(ns)`, "dim");
    },
    info(arg) {
      const p = buscar(arg || "");
      if (!p) return escrever("informe uma máquina: info commodore", "erro");
      escrever(`${p.nome.toUpperCase()} (${p.ano}) — ${p.fabricante}, ${p.pais}`);
      escrever(`cpu: ${p.cpu}`);
      escrever(`memória: ${p.memoria}`);
      escrever(`mídia: ${p.midia}`);
      escrever(`> ${p.curiosidade}`, "dim");
    },
    open(arg) {
      const p = buscar(arg || "");
      if (!p) return escrever("informe uma máquina: open game boy", "erro");
      escrever(`abrindo ${p.nome}...`, "dim");
      abrirPeca(p.id);
    },
    random() {
      const p = ACERVO[Math.floor(Math.random() * ACERVO.length)];
      escrever(`sorteado: ${p.nome} (${p.ano})`);
    },
    async boot() {
      tocar("audio/boot-pc.mp3");
      for (const l of ["BIOS v1.0 (c) 1981", "Testando memória... 640K OK", "Detectando disquete A:... OK", "Carregando MUSEU.COM", "Bem-vindo ao Museu do Bit."]) {
        escrever(l, "dim");
        await esperar(380);
      }
    },
    modem() {
      tocar("audio/modem-discado.mp3");
      escrever("ATDT 0800-BIT ... conectando a 28.8 kbps", "dim");
    },
    sid() {
      tocar("audio/sid-melodia.mp3");
      escrever("♪ tocando melodia sintetizada...", "dim");
    },
    fav() {
      const lista = favoritos.lista();
      if (!lista.length) return escrever("nenhum favorito ainda. Visite o acervo!", "dim");
      lista.forEach((id) => escrever(`♥ ${Bit.pecaPorId(id).nome}`));
    },
    tema() {
      $("#btnTema").click();
    },
    crt() {
      $("#btnCrt").click();
    },
    clear() {
      saida.innerHTML = "";
    },
    whoami() {
      escrever(`visitante nº ${Math.floor(1000 + Math.random() * 8999)}`);
    },
    sudo() {
      escrever("boa tentativa. Aqui o curador sou eu.", "erro");
    },
  };

  const executar = async (texto) => {
    escrever(`C:\\Museu> ${texto}`, "eco");
    const [cmd, ...resto] = texto.trim().split(/\s+/);
    if (!cmd) return;
    const acao = comandos[cmd.toLowerCase()];
    if (!acao) return escrever(`comando não encontrado: ${cmd}. Digite help.`, "erro");
    await acao(resto.join(" "));
  };

  if (form) {
    escrever("Museu do Bit [Versão 1.0]\nCopyright (c) Museu do Bit. Digite help para começar.\n", "dim");
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const texto = entrada.value;
      if (texto.trim()) {
        historico.push(texto);
        posicao = historico.length;
      }
      entrada.value = "";
      executar(texto);
    });
    entrada.addEventListener("keydown", (e) => {
      if (e.key === "ArrowUp" && historico.length) {
        posicao = Math.max(0, posicao - 1);
        entrada.value = historico[posicao];
        e.preventDefault();
      }
      if (e.key === "ArrowDown") {
        posicao = Math.min(historico.length, posicao + 1);
        entrada.value = historico[posicao] || "";
        e.preventDefault();
      }
    });
    $("#terminal").addEventListener("click", () => entrada.focus());
  }

  const caixa = $("#quizCaixa");
  if (caixa) {
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

    let etapa = 0;
    let pontos = {};
    let anoDesejado = 1985;

    const resultado = () => {
      const topo = Object.entries(pontos).sort((a, b) => b[1] - a[1])[0]?.[0] || "jogos";
      const candidatas = ACERVO.filter((p) => p.perfil === topo);
      const peca = candidatas.sort((a, b) => Math.abs(a.ano - anoDesejado) - Math.abs(b.ano - anoDesejado))[0];
      caixa.innerHTML = `
        <div class="quiz__resultado">
          <div class="quiz__img"><img src="img/maquinas/${peca.id}.svg" alt="Ilustração do ${peca.nome}" width="320" height="240"></div>
          <div>
            <span class="rotulo">Seu resultado</span>
            <h3>Você é o ${peca.nome}</h3>
            <p>${peca.descricao}</p>
            <div class="hero__acoes">
              <button class="btn" type="button" data-ver>Ver ficha completa</button>
              <button class="btn btn--fantasma" type="button" data-refazer>Refazer o quiz</button>
            </div>
          </div>
        </div>`;
      $("[data-ver]", caixa).addEventListener("click", () => abrirPeca(peca.id));
      $("[data-refazer]", caixa).addEventListener("click", () => {
        etapa = 0;
        pontos = {};
        pergunta();
      });
    };

    const pergunta = () => {
      const q = perguntas[etapa];
      caixa.innerHTML = `
        <p class="quiz__passo mono">Pergunta ${etapa + 1} de ${perguntas.length}</p>
        <div class="quiz__barra"><span style="width:${(etapa / perguntas.length) * 100}%"></span></div>
        <h3>${q.texto}</h3>
        <div class="quiz__opcoes">
          ${q.opcoes.map(([valor, rotulo]) => `<button class="quiz__opcao" type="button" data-valor="${valor}">${rotulo}</button>`).join("")}
        </div>`;
      $$(".quiz__opcao", caixa).forEach((b) =>
        b.addEventListener("click", () => {
          if (q.decada) anoDesejado = Number(b.dataset.valor);
          else pontos[b.dataset.valor] = (pontos[b.dataset.valor] || 0) + 1;
          etapa++;
          etapa < perguntas.length ? pergunta() : resultado();
        })
      );
    };

    pergunta();
  }
})();
