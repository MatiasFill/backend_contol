const express = require('express');
const router = express.Router();
const pool = require('../db.js'); // ou './db.js' se renomeou

// --- Listar todos os produtos ---
router.get('/', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM products');
    res.json(result.rows);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

// --- Adicionar um produto ---
router.post('/', async (req, res) => {
  const { name, sku, price, quantity } = req.body;

  // Validação básica
  if (!name || !sku || price === undefined || quantity === undefined) {
    return res.status(400).json({ message: "Todos os campos (name, sku, price, quantity) são obrigatórios." });
  }

  try {
    const result = await pool.query(
      'INSERT INTO products (name, sku, price, quantity) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, sku, price, quantity]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

// --- Deletar um produto ---
router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
    res.json({ message: "Produto deletado com sucesso!" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ message: "Erro interno no servidor" });
  }
});

module.exports = router;
