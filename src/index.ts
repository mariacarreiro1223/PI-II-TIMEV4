import express, {Request, Response} from "express";
import cors from "cors";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
    res.send("Sistema SADD");
});

app.use(express.json());
app.use(cors());


function calcularIdade(dataNascimento:string) {
    const hoje = new Date();
    const dtnascimento = new Date(`${dataNascimento}T00:00:00`);

    let idade = hoje.getFullYear() - dtnascimento.getFullYear();
    const aniversarioAindaNaoOcorreu =
        hoje.getMonth() < dtnascimento.getMonth()
        || (
            hoje.getMonth() === dtnascimento.getMonth()
            && hoje.getDate() < dtnascimento.getDate()
        );

    if (aniversarioAindaNaoOcorreu) {
        idade--;
    }

    return idade;
}


function testarCPF(cpf:string)
{
    cpf = cpf.replace(/[-.]/g, '');     //expressão regular, para substituir todos - e . globais por ''

    if(cpf.length>11 || cpf.length<11)
    {
        return false;
    }

    let soma1 = 0;
    for(let i=0; i<9; i++)
    {
        soma1+=Number(cpf[i])*(10-i);
    }
    soma1 = soma1 % 11;
    if(soma1<2)
    {
        if(Number(cpf[9])!==0)
        {
            return false;
        }   
    }
    else if(Number(cpf[9])!==11-soma1)
    {
        return false;
    }
    let soma2 = 0;
    for(let i=0; i<10; i++)
    {
        soma2+=Number(cpf[i])*(11-i);
    }
    soma2 = soma2 % 11; 
    if(soma2<2)
    {
        if(Number(cpf[10])!==0)
        {
            return false;
        }   
    }
    else if(Number(cpf[10])!==11-soma2)
    {
        return false;
    }

    let contNRepetidos = 0;
    for(let i=1; i<11; i++)
    {
        if(Number(cpf[i])===Number(cpf[0]))
        {
            contNRepetidos++;
        }
    }
    if(contNRepetidos==10)
    {
        return false;
    }

    return true;
}

interface usuarioFormato {
    nome: string;
    cpf: number;
    telefone: number;
    dataNasc: string;
    email: string;
    senha: string;
}

let usuarios = [
    {
        nome: "Eduardo Campos",
        cpf: 37197884071,
        telefone: 11987659876,
        dataNasc: "1985-02-01",
        email: "eduard789@gmail.com",
        senha: "1234Abcde_"
    },

    {
        nome: "Juliana Santos",
        cpf: 22105413013,
        telefone: 17964213152,
        dataNasc: "1993-09-24",
        email: "jujusa@gmail.com",
        senha: "2409_Juli"
    }
];

// Nessa requisição, será exibido todos usuários, mas SEM a senha (ela estará vazia)
//      Também é possível específicar o cpf ou email para busca
//      Ele cria uma lista temporária dos usuários que serão exibidos, e anula suas senhas
app.get("/usuarios",(req: Request, res: Response) => {
    const email = req.query.email;
    const cpf = req.query.cpf;

    const qtdeUsuarios = usuarios.length;

    let usuariosExibidos: usuarioFormato[] = [];
    for(let cont=0; cont<qtdeUsuarios; cont++)
    {
        const usuarioFiltrado = usuarios[cont];
        usuarioFiltrado.senha = "";
        if((!cpf && email && email===usuarioFiltrado.email)||(!email && cpf && Number(cpf)===usuarioFiltrado.cpf)||(!cpf && !email))
        {
            usuariosExibidos.push(usuarioFiltrado);
        }
    }
    if(usuariosExibidos.length===0 && (cpf || email))
    {
        return res.status(404).json({mensagem: "Nenhum usuário encontrado"});
    }
    return res.status(200).json(usuariosExibidos);  
});

// Dá status de OK 200 caso ambos email e senha sejam presentes em um usuário
app.post("/login",(req: Request, res: Response) => {
    const {email,senha} = req.body;
    const usuario = usuarios.find((item) => item.email === email)
    if(!usuario || usuario.senha !== senha)
    {
        return res.status(400).json({mensagem: "Usuário ou senha inválidos!"});
    }
    return res.status(200).json({mensagem: "Login OK"});
});


