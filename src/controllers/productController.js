import {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../models/productModel.js";

// Buscar todos os produtos
export const getProducts = async (req, res) => {
  try {
    const products = await getAllProducts();
    res.json(products);
  } catch (error) {
    console.error("Erro ao buscar produtos:", error);
    res.status(500).json({ error: "Erro ao buscar produtos" });
  }
};

// Buscar produto por ID
export const getProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await getProductById(id);

    if (!product) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(product);
  } catch (error) {
    console.error("Erro ao buscar produto:", error);
    res.status(500).json({ error: "Erro ao buscar produto" });
  }
};

// Criar novo produto
export const addProduct = async (req, res) => {
  try {
    const { name, sku, quantity, price } = req.body;

    if (!name || !sku || quantity == null || price == null) {
      return res.status(400).json({ error: "Preencha todos os campos" });
    }

    const newProduct = await createProduct({ name, sku, quantity, price });
    res.status(201).json(newProduct);
  } catch (error) {
    console.error("Erro ao adicionar produto:", error);
    res.status(500).json({ error: "Erro ao adicionar produto" });
  }
};

// Atualizar produto
export const editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, sku, quantity, price } = req.body;

    const updatedProduct = await updateProduct(id, {
      name,
      sku,
      quantity,
      price,
    });

    if (!updatedProduct) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    console.error("Erro ao atualizar produto:", error);
    res.status(500).json({ error: "Erro ao atualizar produto" });
  }
};

// Deletar produto
export const removeProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProduct = await deleteProduct(id);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Produto não encontrado" });
    }

    res.json({ message: "Produto deletado com sucesso" });
  } catch (error) {
    console.error("Erro ao deletar produto:", error);
    res.status(500).json({ error: "Erro ao deletar produto" });
  }
};
