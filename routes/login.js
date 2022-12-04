const express = require('express');

const { loginView, signupUser, logout, verifyOtp, resendOtp, loginUser, loginAdminUser, signupView, otpView } = require('../controllers/loginController');

const { allowIf, protectRoute, isActive, isVerified } = require("../auth/protect");

const router = express.Router();

router.get('/login', allowIf, loginView);

router.get('/signupPage', allowIf, signupView);

router.get('/logout', logout);

router.get('/otp/:id', otpView);

router.get("/dashboard", protectRoute, isActive, isVerified, loginAdminUser);

router.post('/signup', signupUser);

router.post('/login', loginUser);

router.post('/verify/:id', verifyOtp);

router.post('/resend', resendOtp);

module.exports = router;