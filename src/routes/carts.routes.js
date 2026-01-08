
import express from 'express';
import CartManager from '../managers/CartManager.js';

const router = express.Router();
const cartManager = new CartManager();

// Lista carritos
router.get('/', (req, res) => {
  try {
    const carts = cartManager.getCarts();
    res.json(carts);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Agregar carrito
router.post('/', (req, res) => {
  try {
    const newCart = cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Carrito por ID
router.get('/:cid', (req, res) => {
  try {
    const cid = Number(req.params.cid);

    if (isNaN(cid) || !Number.isInteger(cid) || cid <= 0) {
      return res.status(400).json({
        error: "El ID debe ser un número entero mayor a 0"
      });
    }

    const cart = cartManager.getCartById(cid);
    res.json(cart);
  } catch (error) {
    res.status(404).json({ error: error.message });
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
      return res.status(400).json({
        error: "Los IDs deben ser números enteros mayores a 0"
      });
    }

    const cart = cartManager.addProductToCart(cid, pid);
    res.json(cart);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

export default router;
