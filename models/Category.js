const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    imgUrl: {
        type: [String],
        requires: true,
    }
});
const Category = mongoose.model("Categories", CategorySchema);
module.exports = Category;