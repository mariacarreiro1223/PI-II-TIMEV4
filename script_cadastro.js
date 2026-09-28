
// Maria Eduarda

const formulario = document.querySelector("#formCadastro");

// constantes de preenchimento
const camponome = document.querySelector("#nome");
const campocpf = document.querySelector("#cpf");
const campotelefone = document.querySelector("#telefone");
const camponascimento = document.querySelector("#dtnascimento");
const campoemail = document.querySelector("#email");
const camposenha = document.querySelector("#senha");
const campoconfirmasenha = document.querySelector("#confirmar-senha");

// constantes de erro
const erroNome = document.querySelector("#erroNome");
const erroCPF = document.querySelector("#erroCPF");
const erroTel = document.querySelector("#erroTel");
const erroNascimento = document.querySelector("#erroNascimento");
const erroEmail = document.querySelector("#erroEmail");
const erroSenha = document.querySelector("#erroSenha");
const erroConfsenha = document.querySelector("#erroConfirmacaoSenha");

const resultado = document.querySelector("#resultado");


const campos = [
    camponome,
    campocpf,
    campotelefone,
    camponascimento,
    campoemail,
    camposenha,
    campoconfirmasenha
];

const erro = [
    erroNome,
    erroCPF,
    erroTel,
    erroNascimento,
    erroEmail,
    erroSenha,
    erroConfsenha
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

function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const dtnascimento = new Date(`${dataNascimento}T00:00:00`);

    let idade = hoje.getFullYear() - dtnascimento.getFullYear();
    const aniversarioAindaNaoOcorreu =
        hoje.getMonth() < dtnascimento.getMonth()
        || (
            hoje.getMonth() === dtnascimento.getMonth()
            && hoje.getDate() < dtnascimento.getDate()
        );

    if (aniversarioAindaNaoOcorreu) {
        idade--;
    }

    return idade;
}

formulario.addEventListener("submit",function (event) {
    event.preventDefault();
    limparErros();
    // .trim() tira os espaços no início e no final do texto
    const nome = camponome.value.trim();
    // como não realizaremos operações com esses valores, eu não converti para número
    const cpf = campocpf.value.trim().replace(/\D/g, "");
    const telefone = campotelefone.value.trim().replace(/\D/g, "");
    const dataNascimento = camponascimento.value;
    // toLowerCase deixa tudo minusculo
    const email = campoemail.value.trim().toLowerCase();
    const senha = camposenha.value.trim();
    const confirmaSenha = campoconfirmasenha.value.trim();

    let formValido = true;

    // Validações

    // validar nome
    if (nome === ""){
        mostrarErro(camponome, erroNome,"Campo obrigatório!");
        formValido = false;
    // o split faz uma lista com todos os nomes digitados, separando cada nome por valor da lista
    } else if (nome.trim().split(/\s+/).length < 2) {
     mostrarErro(camponome, erroNome, "Digite seu nome completo!");
     formValido = false;
    }

    // validar cpf
    if (cpf === ""){
      mostrarErro(campocpf, erroCPF, "Campo obrigatório!");
        formValido = false;  
    }
    else {
        if (cpf.length !== 11){
            mostrarErro(campocpf, erroCPF, "O CPF deve ter 11 dígitos!");
            formValido = false;
        }
    }

    // validar telefone
    if (telefone === ""){
        mostrarErro(campotelefone,erroTel,"Campo obrigatório!");
        formValido = false;

    }
    else {
        if (telefone.length !== 11){
            mostrarErro(campotelefone,erroTel,"Número inválido!");
            formValido = false;
        }
    }

    //validar data de nascimento
    if (dataNascimento === ""){
        mostrarErro(camponascimento,erroNascimento,"Campo obrigatório!");
        formValido = false;
    } 
    else {
        const hoje = new Date ()
        const nascimento = new Date(`${dataNascimento}T00:00:00`);

        if (nascimento>hoje){
            mostrarErro(camponascimento,erroNascimento,"Data de nascimento inválida!");
            formValido = false;
        } 
        else if (calcularIdade(dataNascimento) < 18 || calcularIdade(dataNascimento) > 100){
            mostrarErro(camponascimento,erroNascimento,"Idade fora do permitido!");
            formValido = false;
        }
    }

    //validar email
    if (email === ""){
        mostrarErro(campoemail,erroEmail,"Email é obrigatório!");
        formValido = false;
    } 
    else if (campoemail.validity.typeMismatch){
        mostrarErro(campoemail,erroEmail,"Insira um email válido!");
        formValido = false;
    }

    //validar senha
    const possuiMaiuscula = /[A-Z]/.test(senha);
    const possuiMinuscula = /[a-z]/.test(senha);
    const possuiNumero = /[0-9]/.test(senha);
    const possuiEspecial = /[_@!]/.test(senha);

    
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
    // validar confirmação de senha
    if (confirmaSenha === ""){
        mostrarErro(campoconfirmasenha,erroConfsenha,"Campo obrigatório!");
        formValido = false;
    }
    if (senha !== confirmaSenha){
        mostrarErro(campoconfirmasenha,erroConfsenha,"As senhas devem ser iguais!");
        formValido = false;
    }

    if (formValido){
        resultado.classList.remove("d-none");
        formulario.reset();
    } 
    else {
        resultado.classList.add("d-none");
    }

});

