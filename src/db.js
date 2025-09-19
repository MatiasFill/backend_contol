import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const { Pool } = pg;
const isProduction = !!process.env.VERCEL_ENV;

// Configuração da pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL, // URL do banco do Vercel/PostgreSQL
  ssl: isProduction
    ? { rejectUnauthorized: false } // produção Vercel requer SSL, mas sem checagem de certificado
    : false,                        // dev local não precisa de SSL
});

// Teste rápido da conexão (opcional)
pool.on('connect', () => {
  console.log('Conectado ao PostgreSQL ✅');
});

pool.on('error', (err) => {
  console.error('Erro na conexão com o PostgreSQL ❌', err);
});

export default pool; // export default para ESM



/*
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const { Pool } = pg;
const isProduction = !!process.env.VERCEL_ENV;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

export default pool; // export default para ESM

*/

/*
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

// Cria o pool de conexões
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Exporta para ser usado no server.cjs
module.exports = pool;
*/

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