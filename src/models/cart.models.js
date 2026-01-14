import mongoose from 'mongoose';

const cartSchema = new mongoose.Schema({
  products: [
    {
      product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
      },
      quantity: {
        type: Number,
        required: true,
        min: 1,
        default: 1
      }
    }
  ]
}, {
  timestamps: true,
  versionKey: false
});

// Índice para búsquedas por producto dentro del carrito
cartSchema.index({ 'products.product': 1 });

const Cart = mongoose.model('Cart', cartSchema);

export default Cart;