import { Router } from "express";
import ProductService from "../services/product.service.js";
import { ok, err } from "../utils/responses.js";
import {
  INVALID_ID,
  PRODUCT_NOT_FOUND,
  MISSING_FIELD,
  CODE_ALREADY_EXISTS,
  INTERNAL_ERROR
} from "../utils/errorCodes.js";

const router = Router();
const productService = new ProductService();

// GET /api/products (con paginación, filtros y ordenamiento)
router.get("/", async (req, res) => {
  try {
    const { limit, page, query, sort } = req.query;

    // Preparar opciones para el servicio
    const options = {
      limit: limit ? parseInt(limit) : 10,
      page: page ? parseInt(page) : 1,
      query: {},
      sort: sort || null
    };

    // Procesar query parameters para filtros
    if (req.query.category) {
      options.query.category = req.query.category;
    }
    if (req.query.status !== undefined) {
      options.query.status = req.query.status;
    }

    // Validar parámetros numéricos
    if (options.limit <= 0 || options.page <= 0) {
      return err(res, 400, INVALID_ID, "limit y page deben ser mayores a 0");
    }

    const result = await productService.getPaginatedProducts(options);

    if (result === null) {
      return err(res, 500, INTERNAL_ERROR, "Error al obtener productos paginados");
    }

    // Enviar respuesta con formato estandarizado
    return res.status(200).json(result);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

// GET /api/products/:pid
router.get("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;

    // Validar formato de ObjectId
    if (pid.length !== 24) {
      return err(res, 400, INVALID_ID, "El ID debe ser un ObjectId válido (24 caracteres)");
    }

    const product = await productService.getProductById(pid);

    if (product === null) {
      return err(res, 404, PRODUCT_NOT_FOUND, "Producto no encontrado");
    }

    return ok(res, product);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

// POST /api/products
router.post("/", async (req, res) => {
  try {
    const body = req.body;

    const required = ["title", "description", "price", "code", "stock", "category"];
    for (const field of required) {
      if (!(field in body)) {
        return err(res, 400, MISSING_FIELD, `Falta el campo ${field}`);
      }
    }

    // Validaciones de tipos
    if (isNaN(Number(body.price)) || Number(body.price) <= 0) {
      return err(res, 400, MISSING_FIELD, "price debe ser numérico mayor a 0");
    }
    if (isNaN(Number(body.stock)) || Number(body.stock) < 0 || !Number.isInteger(Number(body.stock))) {
      return err(res, 400, MISSING_FIELD, "stock debe ser un entero ≥ 0");
    }

    // Convertir tipos
    const productData = {
      ...body,
      price: Number(body.price),
      stock: Number(body.stock)
    };

    const createdProduct = await productService.addProduct(productData);

    if (createdProduct === null) {
      return err(res, 400, CODE_ALREADY_EXISTS, "El código del producto ya existe");
    }

    res.status(201);
    return ok(res, createdProduct);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

// PUT /api/products/:pid
router.put("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;
    
    if (pid.length !== 24) {
      return err(res, 400, INVALID_ID, "El ID debe ser un ObjectId válido (24 caracteres)");
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

    // Validaciones específicas
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

    const updatedProduct = await productService.updateProduct(pid, updated);

    if (updatedProduct === null) {
      return err(res, 404, PRODUCT_NOT_FOUND, "Producto no encontrado o código duplicado");
    }

    return ok(res, updatedProduct);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

// DELETE /api/products/:pid
router.delete("/:pid", async (req, res) => {
  try {
    const pid = req.params.pid;

    if (pid.length !== 24) {
      return err(res, 400, INVALID_ID, "El ID debe ser un ObjectId válido (24 caracteres)");
    }

    const deletedProduct = await productService.deleteProduct(pid);

    if (deletedProduct === null) {
      return err(res, 404, PRODUCT_NOT_FOUND, "Producto no encontrado");
    }

    return ok(res, { product: deletedProduct }, "Producto eliminado correctamente");
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, "Error interno del servidor");
  }
});

export default router;