const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const userModel = require("../models/User");
const nodemailer = require('nodemailer');
const productModel = require("../models/Product");
const cartModel = require("../models/Cart");
const bannerModel = require("../models/Banner");
const wishListModel = require("../models/WishList");
const categoryModel = require("../models/Category");
const orderModel = require("../models/Order")
var otp = Math.random();

const dateTime = new Date()

var Email;
var newUser;
//For Signup Page
const signupView = (req, res) => {
    try {
        res.render("signup", {
            user: ""
        });
    } catch {
        res.render("404")
    }
}

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 456,
    secure: true,
    service: "Gmail",

    auth: {
        user: process.env.USER_EMAIL,
        pass: process.env.USER_PASS,
    }

});
otp = otp * 1000000;
otp = parseInt(otp);

//Post Request that handles Signup
const signupUser = (req, res) => {
    try {
        const { name, email, password, confirm } = req.body;
        if (!name || !email || !password || !confirm) {
            res.json({ empty: true });
        }
        //Confirm Passwords
        if (password !== confirm) {
            res.json({ match: true });
        } else {
            //Validation
            User.findOne({ email: email, verified: true }).then((user) => {
                if (user) {
                    res.json({ users: true });
                } else {
                    //Validation
                    newUser = new User({
                        name,
                        email,
                        password,
                    });
                    Email = email;
                    //Password Hashing
                    bcrypt.genSalt(10, (err, salt) =>
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            // const email = req.body.email;
                            if (err) throw err;
                            // let User = userModel.findOne({ _id: userId });
                            newUser.password = hash;
                            var mailOptions = {
                                to: newUser.email,
                                subject: "Otp for registration is: ",
                                html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                            };

                            transporter.sendMail(mailOptions, (error, info) => {
                                if (error) {
                                    res.json({ wrong: true });
                                }
                                console.log('Message sent: %s', info.messageId);
                                console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                            });
                            newUser
                                .save()
                                .then(() => {
                                    const users = newUser.id;
                                    res.json({ keys: true, users })
                                })
                                .catch((err) => res.render("404"))
                        })
                    );
                }
            });
        }
    } catch {
        res.render("404")
    }
};

const otpView = (req, res) => {
    try {
        const newUser = req.params.id;
        res.render("otp", { newUser })
    } catch {
        res.render("404")
    }
}

const loginAdminUser = async (req, res) => {
    try {
        const userId = req.user.id;
        const products = await productModel.find({ quantity: 1 })
        const categories = await categoryModel.find()
        const banners = await bannerModel.findOne({ name: "Main" })
        const user = await userModel.findById(userId)
        if (req.user.isAdmin === true) {
            const PRODUCT = await productModel.find({ stock: 0 });
            const products = await productModel.find();
            const users = await userModel.find();
            const orders = await orderModel.find();
            const orderCount = orders.length
            let todayOrderCount = 0;
            let todaysRevenue = 0;
            let totalRevenue = 0;
            const currDate = dateTime.toISOString().slice(0, 10);
            for (let i = 0; i < orderCount; i++) {
                let date = orders[i].date.toISOString().slice(0, 10);
                totalRevenue += orders[i].total;
                if (date == currDate) {
                    ++todayOrderCount;
                    todaysRevenue += orders[i].total
                }
            }

            let Product = 0
            if (PRODUCT.length != 0) {
                Product = 1;
            }
            res.render("admin/index", { user: user, Product, products, users, orders, orderCount, todayOrderCount, totalRevenue, todaysRevenue })
        }
        else {
            let count = 0;
            let counts = 0;
            const usersId = req.user.id;
            console.log(usersId);
            const users = await userModel.findById(usersId)
            const cart = await cartModel.findOne({ user: usersId });
            if (cart) {
                count = cart.products.length;
            }
            const wishList = await wishListModel.findOne({ user: usersId });
            if (wishList) {
                counts = wishList.products.length;
            }
            const carts = await cartModel.findOne({ user: userId });
            if (!carts) {
                const newCart = new cartModel({
                    user: req.user.id
                });
                await newCart.save()
            }
            const wish = await wishListModel.findOne({ user: userId });
            if (!wish) {
                const newWishList = new wishListModel({
                    user: req.user.id
                });
                await newWishList.save()
            }
            res.render("dashboard", { products, categories, wish, count, counts, banners, user: users });
        }
    } catch {
        res.render("404")
    }
}

const verifyOtp = async (req, res) => {
    try {
        let userId = req.params.id;
        if (req.body.otp == otp) {
            await userModel.findOneAndUpdate(
                { _id: userId },
                { $set: { verified: true } }
            );
            await userModel.deleteMany({ verified: false });
            res.redirect('/login');
        }
        else {
            console.log("OTp incorrect");
        }
    } catch {
        res.render("404")
    }
}

const resendOtp = function (req, res) {
    try {
        var mailOptions = {
            to: Email,
            subject: "Otp for registration is: ",
            html:
                "<h3>OTP for account verification is </h3>" +
                "<h1 style='font-weight:bold;'>" +
                otp +
                "</h1>", // html body
        };
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                return console.log(error);
            }
            console.log("Message sent: %s", info.messageId);
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
            res.render("otp", { newUser, msg: "Otp has been sent", colour: "green" });
        });
    } catch {
        res.render("404")
    }
};
// For login View
const loginView = (req, res) => {
    try {
        res.render("login", {
            user: req.user
        });
    } catch {
        res.render("404")
    }
}

const loginUser =
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    })

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
}

module.exports = {
    loginUser,
    logout,
    signupView,
    loginView,
    signupUser,
    verifyOtp,
    resendOtp,
    loginAdminUser,
    otpView
};