// Nota: o usuário é cadastrado com a permissão de acesso de um membro da equipe
app.post("/cadastro",(req: Request, res: Response) => {
    const {nome,cpf,telefone,dataNasc,email,senha} = req.body;

    if(!nome||!cpf||!telefone||!dataNasc||!email||!senha)
    {
        return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
    }

    if (nome.trim().split(/\s+/).length < 2)
    {
        return res.status(400).json({mensagem: "Nome incompleto!"});
    }

    const usuarioCPF = usuarios.find((item) => item.cpf === cpf)    // Ele busca se existe um usuário com este CPF (para não existir repetições)
    if(usuarioCPF || !testarCPF(String(cpf)))
    {
        return res.status(400).json({mensagem: "CPF inválido!"});
    }

    if(String(telefone).length<11)
    {
        return res.status(400).json({mensagem: "Número de telefone inválido!"});
    }


    const hoje = new Date ()
    const nascimento = new Date(`${dataNasc}T00:00:00`);
    if(nascimento>hoje|| (calcularIdade(dataNasc) < 18 || calcularIdade(dataNasc) > 100))
    {
        return res.status(400).json({mensagem: "Data de nascimento inválida!"});
    }


    // Esta é uma expressão regular que pesquisei para emails
    const expressaoRegularEmail  = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email);
    if(!expressaoRegularEmail)
    {
        return res.status(400).json({mensagem: "Email inválido!"});
    }

    const possuiMaiuscula = /[A-Z]/.test(senha);
    const possuiMinuscula = /[a-z]/.test(senha);
    const possuiNumero = /[0-9]/.test(senha);
    const possuiEspecial = /[_@!]/.test(senha);
    if(senha.length<8 ||!possuiEspecial || !possuiMaiuscula ||!possuiMinuscula ||!possuiNumero)
    {
        return res.status(400).json({mensagem: "Senha inválida!"});
    }


    const novoUsuario : usuarioFormato =
    {
        nome,cpf,telefone,dataNasc,email,senha
    }

    usuarios.push(novoUsuario);
    return res.status(200).json(novoUsuario);
});
/*
    Cadastro válido para testar:

    {
        "nome": "Heathcliff Cathy",
        "cpf": 49235918030,
        "telefone": 11987659876,
        "dataNasc": "1985-02-01",
        "email": "heathcliff@gmail.com",
        "senha": "1234Abcde_"
    }
*/


interface demandaFormato {
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    prioridade: string;
    status: string;
    projeto: string;
    responsavel: string;
    dataCriacao: Date;
    dataAtualizacao: Date;
    prazo: string;
}

let demandas: demandaFormato[] = [
    {
        id: 1,
        titulo: "Corrigir erro no login",
        descricao: "O sistema não aceita o espaço no final da senha",
        tipo: "defeito",
        prioridade: "media",
        status: "aberta",
        projeto: "Sistema de login",
        responsavel: "nenhum",
        dataCriacao: new Date("2026-09-08T09:35:00"),
        dataAtualizacao: new Date("2026-09-09T20:30:00"),
        prazo: "2026-11-20"
    },

    {
        id: 2,
        titulo: "Atualizar documentação da API",
        descricao: "Documentar todas as rotas novas do sistema",
        tipo: "melhoria",
        prioridade: "media",
        status: "aberta",
        projeto: "nenhum",
        responsavel: "nenhum",
        dataCriacao: new Date("2026-09-10T10:00:00"),
        dataAtualizacao: new Date("2026-09-10T10:00:00"),
        prazo: "2026-12-05"
    },

    {
        id: 3,
        titulo: "Implementar autenticação em duas etapas",
        descricao: "Adicionar uma segunda etapa de verificação no login",
        tipo: "tarefa",
        prioridade: "alta",
        status: "em_andamento",
        projeto: "Sistema de login",
        responsavel: "nenhum",
        dataCriacao: new Date("2026-09-15T14:20:00"),
        dataAtualizacao: new Date("2026-09-28T16:45:00"),
        prazo: "2026-11-30"
    }
];

