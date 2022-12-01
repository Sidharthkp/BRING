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
            },
            status: {
                type: String,
                default: "Order placed"
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
    payment_method: {
        type: String,
        default: 'None'
    },
    payment_status: {
        type: String,
        default: "Pending"
    }, 
    grandTotal: {
        type: Number,
        default: 0
    }
});
const Order = mongoose.model("Order", OrderSchema);
module.exports = Order;