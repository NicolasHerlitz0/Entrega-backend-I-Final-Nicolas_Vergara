import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";

const router = Router();
const manager = new ProductManager("./data/products.json");

router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = await manager.getProducts();

    if (limit) {
      const limitedProducts = products.slice(0, limit);
      return res.json(limitedProducts);
    }

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (isNaN(pid) || !Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        error: "El ID debe ser un número entero mayor a 0",
      });
    }

    const product = await manager.getProductById(pid);

    if (!product) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const newProduct = req.body;

    if (!newProduct || Object.keys(newProduct).length === 0) {
      return res.status(400).json({
        error: "Se deben enviar datos del producto en el body",
      });
    }

    const createdProduct = await manager.addProduct(newProduct);
    res.status(201).json(createdProduct);
  } catch (error) {
    if (
      error.message.includes("requerido") ||
      error.message.includes("ya existe")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    if (isNaN(pid) || !Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        error: "El ID debe ser un número entero mayor a 0",
      });
    }

    const updatedFields = req.body;

    if (!updatedFields || Object.keys(updatedFields).length === 0) {
      return res.status(400).json({
        error: "Se deben enviar campos para actualizar en el body",
      });
    }

    const updatedProduct = await manager.updateProduct(pid, updatedFields);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    if (
      error.message.includes("requerido") ||
      error.message.includes("ya existe")
    ) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (isNaN(pid) || !Number.isInteger(pid) || pid <= 0) {
      return res.status(400).json({
        error: "El ID debe ser un número entero mayor a 0",
      });
    }

    const deletedProduct = await manager.deleteProduct(pid);

    if (!deletedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json({
      message: "Producto eliminado correctamente",
      product: deletedProduct,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
