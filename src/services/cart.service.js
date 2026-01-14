import Cart from '../models/cart.models.js';
import Product from '../models/product.models.js';

class CartService {
  // Obtener todos los carritos
  async getCarts() {
    try {
      const carts = await Cart.find({});
      return carts;
    } catch (error) {
      console.error('Error en getCarts:', error.message);
      return null;
    }
  }

  // Obtener carrito por ID con populate (productos completos)
  async getCartById(id) {
    try {
      // Validar formato de ObjectId
      if (id.length !== 24) {
        return null;
      }

      const cart = await Cart.findById(id).populate('products.product');
      return cart;
    } catch (error) {
      console.error('Error en getCartById:', error.message);
      return null;
    }
  }

  // Crear nuevo carrito vacío
  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      console.error('Error en createCart:', error.message);
      return null;
    }
  }

  // Agregar producto al carrito o incrementar cantidad
  async addProductToCart(cartId, productId) {
    try {
      // Validar IDs
      if (cartId.length !== 24 || productId.length !== 24) {
        return null;
      }

      // Verificar que el producto exista
      const productExists = await Product.findById(productId);
      if (!productExists) {
        return null;
      }

      // Buscar carrito
      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      // Buscar si el producto ya está en el carrito
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex !== -1) {
        // Incrementar cantidad si ya existe
        cart.products[productIndex].quantity += 1;
      } else {
        // Agregar nuevo producto
        cart.products.push({
          product: productId,
          quantity: 1
        });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error('Error en addProductToCart:', error.message);
      return null;
    }
  }

  // Eliminar producto específico del carrito (NUEVO)
  async removeProductFromCart(cartId, productId) {
    try {
      // Validar IDs
      if (cartId.length !== 24 || productId.length !== 24) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      // Filtrar el producto a eliminar
      const initialLength = cart.products.length;
      cart.products = cart.products.filter(
        item => item.product.toString() !== productId
      );

      // Si no se eliminó nada, el producto no estaba en el carrito
      if (cart.products.length === initialLength) {
        return null;
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error('Error en removeProductFromCart:', error.message);
      return null;
    }
  }

  // Reemplazar todos los productos del carrito (NUEVO)
  async updateCartProducts(cartId, productsArray) {
    try {
      // Validar ID del carrito
      if (cartId.length !== 24) {
        return null;
      }

      // Validar estructura del array de productos
      if (!Array.isArray(productsArray)) {
        return null;
      }

      // Verificar que todos los productos existan y tengan cantidad válida
      for (const item of productsArray) {
        if (!item.product || !item.quantity || item.quantity < 1) {
          return null;
        }

        if (item.product.length !== 24) {
          return null;
        }

        const productExists = await Product.findById(item.product);
        if (!productExists) {
          return null;
        }
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      // Reemplazar productos
      cart.products = productsArray;
      await cart.save();

      return cart;
    } catch (error) {
      console.error('Error en updateCartProducts:', error.message);
      return null;
    }
  }

  // Actualizar cantidad de un producto en el carrito (NUEVO)
  async updateProductQuantity(cartId, productId, quantity) {
    try {
      // Validar IDs y cantidad
      if (cartId.length !== 24 || productId.length !== 24) {
        return null;
      }

      if (!quantity || quantity < 1) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      // Buscar producto en el carrito
      const productIndex = cart.products.findIndex(
        item => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return null; // Producto no está en el carrito
      }

      // Actualizar cantidad
      cart.products[productIndex].quantity = quantity;
      await cart.save();

      return cart;
    } catch (error) {
      console.error('Error en updateProductQuantity:', error.message);
      return null;
    }
  }

  // Vaciar carrito (NUEVO)
  async clearCart(cartId) {
    try {
      // Validar ID
      if (cartId.length !== 24) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      // Vaciar array de productos
      cart.products = [];
      await cart.save();

      return cart;
    } catch (error) {
      console.error('Error en clearCart:', error.message);
      return null;
    }
  }
}

export default CartService;