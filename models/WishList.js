const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const WishListSchema = new mongoose.Schema({
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
    date: {
        type: Date,
        default: Date.now,
    },
});
const WishList = mongoose.model("WishList", WishListSchema);
module.exports = WishList;