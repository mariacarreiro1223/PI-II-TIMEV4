//   Isaque Ryo Cruz Tanno


import express, {Request, Response} from "express";
import cors from "cors";

import 'dotenv/config';
import { pool } from "./bd";

const app = express();
const PORT = 3000;

// Middlewares precisam ser registrados antes das rotas.
app.use(cors());
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
    return res.status(200).send("Sistema SADD");
});


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
    cpf = cpf.replace(/[.-]/g, '');

    if(!/^\d{11}$/.test(cpf))
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

// O front usa códigos sem acento (ex.: "em_andamento"), mas o banco guarda o texto bonito (ex.: "Em andamento"). Estes 3 "dicionários" fazem a tradução código -> banco.
const TIPOS: Record<string, string> = {
    tarefa: "Tarefa",
    defeito: "Defeito",
    melhoria: "Melhoria",
    documentacao: "Documentação"
};
 
const PRIORIDADES: Record<string, string> = {
    critica: "Crítica",
    alta: "Alta",
    media: "Média",
    baixa: "Baixa"
};
 
const STATUS: Record<string, string> = {
    aberta: "Aberta",
    em_andamento: "Em andamento",
    em_revisao: "Em revisão",
    concluida: "Concluída",
    cancelada: "Cancelada"
};
 
// Faz o caminho inverso: texto do banco -> código do front (ex.: "Em andamento" vira "em_andamento")
function paraCodigo(mapa: Record<string, string>, valorBanco: string): string {
    for (const codigo of Object.keys(mapa)) {
        if (mapa[codigo] === valorBanco) {
            return codigo;
        }
    }
    return valorBanco;
}
 
// Põe zero à esquerda: 5 vira "05" (usado nas datas)
function doisDigitos(numero: number): string {
    return String(numero).padStart(2, "0");
}
 
// O MySQL devolve a data como objeto Date. Aqui viramos "aaaa-mm-dd", que o front entende.
function formatarData(valor: any): string | null {
    if (!valor) {
        return null;
    }
    if (typeof valor === "string") {
        return valor.substring(0, 10);
    }
    return `${valor.getFullYear()}-${doisDigitos(valor.getMonth() + 1)}-${doisDigitos(valor.getDate())}`;
}
 
// Igual à anterior, mas com hora: "aaaa-mm-ddThh:mm:ss"
function formatarDataHora(valor: any): string {
    const data = valor instanceof Date ? valor : new Date(valor);
    return `${formatarData(data)}T${doisDigitos(data.getHours())}:${doisDigitos(data.getMinutes())}:${doisDigitos(data.getSeconds())}`;
}
 
// No banco o responsável é guardado como NÚMERO (id), mas o front manda o NOME.
// Esta função procura o id pelo nome. Devolve null se for "nenhum", vazio ou não existir.
// async porque consulta o banco.
async function buscarIdUsuarioPorNome(nome: any): Promise<number | null> {
    if (!nome || typeof nome !== "string" || nome.trim() === "" || nome === "nenhum") {
        return null;
    }
    const [linhas]: any = await pool.query(
        "SELECT id_usuario FROM usuarios WHERE nome = ? AND ativo = TRUE",
        [nome.trim()]
    );
    if (linhas.length === 0) {
        return null;
    }
    return linhas[0].id_usuario;
}
 
// Grava UMA linha na tabela historico_demandas (o histórico nunca é apagado, como pede o escopo)
async function registrarHistorico(
    idDemanda: number,
    idUsuario: number,
    campo: string,
    anterior: string | null,
    novo: string | null
) {
    // O esquema exige id_usuario. Ele representa quem fez a ação, não necessariamente o responsável.
    await pool.query(
        "INSERT INTO historico_demandas (id_demanda, id_usuario, campo_alterado, valor_anterior, valor_novo) VALUES (?, ?, ?, ?, ?)",
        [idDemanda, idUsuario, campo, anterior, novo]
    );
}

async function buscarIdAutorHistorico(idInformado: unknown, idResponsavel: number | null): Promise<number | null> {
    // Enquanto não houver middleware de sessão, as rotas aceitam idUsuario enviado pelo cliente.
    // Para manter compatibilidade com chamadas antigas, usa o responsável como fallback quando existe.
    const candidato = idInformado === undefined || idInformado === null || idInformado === ""
        ? idResponsavel
        : Number(idInformado);
    if (!Number.isInteger(candidato) || Number(candidato) <= 0) return null;
    const [linhas]: any = await pool.query(
        "SELECT id_usuario FROM usuarios WHERE id_usuario = ? AND ativo = TRUE",
        [candidato]
    );
    return linhas.length ? Number(linhas[0].id_usuario) : null;
}

//ROTA: GET "/usuarios" — lista usuários ativos; permite filtrar por email e/ou CPF
// app.get("/usuarios",(req: Request, res: Response) => {
//     const email = req.query.email;
//     const cpf = req.query.cpf;

//     const qtdeUsuarios = usuarios.length;

//     let usuariosExibidos: usuarioFormato[] = [];
//     for(let cont=0; cont<qtdeUsuarios; cont++)
//     {
//         const usuarioFiltrado = usuarios[cont];
//         usuarioFiltrado.senha = "";
//         if((!cpf && email && email===usuarioFiltrado.email)||(!email && cpf && Number(cpf)===usuarioFiltrado.cpf)||(!cpf && !email))
//         {
//             usuariosExibidos.push(usuarioFiltrado);
//         }
//     }
//     if(usuariosExibidos.length===0 && (cpf || email))
//     {
//         return res.status(404).json({mensagem: "Nenhum usuário encontrado"});
//     }
//     return res.status(200).json(usuariosExibidos);  
// });

// app.post("/login",(req: Request, res: Response) => {
//     const {email,senha} = req.body;
//     const usuario = usuarios.find((item) => item.email === email)
//     if(!usuario || usuario.senha !== senha)
//     {
//         return res.status(400).json({mensagem: "Usuário ou senha inválidos!"});
//     }
//     return res.status(200).json({mensagem: "Login OK"});
// });
app.get("/usuarios", async (req: Request, res: Response) => {
    try {
        const email = req.query.email;
        const cpf = req.query.cpf;

        let sql = `
            SELECT id_usuario, nome, cpf, telefone, data_nascimento AS dataNasc, email, perfil
            FROM usuarios
            WHERE ativo = TRUE
        `;

        const valores: any[] = [];

        if (email) {
            sql += " AND email = ?";
            valores.push(email);
        }

        if (cpf) {
            sql += " AND cpf = ?";
            valores.push(String(cpf));
        }

        //any[] é um array que o conteúdo pode ter diferentes tipos
        const [usuariosEncontrados] = await pool.execute<any[]>(
            sql,
            valores
        );

        if (usuariosEncontrados.length === 0 && (cpf || email)) {
            return res.status(404).json({
                mensagem: "Nenhum usuário encontrado"
            });
        }

        return res.status(200).json(usuariosEncontrados);

    } catch (erro) {
        console.error("Erro ao buscar usuários:", erro);

        return res.status(500).json({
            mensagem: "Erro ao buscar usuários."
        });
    }
});

