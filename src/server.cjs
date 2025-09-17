const dotenv = require('dotenv');
const jwt = require('jsonwebtoken');
const express = require('express');
const cors = require('cors');

// Importa os módulos locais usando a sintaxe CommonJS
const pool = require('./db.cjs'); // 
const productRoutes = require('./routes/productRoutes.js');

// Carrega as variáveis de ambiente do arquivo .env
dotenv.config();

const app = express();

// Middleware: permite o uso de JSON e lida com requisições CORS
app.use(express.json());
app.use(cors());

// Conecta ao banco de dados usando a URL da variável de ambiente
pool.connect((err, client, release) => {
    if (err) {
        return console.error("Erro ao adquirir o cliente do pool", err.stack);
    }
    client.release();
    console.log("Conexão com o banco de dados bem-sucedida!");
});

// Middleware para proteger as rotas
const authMiddleware = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1]; // Espera "Bearer TOKEN"

    if (!token) {
        return res.status(401).json({ message: 'Autenticação falhou: Nenhum token fornecido.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Adiciona o payload decodificado à requisição
        next();
    } catch (error) {
        return res.status(401).json({ message: 'Autenticação falhou: Token inválido.' });
    }
};

// --- Rota de Login ---
// Por enquanto, esta rota usa um usuário e senha fixos.
// Você pode adaptar para verificar no seu banco de dados.
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Apenas para demonstração, use credenciais fixas
    if (username === 'admin' && password === 'rms-1907') {
        // Crie um token JWT
        const token = jwt.sign(
            { id: '123', username: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );
        return res.json({ token });
    }

    res.status(401).json({ message: 'Credenciais inválidas' });
});

// --- Rota Protegida ---
// Esta rota só pode ser acessada com um token JWT válido
app.get('/api/products/secure', authMiddleware, async (req, res) => {
    // Apenas para demonstração, retorna uma mensagem de sucesso
    res.json({ message: 'Acesso autorizado à rota segura!', user: req.user });
});

// Rotas da API
app.use('/api/products', productRoutes);

// Configura a porta do servidor para rodar tanto localmente quanto na Vercel
const PORT = process.env.PORT || 3000;

if (process.env.VERCEL_ENV) {
    module.exports = app;
} else {
    const port = 3000;
    app.listen(port, () => {
        console.log(`Servidor backend rodando em http://localhost:${port}`);
    });
}



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