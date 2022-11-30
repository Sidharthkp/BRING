const mongoose = require("mongoose");

const CouponSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    discount: {
        
    },
    date: {
        type: Date,
        default: Date.now,
    },
});
const Coupon = mongoose.model("Coupons", CouponSchema);
module.exports = Coupon;