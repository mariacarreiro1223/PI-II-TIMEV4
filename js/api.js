// Isaque Tanno

const API_BASE_URL = "http://localhost:3000";

async function tratarRespostaApi(resposta){
  const dados = await resposta.json();

  if(!resposta.ok){
    const mensagem = dados.mensagem || "Erro na requisição";
    throw new Error(mensagem);
  }

  return dados;
}

async function GETusuarios(email="",cpf="")
{
    let url = `${API_BASE_URL}/usuarios`;
    if(email)
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
    const resposta = await fetch(url);
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

    const resposta = await fetch(url);
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

    const resposta = await fetch(url);
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

    const resposta = await fetch(url);
    return await tratarRespostaApi(resposta);
}