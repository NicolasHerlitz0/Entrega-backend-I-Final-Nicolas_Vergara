
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
    const body = req.body;

    const required = ["title", "description", "price", "code", "stock", "category"];
    for (const field of required) {
      if (!(field in body)) {
        return res.status(400).json({ error: `Falta el campo ${field}` });
      }
    }

    if (isNaN(Number(body.price)) || Number(body.price) <= 0) {
      return res.status(400).json({ error: "price debe ser numérico mayor a 0" });
    }
    if (isNaN(Number(body.stock)) || Number(body.stock) < 0 || !Number.isInteger(Number(body.stock))) {
      return res.status(400).json({ error: "stock debe ser un entero ≥ 0" });
    }

    body.price = Number(body.price);
    body.stock = Number(body.stock);

    const createdProduct = await manager.addProduct(body);
    res.status(201).json(createdProduct);
  } catch (error) {
    if (error.message.includes("ya existe")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
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

    const updated = req.body;
    if (!updated || Object.keys(updated).length === 0) {
      return res.status(400).json({ error: "Se deben enviar campos para actualizar en el body" });
    }

    const allowed = new Set(["title", "description", "price", "code", "stock", "category", "status"]);
    for (const key of Object.keys(updated)) {
      if (!allowed.has(key)) {
        return res.status(400).json({ error: `Campo no permitido: ${key}` });
      }
    }

    if ("price" in updated) {
      if (isNaN(Number(updated.price)) || Number(updated.price) <= 0) {
        return res.status(400).json({ error: "price debe ser numérico mayor a 0" });
      }
      updated.price = Number(updated.price);
    }

    if ("stock" in updated) {
      if (isNaN(Number(updated.stock)) || Number(updated.stock) < 0 || !Number.isInteger(Number(updated.stock))) {
        return res.status(400).json({ error: "stock debe ser un entero ≥ 0" });
      }
      updated.stock = Number(updated.stock);
    }

    const updatedProduct = await manager.updateProduct(pid, updated);

    if (!updatedProduct) {
      return res.status(404).json({ error: "Producto no encontrado" });
    }

    res.json(updatedProduct);
  } catch (error) {
    if (error.message.includes("ya existe")) {
      return res.status(400).json({ error: error.message });
    }
    return res.status(500).json({ error: error.message });
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
