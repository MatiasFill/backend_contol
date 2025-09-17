// src/index.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pg from 'pg';
import jwt from 'jsonwebtoken';

dotenv.config();

const { Pool } = pg;
const isProduction = process.env.NODE_ENV === 'production' || process.env.VERCEL_ENV;

// Configura pool do PostgreSQL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isProduction ? { rejectUnauthorized: false } : false,
});

const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
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

// --- Middleware de autenticação JWT ---
const authMiddleware = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]; // Bearer TOKEN
  if (!token) return res.status(401).json({ message: 'Autenticação falhou: Nenhum token fornecido.' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Autenticação falhou: Token inválido.' });
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
  res.json({ message: 'Acesso autorizado à rota segura!', user: req.user });
});

// --- CRUD de produtos ---

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY name ASC');
    res.json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Erro no servidor');
  }
});

// POST new product
app.post('/api/products', async (req, res) => {
  const { name, sku, quantity, price } = req.body;
  if (!name || !sku || quantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'Todos os campos (name, sku, quantity, price) são obrigatórios.' });
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

// PUT update product
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, price } = req.body;
  if (!name || !sku || quantity === undefined || price === undefined) {
    return res.status(400).json({ message: 'Todos os campos (name, sku, quantity, price) são obrigatórios.' });
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

// DELETE product
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

// --- Porta local ---
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL_ENV) {
  app.listen(PORT, () => console.log(`Servidor backend rodando em http://localhost:${PORT}`));
}

// Export para Vercel
export default app;



/*
import express from 'express';
import cors from 'cors';

const db = require('./db.js');

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
