
import fs from 'fs';

class CartManager {
  constructor() {
    this.path = './data/carts.json';
    this.carts = [];
    this.loadCarts();
  }

  loadCarts() {
    try {
      const data = fs.readFileSync(this.path, 'utf8');
      this.carts = JSON.parse(data);
    } catch (error) {
      this.carts = [];
    }
  }

  saveCarts() {
    fs.writeFileSync(this.path, JSON.stringify(this.carts, null, 2));
  }

  getCarts() {
    return this.carts;
  }

  createCart() {
    const newCart = {
      id: this.carts.length > 0 ? Math.max(...this.carts.map(c => c.id)) + 1 : 1,
      products: []
    };

    this.carts.push(newCart);
    this.saveCarts();
    return newCart;
  }

  // Devuelve null si no existe
  getCartById(id) {
    const cart = this.carts.find(c => c.id === id);
    return cart || null;
  }

  // Devuelve null si el carrito no existe; si existe, agrega/incrementa
  addProductToCart(cartId, productId) {
    const cart = this.getCartById(cartId);
    if (cart === null) return null;

    const existingProduct = cart.products.find(p => p.product === productId);
    if (existingProduct) {
      existingProduct.quantity += 1;
    } else {
      cart.products.push({ product: productId, quantity: 1 });
    }

    this.saveCarts();
    return cart;
  }
}

export default CartManager;
