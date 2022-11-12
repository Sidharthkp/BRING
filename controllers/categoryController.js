const categoryModel = require("../models/Category");

const categoryManagement = async (req, res) => {
    const sort = { date: -1 }
    const categories = await categoryModel.find().sort(sort)
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/categoryManage", { categories })
    }
    else {
        res.render("/")
    }
}

const categoryAdd = (req, res) => {
    if (req.user.isAdmin === true) {
        user = req.user.name;
        res.render("admin/add-categories")
    }
    else {
        res.render("/")
    }
}

const categoryDelete = async (req, res) => {
    let catId = req.params.id;
    await categoryModel
        .findOneAndDelete({ _id: catId }, { is_deleted: true })
        .then((response) => {
            res.redirect("/categoryManage");
        });
}

const categoryEdit = async (req, res) => {
    let catId = req.params.id;
    console.log(catId);
    let Category = await categoryModel.findOne({ _id: catId });
    console.log(Category);
    if (req.user.isAdmin === true) {
        res.render("admin/edit-categories", { Category });
    } else {
        res.redirect("/categoryManage");
    }
}

const categoryEditPost = async (req, res) => {
    const catId = req.params.id;
    const { name } = req.body;
    const saveEdits = await categoryModel.findOneAndUpdate(
        { _id: catId },
        {
            $set: {
                name,
            },
        }
    );
    await saveEdits.save().then(() => {
        res.redirect("/categoryManage");
    }).catch(() => {
        console.log("Error");
    });
}

const categoryPost = async (req, res) => {
    const { name } = req.body;
    const newCategory = new categoryModel({
        name,
    });
    await newCategory.save()
        .then(() => {
            res.redirect("/categoryManage")
        })
        .catch(() => {
            console.log("Error");
        })
}

module.exports = {
    categoryAdd,
    categoryDelete,
    categoryEdit,
    categoryEditPost,
    categoryManagement,
    categoryPost
}