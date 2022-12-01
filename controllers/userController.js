const productModel = require("../models/Product");
const userModel = require("../models/User");
const cartModel = require("../models/Cart");
const bannerModel = require("../models/Banner");
const wishListModel = require("../models/WishList");
const categoryModel = require("../models/Category");
const addressModel = require("../models/Address");
const orderModel = require("../models/Order");
const couponModel = require("../models/Coupons");
const Razorpay = require("razorpay");

const dateTime = new Date()

const home = async (req, res) => {
    const userId = null;
    const count = null;
    const products = await productModel.find({ quantity: 1 })
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
    const Product = await productModel.findOne({ _id: prodId });
    const prod = Product.imgUrl;
    const products = await productModel.find({ category: Product.category, quantity: 1 })
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
    res.render("cart", {
        user: user,
        viewcart,
        count,
        counts,
    });
}

const addToCart = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    const quantity = parseInt(req.params.quantity);
    const price = parseInt(req.params.price);
    const product = await productModel.findById(productId);
    let cart = await cartModel.findOne({ user: userId });
    let itemIndex = cart.products.findIndex(p => p.productId == productId);
    if (product.stock >= quantity) {
        product.stock -= quantity
        if (itemIndex > -1) {
            //product exists in the cart, update the quantity
            let productItem = cart.products[itemIndex];
            productItem.quantity += quantity;
            productItem.subTotal = productItem.quantity * productItem.price;
            cart.total = cart.products.reduce((acc, curr) => {
                return acc + curr.subTotal;
            }, 0)
            await cart.save()
                .then(() => {
                    res.redirect("back");
                })
                .catch(() => {
                    console.log("Error");
                })
        } else {
            console.log(quantity);
            const subTotal = product.newPrice;
            const getCart = await cartModel.findOneAndUpdate({
                user: req.user.id
            },
                {
                    $push: {
                        products: [{ productId, quantity, price, subTotal }],
                    },
                    $inc: {
                        total: product.newPrice
                    }
                }
            );
            await getCart.save()
                .then(() => {
                    res.redirect("back");
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
    const cart = await cartModel.findOne({ user: userId })
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
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()
    if (userDetails.address.length != 0) {
        const address = userDetails.address
        if (viewcart.products.length == 0) {
            console.log("Please add atleast one product");
            res.redirect("/")
        } else {
            res.render("checkout", {
                user: user,
                count,
                viewcart,
                counts,
                address
            });
        }
    } else {
        console.log("please add address");
        res.redirect("/profile")
    }
}

const wishList = async (req, res) => {
    const sort = { date: -1 }
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
    wishListModel.findOne({ user: userId }).populate("products").sort(sort).exec((err, data) => {
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

const addToCartFromWishlist = async (req, res) => {
    const productId = req.params.id;
    const userId = req.user.id;
    const quantity = parseInt(req.params.quantity);
    const price = parseInt(req.params.price);
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
            cart.total = cart.products.reduce((acc, curr) => {
                return acc + curr.subTotal;
            }, 0)
            await cart.save()
                .then(() => {
                    res.redirect("back");
                })
                .catch(() => {
                    console.log("Error");
                })
        } else {
            const subTotal = product.newPrice;
            const getCart = await cartModel.findOneAndUpdate({
                user: req.user.id
            },
                {
                    $push: {
                        products: [{ productId, quantity, price, subTotal }],
                    },
                    $inc: {
                        total: product.newPrice
                    }
                }
            );
            await getCart.save()
                .then(async () => {
                    const removeWishList = await wishListModel.findOneAndUpdate({ user: userId }, { $pull: { products: productId } });
                    await removeWishList.save()
                        .then(() => {
                            res.redirect("back");
                        })
                        .catch(() => {
                            console.log("Error");
                        })
                })
                .catch(() => {
                    console.log("Error");
                })
        }
    }
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
    const products = await productModel.find({ category: catId, quantity: 1 })
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
    const payment_method = req.body.paymentType
    console.log(req.body.paymentType);
    const userId = req.user.id;
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()

    if (payment_method == "cod") {
        console.log("reached on cod");
        res.json({ cod: true });
    } else {
        console.log("reached on online ");
        var instance = new Razorpay({
            key_id: process.env.KEY_ID,
            key_secret: process.env.KEY_SECRET,
        });

        instance.orders.create(
            {
                amount: (viewcart.total) * 100,
                currency: "INR",
                receipt: "asd1234123",
            },
            function (err, order) {
                if (err) {
                    console.log('Error');
                    console.log(err);
                } else {
                    res.json({ order, cod: false });
                    console.log("New Order: ", order);
                }
            }
        );
    }
}

const verifyPayment = async (req, res) => {
    const details = req.body
    console.log(req.body, "dt");
    const crypto = require('crypto')
    let hmac = crypto.createHmac('sha256', process.env.KEY_SECRET)
    hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'], process.env.KEY_SECRET);
    hmac = hmac.digest('hex')

    const orderId = details['order[order][receipt]']
    console.log("Showing orderID");
    console.log(orderId);
    // console.log(hmac,details['payment[razorpay_signature]'],"check match")
    let response = { "cod": false }
    if (details['payment[razorpay_signature]'] == hmac) {
        console.log('order Successfull');
        response = { "cod": true }
    } else {
        response = { "cod": false }
        console.log('payment failed');
    }
    res.send(response);
};

const thankyou = async (req, res) => {
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
    res.render("thankyou", {
        user: user,
        count,
        counts,
    });
}

const orderSuccess = async (req, res) => {
    const userId = req.user.id;
    const Address = await addressModel.findOne({ user: userId })
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()
    const products = viewcart.products
    const newOrderList = new orderModel({
        user: userId,
        products: products,
        address: Address.id,
        total: viewcart.total,
        payment_method: "Razorpay",
        payment_status: "Paid",
        grandTotal: viewcart.grandTotal
    });
    for (let product of products) {
        let id = product.productId
        let stock = product.quantity * -1
        await productModel.updateOne({ _id: id }, { $inc: { stock } })
    }
    await newOrderList.save()
        .then(async () => {
            const cart = await cartModel.findOne({ user: userId })
            cart.total = cart.grandTotal
            cart.save().then(async () => {
                await cartModel.deleteOne({ user: userId })
                res.redirect("/thankyou")
            }).catch(() => {
                console.log("Errors");
                res.redirect("back");
            })
        })
        .catch(() => {
            console.log("Send to Jquery");
        })
}

const orderSuccessCOD = async (req, res) => {
    const userId = req.user.id;
    const Address = await addressModel.findOne({ user: userId })
    const viewcart = await cartModel.findOne({ user: userId }).populate("products.productId").exec()
    const products = viewcart.products;
    const newOrderList = new orderModel({
        user: userId,
        products: products,
        address: Address.id,
        total: viewcart.total,
        payment_method: "Cash On Delivery",
        grandTotal: viewcart.grandTotal
    });
    let PRO
    let flag = 1;
    for (let product of products) {
        let id = product.productId
        const pro = await productModel.findOne({ _id: id });
        PRO = pro.name;
        if (product.quantity > pro.stock) {
            flag = 0
            console.log("NO STOCK");
            break;
        }
    }
    if (flag == 1) {
        for (let product of products) {
            let id = product.productId
            let stock = product.quantity * -1
            await productModel.updateOne({ _id: id }, { $inc: { stock } });
        }
    }
    await newOrderList.save()
        .then(async () => {
            if (flag == 1) {
                const cart = await cartModel.findOne({ user: userId })
                cart.total = cart.grandTotal
                cart.save().then(async () => {
                    await cartModel.deleteOne({ user: userId })
                    res.redirect("/thankyou")
                }).catch(() => {
                    console.log("Errors");
                    res.redirect("back");
                })
            } else {
                console.log("Please remove this item " + PRO + " or reduce the quantity, since it is out of stock")
                res.redirect("/cart");
            }
        })
        .catch(() => {
            console.log("Error");
        })
}

const orderHistory = async (req, res) => {
    const sort = { date: -1 }
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
    const viewOrders = await orderModel.find({ user: userId }).populate("products.productId").sort(sort).exec()
    res.render("history", {
        user: user,
        count,
        counts,
        viewOrders
    });
}

const invoice = async (req, res) => {
    const userId = req.user.id;
    const params = req.params.orderId
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
    const viewInvoice = await orderModel.findOne({ user: userId, _id: params }).populate("products.productId").populate("address").exec()
    res.render("invoice", {
        user: user,
        count,
        counts,
        viewInvoice
    });
}

const cancelOrder = async (req, res) => {
    try {
        const userId = req.user.id;
        const params = req.params.id
        const aw = await orderModel.findOneAndUpdate(
            { "products.productId": params, user: userId, _id: req.params.orderId },
            { $set: { 'products.$.status': "Canceled" } })
        aw.save()
        res.redirect('back')
    } catch (err) {
        console.log(err);
        res.redirect('back')
    }
}

const checkCode = async (req, res) => {
    try {
        const userId = req.user.id
        const couponName = req.body.coupon;
        const couponData = await couponModel.findOne({ name: couponName });
        const coupon = couponData.id
        for(let user of couponData.userId){
            if (user == userId){
                res.json({user: true})
            }
        }
        if (couponData && couponData.status == "Unblocked") {
            res.json({ token: true, coupon });
        } else {
            res.json({ token: false });
        }
    } catch (err) {
        console.log(err);
        console.log("Error");
    }
}

const validCoupon = async (req, res) => {
    const userId = req.user.id
    const cart = await cartModel.findOne({ user: userId })
    const couponId = req.params.id
    const couponSchema = await couponModel.findById(couponId)
    cart.grandTotal = cart.total - ((couponSchema.discount / 100) * cart.total).toFixed(0);
    cart.coupon = couponId
    cart.save().then(async () => {
        await couponModel.findOneAndUpdate({ _id: couponId }, { $push: { userId: userId } });
        res.redirect("back")
    }).catch((err) => {
        console.log(err);
        res.redirect("back");
    })
}

const removeCoupon = async (req, res) => {
    userId = req.user.id
    const cart = await cartModel.findOne({ user: userId }).populate("coupon")
    cart.grandTotal = 0
    const couponId = cart.coupon.id
    await couponModel.findOneAndUpdate({ _id:  couponId}, { $pull: { userId: userId } });
    cart.coupon = null
    cart.save().then(() => {
        res.redirect("back")
    }).catch(() => {
        console.log("Errors");
        res.redirect("back");
    })
}

module.exports = {
    removeCoupon,
    validCoupon,
    checkCode,
    invoice,
    orderSuccessCOD,
    thankyou,
    verifyPayment,
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
    profile,
    editProfile,
    changePassword,
    addAddress,
    orderSuccess,
    addToCartFromWishlist,
}