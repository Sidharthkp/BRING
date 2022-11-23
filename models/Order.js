const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const OrderSchema = new mongoose.Schema({
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
            }
        }
    ],
    total: {
        type: Number
    },
    address: {
        type: ObjectId,
        ref: "Address"
    },
    date: {
        type: Date,
        default: Date.now,
    },
    status: {
        type: String,
        default: "Order placed"
    }
});
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;