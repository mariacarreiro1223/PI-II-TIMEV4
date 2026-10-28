let id_projeto = -1;

async function carregarDemanda()
{
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (!id) 
    {   
        renderizarDemanda();
        return;
    }
    id_projeto = id;

    const demanda = await GETdemanda(id)
    if(!demanda)
    {
        renderizarDemanda();
        return;
    }

    const projeto_id = await GETidprojeto(demanda.projeto);
    if(!projeto_id)
    {
        return;
    }


    renderizarDemanda(demanda, projeto_id.id);
    return;
}

function renderizarDemanda(demanda, projeto_id)
{
    if(!demanda)
    {
        return;
    }

    const titulo = document.getElementById("titulo_id");
    const status = document.getElementById("status_id");
    const desc = document.getElementById("descricao_id");
    const tipo = document.getElementById("tipodemanda_id");
    const prioridade = document.getElementById("prioridade_id");
    const projeto = document.getElementById("projeto_associado_id");
    const responsavel = document.getElementById("responsavel_id");
    //const data_criacao = document.getElementById("data-criacao");
    //const data_atualizacao = document.getElementById("data-atualizacao");
    const prazo = document.getElementById("prazo_finalizacao_id");

    titulo.value = demanda.titulo;
    status.value = demanda.status;
    desc.value = demanda.descricao;
    tipo.value = demanda.tipo;
    prioridade.value = demanda.prioridade;
    projeto.value = demanda.projeto;
    responsavel.value = demanda.responsavel;
    


    //data_criacao.innerHTML = `${data_c.dia}/${data_c.mes}/${data_c.ano} às ${data_c.hora}:${data_c.minuto}`;
    //data_atualizacao.innerHTML = `${data_at.dia}/${data_at.mes}/${data_at.ano} às ${data_at.hora}:${data_at.minuto}`;
    prazo.value = demanda.prazo;

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

async function atualizarDemanda(demanda,responsavel_nome="nenhum")
{
    const nova_demanda =
    {
        prioridade: demanda.prioridade,
        status: demanda.status,
        responsavel: responsavel_nome,
        prazo: demanda.prazo
    };
    const resposta = await PUTdemanda(nova_demanda, id_projeto);
    if(!resposta)
    {
        return;
    }
    return;
}

window.addEventListener("DOMContentLoaded", carregarDemanda());