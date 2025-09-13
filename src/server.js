import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import jwt from 'jsonwebtoken';
import pool from './db.js'; // Importa a conexão do seu arquivo db.js

import productRoutes from './routes/productRoutes.js';

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
app.get('/products/secure', authMiddleware, async (req, res) => {
    // Apenas para demonstração, retorna uma mensagem de sucesso
    res.json({ message: 'Acesso autorizado à rota segura!', user: req.user });
});

// Rotas da API
app.use('/products', productRoutes);

// Configura a porta do servidor para rodar tanto localmente quanto na Vercel
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});




// o segundo
/*
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pool from './db.js'; // Importa a conexão do seu arquivo db.js

import productRoutes from './routes/productRoutes.js';

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


// Rotas da API
app.use('/products', productRoutes);

// Configura a porta do servidor para rodar tanto localmente quanto na Vercel
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

*/

// o primeiro
/*
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import productRoutes from './routes/productRoutes.js';


const app = express();
app.use(cors());
app.use(express.json());

app.use('/products', productRoutes);

app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
*/