const userModel = require("../models/User")
const productModel = require("../models/Product")
const categoryModel = require("../models/Category")
const cartModel = require("../models/Cart")
const wishListModel = require("../models/WishList")
const bannerModel = require("../models/Banner")
const orderModel = require("../models/Order")

const loginAdminUser = async (req, res) => {
    const userId = req.user.id;
    const products = await productModel.find()
    const categories = await categoryModel.find()
    const banners = await bannerModel.findOne({ name: "Main" })
    const user = await userModel.findById(userId)
    if (req.user.isAdmin === true) {
        res.render("admin/index", { user: user })
    }
    else {
        let count = 0;
        let counts = 0;
        const usersId = req.user.id;
        console.log(usersId);
        const users = await userModel.findById(usersId)
        const cart = await cartModel.findOne({ user: usersId });
        if (cart) {
            count = cart.products.length;
        }
        const wishList = await wishListModel.findOne({ user: usersId });
        if (wishList) {
            counts = wishList.products.length;
        }
        const carts = await cartModel.findOne({ user: userId });
        if (!carts) {
            const newCart = new cartModel({
                user: req.user.id
            });
            await newCart.save()
                .then(() => {

                })
                .catch(() => {
                    console.log("Error");
                })
        }
        const wish = await wishListModel.findOne({ user: userId });
        if (!wish) {
            const newWishList = new wishListModel({
                user: req.user.id
            });
            await newWishList.save()
                .then(() => {

                })
                .catch(() => {
                    console.log("Error");
                })
        }
        res.render("dashboard", { products, categories, count, counts, banners, user: users });
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
    const { name, description, category, price, stock } = req.body;
    const productImages = req.files.length != 0 ? req.files.map((img) => img.filename) : null
    if (productImages != null && category != null) {
        await productModel.findOneAndUpdate({ _id: prodId }, { $set: { imgUrl: productImages, category } });
    }
    const save_edits = await productModel.findOneAndUpdate(
        { _id: prodId },
        {
            $set: {
                name,
                description,
                price,
                stock,
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
    const { name, description, category, price, stock } = req.body;
    req.files.forEach(img => { });
    console.log(req.files);
    const productImages = req.files != null ? req.files.map((img) => img.filename) : null
    console.log(productImages);
    const newProduct = new productModel({
        name,
        description,
        price,
        category,
        stock,
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

const orderManagement = async (req, res) => {
    const viewProducts = await orderModel.find().populate("products.productId").populate("user").populate("address").exec()
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/orderManage", {
            viewProducts,
        })
    }
    else {
        res.render("/")
    }
}

const dispatched = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(
            req.params.id,
            { status: "Dispatched" })
        res.redirect('back')
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}

const delivered = async (req, res) => {
    try {
        await orderModel.findByIdAndUpdate(
            req.params.id,
            { status: "Delivered" })
        res.redirect('back')
    } catch (err) {
        console.log(err);
        res.redirect('back')
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

const bannerManagement = async (req, res) => {
    const sort = { date: -1 }
    const banners = await bannerModel.find().sort(sort)
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/bannerView", { banners })
    }
    else {
        res.render("/")
    }
}

const bannerAdd = (req, res) => {
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/add-banners")
    }
    else {
        res.render("/")
    }
}

const bannerDelete = async (req, res) => {
    let banId = req.params.id;
    await bannerModel
        .findOneAndDelete({ _id: banId }, { is_deleted: true })
        .then((response) => {
            res.redirect("/banner");
        });
}

const bannerPost = async (req, res) => {
    const { name, source } = req.body;
    const newBanner = new bannerModel({
        name,
        source,
    });
    await newBanner.save()
        .then(() => {
            res.redirect("/banner")
        })
        .catch(() => {
            console.log("Error");
        })
}

const bannerEdit = async (req, res) => {
    let banId = req.params.id;
    console.log(banId);
    let Banner = await bannerModel.findOne({ _id: banId });
    console.log(Banner);
    if (req.user.isAdmin === true) {
        res.render("admin/edit-banners", { Banner });
    } else {
        res.redirect("/banner");
    }
}

const bannerEditPost = async (req, res) => {
    const banId = req.params.id;
    const { name, source } = req.body;
    const saveEdits = await bannerModel.findOneAndUpdate(
        { _id: banId },
        {
            name,
            source
        }
    );
    await saveEdits.save().then(() => {
        res.redirect("/banner");
    }).catch(() => {
        console.log("Error");
    });
}
module.exports = {
    dispatched,
    delivered,
    bannerEdit,
    bannerEditPost,
    bannerAdd,
    bannerDelete,
    bannerManagement,
    bannerPost,
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