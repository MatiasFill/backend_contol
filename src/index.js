import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import pool from "./db.js"; // Importa a conexão com o PostgreSQL

dotenv.config();

const app = express();
const isProduction = !!process.env.VERCEL_ENV;

// --- Configuração e Middleware ---

// Configuração de CORS para permitir requisições apenas de origens específicas.
const allowedOrigins = [
  process.env.FRONTEND_URL, // Ex: https://seu-frontend-em-producao.vercel.app
  "http://localhost:5173", 
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requisições sem 'origin' (ex: de ferramentas como Postman) e das origens permitidas.
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, origin);
      } else {
        callback(new Error("Não permitido por CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Responde a requisições 'preflight' para qualquer rota.
app.options("*", cors());

// Habilita o uso de JSON nas requisições.
app.use(express.json());

// --- Rotas de Monitoramento e Saúde da Aplicação ---

app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "API rodando 🚀" });
});

app.get("/db-check", async (req, res) => {
  try {
    const result = await pool.query("SELECT NOW()");
    res.json({
      status: "ok",
      dbTime: result.rows[0].now,
      message: "Banco funcionando ✅",
    });
  } catch (err) {
    console.error("Falha na conexão com o banco:", err.message);
    res.status(500).json({
      status: "error",
      message: "Falha na conexão com o banco ❌",
      error: err.message,
    });
  }
});

// --- Middleware de Autenticação JWT ---

const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token)
    return res.status(401).json({ message: "Nenhum token de autenticação fornecido" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Adiciona os dados do usuário ao objeto de requisição
    next(); // Passa o controle para a próxima rota ou middleware
  } catch (err) {
    res.status(401).json({ message: "Token inválido ou expirado" });
  }
};

// --- Rota de Login (apenas para exemplo) ---

app.post("/login", (req, res) => {
  // ATENÇÃO: Credenciais hardcoded são um risco de segurança grave.
  // Em uma aplicação real, use um banco de dados e criptografia de senhas.
  const { username, password } = req.body;
  if (username === "admin" && password === "rms-1907") {
    const token = jwt.sign(
      { id: "123", username: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    return res.json({ token });
  }
  res.status(401).json({ message: "Credenciais inválidas" });
});

// --- Rota Segura de Exemplo ---

app.get("/api/products/secure", authMiddleware, (req, res) => {
  res.json({ message: "Acesso autorizado!", user: req.user });
});

// --- Rotas CRUD de Produtos ---

// READ: Retorna todos os produtos
app.get("/api/products", async (req, res) => {
  try {
    const { rows } = await pool.query("SELECT * FROM products ORDER BY name ASC");
    res.json(rows);
  } catch (err) {
    console.error("Erro ao buscar produtos:", err.message);
    res.status(500).send("Erro no servidor ao buscar produtos");
  }
});

// CREATE: Adiciona um novo produto (protegido por autenticação)
app.post("/api/products", authMiddleware, async (req, res) => {
  const { name, sku, quantity, price } = req.body;
  if (!name || !sku || quantity === undefined || price === undefined) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO products (name, sku, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
      [name, sku, quantity, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error("Erro ao adicionar produto:", err.message);
    res.status(500).send("Erro no servidor ao adicionar produto");
  }
});

// UPDATE: Atualiza um produto existente (protegido por autenticação)
app.put("/api/products/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, price } = req.body;
  if (!name || !sku || quantity === undefined || price === undefined) {
    return res
      .status(400)
      .json({ message: "Todos os campos são obrigatórios." });
  }
  try {
    const { rowCount } = await pool.query(
      "UPDATE products SET name = $1, sku = $2, quantity = $3, price = $4 WHERE id = $5",
      [name, sku, quantity, price, id]
    );
    if (rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }
    res.json({ message: "Produto atualizado com sucesso" });
  } catch (err) {
    console.error("Erro ao atualizar produto:", err.message);
    res.status(500).send("Erro no servidor ao atualizar produto");
  }
});

// DELETE: Exclui um produto (protegido por autenticação)
app.delete("/api/products/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  try {
    const { rowCount } = await pool.query("DELETE FROM products WHERE id = $1", [id]);
    if (rowCount === 0) {
      return res.status(404).json({ message: "Produto não encontrado." });
    }
    res.json({ message: "Produto excluído com sucesso" });
  } catch (err) {
    console.error("Erro ao excluir produto:", err.message);
    res.status(500).send("Erro no servidor ao excluir produto");
  }
});

