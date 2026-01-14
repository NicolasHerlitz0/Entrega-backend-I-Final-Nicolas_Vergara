import express from 'express';
import CartService from '../services/cart.service.js';
import { ok, err } from '../utils/responses.js';
import {
  INVALID_ID,
  CART_NOT_FOUND,
  PRODUCT_NOT_FOUND,
  MISSING_FIELD,
  INTERNAL_ERROR
} from '../utils/errorCodes.js';

const router = express.Router();
const cartService = new CartService();

// GET /api/carts - Listar todos los carritos
router.get('/', async (req, res) => {
  try {
    const carts = await cartService.getCarts();
    
    if (carts === null) {
      return err(res, 500, INTERNAL_ERROR, 'Error al obtener carritos');
    }
    
    return ok(res, carts);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// POST /api/carts - Crear nuevo carrito
router.post('/', async (req, res) => {
  try {
    const newCart = await cartService.createCart();
    
    if (newCart === null) {
      return err(res, 500, INTERNAL_ERROR, 'Error al crear carrito');
    }
    
    res.status(201);
    return ok(res, newCart);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// GET /api/carts/:cid - Obtener carrito por ID (con populate)
router.get('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    
    if (cid.length !== 24) {
      return err(res, 400, INVALID_ID, 'El ID debe ser un ObjectId válido (24 caracteres)');
    }
    
    const cart = await cartService.getCartById(cid);
    
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado');
    }
    
    return ok(res, cart);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// POST /api/carts/:cid/product/:pid - Agregar producto al carrito
router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    
    if (cid.length !== 24 || pid.length !== 24) {
      return err(res, 400, INVALID_ID, 'Los IDs deben ser ObjectId válidos (24 caracteres)');
    }
    
    const cart = await cartService.addProductToCart(cid, pid);
    
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito o producto no encontrado');
    }
    
    return ok(res, cart);
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// DELETE /api/carts/:cid/products/:pid - Eliminar producto específico del carrito (NUEVO)
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    
    if (cid.length !== 24 || pid.length !== 24) {
      return err(res, 400, INVALID_ID, 'Los IDs deben ser ObjectId válidos (24 caracteres)');
    }
    
    const cart = await cartService.removeProductFromCart(cid, pid);
    
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado o producto no está en el carrito');
    }
    
    return ok(res, cart, 'Producto eliminado del carrito');
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// PUT /api/carts/:cid - Reemplazar todos los productos del carrito (NUEVO)
router.put('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const productsArray = req.body.products;
    
    if (cid.length !== 24) {
      return err(res, 400, INVALID_ID, 'El ID del carrito debe ser un ObjectId válido (24 caracteres)');
    }
    
    if (!Array.isArray(productsArray)) {
      return err(res, 400, MISSING_FIELD, 'El body debe contener un array "products"');
    }
    
    const cart = await cartService.updateCartProducts(cid, productsArray);
    
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado o algún producto no existe');
    }
    
    return ok(res, cart, 'Carrito actualizado correctamente');
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// PUT /api/carts/:cid/products/:pid - Actualizar cantidad de un producto (NUEVO)
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cid = req.params.cid;
    const pid = req.params.pid;
    const { quantity } = req.body;
    
    if (cid.length !== 24 || pid.length !== 24) {
      return err(res, 400, INVALID_ID, 'Los IDs deben ser ObjectId válidos (24 caracteres)');
    }
    
    if (!quantity || quantity < 1) {
      return err(res, 400, MISSING_FIELD, 'La cantidad debe ser un número mayor a 0');
    }
    
    const cart = await cartService.updateProductQuantity(cid, pid, quantity);
    
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado o producto no está en el carrito');
    }
    
    return ok(res, cart, 'Cantidad actualizada correctamente');
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// DELETE /api/carts/:cid - Vaciar carrito (NUEVO)
router.delete('/:cid', async (req, res) => {
  try {
    const cid = req.params.cid;
    
    if (cid.length !== 24) {
      return err(res, 400, INVALID_ID, 'El ID debe ser un ObjectId válido (24 caracteres)');
    }
    
    const cart = await cartService.clearCart(cid);
    
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado');
    }
    
    return ok(res, cart, 'Carrito vaciado correctamente');
  } catch (error) {
    console.error(error);
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

export default router;