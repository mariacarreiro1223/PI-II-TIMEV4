//   Isaque Ryo Cruz Tanno

let id_projeto = -1;

let demanda_proj;

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

    demanda_proj = demanda;
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

    const link_projeto = document.getElementById("link-projeto");
    link_projeto.innerHTML = `<a href="projetos.html?nome=${encodeURIComponent(demanda.projeto)}">Projetos</a>`;

    ajustarStatusPossiveis(demanda);
}

function ajustarStatusPossiveis(demanda)
{
    const campo_status = document.getElementById("status_id");
    if(demanda.status==="aberta")
    {
        campo_status.innerHTML = `
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em andamento</option>
            <option value="cancelada">Cancelada</option>
        `;
    }
    else if(demanda.status==="em_andamento")
    {
        campo_status.innerHTML = `
            <option value="em_andamento">Em andamento</option>
            <option value="em_revisao">Em revisão</option>
            <option value="cancelada">Cancelada</option>
        `;
    }
    else if(demanda.status==="em_revisao")
    {
        campo_status.innerHTML = `
            <option value="em_andamento">Em andamento</option>
            <option value="em_revisao">Em revisão</option>
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>
        `;
    }
    else if(demanda.status==="concluida")
    {
        campo_status.innerHTML = `
            <option value="concluida">Concluída</option>
        `;
    }
    else
    {
        campo_status.innerHTML = `
            <option value="cancelada">Cancelada</option>
        `;
    }
    return;
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
    ajustarStatusPossiveis(resposta);
    return resposta;
}

window.addEventListener("DOMContentLoaded", carregarDemanda());