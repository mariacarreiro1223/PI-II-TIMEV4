// Isaque Tanno

let demandas_carregadas;

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

    const link_projeto = document.getElementById("link-projeto");
    link_projeto.innerHTML = `<a href="projetos.html?nome=${encodeURIComponent(projeto_nome.nome)}">Projetos</a>`;
    renderizarDemanda(demandas);
    demandas_carregadas = demandas;
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
                <span class="numero">${demanda.id}</span>
                <span class="nome-demanda">${demanda.titulo}</span>
                <p> Tipo: ${demanda.tipo} <br>
                    Prioridade: ${demanda.prioridade}   <br>
                    Status: ${demanda.status}
                </p>
                <a href="detalhes_demandas.html?id=${demanda.id}" class="ver-detalhes">Ver detalhes</a> 
                <a href="edicao_demanda.html?id=${demanda.id}" class="ver-detalhes">Editar</a>
            </li>`;
        cont++;
    });
    return;
}

const form_filtro = document.getElementById("form-filtro");
form_filtro.addEventListener("submit",function(event) {
    event.preventDefault();

    const tabela = document.getElementById("tabela-demandas");
    tabela.innerHTML="";

    if (!demandas_carregadas || demandas_carregadas.length === 0) 
    {
        tabela.innerHTML=`
            <li class="demanda-card">
                <span class="nome-demanda">Nenhuma demanda encontrada</span>
            </li>
        `;
        return;
    }
    
    const filtro = document.getElementById("txtbox_buscar_id");
    const tipo_filtro = document.getElementById("filtro_lista_id");
    let cont=1;
    if(filtro.value==="")
    {
        demandas_carregadas.forEach((demanda) => {
            tabela.innerHTML+=`
                <li class="demanda-card">
                    <span class="numero">${demanda.id}</span>
                    <span class="nome-demanda">${demanda.titulo}</span>
                    <p> Tipo: ${demanda.tipo} <br>
                        Prioridade: ${demanda.prioridade}   <br>
                        Status: ${demanda.status}
                    </p>
                    <a href="detalhes_demandas.html?id=${demanda.id}" class="ver-detalhes">Ver detalhes</a> 
                    <a href="edicao_demanda.html?id=${demanda.id}" class="ver-detalhes">Editar</a>
                </li>`;
            cont++;
        });
        return;
    }
    demandas_carregadas.forEach((demanda) => {
        const demanda_nome = (demanda.titulo).toLowerCase().trim();
        if(
            (tipo_filtro.value === "id" && demanda.id === Number(filtro.value)) ||
            (tipo_filtro.value === "status" && demanda.status === filtro.value.trim()) ||
            (tipo_filtro.value === "prioridade" && demanda.prioridade === filtro.value.trim()) ||
            (tipo_filtro.value === "tipo" && demanda.tipo === filtro.value.trim()) ||
            (tipo_filtro.value === "responsavel" && demanda.responsavel === filtro.value.trim()) ||
            (tipo_filtro.value === "demanda" && demanda_nome.includes(filtro.value.toLowerCase().trim()))
        )
        {
            tabela.innerHTML+=`
                <li class="demanda-card">
                    <span class="numero">${demanda.id}</span>
                    <span class="nome-demanda">${demanda.titulo}</span>
                    <p> Tipo: ${demanda.tipo} <br>
                        Prioridade: ${demanda.prioridade}   <br>
                        Status: ${demanda.status}
                    </p>
                    <a href="detalhes_demandas.html?id=${demanda.id}" class="ver-detalhes">Ver detalhes</a> 
                    <a href="edicao_demanda.html?id=${demanda.id}" class="ver-detalhes">Editar</a>
                </li>`;
            cont++;
        }
    });
    if(cont===1)
    {
        tabela.innerHTML=`
            <li class="demanda-card">
                <span class="nome-demanda">Nenhuma demanda encontrada</span>
            </li>
        `;
    }
    return;
    
});

window.addEventListener("DOMContentLoaded", carregarProjeto());