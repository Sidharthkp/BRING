const mongoose = require("mongoose");

const CartSchema = new mongoose.Schema({
    user: {
        type: String,
        required: true,
    },
    products: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;