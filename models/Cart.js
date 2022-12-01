const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const CartSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: "User"
    },
    products: [
        {
            productId:
            {
                type: ObjectId,
                ref: "Product"
            },
            quantity:
            {
                type: Number,
                ref: "Product",
            },
            price: {
                type: Number,
                ref: "Product",
            },
            subTotal: {
                type: Number,
                ref: "Product",
            },
        } 
    ],
    total: {
        type: Number
    },
    date: {
        type: Date,
        default: Date.now,
    },
    coupon: {
        type: ObjectId,
        default: null,
        ref: "Coupons"
    },
    grandTotal: {
        type: Number,
        default: 0
    }
});
const Cart = mongoose.model("Cart", CartSchema);
module.exports = Cart;