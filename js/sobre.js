const formContato = document.getElementById("formContato");
const caixaSucesso = document.getElementById("contatoSucesso");
const contador = document.getElementById("contador");
const campoMensagem = document.getElementById("mensagem");
const limiteMensagem = Number(campoMensagem.getAttribute("maxlength"));
const campos = formContato.querySelectorAll("[name]");

function mensagemDeErro(campo) {
  const nome = campo.name;
  const valor = campo.value.trim();

  if (nome === "nome" && valor.length < 3) {
    return "Informe seu nome (mínimo 3 letras).";
  }
  if (nome === "email") {
    const arroba = valor.indexOf("@");
    const ponto = valor.lastIndexOf(".");
    if (arroba < 1 || ponto < arroba + 2 || ponto >= valor.length - 2) {
      return "Informe um e-mail válido, como nome@dominio.com.";
    }
  }
  if (nome === "assunto" && valor === "") {
    return "Escolha um assunto.";
  }
  if (nome === "mensagem" && valor.length < 20) {
    return "Escreva pelo menos 20 caracteres.";
  }
  if (nome === "aceite" && !campo.checked) {
    return "É preciso concordar para enviar.";
  }
  return "";
}

function validarCampo(campo) {
  const erro = mensagemDeErro(campo);
  document.getElementById("erro-" + campo.name).textContent = erro;
  campo.setAttribute("aria-invalid", erro !== "");
  campo.closest(".campo, .aceite").classList.toggle("campo--erro", erro !== "");
  return erro === "";
}

function enviarFormulario(e) {
  e.preventDefault();

  let primeiroInvalido = null;
  for (let i = 0; i < campos.length; i++) {
    const valido = validarCampo(campos[i]);
    if (!valido && primeiroInvalido === null) {
      primeiroInvalido = campos[i];
    }
  }

  if (primeiroInvalido !== null) {
    primeiroInvalido.focus();
    mostrarToast("Confira os campos destacados");
    return;
  }

  const botao = formContato.querySelector("button[type=submit]");
  botao.disabled = true;
  botao.textContent = "Enviando...";

  setTimeout(function () {
    const protocolo = "MB-" + Date.now().toString(36).toUpperCase().slice(-6);
    document.getElementById("protocolo").textContent = protocolo;
    document.getElementById("nomeSucesso").textContent = document.getElementById("nome").value.trim().split(" ")[0];
    formContato.hidden = true;
    caixaSucesso.hidden = false;
    caixaSucesso.focus();
    botao.disabled = false;
    botao.textContent = "Enviar mensagem";
  }, 900);
}

function novaMensagem() {
  formContato.reset();
  for (let i = 0; i < campos.length; i++) {
    campos[i].removeAttribute("aria-invalid");
    campos[i].closest(".campo, .aceite").classList.remove("campo--erro");
  }
  const erros = formContato.querySelectorAll(".campo__erro");
  for (let i = 0; i < erros.length; i++) {
    erros[i].textContent = "";
  }
  contador.textContent = "0/" + limiteMensagem;
  caixaSucesso.hidden = true;
  formContato.hidden = false;
  document.getElementById("nome").focus();
}

function atualizarContador() {
  const tamanho = campoMensagem.value.length;
  contador.textContent = tamanho + "/" + limiteMensagem;
  contador.classList.toggle("contador--alerta", limiteMensagem - tamanho < 40);
}

for (let i = 0; i < campos.length; i++) {
  const campo = campos[i];
  campo.addEventListener("blur", function () {
    validarCampo(campo);
  });
  campo.addEventListener("input", function () {
    if (campo.getAttribute("aria-invalid") === "true") {
      validarCampo(campo);
    }
  });
  campo.addEventListener("change", function () {
    if (campo.getAttribute("aria-invalid") === "true") {
      validarCampo(campo);
    }
  });
}

campoMensagem.addEventListener("input", atualizarContador);
formContato.addEventListener("submit", enviarFormulario);
document.getElementById("novaMensagem").addEventListener("click", novaMensagem);

const detalhes = document.querySelectorAll(".faq details");
for (let i = 0; i < detalhes.length; i++) {
  detalhes[i].addEventListener("toggle", function () {
    if (detalhes[i].open) {
      for (let j = 0; j < detalhes.length; j++) {
        if (j !== i) {
          detalhes[j].open = false;
        }
      }
    }
  });
}

if (location.hash === "#contato") {
  document.getElementById("nome").focus({ preventScroll: true });
}
