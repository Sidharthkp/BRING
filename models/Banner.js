const mongoose = require("mongoose");

const BannerSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    date: {
        type: Date,
        default: Date.now,
    },
    source: {
        type: String,
        requires: true,
    }
});
const Banner = mongoose.model("Banners", BannerSchema);
module.exports = Banner;