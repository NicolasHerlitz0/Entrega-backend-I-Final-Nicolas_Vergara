
import { Router } from "express";
import ProductManager from "../managers/ProductManager.js";
import { ok, err } from "../utils/responses.js";
import {
  INVALID_ID,
  PRODUCT_NOT_FOUND,
  MISSING_FIELD,
  CODE_ALREADY_EXISTS,
  INTERNAL_ERROR
} from "../utils/errorCodes.js";

const router = Router();
const manager = new ProductManager("./data/products.json");

router.get("/", async (req, res) => {
  try {
    const limit = req.query.limit;
    const products = await manager.getProducts();

    if (limit) {
      const limitedProducts = products.slice(0, limit);
      return ok(res, limitedProducts);
    }

    return ok(res, products);
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

router.get("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (isNaN(pid) || !Number.isInteger(pid) || pid <= 0) {
      return err(res, 400, INVALID_ID, "El ID debe ser un número entero mayor a 0");
    }

    const product = await manager.getProductById(pid);

    if (product === null) {
      return err(res, 404, PRODUCT_NOT_FOUND, "Producto no encontrado");
    }

    return ok(res, product);
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const required = ["title", "description", "price", "code", "stock", "category"];
    for (const field of required) {
      if (!(field in body)) {
        return err(res, 400, MISSING_FIELD, `Falta el campo ${field}`);
      }
    }

    if (isNaN(Number(body.price)) || Number(body.price) <= 0) {
      return err(res, 400, MISSING_FIELD, "price debe ser numérico mayor a 0");
    }
    if (isNaN(Number(body.stock)) || Number(body.stock) < 0 || !Number.isInteger(Number(body.stock))) {
      return err(res, 400, MISSING_FIELD, "stock debe ser un entero ≥ 0");
    }

    body.price = Number(body.price);
    body.stock = Number(body.stock);

    const createdProduct = await manager.addProduct(body);
    res.status(201);
    return ok(res, createdProduct);
  } catch (error) {
    if (error.message.includes("ya existe")) {
      return err(res, 400, CODE_ALREADY_EXISTS, error.message);
    }
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

router.put("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);
    if (isNaN(pid) || !Number.isInteger(pid) || pid <= 0) {
      return err(res, 400, INVALID_ID, "El ID debe ser un número entero mayor a 0");
    }

    const updated = req.body;
    if (!updated || Object.keys(updated).length === 0) {
      return err(res, 400, MISSING_FIELD, "Se deben enviar campos para actualizar en el body");
    }

    const allowed = new Set(["title", "description", "price", "code", "stock", "category", "status"]);
    for (const key of Object.keys(updated)) {
      if (!allowed.has(key)) {
        return err(res, 400, MISSING_FIELD, `Campo no permitido: ${key}`);
      }
    }

    if ("price" in updated) {
      if (isNaN(Number(updated.price)) || Number(updated.price) <= 0) {
        return err(res, 400, MISSING_FIELD, "price debe ser numérico mayor a 0");
      }
      updated.price = Number(updated.price);
    }

    if ("stock" in updated) {
      if (isNaN(Number(updated.stock)) || Number(updated.stock) < 0 || !Number.isInteger(Number(updated.stock))) {
        return err(res, 400, MISSING_FIELD, "stock debe ser un entero ≥ 0");
      }
      updated.stock = Number(updated.stock);
    }

    const updatedProduct = await manager.updateProduct(pid, updated);

    if (updatedProduct === null) {
      return err(res, 404, PRODUCT_NOT_FOUND, "Producto no encontrado");
    }

    return ok(res, updatedProduct);
  } catch (error) {
    if (error.message.includes("ya existe")) {
      return err(res, 400, CODE_ALREADY_EXISTS, error.message);
    }
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

router.delete("/:pid", async (req, res) => {
  try {
    const pid = Number(req.params.pid);

    if (isNaN(pid) || !Number.isInteger(pid) || pid <= 0) {
      return err(res, 400, INVALID_ID, "El ID debe ser un número entero mayor a 0");
    }

    const deletedProduct = await manager.deleteProduct(pid);

    if (deletedProduct === null) {
      return err(res, 404, PRODUCT_NOT_FOUND, "Producto no encontrado");
    }

    // Puedes usar ok(res, deletedProduct, "Producto eliminado correctamente")
    return ok(res, { product: deletedProduct }, "Producto eliminado correctamente");
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

export default router;
