const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    discount: {
        type: Number,
        default: 0
    },
    date: {
        type: Date,
        default: Date.now,
    },
    maxLimit: {
        type: Number,
        require: true
    },
    minPurchase: {
        type: Number,
        require: true
    },
    expDate: {
        type: Date,
        require: true
    },
    status: {
        type: String
    }
});
const Coupon = mongoose.model("Coupons", CouponSchema);
module.exports = Coupon;