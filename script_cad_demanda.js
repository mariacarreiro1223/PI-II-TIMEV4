
// Maria Eduarda

const formulario = document.querySelector("#cadastro");

const ctitulo = document.querySelector("#titulo_id");
const cdesc = document.querySelector("#descricao_id");
const ctipo = document.querySelector("#tipodemanda_id");
const cprioridade = document.querySelector("#prioridade_id");
const cprojeto = document.querySelector("#projeto_associado_id");
const cprazo = document.querySelector("#prazo_finalizacao_id");

const erro_titulo = document.querySelector("#erro_titulo_id");
const erro_desc = document.querySelector("#erro_descricao_id");
const erro_tipo = document.querySelector("#erro_tipodemanda_id");
const erro_prioridade = document.querySelector("#erro_prioridade_id");
const erro_projeto = document.querySelector("#erro_projeto_associado_id");
const erro_prazo = document.querySelector("#erro_prazo_finalizacao_id");

const resultado = document.querySelector("#resultado");


const campos = [
    ctitulo,
    cdesc,
    ctipo,
    cprioridade,
    cprojeto,
    cprazo
];

const erro = [
    erro_titulo,
    erro_desc,
    erro_tipo,
    erro_prioridade,
    erro_projeto,
    erro_prazo
];

function mostrarErro(campo, elementoErro, mensagem) {
    campo.classList.add("is-invalid");
    // deixa o campo vermelho quando está errado e mostra a msg de erro
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


formulario.addEventListener("submit",function(event) {

    event.preventDefault();
    limparErros();

    const titulo = ctitulo.value.trim();
    const desc = cdesc.value.trim();
    const tipo = ctipo.value;
    const prioridade = cprioridade.value;
    // const status = cstatus.value;
    const projeto = cprojeto.value;
    const prazo = cprazo.value;
    const dataPrazo = new Date(`${prazo}T00:00:00`); 

    // variável let que sofrerá alterações posteriormente
    let formValido = true;

    // validação do título
    if (titulo === ""){
        mostrarErro(ctitulo,erro_titulo,"Campo obrigatório!");
        formValido = false;
    }

    // validação da descrição
    if (desc === ""){
        mostrarErro(cdesc,erro_desc,"Campo obrigatório!");
        formValido = false;
    } else if (desc.trim().split(/\s+/).length < 3){
        mostrarErro(cdesc,erro_desc,"Descrição muito curta!");
        formValido = false;
    }

    // validar tipo
    if (tipo === "vazio"){
        mostrarErro(ctipo,erro_tipo,"Campo obrigatório!");
        formValido = false;
    }

    // validar prioridade
    if (prioridade === "vazio"){
        mostrarErro(cprioridade,erro_prioridade,"Campo obrigatório!");
        formValido = false;
    }

    // validar projeto associado
    if (projeto === ""){
        mostrarErro(cprojeto,erro_projeto,"Campo obrigatório!");
        formValido = false;
    }

    // validar prazo
    if (prazo === "dd/mm/aaaa"){
        mostrarErro(cprazo,erro_prazo,"Campo obrigatório");
        formValido = false
    }
    else {
        const dataPrazo = new Date(`${prazo}T00:00:00`);
        const prazoMinimo = new Date();
        prazoMinimo.setDate(prazoMinimo.getDate() + 10);
        if (dataPrazo < prazoMinimo) {
            mostrarErro(cprazo, erro_prazo, "O prazo deve ser superior a 10 dias a partir da abertura da demanda!");
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