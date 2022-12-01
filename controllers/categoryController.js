const categoryModel = require("../models/Category");
const productModel = require("../models/Product");

const categoryManagement = async (req, res) => {
    try {
        const sort = { date: -1 }
        const categories = await categoryModel.find().sort(sort)
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/categoryManage", { categories, Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const categoryAdd = async (req, res) => {
    try {
        if (req.user.isAdmin === true) {
            user = req.user.name;
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/add-categories", { Product })
        }
        else {
            res.render("/")
        }
    } catch {
        res.render("404")
    }
}

const categoryDelete = async (req, res) => {
    try {
        let catId = req.params.id;
        await categoryModel
            .findOneAndDelete({ _id: catId }, { is_deleted: true })
            .then((response) => {
                res.redirect("/categoryManage");
            });
    } catch {
        res.render("404")
    }
}

const categoryEdit = async (req, res) => {
    try {
        let catId = req.params.id;
        console.log(catId);
        let Category = await categoryModel.findOne({ _id: catId });
        console.log(Category);
        if (req.user.isAdmin === true) {
            const PRODUCT = await productModel.find({ stock: 0 });
            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/edit-categories", { Category, Product });
        } else {
            res.redirect("/categoryManage");
        }
    } catch {
        res.render("404")
    }
}

const categoryEditPost = async (req, res) => {
    try {
        const catId = req.params.id;
        const { name } = req.body;
        const categoryImages = req.files != null ? req.files.map((img) => img.filename) : null
        const saveEdits = await categoryModel.findOneAndUpdate(
            { _id: catId },
            {
                name,
                imgUrl: categoryImages
            }
        );
        await saveEdits.save().then(() => {
            res.redirect("/categoryManage");
        }).catch(() => {
            res.render("404")
        });
    } catch {
        res.render("404")
    }
}

const categoryPost = async (req, res) => {
    try {
        const { name } = req.body;
        req.files.forEach(img => { });
        console.log(req.files);
        const categoryImages = req.files != null ? req.files.map((img) => img.filename) : null
        console.log(categoryImages);
        const newCategory = new categoryModel({
            name,
            imgUrl: categoryImages,
        });
        await newCategory.save()
            .then(() => {
                res.redirect("/categoryManage")
            })
            .catch(() => {
                res.render("404")
            })
    } catch {
        res.render("404")
    }
}

module.exports = {
    categoryAdd,
    categoryDelete,
    categoryEdit,
    categoryEditPost,
    categoryManagement,
    categoryPost
}