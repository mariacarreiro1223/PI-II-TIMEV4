// Isaque Tanno

let projetos_carregados;

async function carregarProjetos()
{
    
    const parametros = new URLSearchParams(window.location.search);
    const nome = parametros.get("nome");

    

    const projetos = await GETprojetos();
    if(!projetos)
    {
        return;
    }

    const link_dashboard = document.getElementById("link-dashboard");
    const link_demandas = document.getElementById("link-demandas");
    if (nome) 
    {   
        link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(nome)}">Início</a>`;
        const projeto_id = await GETidprojeto(nome);
        if(!projeto_id)
        {
            return;
        }
        link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${projeto_id.id}">Demandas</a>`;

    }
    else
    {
        if(projetos.length>0)
        {
            link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(projetos[0].nome)}">Início</a>`;
            link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${projetos[0].id}">Demandas</a>`;
        }
        else
        {
            link_dashboard.innerHTML = `<a href="#">Início</a>`;
            link_demandas.innerHTML = `<a href="#">Demandas</a>`;
        }
    }

    projetos_carregados = projetos;
    renderizarProjetos(projetos);
    return;
}

function renderizarProjetos(projetos)
{
    const tabela = document.getElementById("tabela-projetos");
    tabela.innerHTML="";

    if (!projetos || projetos.length === 0) 
    {
        tabela.innerHTML=`
            <tr>
                <th scope="row"></th>
                <td class="fw-bold">Nenhum projeto cadastrado</td>
                <td><span class="badge bg-primary"></span></td>
                <td</td>
                <td class="text-center"></td>
            </tr>
        `;
        return;
    }
    
    projetos.forEach((projeto_atual) => {
        tabela.innerHTML+=`
            <tr>
                <th scope="row">${projeto_atual.id}</th>
                <td class="fw-bold">${projeto_atual.nome}</td>
                <td><span class="badge bg-primary">Em Andamento</span></td>
                <td>${projeto_atual.demandas.length}</td>
                <td class="text-center">
                    <a href="dashboard.html?nome=${encodeURIComponent(projeto_atual.nome)}" class="btn btn-sm btn-outline-dark">Abrir Dashboard</a>
                </td>
            </tr>`;
    });
    return;
}

const form_filtro = document.getElementById("form-filtro");
form_filtro.addEventListener("submit",function(event) {

    event.preventDefault();

    const tabela = document.getElementById("tabela-projetos");
    tabela.innerHTML="";
    if (!projetos_carregados || projetos_carregados.length === 0) 
    {
        tabela.innerHTML=`
            <tr>
                <th scope="row"></th>
                <td class="fw-bold">Nenhum projeto cadastrado</td>
                <td><span class="badge bg-primary"></span></td>
                <td</td>
                <td class="text-center"></td>
            </tr>
        `;
        return;
    }
    
    const filtro = document.getElementById("txtbox_buscar_id");
    if(filtro.value==="")
    {
        projetos_carregados.forEach((projeto_atual) => {
            tabela.innerHTML+=`
                <tr>
                    <th scope="row">${projeto_atual.id}</th>
                    <td class="fw-bold">${projeto_atual.nome}</td>
                    <td><span class="badge bg-primary">Em Andamento</span></td>
                    <td>${projeto_atual.demandas.length}</td>
                    <td class="text-center">
                        <a href="dashboard.html?nome=${encodeURIComponent(projeto_atual.nome)}" class="btn btn-sm btn-outline-dark">Abrir Dashboard</a>
                    </td>
                </tr>`;
        });
        return;
    }
    let cont=1;
    projetos_carregados.forEach((projeto_atual) => {
        if((projeto_atual.nome.toLowerCase().trim().includes(filtro.value.toLowerCase().trim())))
        {
            tabela.innerHTML+=`
            <tr>
                <th scope="row">${projeto_atual.id}</th>
                <td class="fw-bold">${projeto_atual.nome}</td>
                <td><span class="badge bg-primary">Em Andamento</span></td>
                <td>${projeto_atual.demandas.length}</td>
                <td class="text-center">
                    <a href="dashboard.html?nome=${encodeURIComponent(projeto_atual.nome)}" class="btn btn-sm btn-outline-dark">Abrir Dashboard</a>
                </td>
            </tr>`;
            cont++;
        }
        
    });

    if(cont===1)
    {
        tabela.innerHTML=`
            <tr>
                <th scope="row"></th>
                <td class="fw-bold">Nenhum projeto com esse nome encontrado</td>
                <td><span class="badge bg-primary"></span></td>
                <td</td>
                <td class="text-center"></td>
            </tr>
        `;
    }
    return;
    
    
});

window.addEventListener("DOMContentLoaded", carregarProjetos());