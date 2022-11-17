const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const productModel = require("../models/Product");
const categoryModel = require("../models/Category");
const userModel = require("../models/User");
const cartModel = require("../models/Cart");
const wishListModel = require("../models/WishList");
const addressModel = require("../models/Address");
const nodemailer = require('nodemailer');
const { name, resolveInclude } = require("ejs");
var otp = Math.random();

var Email;
var newUser;
//For Signup Page
const signupView = (req, res) => {
    res.render("signup", {
        user: ""
    });
}

let transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,
    service: 'Gmail',

    auth: {
        user: 'mernstackdevelopermailer@gmail.com',
        pass: 'iompksjrfnskwujc',
    }

});
otp = otp * 1000000;
otp = parseInt(otp);
console.log(otp);

//Post Request that handles Signup
const signupUser = (req, res) => {
    const { name, email, password, confirm } = req.body;
    if (!name || !email || !password || !confirm) {
        alert("Fill the empty fields");
    }
    //Confirm Passwords
    if (password !== confirm) {
        alert("Password must match");
    } else {
        //Validation
        User.findOne({ email: email, verified: true }).then((user) => {
            if (user) {
                console.log("email exists");
                res.render("login", {
                    name,
                    email,
                    password,
                    confirm,
                });
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
                        console.log(email);
                        if (err) throw err;
                        // let User = userModel.findOne({ _id: userId });
                        console.log(User);
                        newUser.password = hash;
                        var mailOptions = {
                            to: newUser.email,
                            subject: "Otp for registration is: ",
                            html: "<h3>OTP for account verification is </h3>" + "<h1 style='font-weight:bold;'>" + otp + "</h1>" // html body
                        };

                        transporter.sendMail(mailOptions, (error, info) => {
                            if (error) {
                                return console.log(error);
                            }
                            console.log('Message sent: %s', info.messageId);
                            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
                        });
                        newUser
                            .save()
                            .then(
                                res.render('otp', { newUser, msg: "Otp has been sent", colour: "green" })
                            )
                            .catch((err) => console.log(err));
                    })
                );
            }
        });
    }
};

const changePassword = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    res.render('changePassword', { user: user, count, counts });
}

const verifyOtp = async (req, res) => {
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
        res.render('otp', { newUser, msg: "Incorrect otp entered", colour: "red" });
    }
}

const resendOtp = function (req, res) {
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
};
// For login View
const loginView = (req, res) => {
    res.render("login", {
        user: req.user
    });
}

const loginUser =
    passport.authenticate("local", {
        successRedirect: "/dashboard",
        failureRedirect: "/login",
    })

const home = async (req, res) => {
    const userId = null;
    const count = null;
    const products = await productModel.find()
    const categories = await categoryModel.find()
    const user = await userModel.findById(userId)
    res.render("dashboard", {
        user: user,
        count: count,
        products,
        categories,
        Category: false,
    });
}

const logout = (req, res) => {
    req.logout((err) => {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/");
        }
    });
}

const profile = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    res.render("profile", { user: user, count, counts });
}

const editProfile = async (req, res) => {
    const userId = req.params.id;
    const { name, email } = req.body;
    const saveUserEdits = await userModel.findOneAndUpdate(
        { _id: userId },
        {
            $set: {
                name,
                email,
            },
        }
    );
    await saveUserEdits.save().then(() => {
        res.redirect("/profile");
    });
}

const addAddress = async (req, res) => {
    const userId = req.params.id;
    const { first_name, last_name, email, address, city, district, state, country, zip, tel } = req.body;
    const Address = await addressModel.findOne({ user: userId });
    const user = await userModel.findById(userId)
    const newAddress = new addressModel({
        user: user,
        first_name,
        last_name,
        email,
        address,
        city,
        district,
        state,
        country,
        zip,
        tel
    });
    console.log(userId);
    await newAddress.save()
        .then(() => {
            res.redirect('/profile');
        })
        .catch(() => {
            console.log("Error while saving data in address collection");
        })
}

