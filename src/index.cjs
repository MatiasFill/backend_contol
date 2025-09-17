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
