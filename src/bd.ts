// Maria Eduarda
// Conexão com o banco MySQL


//conecta ao banco
import mysql from "mysql2/promise";
//faz a leitura do arquivo .env
import dotenv from "dotenv";

//pega os dados do arquivo .env
dotenv.config();

//monta as configuações de conexão, cada campo recebe os valores vindo do .env
export const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});