// backend/routes/productRoutes.js
import express from 'express';
import pool from '../db.js'; // importa sua conexão com o banco



const router = express.Router()

// Listar todos os produtos
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produtos' });
  }
});

// Buscar um produto pelo ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao buscar produto' });
  }
});

// Adicionar um produto
router.post('/', async (req, res) => {
  const { name, sku, quantity, price } = req.body;
  try {
    const result = await pool.query(
      'INSERT INTO products (name, sku, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, quantity, price]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao adicionar produto' });
  }
});

// Atualizar um produto
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const { name, sku, quantity, price } = req.body;
  try {
    const result = await pool.query(
      'UPDATE products SET name=$1, sku=$2, quantity=$3, price=$4 WHERE id=$5 RETURNING *',
      [name, sku, quantity, price, id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao atualizar produto' });
  }
});

// Deletar um produto
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Produto não encontrado' });
    res.json({ message: 'Produto deletado com sucesso' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Erro ao deletar produto' });
  }
});

export default router;
