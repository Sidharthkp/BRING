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
            couponStatus: {
                type: Boolean,
                default: false
            }
        }
    ],
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