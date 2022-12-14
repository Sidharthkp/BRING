const express = require('express');

const { home, profile, editProfile, productLarge, cart, checkout, store, addToCart, deleteCart, wishList, addToWishList, deleteWishList, changePassword, addAddress, quantityIncrement, quantitydecrement, order, orderHistory, cancelOrder, verifyPayment, orderSuccess, thankyou, orderSuccessCOD, addToCartFromWishlist, invoice, checkCode, validCoupon, removeCoupon, newAddress, addToWishListFromCart, addAddress2, selectAddress } = require('../controllers/userController');

const { protectRoute, allowIf } = require("../auth/protect");

const router = express.Router();

router.get('/', allowIf, home);

router.get('/product/:id', productLarge);

router.get('/cart', protectRoute, cart);

router.get('/wishList', protectRoute, wishList);

router.get('/checkout', protectRoute, checkout);

router.get('/store/:id', store);

router.get('/invoice/:orderId', protectRoute, invoice);

router.get('/changePassword/:id', protectRoute, changePassword);

router.get("/profile", protectRoute, profile);

router.get("/addToCart/:id/:quantity/:price", protectRoute, addToCart);

router.get("/addToCartFromWishlist/:id/:quantity/:price", protectRoute, addToCartFromWishlist);

router.get("/addToWishList/:id", protectRoute, addToWishList);

router.get("/addToWishListFromCart/:id", protectRoute, addToWishListFromCart);

router.get("/deleteCart/:id", protectRoute, deleteCart);

router.get("/deleteWishList/:id", protectRoute, deleteWishList);

router.get("/button-increment/:id", protectRoute, quantityIncrement);

router.get("/button-decrement/:id", protectRoute, quantitydecrement);

router.get("/orderHistory", protectRoute, orderHistory);

router.get("/canceled/:id/:orderId", protectRoute, cancelOrder);

router.get("/orderSuccess", protectRoute, orderSuccess);

router.get("/orderSuccessCOD", protectRoute, orderSuccessCOD);

router.get("/thankyou", protectRoute, thankyou);

router.get("/validCoupon/:id", protectRoute, validCoupon);

router.get("/removeCoupon", protectRoute, removeCoupon);

router.post("/newAddress", protectRoute, newAddress)

router.post("/verify-payment", protectRoute, verifyPayment);

router.post("/checkCode", protectRoute, checkCode)

router.post("/placeOrder", protectRoute, order);

router.post("/addAddress2", protectRoute, addAddress2);

router.post("/address/:id", protectRoute, addAddress);

router.post('/editProfile/:id', protectRoute, editProfile);

router.post('/selectAddress', protectRoute, selectAddress);

module.exports = router;