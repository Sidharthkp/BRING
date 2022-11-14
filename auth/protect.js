const User = require("../models/User");
const protectRoute = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    // console.log('Please log in to continue');
    res.redirect('/login');
}

const allowIf = (req, res, next) => {
    if (!req.isAuthenticated()) {
        return next();
    }
    res.redirect('/dashboard');
}

const isActive = async (req, res, next) => {
    const user = await User.find()
    if (req.user.isActive === true) {
        return next();
    }
    console.log('Your are blocked by the admin');
}

const isVerified = async (req, res, next) => {
    const user = await User.find()
    if (req.user.verified === true) {
        return next();
    }
    console.log('Please register again and enter the otp to verify your account');
}

module.exports = {
    protectRoute,
    allowIf,
    isActive,
    isVerified,
};