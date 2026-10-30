// Alexandre Pavani

const formulario = document.querySelector("#formEdicao");

const titulo = document.querySelector("#titulo_id");
const desc = document.querySelector("#descricao_id");
const tipo = document.querySelector("#tipodemanda_id");
const prioridade = document.querySelector("#prioridade_id");
const stat = document.querySelector("#status_id");
const projeto = document.querySelector("#projeto_associado_id");
const resp = document.querySelector("#responsavel_id");
const prazo = document.querySelector("#prazo_finalizacao_id");

const prazoErro = document.querySelector("#erro_prazo_finalizacao_id");

const resultadomsg = document.querySelector("#msg-resultado");
const resultado = document.querySelector("#resultado");

campos = [
    titulo,
    desc,
    tipo,
    prioridade,
    stat,
    resp,
    prazo,
]

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
}


formulario.addEventListener("submit", async function(event) {
    event.preventDefault();
    limparErros();

    let formValido = true;

    // validação de data
    if (!prazo.value) {
        formValido = false;

        mostrarErro(prazo, prazoErro, "Insira uma data");
        resultado.classList.add("d-none");

        return formValido;

    } else {
        let dataPrazo = new Date(`${prazo.value}T23:59:59`);
        let hoje = new Date();

        if (dataPrazo < hoje) {
            formValido = false;

            mostrarErro(prazo, prazoErro, "Prazo não pode ser anterior à hoje");
            resultado.classList.add("d-none");

            return formValido;
        }
    }

    if (formValido) {
        const nova_demanda =
        {
            prioridade: prioridade.value,
            status: stat.value,
            responsavel: resp.value,
            prazo: prazo.value
        };
        try
        {
            await atualizarDemanda(nova_demanda);
            resultado.classList.remove("d-none");
            resultadomsg.classList.remove("alert-danger");
            resultadomsg.classList.add("alert-sucess");
            resultadomsg.innerHTML = "Demanda Atualizada";
        }
            
        catch(erro)
        {
            resultado.classList.remove("d-none");
            resultadomsg.classList.remove("alert-sucess");
            resultadomsg.classList.add("alert-danger");
            resultadomsg.innerHTML = `${erro.message}`;
        }
    }
    return formValido;
});