// --- Inicialização do Servidor ---

if (!isProduction) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () =>
    console.log(`Servidor rodando em http://localhost:${PORT}`)
  );
}

// Exporta o aplicativo Express para ser usado pela Vercel.
export default app;



/*
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from './db.js'; // agora funciona

dotenv.config();

const app = express();
const isProduction = !!process.env.VERCEL_ENV;

// CORS
app.use(cors({
  origin: isProduction
    ? process.env.FRONTEND_URL
    : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());

// --- Health check ---
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'API rodando 🚀' });
});

// --- DB check ---
app.get('/db-check', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', dbTime: result.rows[0].now, message: 'Banco funcionando ✅' });
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Falha na conexão com o banco ❌', error: err.message });
  }
});

// --- JWT middleware ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Nenhum token fornecido' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token inválido' });
  }
};

// --- Login ---
app.post('/login', (req, res) => {
  const { username, password } = req.body;
  if (username === 'admin' && password === 'rms-1907') {
    const token = jwt.sign({ id: '123', username: 'admin' }, process.env.JWT_SECRET, { expiresIn: '1h' });
    return res.json({ token });
  }
  res.status(401).json({ message: 'Credenciais inválidas' });
});

// --- Rota segura ---
app.get('/api/products/secure', authMiddleware, (req, res) => {
  res.json({ message: 'Acesso autorizado!', user: req.user });
});

// --- CRUD Produtos ---
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.post('/api/products', async (req, res) => {
  const { name, sku, quantity, price } = req.body;
  if (!name || !sku || quantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  try {
    const { rows } = await pool.query(
      'INSERT INTO products (name, sku, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, quantity, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, price } = req.body;
  if (!name || !sku || quantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'Todos os campos são obrigatórios.' });
  }
  try {
    await pool.query(
      'UPDATE products SET name = $1, sku = $2, quantity = $3, price = $4 WHERE id = $5',
      [name, sku, quantity, price, id]
    );
    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Porta local
const PORT = process.env.PORT || 3000;
if (!isProduction) {
  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
}

// Export para Vercel
export default app;
*/

/*
import express from 'express';
import cors from 'cors';

const db = require('./db.cjs');

const app = express();

// Middleware para habilitar o CORS (permite que o frontend se conecte)
app.use(cors());
// Middleware para analisar o corpo das requisições JSON
app.use(express.json());

// Rota GET para buscar todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota POST para adicionar um novo produto
app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, quantity, price } = req.body;
    const { rows } = await db.query(
      'INSERT INTO products (name, sku, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, quantity, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota PUT para atualizar um produto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, price } = req.body;
    await db.query(
      'UPDATE products SET name = $1, sku = $2, quantity = $3, price = $4 WHERE id = $5',
      [name, sku, quantity, price, id]
    );
    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota DELETE para remover um produto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Adiciona a porta apenas para o ambiente local
const port = 3000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(port, () => {
    console.log(`Servidor backend rodando em http://localhost:${port}`);
  });
}

// Exporta a aplicação Express
module.exports = app;

*/

/*

const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
const port = 3000;

// Middleware para habilitar o CORS (permite que o frontend se conecte)
app.use(cors());
// Middleware para analisar o corpo das requisições JSON
app.use(express.json());

// Rota GET para buscar todos os produtos
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await db.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota POST para adicionar um novo produto
app.post('/api/products', async (req, res) => {
  try {
    const { name, sku, quantity, price } = req.body;
    const { rows } = await db.query(
      'INSERT INTO products (name, sku, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, quantity, price]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota PUT para atualizar um produto
app.put('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, price } = req.body;
    await db.query(
      'UPDATE products SET name = $1, sku = $2, quantity = $3, price = $4 WHERE id = $5',
      [name, sku, quantity, price, id]
    );
    res.json({ message: 'Produto atualizado com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Rota DELETE para remover um produto
app.delete('/api/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: 'Produto excluído com sucesso' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor backend rodando em http://localhost:${port}`);
});
*/
