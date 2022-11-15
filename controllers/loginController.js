const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const productModel = require("../models/Product");
const categoryModel = require("../models/Category");
const userModel = require("../models/User");
const cartModel = require("../models/Cart");
const nodemailer = require('nodemailer');
const { name } = require("ejs");
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
    const products = await productModel.find()
    const categories = await categoryModel.find()
    const user = await userModel.findById(userId)
    res.render("dashboard", {
        user: user,
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
    const userId = req.user.id
    const user = await userModel.findById(userId)
    res.render("profile", { user: user });
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

const productLarge = async (req, res) => {
    let prodId = req.params.id;
    console.log(prodId);
    const products = await productModel.find()
    const Product = await productModel.findOne({ _id: prodId })
    res.render("product", {
        user: "",
        Product,
        products
    });
}

const cart = (req, res) => {
    const userId = req.user.id;
    cartModel.findOne({ user: userId }).populate("products").exec((err, data) => {
        if(err){
            return console.log(err);
        }
        console.log(data);
        res.render("cart", {
            user: "",
            data
        });  
    })
}

const addToCart = async (req, res) => {
    console.log("reached here");
    const productId = req.params.id;
    const userId = req.user.id;
    console.log(">>>>>>>>>>>>>" + productId);
    const cart = await cartModel.findOne({user: userId});
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

const checkout = (req, res) => {
    res.render("checkout", {
        user: ""
    });
}

const store = async (req, res) => {
    let catId = req.params.id;
    const products = await productModel.find({ category: catId })
    console.log(products);
    res.render("store", {
        user: "",
        products,
    });
}

module.exports = {
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
    editProfile
};