//ROTA: POST "/login" — confere email e senha no banco e retorna os dados básicos do usuário autenticado
// app.post("/login", (req: Request, res: Response) => {
//     const { email, senha } = req.body;

//     const usuario = usuarios.find((item) => item.email === email);

//     if (!usuario || usuario.senha !== senha) {
//         return res.status(400).json({
//             mensagem: "Usuário ou senha inválidos!"
//         });
//     }

//     return res.status(200).json({ mensagem: "Login OK" });
// });
app.post("/login", async(req: Request, res: Response) => {
   try{ 
        const {email,senha} = req.body;
        if(!email || !senha)
        {
            return res.status(400).json({mensagem: "Email e senha são obrigatórios!"});
        }

        const [usuarioEncontrado] = await pool.execute<any[]>(
            "SELECT id_usuario, nome, email, senha, perfil FROM usuarios WHERE email = ? AND ativo = TRUE",
            [email]
        );

        if (usuarioEncontrado.length === 0){
            return res.status(401).json({mensagem: "Usuário ou senha inválidos!"});
        }

        const usuario = usuarioEncontrado[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({mensagem: "Usuário ou senha inválidos!"});
        }

        return res.status(200).json({
            mensagem: "Login OK",
            usuario: {
                id: usuario.id_usuario,
                nome: usuario.nome,
                email: usuario.email,
                perfil: usuario.perfil
            }
        });

    }catch (erro){
        console.error("Erro ao realizar login:", erro);

        return res.status(500).json({mensagem: "Erro interno ao realizar login."});
    }
});

//ROTA: POST "/cadastro" — valida os dados e cadastra um novo usuário no banco.
// app.post("/cadastro",(req: Request, res: Response) => {
//     const {nome,cpf,telefone,dataNasc,email,senha} = req.body;

//     if(!nome||!cpf||!telefone||!dataNasc||!email||!senha)
//     {
//         return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
//     }

//     if (nome.trim().split(/\s+/).length < 2)
//     {
//         return res.status(400).json({mensagem: "Nome incompleto!"});
//     }

//     const usuarioCPF = usuarios.find((item) => item.cpf === cpf)    // Ele busca se existe um usuário com este CPF (para não existir repetições)
//     if(usuarioCPF || !testarCPF(String(cpf)))
//     {
//         return res.status(400).json({mensagem: "CPF inválido!"});
//     }

//     if(String(telefone).length<11)
//     {
//         return res.status(400).json({mensagem: "Número de telefone inválido!"});
//     }


//     const hoje = new Date ()
//     const nascimento = new Date(`${dataNasc}T00:00:00`);
//     if(nascimento>hoje|| (calcularIdade(dataNasc) < 18 || calcularIdade(dataNasc) > 100))
//     {
//         return res.status(400).json({mensagem: "Data de nascimento inválida!"});
//     }


//     // Esta é uma expressão regular que pesquisei para emails
//     const expressaoRegularEmail  = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email);
//     if(!expressaoRegularEmail)
//     {
//         return res.status(400).json({mensagem: "Email inválido!"});
//     }

//     const possuiMaiuscula = /[A-Z]/.test(senha);
//     const possuiMinuscula = /[a-z]/.test(senha);
//     const possuiNumero = /[0-9]/.test(senha);
//     const possuiEspecial = /[_@!]/.test(senha);
//     if(senha.length<8 ||!possuiEspecial || !possuiMaiuscula ||!possuiMinuscula ||!possuiNumero)
//     {
//         return res.status(400).json({mensagem: "Senha inválida!"});
//     }


//     const novoUsuario : usuarioFormato =
//     {
//         nome,cpf,telefone,dataNasc,email,senha
//     }

