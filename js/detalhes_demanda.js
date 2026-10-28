// Isaque Tanno

async function carregarDemanda()
{
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (!id) 
    {   
        renderizarDemanda();
        return;
    }

    const demanda = await GETdemanda(id)
    if(!demanda)
    {
        renderizarDemanda();
        return;
    }
    
    const comentarios = await GETcomentarios(id)
    if(!comentarios)
    {
        return;
    }

    const historico = await GEThistorico(id)
    if(!historico)
    {
        return;
    }

    const projeto_id = await GETidprojeto(demanda.projeto);
    if(!projeto_id)
    {
        return;
    }


    renderizarDemanda(demanda, projeto_id.id);
    renderizarComentarios(comentarios);
    renderizarHistorico(historico);
    return;
}

function renderizarDemanda(demanda, projeto_id)
{
    if(!demanda)
    {
        return;
    }

    const titulo = document.getElementById("titulo-demanda");
    const status = document.getElementById("status");
    const desc = document.getElementById("descricao-demanda");
    const tipo = document.getElementById("tipo-demanda");
    const prioridade = document.getElementById("prioridade");
    const projeto = document.getElementById("projeto-associado");
    const responsavel = document.getElementById("responsavel");
    const data_criacao = document.getElementById("data-criacao");
    const data_atualizacao = document.getElementById("data-atualizacao");
    const prazo = document.getElementById("prazo");

    titulo.innerHTML = demanda.titulo;
    status.innerHTML = demanda.status;
    desc.innerHTML = demanda.descricao;
    tipo.innerHTML = demanda.tipo;
    prioridade.innerHTML = demanda.prioridade;
    projeto.innerHTML = demanda.projeto;
    responsavel.innerHTML = demanda.responsavel;
    


    const data_c = formatarDatetime(demanda.dataCriacao);
    const data_at = formatarDatetime(demanda.dataAtualizacao);
    const prazo_f = formatarDatetime(demanda.prazo);

    data_criacao.innerHTML = `${data_c.dia}/${data_c.mes}/${data_c.ano} às ${data_c.hora}:${data_c.minuto}`;
    data_atualizacao.innerHTML = `${data_at.dia}/${data_at.mes}/${data_at.ano} às ${data_at.hora}:${data_at.minuto}`;
    prazo.innerHTML = `${prazo_f.dia}/${prazo_f.mes}/${prazo_f.ano}`;

    const link_demandas = document.getElementById("link-demandas");
    link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${projeto_id}">Demandas</a>`;
    
    const link_dashboard = document.getElementById("link-dashboard");
    link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(demanda.projeto)}">Início</a>`;
}

function formatarDatetime(data)
{
    if(!data || typeof(data)!=="string")
    {
        return;
    }
    if(data.length>10)
    {
        const datetimeseparado = data.split("T");
        const dateseparado = datetimeseparado[0].split("-");
        const timeseparado = datetimeseparado[1].split(":");

        const resultado=
        {
            ano: dateseparado[0],
            mes: dateseparado[1],
            dia: dateseparado[2],
            hora: timeseparado[0],
            minuto: timeseparado[1]
        };
        return resultado;
    }
    const dateseparado = data.split("-");

    const resultado=
    {
        ano: dateseparado[0],
        mes: dateseparado[1],
        dia: dateseparado[2],
        hora: "00",
        minuto: "00"
    };
    return resultado;
}

function renderizarComentarios(comentarios)
{
    const lista = document.getElementById("lista-comentarios");
    lista.innerHTML = "";

    if(!comentarios || comentarios.length==0)
    {
        lista.innerHTML = `
            <article class="comentario">
                <p>
                    <strong>Nenhum comentário encontrado</strong>
                </p>
            </article>
        `;
        return;
    }

    comentarios.forEach((comentario) =>
    {
        const data = formatarDatetime(comentario.data);
        lista.innerHTML += `
            <article class="comentario">
                <p>
                    <strong>${comentario.autor}</strong>:
                    ${comentario.texto}
                    <br>
                    <small>${data.dia}/${data.mes}/${data.ano} às ${data.hora}:${data.minuto}</small>
                </p>
            </article>
        `
    });
    return;

}

function renderizarHistorico(historico)
{
    const lista = document.getElementById("lista-historico");
    lista.innerHTML = "";

    if(!historico || historico.length==0)
    {
        lista.innerHTML = `
            <li>
                Nenhuma alteração realizada
            </li>
        `;
        return;
    }

    historico.forEach((alteracao_item) =>
    {
        const data = formatarDatetime(alteracao_item.datahora);
        lista.innerHTML += `
            <li>
                ${data.dia}/${data.mes}/${data.ano} às ${data.hora}:${data.minuto} - 
                ${alteracao_item.alteracao}
            </li>
        `
    });
    return;

}

window.addEventListener("DOMContentLoaded", carregarDemanda());

const formulario = document.getElementById("adicionar-comentario");
formulario.addEventListener("submit", async function(event) {
    event.preventDefault();
    const texto_novo = document.getElementById("novo-comentario");
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if(!texto_novo || texto_novo.value === "" || !id)
    {
        return;
    }

    const responsavel = document.getElementById("responsavel");
    
    const dados = {autor:responsavel.innerHTML,texto:texto_novo.value};


    const comentario = await POSTcomentario(dados, id);
    if(!comentario)
    {
        return;
    }
    const comentarios = await GETcomentarios(id)
    if(!comentarios)
    {
        return;
    }
    renderizarComentarios(comentarios);
});