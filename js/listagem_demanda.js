// Isaque Tanno

async function carregarProjeto()
{
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (!id) 
    {   
        renderizarDemanda();
        return;
    }

    const demandas = await GETdemandasProjeto(id)
    if(!demandas)
    {
        return;
    }

    const projeto_nome = await GETnomeprojeto(id);
    if(!projeto_nome)
    {
        return;
    }
    
    const link_dashboard = document.getElementById("link-dashboard");
    link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(projeto_nome.nome)}">Início</a>`;
    renderizarDemanda(demandas);
    return;
}

function renderizarDemanda(demandas)
{
    const tabela = document.getElementById("tabela-demandas");
    tabela.innerHTML="";

    if (!demandas || demandas.length === 0) 
    {
        tabela.innerHTML=`
            <li class="demanda-card">
                <span class="nome-demanda">Nenhuma demanda encontrada</span>
            </li>
        `;
        return;
    }
    
    let cont=1;
    demandas.forEach((demanda) => {
        tabela.innerHTML+=`
            <li class="demanda-card">
                <span class="numero">${cont}</span>
                <span class="nome-demanda">${demanda.titulo}</span>
                <p> Tipo: ${demanda.tipo} <br>
                    Prioridade: ${demanda.prioridade}   <br>
                    Status: ${demanda.status}
                </p>
                <a href="detalhes_demandas.html?id=${demanda.id}" class="ver-detalhes">Ver detalhes</a>
            </li>`;
        cont++;
    });
    return;
}

window.addEventListener("DOMContentLoaded", carregarProjeto());