//     usuarios.push(novoUsuario);
//     return res.status(200).json(novoUsuario);
// });
app.post("/cadastro", async(req: Request, res: Response) => {
    try{
        const {nome,cpf,telefone,dataNasc,email,senha} = req.body;

        if(!nome||!cpf||!telefone||!dataNasc||!email||!senha)
        {
            return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
        }
        if (typeof nome !== "string" || typeof email !== "string" || typeof senha !== "string" || typeof dataNasc !== "string") {
            return res.status(400).json({mensagem: "Formato dos dados inválido!"});
        }
        if (nome.trim().split(/\s+/).length < 2)
        {
            return res.status(400).json({mensagem: "Nome incompleto!"});
        }

        if (!testarCPF(String(cpf)))
        {
            return res.status(400).json({mensagem: "CPF inválido!"});
        }

        const telefoneLimpo = String(telefone).replace(/\D/g, "");
        if(!/^\d{11}$/.test(telefoneLimpo))
        {
            return res.status(400).json({mensagem: "Número de telefone inválido! Informe DDD e número com 11 dígitos."});
        }

        const hoje = new Date();
        const nascimento = new Date(`${dataNasc}T00:00:00`);

        if (nascimento > hoje || calcularIdade(dataNasc) < 18 || calcularIdade(dataNasc)>100)
        {
            return res.status(400).json({mensagem: "Data de nascimento inválida!"})
        }

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

        //antes usávamos o find, que procura o usuário numa array
        const [usuariosExistentes] = await pool.execute<any[]>("SELECT id_usuario FROM usuarios WHERE cpf = ? OR email = ?",[String(cpf), email]);

        if (usuariosExistentes.length > 0)
        {
            return res.status(400).json({mensagem: "CPF ou email já cadastrado!"});
        }

        await pool.execute(
            `INSERT INTO usuarios (nome, cpf, telefone, data_nascimento, email, senha, perfil)
            VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                nome.trim(),
                String(cpf),
                telefoneLimpo,
                dataNasc,
                email.trim(),
                senha,
                "Membro da Equipe"
            ]
        );

        return res.status(201).json({mensagem: "Usuário cadastrado com sucesso!",
            usuario: {
                nome: nome.trim(),
                cpf: String(cpf),
                telefone: telefoneLimpo,
                dataNasc,
                email,
                perfil: "Membro da Equipe"
            }
        });


    } catch (erro)
    {
        console.error("Erro ao cadastrar usuário:", erro);
        return res.status(500).json({
            mensagem: "Erro interno ao cadastrar usuário."
        });
    }
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

// Formato da demanda que o front espera receber
interface demandaFormato {
    id: number;
    titulo: string;
    descricao: string;
    tipo: string;
    prioridade: string;
    status: string;
    projeto: string;
    responsavel: string;
    dataCriacao: string;
    dataAtualizacao: string;
    prazo: string | null;
}
 
// Consulta-base de demandas. Junta 3 tabelas:
//   demandas + projetos (para ter o NOME do projeto) + usuarios (para ter o NOME do responsável)
// É LEFT JOIN em usuarios porque a demanda pode não ter responsável.
// As outras rotas reaproveitam isso, só acrescentando um WHERE no final.
const SQL_DEMANDAS = `
    SELECT d.id_demanda AS id, d.titulo, d.descricao, d.tipo, d.prioridade, d.status,
           p.nome AS projeto, u.nome AS responsavel,
           d.data_criacao, d.data_atualizacao, d.prazo_finalizacao
    FROM demandas d
    JOIN projetos p ON p.id_projeto = d.id_projeto
    LEFT JOIN usuarios u ON u.id_usuario = d.id_responsavel
`;
 
// Transforma UMA linha do banco no formato que o front espera
// (traduz "Em andamento" -> "em_andamento", ajusta datas, troca responsável vazio por "nenhum")
function formatarDemanda(linha: any): demandaFormato {
    return {
        id: linha.id,
        titulo: linha.titulo,
        descricao: linha.descricao,
        tipo: paraCodigo(TIPOS, linha.tipo),
        prioridade: paraCodigo(PRIORIDADES, linha.prioridade),
        status: paraCodigo(STATUS, linha.status),
        projeto: linha.projeto,
        responsavel: linha.responsavel || "nenhum",
        dataCriacao: formatarDataHora(linha.data_criacao),
        dataAtualizacao: formatarDataHora(linha.data_atualizacao),
        prazo: formatarData(linha.prazo_finalizacao)
    };
}
 
// Busca demandas no banco. "filtro" é um pedaço de SQL, ex.: "WHERE d.id_demanda = ?"
async function buscarDemandas(filtro: string, parametros: any[]): Promise<demandaFormato[]> {
    const [linhas]: any = await pool.query(`${SQL_DEMANDAS} ${filtro} ORDER BY d.id_demanda`, parametros);
    return linhas.map(formatarDemanda);
}
 
// Busca por ID para evitar misturar demandas caso existam projetos com nomes iguais.
async function buscarDemandasDoProjeto(idProjeto: number): Promise<demandaFormato[]> {
    return buscarDemandas("WHERE d.id_projeto = ?", [idProjeto]);
}

//ROTA: GET "/demandas" — lista as demandas e permite filtrar por status, prioridade e tipo.
// app.get("/demandas",(req: Request, res: Response) => {
//     const status = req.query.status;
//     const prioridade = req.query.prioridade;
//     const tipo = req.query.tipo;

//     let demandasExibidas: demandaFormato[] = [];
//     for(let cont=0; cont<demandas.length; cont++)
//     {
//         const demanda = demandas[cont];
//         if((!status || status===demanda.status) && (!prioridade || prioridade===demanda.prioridade) && (!tipo || tipo===demanda.tipo))
//         {
//             demandasExibidas.push(demanda);
//         }
//     }
//     return res.status(200).json(demandasExibidas);
// });
app.get("/demandas", async (req: Request, res: Response) => {
    const status = req.query.status;
    const prioridade = req.query.prioridade;
    const tipo = req.query.tipo;
 
    try {
        // Cada filtro que veio na URL vira uma condição do WHERE
        const condicoes: string[] = [];
        const parametros: any[] = [];
 
        if (status) {
            condicoes.push("d.status = ?");
            parametros.push(STATUS[String(status)] || String(status));   // traduz código -> texto do banco
        }
        if (prioridade) {
            condicoes.push("d.prioridade = ?");
            parametros.push(PRIORIDADES[String(prioridade)] || String(prioridade));
        }
        if (tipo) {
            condicoes.push("d.tipo = ?");
            parametros.push(TIPOS[String(tipo)] || String(tipo));
        }
 
        // Se houver condições, junta com AND; senão, sem WHERE (traz tudo)
        const filtro = condicoes.length > 0 ? "WHERE " + condicoes.join(" AND ") : "";
        const demandasExibidas = await buscarDemandas(filtro, parametros);
        return res.status(200).json(demandasExibidas);
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar demandas!"});
    }
});

// ROTA: GET "/demandas/:id" — busca uma demanda específica pelo ID.
// app.get("/demandas/:id",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const demanda = demandas.find((item) => item.id === id);

//     if(!demanda)
//     {
//         return res.status(404).json({mensagem: "Demanda não encontrada!"});
//     }
//     return res.status(200).json(demanda);
// });
app.get("/demandas/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({mensagem: "ID inválido!"});
 
    try {
        const demandas = await buscarDemandas("WHERE d.id_demanda = ?", [id]);
        if(demandas.length === 0)
        {
            return res.status(404).json({mensagem: "Demanda não encontrada!"});
        }
        return res.status(200).json(demandas[0]);
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar demanda!"});
    }
});

//     if(!titulo||!descricao||!tipo||!prioridade||!prazo)
//     {
//         return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
//     }

//     if(titulo.trim()==="")
//     {
//         return res.status(400).json({mensagem: "Título inválido!"});
//     }

//     if(descricao.trim().split(/\s+/).length < 3)
//     {
//         return res.status(400).json({mensagem: "Descrição muito curta!"});
//     }

//     if(descricao.length > 500)
//     {
//         return res.status(400).json({mensagem: "Descrição deve ter até 500 caracteres!"});
//     }

//     if(tipo!=="tarefa" && tipo!=="defeito" && tipo!=="melhoria" && tipo!=="documentacao")
//     {
//         return res.status(400).json({mensagem: "Tipo de demanda inválido!"});
//     }

//     if(prioridade!=="critica" && prioridade!=="alta" && prioridade!=="media" && prioridade!=="baixa")
//     {
//         return res.status(400).json({mensagem: "Prioridade inválida!"});
//     }

//     const formatoPrazo = /^\d{4}-\d{2}-\d{2}$/.test(prazo);
//     const dataPrazo = new Date(`${prazo}T00:00:00`);
//     const prazoMinimo = new Date();
//     prazoMinimo.setDate(prazoMinimo.getDate() + 10);
//     if(!formatoPrazo || !dataValida || dataPrazo < new Date(prazoMinimo.getFullYear(), prazoMinimo.getMonth(), prazoMinimo.getDate()))
//     {
//         return res.status(400).json({mensagem: "O prazo deve ser superior a 10 dias a partir da abertura da demanda!"});
//     }

//     const hoje = new Date();

//     const novaDemanda : demandaFormato =
//     {
//         id: demandas.length + 1,
//         titulo: titulo.trim(),
//         descricao: descricao.trim(),
//         tipo,
//         prioridade,
//         status: "aberta",
//         projeto: projeto || "nenhum",
//         responsavel: responsavel || "nenhum",
//         dataCriacao: hoje,
//         dataAtualizacao: hoje,
//         prazo
//     };

//     demandas.push(novaDemanda);
//     return res.status(201).json(novaDemanda);
// });
app.post("/demandas", async (req: Request, res: Response) => {
    const {titulo,descricao,tipo,prioridade,projeto,responsavel,prazo} = req.body;
 
    // Valida os tipos antes de chamar trim/length para evitar erro com JSON malformado.
    if (typeof titulo !== "string" || typeof descricao !== "string" || typeof tipo !== "string" ||
        typeof prioridade !== "string" || typeof projeto !== "string" || typeof prazo !== "string") {
        return res.status(400).json({mensagem: "Formato dos dados inválido ou campos obrigatórios vazios!"});
    }
    if(!titulo||!descricao||!tipo||!prioridade||!projeto||!prazo)
    {
        return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
    }
 
    if(titulo.trim()==="")
    {
        return res.status(400).json({mensagem: "Título inválido!"});
    }
 
    // No banco a coluna titulo é VARCHAR(70)
    if(titulo.trim().length > 70)
    {
        return res.status(400).json({mensagem: "Título deve ter até 70 caracteres!"});
    }
 
    if(descricao.trim().split(/\s+/).length < 3)
    {
        return res.status(400).json({mensagem: "Descrição muito curta!"});
    }
 
    if(descricao.length > 500)
    {
        return res.status(400).json({mensagem: "Descrição deve ter até 500 caracteres!"});
    }
 
    if(!TIPOS[tipo])   // se o código não existe no dicionário, é inválido
    {
        return res.status(400).json({mensagem: "Tipo de demanda inválido!"});
    }
 
    if(!PRIORIDADES[prioridade])
    {
        return res.status(400).json({mensagem: "Prioridade inválida!"});
    }
 
    const formatoPrazo = /^\d{4}-\d{2}-\d{2}$/.test(prazo);
    const dataPrazo = new Date(`${prazo}T00:00:00`);
    const dataValida = !Number.isNaN(dataPrazo.getTime()) && dataPrazo.toISOString().slice(0, 10) === prazo;
    const prazoMinimo = new Date();
    prazoMinimo.setDate(prazoMinimo.getDate() + 10);
    prazoMinimo.setHours(0, 0, 0, 0);
    if(!formatoPrazo || !dataValida || dataPrazo < prazoMinimo)
    {
        return res.status(400).json({mensagem: "O prazo deve ser superior a 10 dias a partir da abertura da demanda!"});
    }
 
    try {
        // Toda demanda precisa estar ligada a um projeto que exista
        const [projetosAchados]: any = await pool.query(
            "SELECT id_projeto FROM projetos WHERE nome = ? AND ativo = TRUE",
            [projeto]
        );
        if (projetosAchados.length === 0) {
            return res.status(400).json({mensagem: "Projeto não encontrado!"});
        }
 
        // Responsável é opcional; se vier um nome, ele precisa existir.
        const idResponsavel = await buscarIdUsuarioPorNome(responsavel);
        if (responsavel && responsavel !== "nenhum" && idResponsavel === null) {
            return res.status(400).json({mensagem: "Responsável não encontrado!"});
        }
        
        const [usuariosAtivos]: any = await pool.query(
            "SELECT id_usuario FROM usuarios WHERE ativo = TRUE ORDER BY id_usuario LIMIT 1"
        );

        const resultadoFeriado = (await isFeriado(dataPrazo)).status;

        if (resultadoFeriado !== false) {
            return res.status(400).json({ mensagem: resultadoFeriado });
        }

        if (usuariosAtivos.length === 0) {
            return res.status(400).json({
                mensagem: "Não existe usuário ativo para registrar o histórico."
            });
        }

        const idAutor = usuariosAtivos[0].id_usuario;
 
        // INSERT = grava uma linha nova. Status e datas o próprio banco preenche (DEFAULT).
        // "resultado.insertId" é o id que o MySQL gerou (AUTO_INCREMENT).
        const [resultado]: any = await pool.query(
            "INSERT INTO demandas (titulo, descricao, tipo, prioridade, id_projeto, id_responsavel, prazo_finalizacao) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [titulo.trim(), descricao.trim(), TIPOS[tipo], PRIORIDADES[prioridade], projetosAchados[0].id_projeto, idResponsavel, prazo]
        );
 
        // Registra a criação no histórico
        await registrarHistorico(resultado.insertId, idAutor, "criação", null, "Demanda criada");
 
        // Busca a demanda recém-criada já no formato do front e devolve
        const criadas = await buscarDemandas("WHERE d.id_demanda = ?", [resultado.insertId]);
        return res.status(201).json(criadas[0]);
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao cadastrar demanda!"});
    }
});

// ROTA: PUT "/demandas/:id" — altera prioridade, status, responsável e prazo de uma demanda no MySQL, registrando o histórico.
// app.put("/demandas/:id",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const demanda = demandas.find((item) => item.id === id);

//     if(!demanda)
//     {
//         return res.status(404).json({mensagem: "Demanda não encontrada!"});
//     }

//     const {prioridade,status,responsavel,prazo} = req.body;

//     if(!prioridade||!status||!prazo)
//     {
//         return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
//     }

//     if(prioridade!=="critica" && prioridade!=="alta" && prioridade!=="media" && prioridade!=="baixa")
//     {
//         return res.status(400).json({mensagem: "Prioridade inválida!"});
//     }

//     if(status!=="aberta" && status!=="em_andamento" && status!=="em_revisao" && status!=="concluida" && status!=="cancelada")
//     {
//         return res.status(400).json({mensagem: "Status inválido!"});
//     }

//     const hoje = new Date();
//     const dataPrazo = new Date(`${prazo}T23:59:59`);
//     if(dataPrazo < hoje)
//     {
//         return res.status(400).json({mensagem: "Prazo não pode ser anterior a hoje!"});
//     }

//     const antes_prioridade = demanda.prioridade;
//     const antes_status = demanda.status;
//     const antes_responsavel = demanda.responsavel;
//     const antes_prazo = demanda.prazo;

//     demanda.prioridade = prioridade;
//     demanda.status = status;
//     demanda.responsavel = responsavel || "nenhum";
//     demanda.prazo = prazo;
//     demanda.dataAtualizacao = hoje;

//     let mensagem_alteracao = `${responsavel} alterou:`;
//     if(antes_prioridade===prioridade && antes_status===status && antes_responsavel===responsavel && antes_prazo===prazo)
//     {
//         mensagem_alteracao += ` Nenhuma alteração`;
//     }
//     else 
//     {
//         if(antes_prioridade != prioridade)
//         {
//             mensagem_alteracao += ` prioridade[${antes_prioridade} => ${prioridade}];`;
//         }
//         if(antes_status != status)
//         {
//             mensagem_alteracao += ` status[${antes_status} => ${status}];`;
//         }
//         if(antes_responsavel != responsavel)
//         {
//             mensagem_alteracao += ` responsável[${antes_responsavel} => ${responsavel}];`;
//         }
//         if(antes_prazo != prazo)
//         {
//             mensagem_alteracao += ` prazo alterado;`;
//         }
//     }
//     const alteracao : historicoFormato =
//     {
//         id:historico.length + 1,
//         demanda:id,
//         datahora:hoje.toISOString().split('.')[0],
//         alteracao:mensagem_alteracao
//     }

//     historico.push(alteracao);

//     return res.status(200).json(demanda);
// });
app.put("/demandas/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({mensagem: "ID inválido!"});
 
    try {
        const demandas = await buscarDemandas("WHERE d.id_demanda = ?", [id]);
        const demanda = demandas[0];   // a demanda como estava ANTES (para comparar depois)
 
        if(!demanda)
        {
            return res.status(404).json({mensagem: "Demanda não encontrada!"});
        }
 
        const {prioridade,status,responsavel,prazo,idUsuario} = req.body;
 
        if(typeof prioridade !== "string" || typeof status !== "string" || typeof prazo !== "string" || !prioridade || !status || !prazo)
        {
            return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
        }
 
        if(!PRIORIDADES[prioridade])
        {
            return res.status(400).json({mensagem: "Prioridade inválida!"});
        }
 
        if(!STATUS[status])
        {
            return res.status(400).json({mensagem: "Status inválido!"});
        }
 
        if(!/^\d{4}-\d{2}-\d{2}$/.test(prazo) || Number.isNaN(new Date(`${prazo}T00:00:00`).getTime()) || new Date(`${prazo}T00:00:00`).toISOString().slice(0, 10) !== prazo)
        {
            return res.status(400).json({mensagem: "Prazo inválido!"});
        }
 
        const hoje = new Date();
        const dataPrazo = new Date(`${prazo}T23:59:59`);
        if(dataPrazo < hoje)
        {
            return res.status(400).json({mensagem: "Prazo não pode ser anterior a hoje!"});
        }
 
        const idResponsavel = await buscarIdUsuarioPorNome(responsavel);
        if (responsavel && responsavel !== "nenhum" && idResponsavel === null) {
            return res.status(400).json({mensagem: "Responsável não encontrado!"});
        }
        const novoResponsavel = responsavel || "nenhum";
        const idAutor = await buscarIdAutorHistorico(idUsuario, idResponsavel);
        if (idAutor === null) {
            return res.status(400).json({mensagem: "Informe idUsuario válido (usuário ativo que está realizando a alteração) para registrar o histórico."});
        }
 
        // UPDATE = altera uma linha que já existe. NOW() = data/hora de agora.
        await pool.query(
            "UPDATE demandas SET prioridade = ?, status = ?, id_responsavel = ?, prazo_finalizacao = ?, data_atualizacao = NOW() WHERE id_demanda = ?",
            [PRIORIDADES[prioridade], STATUS[status], idResponsavel, prazo, id]
        );
 
        // Compara "antes" com "depois" e grava uma linha de histórico para cada campo que mudou.
        // Provisório: quem fez a alteração é o responsável informado (ainda não existe sessão de login).
        if (demanda.prioridade !== prioridade) {
            await registrarHistorico(id, idAutor, "prioridade", PRIORIDADES[demanda.prioridade], PRIORIDADES[prioridade]);
        }
        if (demanda.status !== status) {
            // Cancelar fica registrado com nome próprio, como pede o escopo
            const campo = status === "cancelada" ? "cancelamento" : "status";
            await registrarHistorico(id, idAutor, campo, STATUS[demanda.status], STATUS[status]);
        }
        if (demanda.responsavel !== novoResponsavel) {
            await registrarHistorico(id, idAutor, "responsável", demanda.responsavel, novoResponsavel);
        }
        if (demanda.prazo !== prazo) {
            await registrarHistorico(id, idAutor, "prazo", demanda.prazo, prazo);
        }
 
        const atualizadas = await buscarDemandas("WHERE d.id_demanda = ?", [id]);
        return res.status(200).json(atualizadas[0]);
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao atualizar demanda!"});
    }
});

// Transforma uma linha do banco no formato de comentário que o front espera
function formatarComentario(linha: any) {
    return {
        id: linha.id,
        idDemanda: linha.id_demanda,
        autor: linha.autor,
        texto: linha.texto,
        data: formatarDataHora(linha.data_hora)
    };

}
// Consulta-base de comentários: junta com usuarios para ter o NOME do autor
const SQL_COMENTARIOS = `
    SELECT c.id_comentario AS id, c.id_demanda, u.nome AS autor, c.texto, c.data_hora
    FROM comentarios c
    JOIN usuarios u ON u.id_usuario = c.id_usuario
`;

// ROTA: GET "/demandas/:id/comentarios" - Lista todos os comentários de uma demanda
// app.get("/demandas/:id/comentarios",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const demanda = demandas.find((item) => item.id === id);

//     if(!demanda)
//     {
//         return res.status(404).json({mensagem: "Demanda não encontrada!"});
//     }

//     let comentariosExibidos: comentarioFormato[] = [];
//     for(let cont=0; cont<comentarios.length; cont++)
//     {
//         if(comentarios[cont].idDemanda === id)
//         {
//             comentariosExibidos.push(comentarios[cont]);
//         }
//     }
//     return res.status(200).json(comentariosExibidos);
// });
app.get("/demandas/:id/comentarios", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
 
    try {
        // Primeiro confere se a demanda existe
        const [demandaAchada]: any = await pool.query("SELECT id_demanda FROM demandas WHERE id_demanda = ?", [id]);
        if(demandaAchada.length === 0)
        {
            return res.status(404).json({mensagem: "Demanda não encontrada!"});
        }
 
        const [linhas]: any = await pool.query(
            `${SQL_COMENTARIOS} WHERE c.id_demanda = ? ORDER BY c.data_hora`,
            [id]
        );
        return res.status(200).json(linhas.map(formatarComentario));
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar comentários!"});
    }
});

// ROTA: GET "/demandas/:id/comentarios/:idComentario"  - Busca um comentário específico de uma demanda
// app.get("/demandas/:id/comentarios/:idComentario",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const idComentario = Number(req.params.idComentario);

//     const demanda = demandas.find((item) => item.id === id);
//     if(!demanda)
//     {
//         return res.status(404).json({mensagem: "Demanda não encontrada!"});
//     }

//     const comentario = comentarios.find((item) => item.id === idComentario && item.idDemanda === id);
//     if(!comentario)
//     {
//         return res.status(404).json({mensagem: "Comentário não encontrado!"});
//     }
//     return res.status(200).json(comentario);
// });
app.get("/demandas/:id/comentarios/:idComentario", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const idComentario = Number(req.params.idComentario);
 
    try {
        const [linhas]: any = await pool.query(
            `${SQL_COMENTARIOS} WHERE c.id_demanda = ? AND c.id_comentario = ?`,
            [id, idComentario]
        );
        if(linhas.length === 0)
        {
            return res.status(404).json({mensagem: "Comentário não encontrado!"});
        }
        return res.status(200).json(formatarComentario(linhas[0]));
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar comentário!"});
    }
});

// ROTA: POST "/demandas/:id/comentarios" - Adiciona um comentário novo em uma demanda
// app.post("/demandas/:id/comentarios",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const demanda = demandas.find((item) => item.id === id);

//     if(!demanda)
//     {
//         return res.status(404).json({mensagem: "Demanda não encontrada!"});
//     }

//     const {autor,texto} = req.body;

//     if(!autor||!texto)
//     {
//         return res.status(400).json({mensagem: "Dados obrigatórios vazios!"});
//     }

//     if(texto.trim()==="")
//     {
//         return res.status(400).json({mensagem: "Comentário inválido!"});
//     }

//     if(texto.length > 100)
//     {
//         return res.status(400).json({mensagem: "Comentário deve ter até 100 caracteres!"});
//     }

//     const hoje = new Date();

//     const novoComentario : comentarioFormato =
//     {
//         id: comentarios.length + 1,
//         idDemanda: id,
//         autor: autor.trim(),
//         texto: texto.trim(),
//         data: hoje
//     };

//     comentarios.push(novoComentario);
//     demanda.dataAtualizacao = hoje;
//     return res.status(201).json(novoComentario);
// });
app.post("/demandas/:id/comentarios", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    const {autor,texto} = req.body;
 
    if(typeof autor !== "string" || typeof texto !== "string" || !autor.trim() || !texto.trim())
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
 
    try {
        const [demandaAchada]: any = await pool.query("SELECT id_demanda FROM demandas WHERE id_demanda = ?", [id]);
        if(demandaAchada.length === 0)
        {
            return res.status(404).json({mensagem: "Demanda não encontrada!"});
        }
 
        // A tabela comentarios exige um usuário que EXISTA (chave estrangeira)
        const idUsuario = await buscarIdUsuarioPorNome(autor);
        if (idUsuario === null) {
            return res.status(400).json({mensagem: "Autor do comentário não encontrado!"});
        }
 
        const [resultado]: any = await pool.query(
            "INSERT INTO comentarios (id_demanda, id_usuario, texto) VALUES (?, ?, ?)",
            [id, idUsuario, texto.trim()]
        );
        // Comentar também conta como "atualização" da demanda
        await pool.query("UPDATE demandas SET data_atualizacao = NOW() WHERE id_demanda = ?", [id]);
 
        const [criado]: any = await pool.query(`${SQL_COMENTARIOS} WHERE c.id_comentario = ?`, [resultado.insertId]);
        return res.status(201).json(formatarComentario(criado[0]));
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao cadastrar comentário!"});
    }
});

// interface projetoFormato {
//     id: number;
//     nome: string;
//     descricao: string;
//     demandas?: demandaFormato[];
// }

// function buscarDemandasDoProjeto(nomeProjeto: string)
// {
//     let demandasDoProjeto: demandaFormato[] = [];
//     for(let cont=0; cont<demandas.length; cont++)
//     {
//         if(demandas[cont].projeto === nomeProjeto)
//         {
//             demandasDoProjeto.push(demandas[cont]);
//         }
//     }
//     return demandasDoProjeto;
// }


// ROTA: GET "/projetos" — lista projetos ativos do banco e inclui demandas associadas (a associação das demandas ainda é provisória/em memória).
// app.get("/projetos",(req: Request, res: Response) => {
//     let projetosExibidos: projetoFormato[] = [];
//     for(let cont=0; cont<projetos.length; cont++)
//     {
//         const projeto = projetos[cont];
//         projetosExibidos.push({
//             id: projeto.id,
//             nome: projeto.nome,
//             descricao: projeto.descricao,
//             demandas: buscarDemandasDoProjeto(projeto.nome)
//         });
//     }
//     return res.status(200).json(projetosExibidos);
// });
app.get("/projetos", async (req: Request, res: Response) => {
    try {
        const [projetosBanco]: any = await pool.query(
            //pede ao banco somente os projetos ativos
            "SELECT id_projeto AS id, nome, descricao FROM projetos WHERE ativo = TRUE ORDER BY id_projeto"
        );

        //percorre cada projeto e monta um obj no formato
        const projetosExibidos = await Promise.all(projetosBanco.map(async (projeto: any) => ({
            id: projeto.id,
            nome: projeto.nome,
            descricao: projeto.descricao,
            demandas: await buscarDemandasDoProjeto(Number(projeto.id))
        })));

        return res.status(200).json(projetosExibidos);
        //para não derrubar o servidor, se der erro ele responde com stt 500
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({ mensagem: "Erro ao buscar projetos!" });
    }
});

// ROTA: GET "/projetos/:id" — busca um projeto pelo ID e retorna suas demandas (atualmente usando arrays em memória).
// app.get("/projetos/:id",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const projeto = projetos.find((item) => item.id === id);

//     if(!projeto)
//     {
//         return res.status(404).json({mensagem: "Projeto não encontrado!"});
//     }
//     return res.status(200).json({
//         id: projeto.id,
//         nome: projeto.nome,
//         descricao: projeto.descricao,
//         demandas: buscarDemandasDoProjeto(projeto.nome)
//     });
// });
app.get("/projetos/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
 
    try {
        const [linhas]: any = await pool.query(
            "SELECT id_projeto AS id, nome, descricao FROM projetos WHERE id_projeto = ? AND ativo = TRUE",
            [id]
        );
        if(linhas.length === 0)
        {
            return res.status(404).json({mensagem: "Projeto não encontrado!"});
        }
        const projeto = linhas[0];
        return res.status(200).json({
            id: projeto.id,
            nome: projeto.nome,
            descricao: projeto.descricao,
            demandas: await buscarDemandasDoProjeto(Number(projeto.id))
        });
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar projeto!"});
    }
});

// ROTA: GET "/projetos/demandas/:id" — lista as demandas de um projeto pelo ID (atualmente usando arrays em memória).
// app.get("/projetos/demandas/:id",(req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     const projeto = projetos.find((item) => item.id === id);

//     if(!projeto)
//     {
//         return res.status(404).json({mensagem: "Projeto não encontrado!"});
//     }
//     const demandas = buscarDemandasDoProjeto(projeto.nome);
//     return res.status(200).json(demandas);
// });
app.get("/projetos/demandas/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
 
    try {
        const [linhas]: any = await pool.query(
            "SELECT id_projeto FROM projetos WHERE id_projeto = ? AND ativo = TRUE",
            [id]
        );
        if(linhas.length === 0)
        {
            return res.status(404).json({mensagem: "Projeto não encontrado!"});
        }
        const demandasDoProjeto = await buscarDemandasDoProjeto(Number(linhas[0].id_projeto));
        return res.status(200).json(demandasDoProjeto);
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar demandas do projeto!"});
    }
});

// Dashboard
// function filtrarDemandasPorTipo(demandas:demandaFormato[], tipo: String) {

//     let demandasFiltradas: demandaFormato[] = [];
//     for(let cont=0; cont<demandas.length; cont++)
//     {
//         if(demandas[cont].tipo === tipo)
//         {
//             demandasFiltradas.push(demandas[cont]);
//         }
//     }
//     return demandasFiltradas;
// }

// function filtrarDemandasPorPrioridade(demandas:demandaFormato[], prioridade: String) {

//     let demandasFiltradas: demandaFormato[] = [];
//     for(let cont=0; cont<demandas.length; cont++)
//     {
//         if(demandas[cont].prioridade === prioridade)
//         {
//             demandasFiltradas.push(demandas[cont]);
//         }
//     }
//     return demandasFiltradas;
// }

// function filtrarDemandasPorStatus(demandas:demandaFormato[], status: String) {

//     let demandasFiltradas: demandaFormato[] = [];
//     for(let cont=0; cont<demandas.length; cont++)
//     {
//         if(demandas[cont].status === status)
//         {
//             demandasFiltradas.push(demandas[cont]);
//         }
//     }
//     return demandasFiltradas;
// }

// function filtrarDemandasProximas(demandas:demandaFormato[]) {

//     let demandasFiltradas: demandaFormato[] = [];
    
//     for(let cont=0; cont<demandas.length; cont++)
//     {
//         let prazoDemanda = new Date(demandas[cont].prazo);
//         let prazoFiltro = new Date(prazoDemanda);
//         prazoFiltro.setDate(prazoFiltro.getDate() - 7) //próximo nesse caso é 1 semana

//         let dataAtual = new Date();
//         dataAtual.toISOString().split('T')[0]; // torna a data para o formato aaaa-mm-dd
//         if(dataAtual > prazoFiltro && dataAtual < prazoDemanda)
//         {
//             demandasFiltradas.push(demandas[cont]);
//         }
//     }
//     return demandasFiltradas;
// }

// Estas funções pequenas só contam/filtram a lista de demandas que já veio do banco
function filtrarDemandasPorTipo(demandas: demandaFormato[], tipo: string) {
    return demandas.filter((demanda) => demanda.tipo === tipo);   // .filter fica só com quem passa no teste
}
 
function filtrarDemandasPorPrioridade(demandas: demandaFormato[], prioridade: string) {
    return demandas.filter((demanda) => demanda.prioridade === prioridade);
}
 
function filtrarDemandasPorStatus(demandas: demandaFormato[], status: string) {
    return demandas.filter((demanda) => demanda.status === status);
}
 
// "Próxima do prazo" = faltam 7 dias ou menos para o prazo
function filtrarDemandasProximas(demandas: demandaFormato[]) {
    let demandasFiltradas: demandaFormato[] = [];
 
    for(let cont=0; cont<demandas.length; cont++)
    {
        if(!demandas[cont].prazo)
        {
            continue;   // sem prazo, pula
        }
        const prazoDemanda = new Date(`${demandas[cont].prazo}T23:59:59`);
        const prazoFiltro = new Date(prazoDemanda);
        prazoFiltro.setDate(prazoFiltro.getDate() - 7);
 
        const dataAtual = new Date();
        if(dataAtual > prazoFiltro && dataAtual < prazoDemanda)
        {
            demandasFiltradas.push(demandas[cont]);
        }
    }
    return demandasFiltradas;
}

// ROTA: GET "/dashboard/:nomeProjeto" — calcula e retorna contagens/resumos das demandas de um projeto (atualmente em memória).
// app.get("/dashboard/:nomeProjeto", (req: Request, res: Response) => {
//     const nomeProjeto = decodeURIComponent(String(req.params.nomeProjeto));
//     const demandas = buscarDemandasDoProjeto(nomeProjeto);

//     const projeto = projetos.find((item) => item.nome === nomeProjeto);
//     if (!projeto) {
//         return res.status(404).json({mensagem: "Projeto não encontrado!"});
//     }
    
//     const demandasCriticas = filtrarDemandasPorPrioridade(demandas, "critica");
//     const demandasProximas = filtrarDemandasProximas(demandas);

//     const qtdCriticas = demandasCriticas.length;
//     const qtdProximas = demandasProximas.length;

//     const qtdAltas = filtrarDemandasPorPrioridade(demandas, "alta").length;
//     const qtdMedias = filtrarDemandasPorPrioridade(demandas, "media").length;
//     const qtdBaixas = filtrarDemandasPorPrioridade(demandas, "baixa").length;

//     const qtdTarefas = filtrarDemandasPorTipo(demandas, "tarefa").length;
//     const qtdDefeitos = filtrarDemandasPorTipo(demandas, "defeito").length;
//     const qtdMelhorias = filtrarDemandasPorTipo(demandas, "melhoria").length;
//     const qtdDocs = filtrarDemandasPorTipo(demandas, "documentacao").length;

//     const qtdAbertas = filtrarDemandasPorStatus(demandas, "aberta").length;
//     const qtdAndamento = filtrarDemandasPorStatus(demandas, "em_andamento").length;
//     const qtdRevisao = filtrarDemandasPorStatus(demandas, "em_revisao").length;
//     const qtdConcluidas = filtrarDemandasPorStatus(demandas, "concluida").length;
//     const qtdCanceladas = filtrarDemandasPorStatus(demandas, "cancelada").length;

//     const demandasCriticasAbertas = filtrarDemandasPorStatus(demandasCriticas, "aberta");
//     const demandasProximasAbertas = filtrarDemandasPorStatus(demandasProximas, "aberta");

//     const arrayQtdImportante = {"criticas": qtdCriticas, "proximas": qtdProximas};
//     const arrayQtdPrioridade = {"criticas": qtdCriticas, "altas": qtdAltas, "medias":qtdMedias, "baixas":qtdBaixas};
//     const arrayQtdTipo = {"tarefas": qtdTarefas, "defeitos": qtdDefeitos, "melhorias": qtdMelhorias, "docs": qtdDocs};
//     const arrayQtdStatus = {"abertas": qtdAbertas, "em_andamento": qtdAndamento, "em_revisao": qtdRevisao, "concluidas": qtdConcluidas, "canceladas": qtdCanceladas};

//     return res.status(200).json({
//         id: projeto.id,
//         demandas_criticas: demandasCriticasAbertas,
//         demandas_proximas: demandasProximasAbertas,

//         qtd_demandas_importantes: arrayQtdImportante,
//         qtd_demandas_por_prioridade: arrayQtdPrioridade,
//         qtd_demandas_por_tipo: arrayQtdTipo,
//         qtd_demandas_por_status: arrayQtdStatus,
//         qtd_total: demandas.length
//     });
// });
app.get("/dashboard/:nomeProjeto", async (req: Request, res: Response) => {
    const nomeProjeto = decodeURIComponent(String(req.params.nomeProjeto));
 
    try {
        const [projetosAchados]: any = await pool.query(
            "SELECT id_projeto FROM projetos WHERE nome = ? AND ativo = TRUE ORDER BY id_projeto LIMIT 1",
            [nomeProjeto]
        );
        if (projetosAchados.length === 0) {
            return res.status(404).json({mensagem: "Projeto não encontrado!"});
        }
 
        const demandas = await buscarDemandasDoProjeto(Number(projetosAchados[0].id_projeto));
 
        const demandasCriticas = filtrarDemandasPorPrioridade(demandas, "critica");
        const demandasProximas = filtrarDemandasProximas(demandas);
 
        // Os cartões de "importantes" mostram só as que ainda estão ABERTAS
        const demandasCriticasAbertas = filtrarDemandasPorStatus(demandasCriticas, "aberta");
        const demandasProximasAbertas = filtrarDemandasPorStatus(demandasProximas, "aberta");
 
        const arrayQtdImportante = {
            "criticas": demandasCriticasAbertas.length,
            "proximas": demandasProximasAbertas.length
        };
        const arrayQtdPrioridade = {
            "criticas": demandasCriticas.length,
            "altas": filtrarDemandasPorPrioridade(demandas, "alta").length,
            "medias": filtrarDemandasPorPrioridade(demandas, "media").length,
            "baixas": filtrarDemandasPorPrioridade(demandas, "baixa").length
        };
        const arrayQtdTipo = {
            "tarefas": filtrarDemandasPorTipo(demandas, "tarefa").length,
            "defeitos": filtrarDemandasPorTipo(demandas, "defeito").length,
            "melhorias": filtrarDemandasPorTipo(demandas, "melhoria").length,
            "docs": filtrarDemandasPorTipo(demandas, "documentacao").length
        };
        const arrayQtdStatus = {
            "abertas": filtrarDemandasPorStatus(demandas, "aberta").length,
            "em_andamento": filtrarDemandasPorStatus(demandas, "em_andamento").length,
            "em_revisao": filtrarDemandasPorStatus(demandas, "em_revisao").length,
            "concluidas": filtrarDemandasPorStatus(demandas, "concluida").length,
            "canceladas": filtrarDemandasPorStatus(demandas, "cancelada").length
        };
 
        return res.status(200).json({
            id: projetosAchados[0].id_projeto,
            demandas_criticas: demandasCriticasAbertas,
            demandas_proximas: demandasProximasAbertas,
 
            qtd_demandas_importantes: arrayQtdImportante,
            qtd_demandas_por_prioridade: arrayQtdPrioridade,
            qtd_demandas_por_tipo: arrayQtdTipo,
            qtd_demandas_por_status: arrayQtdStatus,
            qtd_total: demandas.length
        });
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao montar o dashboard!"});
    }
});

/* queries atuais para a dashboard:

    Sistema de login
    nenhum
*/

/*interface historicoFormato {
    id: number;
    demanda: number;
    datahora: string;
    alteracao: string;
}*/

// Monta a frase que o front mostra (ex.: Maria alterou status de "Aberta" para "Em andamento")
function montarFraseHistorico(linha: any): string {
    const quem = linha.usuario || "Alguém";
    if (linha.campo_alterado === "criação") {
        return `${quem} criou a demanda`;
    }
    return `${quem} alterou ${linha.campo_alterado} de "${linha.valor_anterior ?? "-"}" para "${linha.valor_novo ?? "-"}"`;
}

/* ROTA: GET "/historico/:id" — histórico de uma demanda, do mais novo pro mais antigo */
// app.get("/historico/:id", (req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     if(!id)
//     {
//         return res.status(400).json({mensagem: "ID inválido!"});
//     }
//     const alteracoes = historico.filter((item) => {
//         return item.demanda === id;
//     })

//     if(!alteracoes)
//     {
//         return res.status(404).json({mensagem: "Alterações não encontradas"});
//     }
//     return res.status(200).json(alteracoes);
// });
app.get("/historico/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if(!Number.isInteger(id) || id <= 0)
    {
        return res.status(400).json({mensagem: "ID inválido!"});
    }
 
    try {
        const [demandaExiste]: any = await pool.query("SELECT id_demanda FROM demandas WHERE id_demanda = ?", [id]);
        if (demandaExiste.length === 0) return res.status(404).json({mensagem: "Demanda não encontrada!"});
        // LEFT JOIN: se a alteração não tiver usuário, a linha continua aparecendo
        const [linhas]: any = await pool.query(
            `SELECT h.id_historico AS id, h.id_demanda, u.nome AS usuario,
                    h.campo_alterado, h.valor_anterior, h.valor_novo, h.data_hora
             FROM historico_demandas h
             LEFT JOIN usuarios u ON u.id_usuario = h.id_usuario
             WHERE h.id_demanda = ?
             ORDER BY h.data_hora DESC, h.id_historico DESC`,
            [id]
        );
 
        const alteracoes = linhas.map((linha: any) => ({
            id: linha.id,
            demanda: linha.id_demanda,
            datahora: formatarDataHora(linha.data_hora),
            alteracao: montarFraseHistorico(linha)
        }));
        return res.status(200).json(alteracoes);
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar histórico!"});
    }
});

// ROTA: GET "/projetoid/:nome" — procura um projeto ativo pelo nome e retorna seu ID.
// app.get("/projetoid/:nome", (req: Request, res: Response) => {
//     const nome = decodeURIComponent(String(req.params.nome).trim());
//     if(!nome)
//     {
//         return res.status(400).json({mensagem: "Nome inválido!"});
//     }
//     const projeto = projetos.find((item) => item.nome === nome)
//     if(!projeto)
//     {
//         return res.status(404).json({mensagem: "Projeto com este nome não encontrado"});
//     }
//     return res.status(200).json({id: projeto.id});
// });
app.get("/projetoid/:nome", async (req: Request, res: Response) => {
    const nome = decodeURIComponent(String(req.params.nome).trim());
    if(!nome)
    {
        return res.status(400).json({mensagem: "Nome inválido!"});
    }

    try {
        const [linhas]: any = await pool.query(
            "SELECT id_projeto FROM projetos WHERE nome = ? AND ativo = TRUE",
            [nome]
        );

        if(linhas.length === 0)
        {
            return res.status(404).json({mensagem: "Projeto com este nome não encontrado"});
        }
        return res.status(200).json({id: linhas[0].id_projeto});
    } catch (erro) {
        console.log(erro);
        return res.status(500).json({mensagem: "Erro ao buscar projeto!"});
    }
});

// ROTA: GET "/projetonome/:id" — procura um projeto ativo pelo ID e retorna seu nome.
// app.get("/projetonome/:id", (req: Request, res: Response) => {
//     const id = Number(req.params.id);
//     if(!id)
//     {
//         return res.status(400).json({mensagem: "ID inválido!"});
//     }
//     const projeto = projetos.find((item) => item.id === id)
//     if(!projeto)
//     {
//         return res.status(404).json({mensagem: "Projeto com este id não encontrado"});
//     }
//     return res.status(200).json({nome: projeto.nome});
// });
app.get("/projetonome/:id", async (req: Request, res: Response) => {
    const id = Number(req.params.id);
    if(!id)
    {
        return res.status(400).json({mensagem: "ID inválido!"});
    }
    
    try{
        //variável que vai armazenar o resultado da pesquisa
        const [linhas]: any = await pool.query(
            //o ? no SQL reserva espaço para um valor, que no caso é o id
            "SELECT nome FROM projetos WHERE id_projeto = ? AND ativo = TRUE", [id]
        );

        if(linhas.length === 0){
            return res.status(404).json({mensagem: "Projeto com este ID não encontrado!"})
        }
        return res.status(200).json({nome: linhas[0].nome})
    }catch (erro) {
        console.log(erro);
        return res.status(500).json({ mensagem: "Erro ao buscar projeto!" });
    }
});

// Inicia o servidor depois de registrar todas as rotas.
app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});

const apiKey = process.env.API_FERIADOS_KEY;

const API_BASE_URL = "https://feriadosapi.com/api/v1/";

async function isFeriado(data: Date) {
    let url = `${API_BASE_URL}feriados/nacionais`;

    if (!data) {
        return { status: "Nenhuma data especificada" };
    }

    url += `?ano=${data.getFullYear()}`;

    const resposta = await fetch(url, {
        headers: {
            Authorization: `Bearer ${apiKey}`
        }
    });

    if (!resposta.ok) {
        console.error(
            `[Feriados API Erro]: Status ${resposta.status} - ${resposta.statusText}`
        );
        return { status: "Erro servidor API" };
    }

    const dados = await resposta.json();
    const feriados = dados.feriados;

    const diaBusca = String(data.getDate()).padStart(2, "0");
    const mesBusca = String(data.getMonth() + 1).padStart(2, "0");
    const anoBusca = data.getFullYear();
    const dataAtual = `${diaBusca}/${mesBusca}/${anoBusca}`;

    let isferiado = false;

    feriados.forEach((feriado: any) => {
        if (feriado.data === dataAtual) {
            isferiado = true;
        }
    });

    if (isferiado) {
        return { status: "Data inserida é feriado!" };
    }

    return { status: isferiado };
}
