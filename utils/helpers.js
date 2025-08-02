import CartItem from "../models/cartItemModel.js";
import Cart from "../models/cartModel.js";

const updateCartTotals = async (cartId) => {
  const cartItems = await CartItem.find({ cart: cartId });
  const totalAmount = cartItems.reduce((sum, item) => {
    return sum + item.price * item.quantity;
  }, 0);
  const totalItems = cartItems.reduce((sum, item) => {
    return sum + item.quantity;
  }, 0);

  await Cart.findByIdAndUpdate(cartId, {
    totalAmount,
    totalItems,
    updatedAt: new Date(),
  });
};

const getCartWithItems = async (cartId) => {
  const cart = await Cart.findById(cartId);
  const cartItems = await CartItem.find({ cart: cartId })
    .populate("game", "title price imageUrl")
    .sort({ createdAt: -1 });

  return {
    ...cart.toObject(),
    items: cartItems,
  };
};

export default {
  updateCartTotals,
  getCartWithItems,
};
