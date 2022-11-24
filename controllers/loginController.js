const User = require("../models/User");
const bcrypt = require("bcryptjs");
const passport = require("passport");
const productModel = require("../models/Product");
const categoryModel = require("../models/Category");
const userModel = require("../models/User");
const cartModel = require("../models/Cart");
const wishListModel = require("../models/WishList");
const addressModel = require("../models/Address");
const orderModel = require("../models/Order");
const nodemailer = require('nodemailer');
const bannerModel = require("../models/Banner");
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
    const banners = await bannerModel.findOne({ name: "Main" })
    const user = await userModel.findById(userId)
    res.render("dashboard", {
        user: user,
        count: count,
        products,
        categories,
        banners,
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
    const user = await userModel.findById(userId)
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    userModel.findOne({ _id: userId }).populate("address").exec((err, data) => {
        if (err) {
            return console.log(err);
        }
        console.log(data);
        res.render("profile", {
            user: user,
            data,
            count,
            counts,
        });
    })
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
        .then(async () => {
            const Address = await addressModel.findOne({ user: userId })
            console.log(userId);
            let data = await userModel.findByIdAndUpdate(userId,

                {
                    $push: {
                        address: Address.id,
                    },
                }
            );
            res.redirect('/profile');
        })
        .catch((err) => {
            console.log(err)
            console.log("Error while saving data to the user collection");
        })
}

const productLarge = async (req, res) => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    let prodId = req.params.id;
    console.log(prodId);
    const products = await productModel.find()
    const Product = await productModel.findOne({ _id: prodId });
    const prod = Product.imgUrl;
    const user = await userModel.findById(userId)
    res.render("product", {
        user: user,
        Product,
        products,
        count,
        prod,
        counts
    });
}

const cart = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()
    await cart.save()
        .then(() => {
            res.render("cart", {
                user: user,
                viewcart,
                count,
                counts,
            });
        })
        .catch(() => {
            console.log("Error");
        })
}

const addToCart = async (req, res) => {
    console.log("reached here");
    const productId = req.params.id;
    const userId = req.user.id;
    const quantity = parseInt(req.params.quantity);
    const price = parseInt(req.params.price);
    console.log(">>>>>>>>>>>>>" + productId);
    const product = await productModel.findById(productId);
    let cart = await cartModel.findOne({ user: userId });
    let itemIndex = cart.products.findIndex(p => p.productId == productId);
    if (product.stock >= quantity) {
        // console.log(product.stock);
        // console.log(quantity);
        product.stock -= quantity
        if (itemIndex > -1) {
            //product exists in the cart, update the quantity
            let productItem = cart.products[itemIndex];
            productItem.quantity += quantity;
            productItem.subTotal = productItem.quantity * productItem.price;
            console.log(productItem.subTotal);
            cart.total = cart.products.reduce((acc, curr) => {
                return acc + curr.subTotal;
            }, 0)
            await cart.save()
                .then(() => {
                    res.redirect("/cart");
                })
                .catch(() => {
                    console.log("Error");
                })
        } else {
            console.log(quantity);
            const subTotal = product.price;
            const getCart = await cartModel.findOneAndUpdate({
                user: req.user.id
            },
                {
                    $push: {
                        products: [{ productId, quantity, price, subTotal }],
                    },
                    $inc: {
                        total: product.price
                    }
                }
            );
            await getCart.save()
                .then(() => {
                    res.redirect("/cart");
                })
                .catch(() => {
                    console.log("Error");
                })
        }
    }

}

const deleteCart = async (req, res) => {
    const userId = req.user.id;
    const productId = req.params.id;
    console.log(productId);
    const cart = await cartModel.findOne({ userId })
    const itemIndex = cart.products.findIndex(product => product.productId == productId);
    cart.products.splice(itemIndex, 1)
    cart.total = cart.products.reduce((acc, curr) => {
        return acc + curr.price;
    }, 0)
    await cart.save()
        .then(() => {
            res.redirect("/cart");
        })
        .catch(() => {
            console.log("Error");
        })
}

const quantityIncrement = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    const cart = await cartModel.findOne({ user: userId });
    let itemIndex = cart.products.findIndex(p => p.productId == productId);
    let productItem = cart.products[itemIndex];
    productItem.quantity += 1;
    productItem.subTotal = productItem.quantity * productItem.price;
    cart.total = cart.products.reduce((acc, curr) => {
        return acc + curr.subTotal;
    }, 0)
    await cart.save()
        .then(() => {
            res.redirect("back")
        })
        .catch(() => {
            console.log("Error");
        })
}

const quantitydecrement = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    const cart = await cartModel.findOne({ user: userId });
    let itemIndex = cart.products.findIndex(p => p.productId == productId);
    let productItem = cart.products[itemIndex];
    if (productItem.quantity > 1) {
        productItem.quantity -= 1;
        productItem.subTotal = productItem.quantity * productItem.price;
        cart.total = cart.products.reduce((acc, curr) => {
            return acc + curr.subTotal;
        }, 0)
    }
    await cart.save()
        .then(() => {
            res.redirect("back")
        })
        .catch(() => {
            console.log("Error");
        })
}

const checkout = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    const userDetails = await userModel.findOne({ _id: userId }).populate("address")
    const address = userDetails.address
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()
    res.render("checkout", {
        user: user,
        count,
        viewcart,
        counts,
        address
    });
}

const wishList = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
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
    const removeWishList = await wishListModel.findOneAndUpdate({ user: userId }, { $pull: { products: productId } });
    await removeWishList.save()
        .then(() => {
            res.redirect("/wishList");
        })
        .catch(() => {
            console.log("Error");
        })
}

const store = async (req, res) => {
    let userId = null;
    if (req.user) {
        userId = req.user.id;
    }
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
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

const order = async (req, res) => {
    const userId = req.user.id;
    const Address = await addressModel.findOne({ user: userId })
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()
    const products = viewcart.products

    const newOrderList = new orderModel({
        user: userId,
        products: products,
        address: Address.id,
        total: viewcart.total

    });
    await newOrderList.save()
        .then(async () => {
            await cartModel.deleteOne({ user: userId })
            res.redirect("/");
        })
        .catch(() => {
            console.log("Error in order");
        })
}

const orderHistory = async (req, res) => {
    const userId = req.user.id;
    let count = 0;
    let counts = 0;
    const cart = await cartModel.findOne({ user: userId });
    if (cart) {
        count = cart.products.length;
    }
    const wishList = await wishListModel.findOne({ user: userId });
    if (wishList) {
        counts = wishList.products.length;
    }
    const user = await userModel.findById(userId)
    const viewOrders = await orderModel.find({user: userId}).populate("products.productId").exec()
    res.render("history", {
        user: user,
        count,
        counts,
        viewOrders
    });
}

const cancelOrder = async (req, res) => {
    try {
        const params = req.params.id
        const aw = await orderModel.findOneAndUpdate(
            { "products.productId":  params},
            {$set: {'products.$.status': "Canceled" }})
        aw.save()
        res.redirect('back')
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}

module.exports = {
    cancelOrder,
    order,
    orderHistory,
    quantityIncrement,
    quantitydecrement,
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