// Isaque Tanno

async function carregarPerfil()
{

    const perfil = await GETverificarsessao();
    if (!perfil) 
    {   
        console.log("erro, sessao nao ativa");
        return;
    }
    //console.log(perfil);

    const parametros = new URLSearchParams(window.location.search);

    const nome = parametros.get("nome");
    if (!nome) 
    {   
        console.log("erro, sem nome do projeto");
        return;
    }
    const projeto_id = await GETidprojeto(nome);
    if(!projeto_id)
    {
        console.log("erro, sem id do projeto");
        return;
    }
    
    const link_demandas = document.getElementById("link-demandas");
    link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${projeto_id.id}">Demandas</a>`;
    
    const link_dashboard = document.getElementById("link-dashboard");
    link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(nome)}">Início</a>`;

    const link_projeto = document.getElementById("link-projeto");
    link_projeto.innerHTML = `<a href="projetos.html?nome=${encodeURIComponent(nome)}">Projetos</a>`;

    const nome_perfil = document.getElementById("nome-perfil");
    nome_perfil.innerHTML = `<strong>Nome: </strong> ${perfil.nome}`;

    const perfil_perfil = document.getElementById("perfil-perfil");
    perfil_perfil.innerHTML = `<strong>Perfil: </strong> ${perfil.perfil}`;
}

window.addEventListener("DOMContentLoaded", carregarPerfil());