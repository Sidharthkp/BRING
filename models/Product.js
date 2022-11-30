const mongoose = require("mongoose");

const ProductSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  price: {
    type: Number,
    required: true,
  },
  newPrice: {
    type: Number,
  },
  imgUrl: {
    type: [String],
    required: true,
  },
  category: {
    type: String,
    required: true,
  },
  date: {
    type: Date,
    default: Date.now,
  },
  stock: {
    type: Number,
  },
  quantity: {
    type: Number,
    default: 1
  },
  discount: {
    type: Number,
    default: 0
  }
});
const Product = mongoose.model("Product", ProductSchema);
module.exports = Product;