app.get("/demandas",(req: Request, res: Response) => {
    const status = req.query.status;
    const prioridade = req.query.prioridade;
    const tipo = req.query.tipo;

    let demandasExibidas: demandaFormato[] = [];
    for(let cont=0; cont<demandas.length; cont++)
    {
        const demanda = demandas[cont];
        if((!status || status===demanda.status) && (!prioridade || prioridade===demanda.prioridade) && (!tipo || tipo===demanda.tipo))
        {
            demandasExibidas.push(demanda);
        }
    }
    return res.status(200).json(demandasExibidas);
});

app.get("/demandas/:id",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const demanda = demandas.find((item) => item.id === id);

    if(!demanda)
    {
        return res.status(404).json({mensagem: "Demanda não encontrada!"});
    }
    return res.status(200).json(demanda);
});

app.post("/demandas",(req: Request, res: Response) => {
    const {titulo,descricao,tipo,prioridade,projeto,responsavel,prazo} = req.body;

    if(!titulo||!descricao||!tipo||!prioridade||!prazo)
    {
        return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
    }

    if(titulo.trim()==="")
    {
        return res.status(400).json({mensagem: "Título inválido!"});
    }

    if(descricao.trim().split(/\s+/).length < 3)
    {
        return res.status(400).json({mensagem: "Descrição muito curta!"});
    }

    if(descricao.length > 500)
    {
        return res.status(400).json({mensagem: "Descrição deve ter até 500 caracteres!"});
    }

    if(tipo!=="tarefa" && tipo!=="defeito" && tipo!=="melhoria" && tipo!=="documentacao")
    {
        return res.status(400).json({mensagem: "Tipo de demanda inválido!"});
    }

    if(prioridade!=="critica" && prioridade!=="alta" && prioridade!=="media" && prioridade!=="baixa")
    {
        return res.status(400).json({mensagem: "Prioridade inválida!"});
    }

    const formatoPrazo = /^\d{4}-\d{2}-\d{2}$/.test(prazo);
    const dataPrazo = new Date(`${prazo}T00:00:00`);
    const prazoMinimo = new Date();
    prazoMinimo.setDate(prazoMinimo.getDate() + 10);
    if(!formatoPrazo || dataPrazo < prazoMinimo)
    {
        return res.status(400).json({mensagem: "O prazo deve ser superior a 10 dias a partir da abertura da demanda!"});
    }

    const hoje = new Date();

    const novaDemanda : demandaFormato =
    {
        id: demandas.length + 1,
        titulo: titulo.trim(),
        descricao: descricao.trim(),
        tipo,
        prioridade,
        status: "aberta",
        projeto: projeto || "nenhum",
        responsavel: responsavel || "nenhum",
        dataCriacao: hoje,
        dataAtualizacao: hoje,
        prazo
    };

    demandas.push(novaDemanda);
    return res.status(201).json(novaDemanda);
});

app.put("/demandas/:id",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const demanda = demandas.find((item) => item.id === id);

    if(!demanda)
    {
        return res.status(404).json({mensagem: "Demanda não encontrada!"});
    }

    const {prioridade,status,responsavel,prazo} = req.body;
    
    if(!prioridade||!status||!prazo)
    {
        return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
    }

    if(prioridade!=="critica" && prioridade!=="alta" && prioridade!=="media" && prioridade!=="baixa")
    {
        return res.status(400).json({mensagem: "Prioridade inválida!"});
    }

    if(status!=="aberta" && status!=="em_andamento" && status!=="em_revisao" && status!=="concluida" && status!=="cancelada")
    {
        return res.status(400).json({mensagem: "Status inválido!"});
    }

    if(
        (demanda.status==="aberta" && (status!=="aberta" && status!=="em_andamento" && status!=="cancelada"))||
        (demanda.status==="em_andamento" && (status!=="em_andamento" && status!=="em_revisao" && status!=="cancelada"))||
        (demanda.status==="em_revisao" && (status!=="em_andamento" && status!=="em_revisao" && status!=="concluida" && status!=="cancelada"))||
        (demanda.status==="concluida" && (status!=="concluida"))||
        (demanda.status==="cancelada" && (status!=="cancelada"))
    )
    {
        return res.status(400).json({mensagem: "Status não segue ciclo de vida de demandas!"});
    }

    const hoje = new Date();
    const dataPrazo = new Date(`${prazo}T23:59:59`);
    if(dataPrazo < hoje)
    {
        return res.status(400).json({mensagem: "Prazo não pode ser anterior a hoje!"});
    }

    const antes_prioridade = demanda.prioridade;
    const antes_status = demanda.status;
    const antes_responsavel = demanda.responsavel;
    const antes_prazo = demanda.prazo;

    demanda.prioridade = prioridade;
    demanda.status = status;
    demanda.responsavel = responsavel || "nenhum";
    demanda.prazo = prazo;
    demanda.dataAtualizacao = hoje;

    let mensagem_alteracao = `${responsavel} alterou:`;
    if(antes_prioridade===prioridade && antes_status===status && antes_responsavel===responsavel && antes_prazo===prazo)
    {
        mensagem_alteracao += ` Nenhuma alteração`;
        return res.status(200).json(demanda);
    }
    else 
    {
        if(antes_prioridade != prioridade)
        {
            mensagem_alteracao += ` prioridade[${antes_prioridade} => ${prioridade}];`;
        }
        if(antes_status != status)
        {
            mensagem_alteracao += ` status[${antes_status} => ${status}];`;
        }
        if(antes_responsavel != responsavel)
        {
            mensagem_alteracao += ` responsável[${antes_responsavel} => ${responsavel}];`;
        }
        if(antes_prazo != prazo)
        {
            mensagem_alteracao += ` prazo alterado;`;
        }
    }
    const alteracao : historicoFormato =
    {
        id:historico.length + 1,
        demanda:id,
        datahora:hoje.toISOString().split('.')[0],
        alteracao:mensagem_alteracao
    }

    historico.push(alteracao);

    return res.status(200).json(demanda);
});

