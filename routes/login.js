const express = require('express');

const { loginView, signupUser, loginUser, logout, home, verifyOtp, resendOtp, profile, editProfile, productLarge, cart, checkout, store, addToCart, deleteCart, wishList, addToWishList, deleteWishList, changePassword, addAddress } = require('../controllers/loginController');

const { loginAdminUser, userManagement, productManagement, orderManagement, productAdd, productPost, productDelete, productEdit, productEditPost, blockUser, activeUser, bannerAdd, bannerManagement, bannerDelete, bannerPost } = require('../controllers/adminController');

const { categoryManagement, categoryDelete, categoryAdd, categoryPost, categoryEditPost, categoryEdit } = require("../controllers/categoryController");

const { protectRoute, allowIf, isActive, isVerified } = require("../auth/protect");

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

router.get('/cart', protectRoute, cart);

router.get('/wishList', protectRoute, wishList);

router.get('/checkout', protectRoute, checkout);

router.get('/store/:id', store);

router.get('/changePassword/:id', changePassword);

router.get("/dashboard", protectRoute, isActive, isVerified, loginAdminUser);

router.get("/add-products", protectRoute, productAdd);

router.get("/add-banners", protectRoute, bannerAdd);

router.get("/banner", protectRoute, bannerManagement);

router.get("/edit-products/:id", protectRoute, productEdit);

router.get("/add-categories", protectRoute, categoryAdd);

router.get("/edit-categories/:id", protectRoute, categoryEdit);

router.get("/profile", protectRoute, profile);

router.get("/addToCart/:id", protectRoute, addToCart);

router.get("/addToWishList/:id", protectRoute, addToWishList);

router.get("/deleteCart/:id", protectRoute, deleteCart);

router.get('/bannerManage/:id', protectRoute, bannerDelete);

router.get('/categoryManage/:id', protectRoute, categoryDelete);

router.get('/productManage/:id', protectRoute, productDelete);

router.get("/deleteWishList/:id", protectRoute, deleteWishList);

router.post("/address/:id", addAddress);

router.post('/signup', signupUser);

router.post('/login', loginUser);

router.post("/add-products", protectRoute, productPost);

router.post('/admin/edit-products/:id', protectRoute, productEditPost);

router.post("/add-categories", protectRoute, categoryPost);

router.post("/add-banners", protectRoute, bannerPost);

router.post('/admin/edit-categories/:id', protectRoute, categoryEditPost);

router.post("/admin/blockuser/:id", blockUser);

router.post('/admin/activeUser/:id', activeUser);

router.post('/verify/:id', verifyOtp);

router.post('/resend', resendOtp);

router.post('/editProfile/:id', editProfile);

module.exports = router;