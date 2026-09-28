// Isaque Tanno

const formulario = document.querySelector("#formLogin");

const campoemail = document.querySelector("#email_id");
const camposenha = document.querySelector("#senha_id");

const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");

const campos = [
    campoemail,
    camposenha
];

const erro = [
    erroEmail,
    erroSenha
];

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    // deixa o campo vermelho quando está errado e mostra a mensagem de erro
    elementoErro.innerText = mensagem;
}

function limparErros() {
    campos.forEach(function (campo) {
        campo.classList.remove("is-invalid");
        // limpa o campo que ela colocou errado e retorna a cor do campo, tirando o vermelho
    });

    erro.forEach(function (elementoErro) {
        elementoErro.innerText = "";
    });
}

formulario.addEventListener("submit",function (event) {
    event.preventDefault();
    limparErros();

    const email = campoemail.value.trim().toLowerCase();
    const senha = camposenha.value.trim();

    let formValido = true;

    // email
    if (email === ""){
        mostrarErro(campoemail,erroEmail,"Email é obrigatório!");
        formValido = false;
    } 
    else if (campoemail.validity.typeMismatch){
        mostrarErro(campoemail,erroEmail,"Insira um email válido!");
        formValido = false;
    }

    const possuiMaiuscula = /[A-Z]/.test(senha);
    const possuiMinuscula = /[a-z]/.test(senha);
    const possuiNumero = /[0-9]/.test(senha);
    const possuiEspecial = /[_@!]/.test(senha);

    
    // senha
    if (senha === ""){
        mostrarErro(camposenha,erroSenha,"Campo obrigatório!");
        formValido = false;
    } else {
        if (senha.length < 8){
            mostrarErro(camposenha,erroSenha,"A senha deve ter no mínimo 8 caracteres!");
            formValido = false;
        } 
        else if (!possuiEspecial){
            mostrarErro(camposenha,erroSenha,"Senha precisa ter no mínimo um caracter especial [_@!]");
            formValido = false;
        }
        else if (!possuiMaiuscula){
            mostrarErro(camposenha,erroSenha,"Senha precisa ter no mínimo um caracter maiúsculo!");
            formValido = false;
        }
        else if (!possuiMinuscula){
            mostrarErro(camposenha,erroSenha,"Senha precisa ter no mínimo um caracter minúsculo!");
            formValido = false;
        }
        else if (!possuiNumero){
            mostrarErro(camposenha,erroSenha,"Senha precisa ter no mínimo um número!");
            formValido = false;
        }
    }

    if (formValido){
        resultado.classList.remove("d-none");
        formulario.reset();
    } 
    else {
        resultado.classList.add("d-none");
    }
});