interface comentarioFormato {
    id: number;
    idDemanda: number;
    autor: string;
    texto: string;
    data: Date;
}

let comentarios: comentarioFormato[] = [
    {
        id: 1,
        idDemanda: 1,
        autor: "João",
        texto: "Testei com e sem pontuação e não funcionou.",
        data: new Date("2026-09-09T14:30:00")
    }
];

// Lista todos os comentários de uma demanda
app.get("/demandas/:id/comentarios",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const demanda = demandas.find((item) => item.id === id);

    if(!demanda)
    {
        return res.status(404).json({mensagem: "Demanda não encontrada!"});
    }

    let comentariosExibidos: comentarioFormato[] = [];
    for(let cont=0; cont<comentarios.length; cont++)
    {
        if(comentarios[cont].idDemanda === id)
        {
            comentariosExibidos.push(comentarios[cont]);
        }
    }
    return res.status(200).json(comentariosExibidos);
});

// Busca um comentário específico de uma demanda
app.get("/demandas/:id/comentarios/:idComentario",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idComentario = Number(req.params.idComentario);

    const demanda = demandas.find((item) => item.id === id);
    if(!demanda)
    {
        return res.status(404).json({mensagem: "Demanda não encontrada!"});
    }

    const comentario = comentarios.find((item) => item.id === idComentario && item.idDemanda === id);
    if(!comentario)
    {
        return res.status(404).json({mensagem: "Comentário não encontrado!"});
    }
    return res.status(200).json(comentario);
});

// Adiciona um comentário novo em uma demanda
app.post("/demandas/:id/comentarios",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const demanda = demandas.find((item) => item.id === id);

    if(!demanda)
    {
        return res.status(404).json({mensagem: "Demanda não encontrada!"});
    }

    const {autor,texto} = req.body;

    if(!autor||!texto)
    {
        return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
    }

    if(texto.trim()==="")
    {
        return res.status(400).json({mensagem: "Comentário inválido!"});
    }

    if(texto.length > 100)
    {
        return res.status(400).json({mensagem: "Comentário deve ter até 100 caracteres!"});
    }

    const hoje = new Date();

    const novoComentario : comentarioFormato =
    {
        id: comentarios.length + 1,
        idDemanda: id,
        autor: autor.trim(),
        texto: texto.trim(),
        data: hoje
    };

    comentarios.push(novoComentario);
    demanda.dataAtualizacao = hoje;
    return res.status(201).json(novoComentario);
});

interface projetoFormato {
    id: number;
    nome: string;
    descricao: string;
    demandas?: demandaFormato[];
}

