// Isaque Tanno

async function carregarDemanda()
{
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    if (!id) 
    {   
        renderizarDemanda();
        return;
    }

    const demanda = await GETdemanda(id)
    if(!demanda)
    {
        renderizarDemanda();
        return;
    }
    
    const comentarios = await GETcomentarios(id)
    if(!comentarios)
    {
        return;
    }

    renderizarDemanda(demanda);
    renderizarComentarios(comentarios);
}

function renderizarDemanda(demanda)
{
    if(!demanda)
    {
        return;
    }

    const titulo = document.getElementById("titulo-demanda");
    const status = document.getElementById("status");
    const desc = document.getElementById("descricao-demanda");
    const tipo = document.getElementById("tipo-demanda");
    const prioridade = document.getElementById("prioridade");
    const projeto = document.getElementById("projeto-associado");
    const responsavel = document.getElementById("responsavel");
    const data_criacao = document.getElementById("data-criacao");
    const data_atualizacao = document.getElementById("data-atualizacao");
    const prazo = document.getElementById("prazo");

    titulo.innerHTML = demanda.titulo;
    status.innerHTML = demanda.status;
    desc.innerHTML = demanda.descricao;
    tipo.innerHTML = demanda.tipo;
    prioridade.innerHTML = demanda.prioridade;
    projeto.innerHTML = demanda.projeto;
    responsavel.innerHTML = demanda.responsavel;
    


    const data_c = formatarDatetime(demanda.dataCriacao);
    const data_at = formatarDatetime(demanda.dataAtualizacao);
    const prazo_f = formatarDatetime(demanda.prazo);

    data_criacao.innerHTML = `${data_c.dia}/${data_c.mes}/${data_c.ano} às ${data_c.hora}:${data_c.minuto}`;
    data_atualizacao.innerHTML = `${data_at.dia}/${data_at.mes}/${data_at.ano} às ${data_at.hora}:${data_at.minuto}`;
    prazo.innerHTML = `${prazo_f.dia}/${prazo_f.mes}/${prazo_f.ano}`;
    
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

function renderizarComentarios(comentarios)
{
    const lista = document.getElementById("lista-comentarios");
    lista.innerHTML = "";

    if(!comentarios || comentarios.length==0)
    {
        lista.innerHTML = `
            <article class="comentario">
                <p>
                    <strong>Nenhum comentário encontrado</strong>
                </p>
            </article>
        `;
        return;
    }

    comentarios.forEach((comentario) =>
    {
        const data = formatarDatetime(comentario.data);
        lista.innerHTML += `
            <article class="comentario">
                <p>
                    <strong>${comentario.autor}</strong>:
                    ${comentario.texto}
                    <br>
                    <small>${data.dia}/${data.mes}/${data.ano} às ${data.hora}:${data.minuto}</small>
                </p>
            </article>
        `
    });
    return;

}

window.addEventListener("DOMContentLoaded", carregarDemanda());