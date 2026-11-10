// Isaque Tanno

const API_BASE_URL = "http://127.0.0.1:3000";

async function tratarRespostaApi(resposta){
  const dados = await resposta.json();

  if(!resposta.ok){
    const mensagem = dados.mensagem || "Erro na requisição";
    throw new Error(mensagem);
  }

  return dados;
}

async function GETusuarios(idProjeto="",email="",cpf="")
{
    let url = `${API_BASE_URL}/usuarios`;
    if(idProjeto)
    {
        if(email)
        {
            if(cpf)
            {
                url += `?idprojeto=${encodeURIComponent(idProjeto)}&email=${encodeURIComponent(email)}&cpf=${encodeURIComponent(cpf)}`;
            }
            else
            {
                url += `?idprojeto=${encodeURIComponent(idProjeto)}&email=${encodeURIComponent(email)}`;
            }
        }
        else if(cpf)
        {
            url += `?idprojeto=${encodeURIComponent(idProjeto)}&cpf=${encodeURIComponent(cpf)}`;
        }
        else
        {
            url += `?idprojeto=${encodeURIComponent(idProjeto)}`;
        }
    }
    else if(email)
    {
        if(cpf)
        {
            url += `?email=${encodeURIComponent(email)}&cpf=${encodeURIComponent(cpf)}`;
        }
        else
        {
            url += `?email=${encodeURIComponent(email)}`;
        }
    }
    else if(cpf)
    {
        url += `?cpf=${encodeURIComponent(cpf)}`;
    }
    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETdemandasProjeto(projeto_id)
{
    let url = `${API_BASE_URL}/projetos/demandas/`;
    if(!projeto_id)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(projeto_id)}`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETdemanda(demanda_id)
{
    let url = `${API_BASE_URL}/demandas/`;
    if(!demanda_id)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(demanda_id)}`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETcomentarios(demanda_id)
{
    let url = `${API_BASE_URL}/demandas/`;
    if(!demanda_id)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(demanda_id)}/comentarios`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETdashboard(projeto_nome)
{
    let url = `${API_BASE_URL}/dashboard/`;
    if(!projeto_nome)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(projeto_nome)}`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GEThistorico(demanda_id)
{
    let url = `${API_BASE_URL}/historico/`;
    if(!demanda_id)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(demanda_id)}`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETidprojeto(nome_projeto)
{
    let url = `${API_BASE_URL}/projetoid/`;
    if(!nome_projeto)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(nome_projeto)}`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETnomeprojeto(id_projeto)
{
    let url = `${API_BASE_URL}/projetonome/`;
    if(!id_projeto)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(id_projeto)}`;

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function POSTdemanda(demanda)
{
    let url = `${API_BASE_URL}/demandas`;
    if(!demanda)
    {
        url += `x`;
    }

    const resposta = await fetch(url, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(demanda)
        }
    );
    return await tratarRespostaApi(resposta);
}

async function PUTdemanda(demanda, id)
{
    let url = `${API_BASE_URL}/demandas`;
    if(!demanda)
    {
        url += `x`;
    }

    url += `/${encodeURIComponent(id)}`;

    const resposta = await fetch(url, 
        {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(demanda)
        }
    );
    return await tratarRespostaApi(resposta);
}

async function POSTcomentario(comentario, id)
{
    let url = `${API_BASE_URL}/demandas`;
    if(!comentario)
    {
        url += `x`;
    }

    url += `/${encodeURIComponent(id)}/comentarios`;

    const resposta = await fetch(url, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(comentario)
        }
    );
    return await tratarRespostaApi(resposta);
}

async function POSTlogin(login)
{
    let url = `${API_BASE_URL}/login`;
    if(!login)
    {
        url += `x`;
    }
    const resposta = await fetch(url, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            credentials: "include",
            body: JSON.stringify(login)
        }
    );

    if(resposta.ok)
    {
        window.location.href = "projetos.html";
    }
    return await tratarRespostaApi(resposta);
}

async function POSTlogout()
{
    const resposta = await fetch(`${API_BASE_URL}/logout`, {
        method: "POST",
        credentials: "include"
    });

    if(resposta.ok)
    {
        window.location.href = "login.html";
    }

    return await tratarRespostaApi(resposta);
}

async function POSTcadastro(cadastro)
{
    let url = `${API_BASE_URL}/cadastro`;
    if(!cadastro)
    {
        url += `x`;
    }
    const resposta = await fetch(url, 
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(cadastro)
        }
    );
    return await tratarRespostaApi(resposta);
}

async function GETprojetos(id_projeto)
{
    let url = `${API_BASE_URL}/projetos`;
    /*
    if(!id_projeto)
    {
        url += `x`;
    }
    url += `${encodeURIComponent(id_projeto)}`;
    */

    const resposta = await fetch(url,{credentials: "include"});
    return await tratarRespostaApi(resposta);
}

async function GETverificarsessao()
{
    const resposta = await fetch(`${API_BASE_URL}/verificarsessao`, {
        method: "GET",
        credentials: "include"
    });

    if(!resposta.ok)
    {
        //window.location.href = "login.html";
        return null;
    }

    const dados = await resposta.json();

    //console.log(dados.usuario.nome);
    //console.log(dados.usuario.id_usuario);
    //console.log(dados.usuario.perfil);
    return dados.usuario;
}