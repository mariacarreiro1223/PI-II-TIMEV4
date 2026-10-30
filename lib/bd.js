"use strict";
// Maria Eduarda
// Conexão com o banco MySQL
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.pool = void 0;
//conecta ao banco
const promise_1 = __importDefault(require("mysql2/promise"));
//faz a leitura do arquivo .env
const dotenv_1 = __importDefault(require("dotenv"));
//pega os dados do arquivo .env
dotenv_1.default.config();
//monta as configuações de conexão, cada campo recebe os valores vindo do .env
exports.pool = promise_1.default.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});
//# sourceMappingURL=bd.js.map