(() => {
  const { $, $$, toast } = Bit;

  const form = $("#formContato");
  const sucesso = $("#contatoSucesso");
  const contador = $("#contador");
  const mensagem = $("#mensagem");
  const limite = Number(mensagem.getAttribute("maxlength"));

  const regras = {
    nome: (v) => (v.trim().length >= 3 ? "" : "Informe seu nome (mínimo 3 letras)."),
    email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Informe um e-mail válido, como nome@dominio.com."),
    assunto: (v) => (v ? "" : "Escolha um assunto."),
    mensagem: (v) => (v.trim().length >= 20 ? "" : "Escreva pelo menos 20 caracteres."),
    aceite: (_, campo) => (campo.checked ? "" : "É preciso concordar para enviar."),
  };

  const validar = (campo) => {
    const mensagemErro = regras[campo.name](campo.value, campo);
    const aviso = $(`#erro-${campo.name}`);
    aviso.textContent = mensagemErro;
    campo.setAttribute("aria-invalid", Boolean(mensagemErro));
    campo.closest(".campo, .aceite").classList.toggle("campo--erro", Boolean(mensagemErro));
    return !mensagemErro;
  };

  const campos = $$("[name]", form);
  campos.forEach((campo) => {
    campo.addEventListener("blur", () => validar(campo));
    campo.addEventListener("input", () => campo.getAttribute("aria-invalid") === "true" && validar(campo));
    campo.addEventListener("change", () => campo.getAttribute("aria-invalid") === "true" && validar(campo));
  });

  mensagem.addEventListener("input", () => {
    const restante = limite - mensagem.value.length;
    contador.textContent = `${mensagem.value.length}/${limite}`;
    contador.classList.toggle("contador--alerta", restante < 40);
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const resultados = campos.map(validar);
    const primeiroErro = campos[resultados.indexOf(false)];
    if (primeiroErro) {
      primeiroErro.focus();
      return toast("Confira os campos destacados");
    }
    const botao = $("button[type=submit]", form);
    botao.disabled = true;
    botao.textContent = "Enviando...";
    setTimeout(() => {
      const protocolo = `MB-${Date.now().toString(36).toUpperCase().slice(-6)}`;
      $("#protocolo", sucesso).textContent = protocolo;
      $("#nomeSucesso", sucesso).textContent = $("#nome").value.trim().split(" ")[0];
      form.hidden = true;
      sucesso.hidden = false;
      sucesso.focus();
      botao.disabled = false;
      botao.textContent = "Enviar mensagem";
    }, 900);
  });

  $("#novaMensagem").addEventListener("click", () => {
    form.reset();
    campos.forEach((c) => {
      c.removeAttribute("aria-invalid");
      c.closest(".campo, .aceite").classList.remove("campo--erro");
    });
    $$(".campo__erro", form).forEach((e) => (e.textContent = ""));
    contador.textContent = `0/${limite}`;
    sucesso.hidden = true;
    form.hidden = false;
    $("#nome").focus();
  });

  const detalhes = $$(".faq details");
  detalhes.forEach((d) =>
    d.addEventListener("toggle", () => {
      if (d.open) detalhes.forEach((o) => o !== d && (o.open = false));
    })
  );
  if (location.hash === "#contato") $("#nome").focus({ preventScroll: true });
})();