let projetos: projetoFormato[] = [
    {
        id: 1,
        nome: "Sistema de login",
        descricao: "Telas e regras de login e cadastro de usuários"
    },

    {
        id: 2,
        nome: "Documentação da API",
        descricao: "Documentação das rotas do servidor"
    }
];

function buscarDemandasDoProjeto(nomeProjeto: string)
{
    let demandasDoProjeto: demandaFormato[] = [];
    for(let cont=0; cont<demandas.length; cont++)
    {
        if(demandas[cont].projeto === nomeProjeto)
        {
            demandasDoProjeto.push(demandas[cont]);
        }
    }
    return demandasDoProjeto;
}

app.get("/projetos",(req: Request, res: Response) => {
    let projetosExibidos: projetoFormato[] = [];
    for(let cont=0; cont<projetos.length; cont++)
    {
        const projeto = projetos[cont];
        projetosExibidos.push({
            id: projeto.id,
            nome: projeto.nome,
            descricao: projeto.descricao,
            demandas: buscarDemandasDoProjeto(projeto.nome)
        });
    }
    return res.status(200).json(projetosExibidos);
});

app.get("/projetos/:id",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const projeto = projetos.find((item) => item.id === id);

    if(!projeto)
    {
        return res.status(404).json({mensagem: "Projeto não encontrado!"});
    }
    return res.status(200).json({
        id: projeto.id,
        nome: projeto.nome,
        descricao: projeto.descricao,
        demandas: buscarDemandasDoProjeto(projeto.nome)
    });
});

app.get("/projetos/demandas/:id",(req: Request, res: Response) => {
    const id = Number(req.params.id);
    const projeto = projetos.find((item) => item.id === id);

    if(!projeto)
    {
        return res.status(404).json({mensagem: "Projeto não encontrado!"});
    }
    const demandas = buscarDemandasDoProjeto(projeto.nome);
    return res.status(200).json(demandas);
});

function filtrarDemandasPorTipo(demandas:demandaFormato[], tipo: String) {

    let demandasFiltradas: demandaFormato[] = [];
    for(let cont=0; cont<demandas.length; cont++)
    {
        if(demandas[cont].tipo === tipo)
        {
            demandasFiltradas.push(demandas[cont]);
        }
    }
    return demandasFiltradas;
}

function filtrarDemandasPorPrioridade(demandas:demandaFormato[], prioridade: String) {

    let demandasFiltradas: demandaFormato[] = [];
    for(let cont=0; cont<demandas.length; cont++)
    {
        if(demandas[cont].prioridade === prioridade)
        {
            demandasFiltradas.push(demandas[cont]);
        }
    }
    return demandasFiltradas;
}

function filtrarDemandasPorStatus(demandas:demandaFormato[], status: String) {

    let demandasFiltradas: demandaFormato[] = [];
    for(let cont=0; cont<demandas.length; cont++)
    {
        if(demandas[cont].status === status)
        {
            demandasFiltradas.push(demandas[cont]);
        }
    }
    return demandasFiltradas;
}

function filtrarDemandasProximas(demandas:demandaFormato[]) {

    let demandasFiltradas: demandaFormato[] = [];
    
    for(let cont=0; cont<demandas.length; cont++)
    {
        let prazoDemanda = new Date(demandas[cont].prazo);
        let prazoFiltro = new Date(prazoDemanda);
        prazoFiltro.setDate(prazoFiltro.getDate() - 7) //próximo nesse caso é 1 semana

        let dataAtual = new Date();
        dataAtual.toISOString().split('T')[0]; // torna a data para o formato aaaa-mm-dd
        if(dataAtual > prazoFiltro && dataAtual < prazoDemanda)
        {
            demandasFiltradas.push(demandas[cont]);
        }
    }
    return demandasFiltradas;
}

