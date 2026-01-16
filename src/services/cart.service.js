import Cart from "../models/cart.models.js";
import Product from "../models/product.models.js";

class CartService {
  async getCarts() {
    try {
      const carts = await Cart.find({});
      return carts;
    } catch (error) {
      console.error("Error en getCarts:", error.message);
      return null;
    }
  }

  // Obtener carrito por ID
  async getCartById(id) {
    try {
      if (id.length !== 24) {
        return null;
      }

      const cart = await Cart.findById(id).populate("products.product");
      return cart;
    } catch (error) {
      console.error("Error en getCartById:", error.message);
      return null;
    }
  }

  // Crear carrito
  async createCart() {
    try {
      const newCart = new Cart({ products: [] });
      await newCart.save();
      return newCart;
    } catch (error) {
      console.error("Error en createCart:", error.message);
      return null;
    }
  }

  // Agregar producto al carrito o incrementar cantidad
  async addProductToCart(cartId, productId) {
    try {
      if (cartId.length !== 24 || productId.length !== 24) {
        return null;
      }
      const productExists = await Product.findById(productId);
      if (!productExists) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }
      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex !== -1) {
        cart.products[productIndex].quantity += 1;
      } else {
        cart.products.push({
          product: productId,
          quantity: 1,
        });
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error en addProductToCart:", error.message);
      return null;
    }
  }

  // Eliminar producto específico del carrito
  async removeProductFromCart(cartId, productId) {
    try {
      if (cartId.length !== 24 || productId.length !== 24) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      const initialLength = cart.products.length;
      cart.products = cart.products.filter(
        (item) => item.product.toString() !== productId
      );

      if (cart.products.length === initialLength) {
        return null;
      }

      await cart.save();
      return cart;
    } catch (error) {
      console.error("Error en removeProductFromCart:", error.message);
      return null;
    }
  }

  async updateCartProducts(cartId, productsArray) {
    try {
      if (cartId.length !== 24) {
        return null;
      }

      if (!Array.isArray(productsArray)) {
        return null;
      }

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

      cart.products = productsArray;
      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error en updateCartProducts:", error.message);
      return null;
    }
  }

  // Actualizar cantidad de un producto en el carrito
  async updateProductQuantity(cartId, productId, quantity) {
    try {
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

      const productIndex = cart.products.findIndex(
        (item) => item.product.toString() === productId
      );

      if (productIndex === -1) {
        return null; // Producto no está en el carrito
      }

      cart.products[productIndex].quantity = quantity;
      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error en updateProductQuantity:", error.message);
      return null;
    }
  }

  // Vaciar carrito (
  async clearCart(cartId) {
    try {
      if (cartId.length !== 24) {
        return null;
      }

      const cart = await Cart.findById(cartId);
      if (!cart) {
        return null;
      }

      cart.products = [];
      await cart.save();

      return cart;
    } catch (error) {
      console.error("Error en clearCart:", error.message);
      return null;
    }
  }
}

export default CartService;
