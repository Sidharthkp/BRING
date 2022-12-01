const userModel = require("../models/User")
const productModel = require("../models/Product")
const categoryModel = require("../models/Category")
const bannerModel = require("../models/Banner")
const orderModel = require("../models/Order")
const couponModel = require("../models/Coupons");

const dateTime = new Date()

//user management
const userManagement = async (req, res) => {
    try {
        const sort = { date: -1 }
        const users = await userModel.find().sort(sort)
        if (req.user.isAdmin === true) {
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/userManage", { users, Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

//adminside products view
const productManagement = async (req, res) => {
    try {
        const sort = { date: -1 }
        const products = await productModel.find().sort(sort)
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/productManage", { products, Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

//product add page
const productAdd = async (req, res) => {
    try {
        const categories = await categoryModel.find()
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/add-products", { categories, Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}


//product listing
const productList = async (req, res) => {
    try {
        let prodId = req.params.id;
        const List = await productModel
            .findOneAndUpdate({ _id: prodId }, { $set: { quantity: 1 } })
        List.save()
            .then((response) => {
                res.redirect("/productManage");
            });
    } catch {
        res.render("404");
    }
}


//product unlisting
const productUnlist = async (req, res) => {
    try {
        let prodId = req.params.id;
        const Unlist = await productModel
            .findOneAndUpdate({ _id: prodId }, { $set: { quantity: 0 } })
        Unlist.save()
            .then((response) => {
                res.redirect("/productManage");
            });
    } catch {
        res.render("404")
    }
}


//Product Edititng
const productEdit = async (req, res) => {
    try {
        const categories = await categoryModel.find()
        let prodId = req.params.id;
        let product = await productModel.findOne({ _id: prodId });
        if (req.user.isAdmin === true) {
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/edit-products", { Product, categories, product });
        } else {
            res.redirect("/productManage");
        }
    } catch {
        res.render("404")
    }
}


//Post product after editing
const productEditPost = async (req, res) => {
    try {
        const prodId = req.params.id;
        const { name, description, category, price, stock, discount } = req.body;
        const productImages = req.files.length != 0 ? req.files.map((img) => img.filename) : null
        if (productImages != null && category != null) {
            await productModel.findOneAndUpdate({ _id: prodId }, { $set: { imgUrl: productImages, category } });
        }
        let newPrice = price
        if (discount > 0) {
            newPrice = price - ((discount / 100) * price).toFixed(0);
        }
        const save_edits = await productModel.findOneAndUpdate(
            { _id: prodId },
            {
                $set: {
                    name,
                    description,
                    price,
                    stock,
                    discount,
                    newPrice
                },
            }
        );
        await save_edits.save().then(() => {
            res.redirect("/productManage");
        }).catch(() => {
            res.render("404")
        });
    } catch {
        res.render("404")
    }
}

//post product to database
const productPost = async (req, res) => {
    try {
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
            discount,
            imgUrl: productImages,
        });
        await newProduct.save()
            .then(() => {
                res.redirect("/productManage")
            })
            .catch((err) => {
                console.log(err);
                res.render("404")
            })
    } catch {
        res.render("404")
    }
}

const orderManagement = async (req, res) => {
    try {
        const sort = { date: -1 }
        const viewProducts = await orderModel.find().populate("products.productId").populate("user").populate("address").sort(sort).exec()
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/orderManage", {
                viewProducts, Product
            })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const dispatched = async (req, res) => {
    try {
        const params = req.params.id
        const aw = await orderModel.findOneAndUpdate(
            { "products.productId": params, _id: req.params.orderId },
            { $set: { 'products.$.status': "Dispatched" } })
        aw.save()
            .then(() => {
                res.redirect('back')
            })
            .catch(() => {
                res.render("404")
            })
    } catch (err) {
        res.render("404")
    }
}

const delivered = async (req, res) => {
    try {
        const params = req.params.id
        const aw = await orderModel.findOneAndUpdate(
            { "products.productId": params, _id: req.params.orderId },
            { $set: { 'products.$.status': "Delivered" } })
        aw.save()
            .then(() => {
                res.redirect('back')
            })
            .catch(() => {
                res.render("404")
            })
    } catch (err) {
        res.render("404")
    }
}

const blockUser = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(
            req.params.id,
            { isActive: false })
        res.redirect('back')
    } catch (err) {
        res.render("404")
    }
}
const activeUser = async (req, res) => {
    try {
        await userModel.findByIdAndUpdate(
            req.params.id,
            { isActive: true })
        res.redirect('back')
    } catch {
        res.render("404")
    }
}

const bannerManagement = async (req, res) => {
    try {
        const sort = { date: -1 }
        const banners = await bannerModel.find().sort(sort)
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/bannerView", { banners, Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const bannerAdd = async (req, res) => {
    try {
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/add-banners", { Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const bannerDelete = async (req, res) => {
    try {
        let banId = req.params.id;
        await bannerModel
            .findOneAndDelete({ _id: banId }, { is_deleted: true })
            .then((response) => {
                res.redirect("/banner");
            });
    } catch {
        res.render("404")
    }
}

const bannerPost = async (req, res) => {
    try {
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
                res.render("404")
            })
    } catch {
        res.render("404")
    }
}

const bannerEdit = async (req, res) => {
    try {
        let banId = req.params.id;
        console.log(banId);
        let Banner = await bannerModel.findOne({ _id: banId });
        console.log(Banner);
        if (req.user.isAdmin === true) {
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/edit-banners", { Banner, Product });
        } else {
            res.redirect("/banner");
        }
    } catch {
        res.render("404")
    }
}

const bannerEditPost = async (req, res) => {
    try {
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
            res.render("404")
        });
    } catch {
        res.render("404")
    }
}

const couponManagement = async (req, res) => {
    try {
        const sort = { date: -1 }
        const coupons = await couponModel.find().sort(sort)
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/couponView", { coupons, Product, dateTime })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const couponAdd = async (req, res) => {
    try {
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/add-coupon", { Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const couponBlock = async (req, res) => {
    try {
        let coupId = req.params.id;
        const couponStatus = await couponModel
            .findOneAndUpdate({ _id: coupId }, { status: "blocked" })
        couponStatus.save()
            .then((response) => {
                res.redirect("/coupon");
            });
    } catch {
        res.render("404")
    }
}

const couponUnblock = async (req, res) => {
    try {
        let coupId = req.params.id;
        const couponStatus = await couponModel
            .findOneAndUpdate({ _id: coupId }, { status: "Unblocked" })
        couponStatus.save()
            .then((response) => {
                res.redirect("/coupon");
            });
    } catch {
        res.render("404")
    }
}

const couponPost = async (req, res) => {
    try {
        let { name, discount, expDate } = req.body;
        const newCoupon = new couponModel({
            name,
            discount,
            expDate
        })
        await newCoupon.save()
            .then(() => {
                res.redirect("/coupon")
            })
            .catch(() => {
                res.render("404")
            })
    } catch {
        res.render("404")
    }
}
module.exports = {
    couponAdd,
    couponBlock,
    couponUnblock,
    couponManagement,
    couponPost,
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
    userManagement,
    productManagement,
    orderManagement,
    productAdd,
    productPost,
    productList,
    productUnlist,
    productEdit,
    productEditPost
}