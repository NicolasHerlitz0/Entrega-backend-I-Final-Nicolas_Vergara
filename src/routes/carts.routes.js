//actualizado para nuevos endpoints y populate
import express from 'express';
import CartManager from '../managers/CartManager.js';
import { ok, err } from '../utils/responses.js';
import {
  INVALID_ID,
  CART_NOT_FOUND,
  INTERNAL_ERROR
} from '../utils/errorCodes.js';

const router = express.Router();
const cartManager = new CartManager();

// Lista carritos
router.get('/', (req, res) => {
  try {
    const carts = cartManager.getCarts();
    return ok(res, carts);
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// Agregar carrito
router.post('/', (req, res) => {
  try {
    const newCart = cartManager.createCart();
    // Éxito con data; si quieres incluir mensaje: ok(res, newCart, "Carrito creado")
    res.status(201);
    return ok(res, newCart);
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// Carrito por ID
router.get('/:cid', (req, res) => {
  try {
    const cid = Number(req.params.cid);

    if (isNaN(cid) || !Number.isInteger(cid) || cid <= 0) {
      return err(res, 400, INVALID_ID, 'El ID debe ser un número entero mayor a 0');
    }

    const cart = cartManager.getCartById(cid);
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado');
    }

    return ok(res, cart);
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

// Agregar producto a carrito
router.post('/:cid/product/:pid', (req, res) => {
  try {
    const cid = Number(req.params.cid);
    const pid = Number(req.params.pid);

    if (
      isNaN(cid) || !Number.isInteger(cid) || cid <= 0 ||
      isNaN(pid) || !Number.isInteger(pid) || pid <= 0
    ) {
      return err(res, 400, INVALID_ID, 'Los IDs deben ser números enteros mayores a 0');
    }

    const cart = cartManager.addProductToCart(cid, pid);
    if (cart === null) {
      return err(res, 404, CART_NOT_FOUND, 'Carrito no encontrado');
    }

    return ok(res, cart);
  } catch (error) {
    return err(res, 500, INTERNAL_ERROR, 'Error interno del servidor');
  }
});

export default router;
