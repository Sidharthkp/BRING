const userModel = require("../models/User")
const productModel = require("../models/Product")
const categoryModel = require("../models/Category")
const cartModel = require("../models/Cart")

const loginAdminUser = async (req, res) => {
    const userId = req.user.id;
    const products = await productModel.find()
    const categories = await categoryModel.find()
    const user = await userModel.findById(userId)
    if (req.user.isAdmin === true) {
        res.render("admin/index", { user: user })
    }
    else {
        let count = 0;
        const userId = req.user.id;
        const cart = await cartModel.findOne({ userId });
        if (cart) {
            count = cart.products.length;
        }
        res.render("dashboard", { products, categories, count, user: user });
    }
}

const userManagement = async (req, res) => {
    const sort = { date: -1 }
    const users = await userModel.find().sort(sort)
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/userManage", { users })
    }
    else {
        res.render("/")
    }
}

const productManagement = async (req, res) => {
    const sort = { date: -1 }
    const products = await productModel.find().sort(sort)
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/productManage", { products })
    }
    else {
        res.render("/")
    }
}

const productAdd = async (req, res) => {
    const categories = await categoryModel.find()
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/add-products", { categories })
    }
    else {
        res.render("/")
    }
}

const productDelete = async (req, res) => {
    let prodId = req.params.id;
    await productModel
        .findOneAndDelete({ _id: prodId }, { is_deleted: true })
        .then((response) => {
            res.redirect("/productManage");
        });
}

const productEdit = async (req, res) => {
    const categories = await categoryModel.find()
    let prodId = req.params.id;
    console.log(prodId);
    let Product = await productModel.findOne({ _id: prodId });
    console.log(Product);
    if (req.user.isAdmin === true) {
        res.render("admin/edit-products", { Product, categories });
    } else {
        res.redirect("/productManage");
    }
}

const productEditPost = async (req, res) => {
    const prodId = req.params.id;
    const { name, description, category, price } = req.body;
    const productImages = req.files != null ? req.files.map((img) => img.filename) : null
    const save_edits = await productModel.findOneAndUpdate(
        { _id: prodId },
        {
            $set: {
                name,
                description,
                price,
                category,
                imgUrl: productImages
            },
        }
    );
    await save_edits.save().then(() => {
        res.redirect("/productManage");
    }).catch(() => {
        console.log("Error");
    });
}

const productPost = async (req, res) => {
    const { name, description, category, price } = req.body;
    req.files.forEach(img => { });
    console.log(req.files);
    const productImages = req.files != null ? req.files.map((img) => img.filename) : null
    console.log(productImages);
    const newProduct = new productModel({
        name,
        description,
        price,
        category,
        imgUrl: productImages,
    });
    await newProduct.save()
        .then(() => {
            res.redirect("/productManage")
        })
        .catch(() => {
            console.log("Error");
        })
}

const orderManagement = (req, res) => {
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/orderManage")
    }
    else {
        res.render("/")
    }
}

const blockUser = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(
            req.params.id,
            { isActive: false })
        res.redirect('back')
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}
const activeUser = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(
            req.params.id,
            { isActive: true })
        res.redirect('back')
    } catch {
        console.log(err);
        res.redirect('back')
    }
}

module.exports = {
    blockUser,
    activeUser,
    loginAdminUser,
    userManagement,
    productManagement,
    orderManagement,
    productAdd,
    productPost,
    productDelete,
    productEdit,
    productEditPost
}