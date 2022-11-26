const express = require('express');

const { userManagement, productManagement, orderManagement, productAdd, productPost, productDelete, productEdit, productEditPost, blockUser, activeUser, bannerAdd, bannerManagement, bannerDelete, bannerPost, bannerEdit, bannerEditPost, dispatched, delivered } = require('../controllers/adminController');

const { categoryManagement, categoryDelete, categoryAdd, categoryPost, categoryEditPost, categoryEdit } = require("../controllers/categoryController");

const { protectRoute } = require("../auth/protect");

const router = express.Router();

router.get("/add-categories", protectRoute, categoryAdd);

router.get("/edit-categories/:id", protectRoute, categoryEdit);

router.get('/categoryManage/:id', protectRoute, categoryDelete);

router.get('/categoryManage', protectRoute, categoryManagement);

router.get('/admin/categoryManage/:id', protectRoute, categoryDelete);

router.get('/userManage', protectRoute, userManagement);

router.get('/productManage', protectRoute, productManagement);

router.get('/orderManage', protectRoute, orderManagement);

router.get('/admin/productManage/:id', protectRoute, productDelete);

router.get("/add-products", protectRoute, productAdd);

router.get("/add-banners", protectRoute, bannerAdd);

router.get("/banner", protectRoute, bannerManagement);

router.get("/edit-products/:id", protectRoute, productEdit);

router.get("/edit-banners/:id", protectRoute, bannerEdit);

router.get('/bannerManage/:id', protectRoute, bannerDelete);

router.get('/productManage/:id', protectRoute, productDelete);

router.get("/dispatched/:id/:orderId", protectRoute, dispatched);

router.get("/delivered/:id/:orderId", protectRoute, delivered);

router.post("/add-products", protectRoute, productPost);

router.post('/admin/edit-products/:id', protectRoute, productEditPost);

router.post("/admin/edit-banners/:id", protectRoute, bannerEditPost);

router.post("/add-banners", protectRoute, bannerPost);

router.post("/admin/blockuser/:id", blockUser);

router.post('/admin/activeUser/:id', activeUser);

router.post("/add-categories", protectRoute, categoryPost);

router.post('/admin/edit-categories/:id', protectRoute, categoryEditPost);

module.exports = router;