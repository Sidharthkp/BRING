const User = require("../models/User");
const protectRoute = (req, res, next) => {
    if (req.isAuthenticated()) {
        return next();
    }
    console.log('Please log in to continue');
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
    if (req.user.isActive === true && req.user.verified === true) {
        return next();
    }
    console.log('Your are blocked by the admin');
}

module.exports = {
    protectRoute,
    allowIf,
    isActive
};