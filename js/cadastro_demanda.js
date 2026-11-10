//   Isaque Ryo Cruz Tanno


let id_projeto = -1;
let nome_projeto = "";

async function carregarInfo()
{
    const perfil = await GETverificarsessao();
    if (!perfil) 
    {   
        console.log("erro, sessao nao ativa");
        window.location.href = "login.html";
        return;
    }

    const parametros = new URLSearchParams(window.location.search);
    id_projeto = Number(parametros.get("id"));
    
    nome_projeto = await GETnomeprojeto(id_projeto);
    if(!nome_projeto)
    {
        return;
    }
    const campo_nome_projeto = document.getElementById("nome-projeto");
    campo_nome_projeto.innerHTML = nome_projeto.nome;

    const link_dashboard = document.getElementById("link-dashboard");
    link_dashboard.innerHTML = `<a href="dashboard.html?nome=${encodeURIComponent(nome_projeto.nome)}">Início</a>`;

    const link_demandas = document.getElementById("link-demandas");
    link_demandas.innerHTML = `<a href="Listagem_demanda.html?id=${id_projeto}">Demandas</a>`;

    const link_projeto = document.getElementById("link-projeto");
    link_projeto.innerHTML = `<a href="projetos.html?nome=${encodeURIComponent(nome_projeto.nome)}">Projetos</a>`;

    const link_perfil = document.getElementById("link-perfil");
    link_perfil.innerHTML = `<a href="perfil.html?nome=${encodeURIComponent(nome_projeto.nome)}">Perfil</a>`;

    if(perfil.perfil === "Membro da Equipe")
    {
        return
    }

    const usuarios_projeto = await GETusuarios(id_projeto);
    if(!usuarios_projeto || usuarios_projeto.length===0)
    {
        return;
    }
    
    const select_responsavel = document.getElementById("responsavel_id");
    select_responsavel.innerHTML = `<option value="nenhum">Nenhum</option>`;

    usuarios_projeto.forEach((usuario)=>{
        select_responsavel.innerHTML+=`<option value="${usuario.id_usuario}">${usuario.nome}</option>`;
    })
}

async function cadastrarDemanda(demanda)
{
    const nova_demanda =
    {
        titulo: demanda.titulo,
        descricao: demanda.desc,
        tipo: demanda.tipo,
        prioridade: demanda.prioridade,
        projeto: nome_projeto.nome,
        responsavel: demanda.responsavel,
        prazo: demanda.prazo
    };
    const resposta = await POSTdemanda(nova_demanda);
    if(!resposta)
    {
        return;
    }
    return;
}

window.addEventListener("DOMContentLoaded", carregarInfo());