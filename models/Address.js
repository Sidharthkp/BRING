const mongoose = require("mongoose");

const ObjectId = mongoose.Schema.Types.ObjectId;

const AddressSchema = new mongoose.Schema({
    user: {
        type: ObjectId,
        required: true,
        ref: "User"
    },
    date: {
        type: Date,
        default: Date.now,
    },
    first_name: {
        type: String,
        required: true,
    },
    last_name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    city: {
        type: String,
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    country: {
        type: String,
        required: true,
    },
    zip: {
        type: Number,
        required: true,
    },
    tel: {
        type: Number,
        required: true,
    }
});
const Address = mongoose.model("Address", AddressSchema);
module.exports = Address;