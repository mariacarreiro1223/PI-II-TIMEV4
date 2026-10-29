// Isaque Tanno

async function carregarDashboard()
{
    const parametros = new URLSearchParams(window.location.search);
    const nome = parametros.get("nome");

    if (!nome) 
    {   
        return;
    }
    


    const dashboard_dados = await GETdashboard(nome)
    if(!dashboard_dados)
    {
        return;
    }
    const titulo = document.getElementById("titulo-texto");
    titulo.innerHTML += nome;

    renderizarDashboard(dashboard_dados,nome);
}

function renderizarDashboard(dados,nome)
{
    if(!dados)
    {
        return;
    }
    const demandas_crit = document.getElementById("demandas_criticas_abertas");
    const demandas_prazo = document.getElementById("demandas_prox_prazo");

    const demandas_tarefa = document.getElementById("demandas_tarefa");
    const demandas_defeito = document.getElementById("demandas_defeito");
    const demandas_melhoria = document.getElementById("demandas_melhoria");
    const demandas_documentacao = document.getElementById("demandas_documentacao");

    const demandas_alta = document.getElementById("demandas_alta");
    const demandas_media = document.getElementById("demandas_media");
    const demandas_baixa = document.getElementById("demandas_baixa");

    const demandas_totais = document.getElementById("demandas_totais");
    const demandas_abertas = document.getElementById("demandas_abertas");
    const demandas_andamento = document.getElementById("demandas_andamento");
    const demandas_revisao = document.getElementById("demandas_revisao");
    const demandas_concluidas = document.getElementById("demandas_concluidas");
    const demandas_canceladas = document.getElementById("demandas_canceladas");


    demandas_crit.innerHTML = String(dados.qtd_demandas_importantes.criticas);
    demandas_prazo.innerHTML = String(dados.qtd_demandas_importantes.proximas);

    demandas_tarefa.innerHTML = String(dados.qtd_demandas_por_tipo.tarefas);
    demandas_defeito.innerHTML = String(dados.qtd_demandas_por_tipo.defeitos);
    demandas_melhoria.innerHTML = String(dados.qtd_demandas_por_tipo.melhorias);
    demandas_documentacao.innerHTML = String(dados.qtd_demandas_por_tipo.docs);

    demandas_alta.innerHTML = String(dados.qtd_demandas_por_prioridade.altas);
    demandas_media.innerHTML = String(dados.qtd_demandas_por_prioridade.medias);
    demandas_baixa.innerHTML = String(dados.qtd_demandas_por_prioridade.baixas);

    demandas_totais.innerHTML = String(dados.qtd_total);
    demandas_abertas.innerHTML = String(dados.qtd_demandas_por_status.abertas);
    demandas_andamento.innerHTML = String(dados.qtd_demandas_por_status.em_andamento);
    demandas_revisao.innerHTML = String(dados.qtd_demandas_por_status.em_revisao);
    demandas_concluidas.innerHTML = String(dados.qtd_demandas_por_status.concluidas);
    demandas_canceladas.innerHTML = String(dados.qtd_demandas_por_status.canceladas);

    const link_demandas = document.getElementById("link-demandas");
    link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${dados.id}">Demandas</a>`;

    const link_cadastro_demandas = document.getElementById("link-cadastro-demanda");
    link_cadastro_demandas.innerHTML = `<a href="cadastro_demanda.html?id=${dados.id}" target="_self">Criar Demanda</a>`;

    const lista_demandas = document.getElementById("lista-demandas-link2");
    lista_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${dados.id}">Listagem de Demandas</a>`;

    const link_projeto = document.getElementById("link-projeto");
    link_projeto.innerHTML = `<a href="projetos.html?nome=${encodeURIComponent(nome)}">Projetos</a>`;

    const tabela_critica = document.getElementById("tabela-critica-demandas");
    tabela_critica.innerHTML="";
    const tabela_proxima = document.getElementById("tabela-proxima-demandas");
    tabela_proxima.innerHTML="";
    let cont;

    const criticas = dados.demandas_criticas;
    const proximas = dados.demandas_proximas;
    if (!criticas || criticas.length === 0) 
    {
        tabela_critica.innerHTML=`
            <tr>
                <th scope="row"></th>
                <td class="fw-bold">Nenhuma demanda crítica aberta</td>
                <td><span class="badge bg-primary"></span></td>
                <td></td>
                <td class="text-center"></td>
            </tr>
        `;
    }
    else
    {
        cont=1;
        criticas.forEach((demanda) => {
            if(demanda.status!=="cancelada")
            {
                tabela_critica.innerHTML+=`
                    <tr>
                        <th scope="row">${demanda.id}</th>
                        <td class="fw-bold">${demanda.titulo}</td>
                        <td><span class="badge bg-primary">${demanda.status}</span></td>
                        <td>${demanda.tipo}</td>
                        <td class="text-center"><a href="detalhes_demandas.html?id=${demanda.id}" class="btn btn-sm btn-outline-dark">Detalhes</a></td>
                    </tr>
                    `;
                cont++;
            }
        });
    }

    if (!proximas || proximas.length === 0) 
    {
        tabela_proxima.innerHTML=`
            <tr>
                <th scope="row"></th>
                <td class="fw-bold">Nenhuma demanda próxima aberta</td>
                <td><span class="badge bg-primary"></span></td>
                <td></td>
                <td class="text-center"></td>
            </tr>
        `;
    }
    else
    {
        cont=1;
        proximas.forEach((demanda) => {
            if(demanda.status!=="cancelada")
            {
                tabela_proxima.innerHTML+=`
                    <tr>
                        <th scope="row">${demanda.id}</th>
                        <td class="fw-bold">${demanda.titulo}</td>
                        <td><span class="badge bg-primary">${demanda.status}</span></td>
                        <td>${demanda.tipo}</td>
                        <td class="text-center"><a href="detalhes_demandas.html?id=${demanda.id}" class="btn btn-sm btn-outline-dark">Detalhes</a></td>
                    </tr>
                    `;
                cont++;
            }
        });
    }
    return;
}

window.addEventListener("DOMContentLoaded", carregarDashboard());