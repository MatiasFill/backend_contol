const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Cria o pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Exporta para ser usado no server.cjs
module.exports = pool;


/* esta estava em uso.
import pkg from "pg";
import dotenv from "dotenv";

dotenv.config();
const { Pool } = pkg;

// Configura o pool de conexões com suas credenciais do PostgreSQL
const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  host: process.env.DB_HOST || "localhost",
  database: process.env.DB_NAME || "stock_db", // o nome do banco que você criou
  password: process.env.DB_PASS || "rms-1907",
  port: process.env.DB_PORT || 5432, // porta padrão do PostgreSQL
});

// Exporta o pool para ser usado nos models
export default pool;

// Se quiser usar diretamente o método query em outros arquivos:
export const query = (text, params) => pool.query(text, params);


*/

/*
import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

// Use a string de conexão completa da variável de ambiente DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Verifica a conexão ao iniciar a aplicação
pool.connect((err, client, release) => {
  if (err) {
    return console.error("Erro ao adquirir o cliente do pool", err.stack);
  }
  client.query("SELECT NOW()", (err, result) => {
    release();
    if (err) {
      return console.error("Erro ao executar a query de teste", err.stack);
    }
    console.log("Conexão com o banco de dados bem-sucedida!", result.rows[0]);
  });
});

export default pool;

*/