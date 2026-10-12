import express, {Request, Response} from "express";

const app = express();
const PORT = 3000;

app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});

app.get("/", (req: Request, res: Response) => {
    res.send("Sistema SADD");
});

app.use(express.json());


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

    const hoje = new Date();
    const dataPrazo = new Date(`${prazo}T23:59:59`);
    if(dataPrazo < hoje)
    {
        return res.status(400).json({mensagem: "Prazo não pode ser anterior a hoje!"});
    }

    demanda.prioridade = prioridade;
    demanda.status = status;
    demanda.responsavel = responsavel || "nenhum";
    demanda.prazo = prazo;
    demanda.dataAtualizacao = hoje;

    return res.status(200).json(demanda);
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