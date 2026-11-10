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

    const nome_perfil = document.getElementById("nome-perfil");
    nome_perfil.innerHTML = `<strong>Nome: </strong> ${perfil.nome}`;

    const perfil_perfil = document.getElementById("perfil-perfil");
    perfil_perfil.innerHTML = `<strong>Perfil: </strong> ${perfil.perfil}`;

    const parametros = new URLSearchParams(window.location.search);

    const nome = parametros.get("nome");
    if (nome) 
    {           
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
    }
    else
    {
        const link_demandas = document.getElementById("link-demandas");
        link_demandas.innerHTML = ``;
        
        const link_dashboard = document.getElementById("link-dashboard");
        link_dashboard.innerHTML = ``;

        const link_projeto = document.getElementById("link-projeto");
        link_projeto.innerHTML = `<a href="projetos.html">Projetos</a>`;
    }
    
    if(perfil.perfil === "Administrador")
    {
        const div_usuarios = document.getElementById("box-demandas");
        div_usuarios.removeAttribute('hidden');

        const tabela_usuarios = document.getElementById("tabela-usuarios");
        const usuarios = await GETusuarios();
        if(!usuarios || usuarios.length === 0)
        {
            tabela_usuarios.innerHTML = `
                        <tr>
                            <th scope="row">1</th>
                            <td class="fw-bold">Nenhum usuário encontrado</td>
                            <td><span class="badge bg-primary"></span></td>
                            <td></td>
                            <td class="text-center"></td>
                        </tr>`;
            return;
        }
        else
        {
            tabela_usuarios.innerHTML = "";
            usuarios.forEach((usuario)=>{
                tabela_usuarios.innerHTML+=`
                    <tr>
                        <th scope="row">${usuario.id_usuario}</th>
                        <td class="fw-bold">${usuario.nome}</td>
                        <td><span class="badge bg-primary">${usuario.cpf}</span></td>
                        <td>${usuario.email}</td>
                        <td class="text-center">${usuario.perfil}</td>
                    </tr>
                `;

            });
        }

    }
    
}

window.addEventListener("DOMContentLoaded", carregarPerfil());