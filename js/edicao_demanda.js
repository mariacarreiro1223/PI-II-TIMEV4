//   Isaque Ryo Cruz Tanno

let id_projeto = -1;

let demanda_proj;

async function carregarDemanda()
{
    const perfil = await GETverificarsessao();
    if (!perfil) 
    {   
        console.log("erro, sessao nao ativa");
        window.location.href = "login.html";
        return;
    }
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

    const usuarios_projeto = await GETusuarios(projeto_id.id);
    if(!usuarios_projeto || usuarios_projeto.length===0)
    {
        return;
    }
    
    const select_responsavel = document.getElementById("responsavel_id");
    select_responsavel.innerHTML = `<option value="nenhum">Nenhum</option>`;

    usuarios_projeto.forEach((usuario)=>{
        select_responsavel.innerHTML+=`<option value="${usuario.id_usuario}">${usuario.nome}</option>`;
    })
    demanda_proj = demanda;

    let ismembro=false;
    if(perfil.perfil === "Membro da Equipe")
    {
        ismembro=true;
    }
    renderizarDemanda(demanda, projeto_id.id,ismembro);
    return;
}

function renderizarDemanda(demanda, projeto_id, ismembro=false)
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
    if(demanda.id_responsavel===null)
    {
        responsavel.value = demanda.responsavel;
    }
    else
    {
        responsavel.value = demanda.id_responsavel;
    }
    


    //data_criacao.innerHTML = `${data_c.dia}/${data_c.mes}/${data_c.ano} às ${data_c.hora}:${data_c.minuto}`;
    //data_atualizacao.innerHTML = `${data_at.dia}/${data_at.mes}/${data_at.ano} às ${data_at.hora}:${data_at.minuto}`;
    prazo.value = demanda.prazo;

    const link_demandas = document.getElementById("link-demandas");
    link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${projeto_id}">Demandas</a>`;
    
    const link_dashboard = document.getElementById("link-dashboard");
    link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(demanda.projeto)}">Início</a>`;

    const link_projeto = document.getElementById("link-projeto");
    link_projeto.innerHTML = `<a href="projetos.html?nome=${encodeURIComponent(demanda.projeto)}">Projetos</a>`;

    const link_perfil = document.getElementById("link-perfil");
    link_perfil.innerHTML = `<a href="perfil.html?nome=${encodeURIComponent(demanda.projeto)}">Perfil</a>`;

    if(ismembro===true)
    {
        responsavel.setAttribute("readonly",true);
        prazo.setAttribute("readonly",true);
        Array.from(prioridade.options).forEach(opcao => {
            if (opcao.value !== demanda.prioridade) 
            {
                opcao.disabled = true;
            }
        });
        Array.from(responsavel.options).forEach(opcao => {
            if (opcao.value !== demanda.prioridade) 
            {
                opcao.disabled = true;
            }
        });
    }

    ajustarStatusPossiveis(demanda, ismembro);
}

function ajustarStatusPossiveis(demanda, ismembro=false )
{
    const campo_status = document.getElementById("status_id");
    if(demanda.status==="aberta")
    {
        campo_status.innerHTML = `
            <option value="aberta">Aberta</option>
            <option value="em_andamento">Em andamento</option>
        `;
        if(ismembro===false)
        {
            campo_status.innerHTML+=`<option value="cancelada">Cancelada</option>`;
        }
    }
    else if(demanda.status==="em_andamento")
    {
        campo_status.innerHTML = `
            <option value="em_andamento">Em andamento</option>
            <option value="em_revisao">Em revisão</option>
        `;
        if(ismembro===false)
        {
            campo_status.innerHTML+=`<option value="cancelada">Cancelada</option>`;
        }
    }
    else if(demanda.status==="em_revisao")
    {
        campo_status.innerHTML = `
            <option value="em_revisao">Em revisão</option>
            <option value="em_andamento">Em andamento</option>
        `;
        if(ismembro===false)
        {
            campo_status.innerHTML+=`
            <option value="concluida">Concluída</option>
            <option value="cancelada">Cancelada</option>`;
        }
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

async function atualizarDemanda(demanda)
{
    const nova_demanda =
    {
        prioridade: demanda.prioridade,
        status: demanda.status,
        responsavel: demanda.responsavel,
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