app.get("/dashboard/:nomeProjeto", (req: Request, res: Response) => {
    const nomeProjeto = decodeURIComponent(String(req.params.nomeProjeto));
    const demandas = buscarDemandasDoProjeto(nomeProjeto);

    const projeto = projetos.find((item) => item.nome === nomeProjeto);
    if (!projeto) {
        return res.status(404).json({mensagem: "Projeto não encontrado!"});
    }
    
    const demandasCriticas = filtrarDemandasPorPrioridade(demandas, "critica");
    const demandasProximas = filtrarDemandasProximas(demandas);

    const qtdCriticas = demandasCriticas.length;
    const qtdProximas = demandasProximas.length;

    const qtdAltas = filtrarDemandasPorPrioridade(demandas, "alta").length;
    const qtdMedias = filtrarDemandasPorPrioridade(demandas, "media").length;
    const qtdBaixas = filtrarDemandasPorPrioridade(demandas, "baixa").length;

    const qtdTarefas = filtrarDemandasPorTipo(demandas, "tarefa").length;
    const qtdDefeitos = filtrarDemandasPorTipo(demandas, "defeito").length;
    const qtdMelhorias = filtrarDemandasPorTipo(demandas, "melhoria").length;
    const qtdDocs = filtrarDemandasPorTipo(demandas, "documentacao").length;

    const qtdAbertas = filtrarDemandasPorStatus(demandas, "aberta").length;
    const qtdAndamento = filtrarDemandasPorStatus(demandas, "em_andamento").length;
    const qtdRevisao = filtrarDemandasPorStatus(demandas, "em_revisao").length;
    const qtdConcluidas = filtrarDemandasPorStatus(demandas, "concluida").length;
    const qtdCanceladas = filtrarDemandasPorStatus(demandas, "cancelada").length;

    const demandasCriticasAbertas = filtrarDemandasPorStatus(demandasCriticas, "aberta");
    const demandasProximasAbertas = filtrarDemandasPorStatus(demandasProximas, "aberta");

    const arrayQtdImportante = {"criticas": qtdCriticas, "proximas": qtdProximas};
    const arrayQtdPrioridade = {"criticas": qtdCriticas, "altas": qtdAltas, "medias":qtdMedias, "baixas":qtdBaixas};
    const arrayQtdTipo = {"tarefas": qtdTarefas, "defeitos": qtdDefeitos, "melhorias": qtdMelhorias, "docs": qtdDocs};
    const arrayQtdStatus = {"abertas": qtdAbertas, "em_andamento": qtdAndamento, "em_revisao": qtdRevisao, "concluidas": qtdConcluidas, "canceladas": qtdCanceladas};

    return res.status(200).json({
        id: projeto.id,
        demandas_criticas: demandasCriticasAbertas,
        demandas_proximas: demandasProximasAbertas,

        qtd_demandas_importantes: arrayQtdImportante,
        qtd_demandas_por_prioridade: arrayQtdPrioridade,
        qtd_demandas_por_tipo: arrayQtdTipo,
        qtd_demandas_por_status: arrayQtdStatus,
        qtd_total: demandas.length
    });
});

/* queries atuais para a dashboard:

    Sistema de login
    nenhum
*/

interface historicoFormato {
    id: number;
    demanda: number;
    datahora: string;
    alteracao: string;
}

let historico : historicoFormato[] = [
    {
        id:1,
        demanda:1,
        datahora:"2026-09-08T11:30:00:000Z",
        alteracao:"João alterou a prioridade para media"
    },
    {
        id:2,
        demanda:1,
        datahora:"2026-09-09T14:35:00:000Z",
        alteracao:"João alterou o tipo para defeito"
    }
];

app.get("/historico/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if(!id)
    {
        return res.status(400).json({mensagem: "ID inválido!"});
    }
    const alteracoes = historico.filter((item) => {
        return item.demanda === id;
    })

    if(!alteracoes)
    {
        return res.status(404).json({mensagem: "Alterações não encontradas"});
    }
    return res.status(200).json(alteracoes);
});

app.get("/projetoid/:nome", (req: Request, res: Response) => {
    const nome = decodeURIComponent(String(req.params.nome).trim());
    if(!nome)
    {
        return res.status(400).json({mensagem: "Nome inválido!"});
    }
    const projeto = projetos.find((item) => item.nome === nome)
    if(!projeto)
    {
        return res.status(404).json({mensagem: "Projeto com este nome não encontrado"});
    }
    return res.status(200).json({id: projeto.id});
});

app.get("/projetonome/:id", (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if(!id)
    {
        return res.status(400).json({mensagem: "ID inválido!"});
    }
    const projeto = projetos.find((item) => item.id === id)
    if(!projeto)
    {
        return res.status(404).json({mensagem: "Projeto com este id não encontrado"});
    }
    return res.status(200).json({nome: projeto.nome});
});