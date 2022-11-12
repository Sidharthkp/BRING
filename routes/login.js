const express = require('express');

const { loginView, signupUser, loginUser, logout, home, verifyOtp, resendOtp, profile, editProfile, productLarge, cart, checkout, store } = require('../controllers/loginController');

const { loginAdminUser, userManagement, productManagement, orderManagement, productAdd, productPost, productDelete, productEdit, productEditPost, blockUser, activeUser } = require('../controllers/adminController');

const { categoryManagement, categoryDelete, categoryAdd, categoryPost, categoryEditPost, categoryEdit } = require("../controllers/categoryController");

const { protectRoute, allowIf, isActive } = require("../auth/protect");

const router = express.Router();

router.get('/login', allowIf, loginView);

router.get('/', allowIf, home);

router.get('/logout', logout);

router.get('/userManage', protectRoute, userManagement);

router.get('/productManage', protectRoute, productManagement);

router.get('/categoryManage', protectRoute, categoryManagement);

router.get('/orderManage', protectRoute, orderManagement);

router.get('/admin/productManage/:id', protectRoute, productDelete);

router.get('/admin/categoryManage/:id', protectRoute, categoryDelete);

router.get('/product/:id', productLarge);

router.get('/cart', cart);

router.get('/checkout', checkout);

router.get('/store', store);

//Dashboard
router.get("/dashboard", protectRoute, isActive, loginAdminUser);

router.get("/add-products", protectRoute, productAdd);

router.get("/edit-products/:id", protectRoute, productEdit);

router.get("/add-categories", protectRoute, categoryAdd);

router.get("/edit-categories/:id", protectRoute, categoryEdit);

router.get("/profile", protectRoute, profile)

router.post('/signup', signupUser);

router.post('/login', loginUser);

router.post("/add-products", protectRoute, productPost);

router.post('/productManage', protectRoute, productDelete);

router.post('/admin/edit-products/:id', protectRoute, productEditPost);

router.post("/add-categories", protectRoute, categoryPost);

router.post('/categoryManage', protectRoute, categoryDelete);

router.post('/admin/edit-categories/:id', protectRoute, categoryEditPost);

router.post("/admin/blockuser/:id", blockUser);

router.post('/admin/activeUser/:id', activeUser);

router.post('/verify/:id', verifyOtp);

router.post('/resend', resendOtp);

router.post('/editProfile/:id', editProfile);

module.exports = router;