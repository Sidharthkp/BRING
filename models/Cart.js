const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const CartSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: "User"
    },
    products: {
        type: [ObjectId],
        required: true,
        ref: "Product"
    },
    total: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;