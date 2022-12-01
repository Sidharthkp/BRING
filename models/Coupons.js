const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

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
    expDate: {
        type: Date,
        require: true
    },
    status: {
        type: String
    },
    userId: {
        type: [ObjectId],
        ref: "User"
    }
});
const Coupon = mongoose.model("Coupons", CouponSchema);
module.exports = Coupon;