const productLarge = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    let prodId = req.params.id;
    console.log(prodId);
    const products = await productModel.find()
    const Product = await productModel.findOne({ _id: prodId })
    const user = await userModel.findById(userId)
    res.render("product", {
        user: user,
        Product,
        products,
        count,
        counts
    });
}

const cart = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    cartModel.findOne({ user: userId }).populate("products").exec((err, data) => {
        if (err) {
            return console.log(err);
        }
        res.render("cart", {
            user: user,
            data,
            count,
            counts,
        });
    })
}

const addToCart = async (req, res) => {
    console.log("reached here");
    const productId = req.params.id;
    const userId = req.user.id;
    console.log(">>>>>>>>>>>>>" + productId);
    const cart = await cartModel.findOne({ user: userId });
    const product = await productModel.findById(productId);
    if (!cart) {
        const newCart = new cartModel({
            user: req.user.id
        });
        await newCart.save()
            .then(() => {
                res.redirect("back");
            })
            .catch(() => {
                console.log("Error");
            })
    }
    const newCart = await cartModel.findOneAndUpdate({
        user: req.user.id
    },
        {
            $push: {
                products: productId,
            },
            $inc: {
                total: product.price
            }
        }
    );
    await newCart.save()
        .then(() => {
            res.redirect("back");
        })
        .catch(() => {
            console.log("Error");
        })

}

const deleteCart = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.id;
    console.log(productId);
    const product = await productModel.findById(productId);
    const removeCart = await cartModel.findOneAndUpdate({ userId }, {
        $pull: { products: productId },
        $inc: {
            total: -product.price
        }
    });
    await removeCart.save()
        .then(() => {
            res.redirect("/cart");
        })
        .catch(() => {
            console.log("Error");
        })
}

const checkout = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    res.render("checkout", {
        user: "user",
        count,
        counts
    });
}

const wishList = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    wishListModel.findOne({ user: userId }).populate("products").exec((err, data) => {
        if (err) {
            return console.log(err);
        }
        res.render("wishList", {
            user: user,
            data,
            count,
            counts
        });
    })
}

const addToWishList = async (req, res) => {
    console.log("reached here");
    const productId = req.params.id;
    const userId = req.user.id;
    console.log(">>>>>>>>>>>>>" + productId);
    const wishList = await wishListModel.findOne({ user: userId });
    if (!wishList) {
        const newWishList = new wishListModel({
            user: req.user.id
        });
        await newWishList.save()
            .then(() => {
                res.redirect("back");
            })
            .catch(() => {
                console.log("Error");
            })
    }
    const newWishList = await wishListModel.findOneAndUpdate({
        user: req.user.id
    },
        {
            $push: {
                products: productId,
            }
        }
    );
    await newWishList.save()
        .then(() => {
            res.redirect("back");
        })
        .catch(() => {
            console.log("Error");
        })

}

const deleteWishList = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.id;
    console.log(productId);
    const removeWishList = await wishListModel.findOneAndUpdate({ userId }, { $pull: { products: productId } });
    await removeWishList.save()
        .then(() => {
            res.redirect("/wishList");
        })
        .catch(() => {
            console.log("Error");
        })
}

const store = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    let catId = req.params.id;
    const products = await productModel.find({ category: catId })
    console.log(products);
    const user = await userModel.findById(userId)
    res.render("store", {
        user: user,
        products,
        count,
        counts
    });
}

module.exports = {
    deleteWishList,
    addToWishList,
    wishList,
    deleteCart,
    addToCart,
    store,
    checkout,
    cart,
    productLarge,
    home,
    logout,
    signupView,
    loginView,
    signupUser,
    loginUser,
    verifyOtp,
    resendOtp,
    profile,
    editProfile,
    changePassword,
    addAddress
};