"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const app = (0, express_1.default)();
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Servidor ativo na porta ${PORT}`);
});
app.get("/", (req, res) => {
    res.send("Sistema SADD");
});
app.use(express_1.default.json());
function calcularIdade(dataNascimento) {
    const hoje = new Date();
    const dtnascimento = new Date(`${dataNascimento}T00:00:00`);
    let idade = hoje.getFullYear() - dtnascimento.getFullYear();
    const aniversarioAindaNaoOcorreu = hoje.getMonth() < dtnascimento.getMonth()
        || (hoje.getMonth() === dtnascimento.getMonth()
            && hoje.getDate() < dtnascimento.getDate());
    if (aniversarioAindaNaoOcorreu) {
        idade--;
    }
    return idade;
}
function testarCPF(cpf) {
    cpf = cpf.replace(/[-.]/g, ''); //expressão regular, para substituir todos - e . globais por ''
    if (cpf.length > 11 || cpf.length < 11) {
        return false;
    }
    let soma1 = 0;
    for (let i = 0; i < 9; i++) {
        soma1 += Number(cpf[i]) * (10 - i);
    }
    soma1 = soma1 % 11;
    if (soma1 < 2) {
        if (Number(cpf[9]) !== 0) {
            return false;
        }
    }
    else if (Number(cpf[9]) !== 11 - soma1) {
        return false;
    }
    let soma2 = 0;
    for (let i = 0; i < 10; i++) {
        soma2 += Number(cpf[i]) * (11 - i);
    }
    soma2 = soma2 % 11;
    if (soma2 < 2) {
        if (Number(cpf[10]) !== 0) {
            return false;
        }
    }
    else if (Number(cpf[10]) !== 11 - soma2) {
        return false;
    }
    let contNRepetidos = 0;
    for (let i = 1; i < 11; i++) {
        if (Number(cpf[i]) === Number(cpf[0])) {
            contNRepetidos++;
        }
    }
    if (contNRepetidos == 10) {
        return false;
    }
    return true;
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
app.get("/usuarios", (req, res) => {
    const email = req.query.email;
    const cpf = req.query.cpf;
    const qtdeUsuarios = usuarios.length;
    let usuariosExibidos = [];
    for (let cont = 0; cont < qtdeUsuarios; cont++) {
        const usuarioFiltrado = usuarios[cont];
        usuarioFiltrado.senha = "";
        if ((!cpf && email && email === usuarioFiltrado.email) || (!email && cpf && Number(cpf) === usuarioFiltrado.cpf) || (!cpf && !email)) {
            usuariosExibidos.push(usuarioFiltrado);
        }
    }
    if (usuariosExibidos.length === 0 && (cpf || email)) {
        return res.status(404).json({ mensagem: "Nenhum usuário encontrado" });
    }
    return res.status(200).json(usuariosExibidos);
});
// Dá status de OK 200 caso ambos email e senha sejam presentes em um usuário
app.post("/login", (req, res) => {
    const { email, senha } = req.body;
    const usuario = usuarios.find((item) => item.email === email);
    if (!usuario || usuario.senha !== senha) {
        return res.status(400).json({ mensagem: "Usuário ou senha inválidos!" });
    }
    return res.status(200).json({ mensagem: "Login OK" });
});
// Nota: o usuário é cadastrado com a permissão de acesso de um membro da equipe
app.post("/cadastro", (req, res) => {
    const { nome, cpf, telefone, dataNasc, email, senha } = req.body;
    if (!nome || !cpf || !telefone || !dataNasc || !email || !senha) {
        return res.status(400).json({ mensagem: "Dados obrigatórios vazios!" });
    }
    if (nome.trim().split(/\s+/).length < 2) {
        return res.status(400).json({ mensagem: "Nome incompleto!" });
    }
    const usuarioCPF = usuarios.find((item) => item.cpf === cpf); // Ele busca se existe um usuário com este CPF (para não existir repetições)
    if (usuarioCPF || !testarCPF(String(cpf))) {
        return res.status(400).json({ mensagem: "CPF inválido!" });
    }
    if (String(telefone).length < 11) {
        return res.status(400).json({ mensagem: "Número de telefone inválido!" });
    }
    const hoje = new Date();
    const nascimento = new Date(`${dataNasc}T00:00:00`);
    if (nascimento > hoje || (calcularIdade(dataNasc) < 18 || calcularIdade(dataNasc) > 100)) {
        return res.status(400).json({ mensagem: "Data de nascimento inválida!" });
    }
    // Esta é uma expressão regular que pesquisei para emails
    const expressaoRegularEmail = /^(([^<>()[\]\.,;:\s@\"]+(\.[^<>()[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i.test(email);
    if (!expressaoRegularEmail) {
        return res.status(400).json({ mensagem: "Email inválido!" });
    }
    const possuiMaiuscula = /[A-Z]/.test(senha);
    const possuiMinuscula = /[a-z]/.test(senha);
    const possuiNumero = /[0-9]/.test(senha);
    const possuiEspecial = /[_@!]/.test(senha);
    if (senha.length < 8 || !possuiEspecial || !possuiMaiuscula || !possuiMinuscula || !possuiNumero) {
        return res.status(400).json({ mensagem: "Senha inválida!" });
    }
    const novoUsuario = {
        nome, cpf, telefone, dataNasc, email, senha
    };
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
//# sourceMappingURL=index.js.map