import { query } from "../db.cjs";

// Busca todos os produtos
export const getAllProducts = async () => {
  const result = await query("SELECT * FROM products ORDER BY id ASC");
  return result.rows;
};

// Busca um produto por ID
export const getProductById = async (id) => {
  const result = await query("SELECT * FROM products WHERE id = $1", [id]);
  return result.rows[0];
};

// Cria um novo produto
export const createProduct = async ({ name, sku, quantity, price }) => {
  const result = await query(
    "INSERT INTO products (name, sku, quantity, price) VALUES ($1, $2, $3, $4) RETURNING *",
    [name, sku, quantity, price]
  );
  return result.rows[0];
};

// Atualiza um produto existente
export const updateProduct = async (id, { name, sku, quantity, price }) => {
  const result = await query(
    "UPDATE products SET name = $1, sku = $2, quantity = $3, price = $4 WHERE id = $5 RETURNING *",
    [name, sku, quantity, price, id]
  );
  return result.rows[0];
};

// Deleta um produto
export const deleteProduct = async (id) => {
  const result = await query("DELETE FROM products WHERE id = $1 RETURNING *", [
    id,
  ]);
  return result.rows[0];
};
