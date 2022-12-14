$("#couponCode").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: "/checkCode",
        method: "post",
        data: $("#couponCode").serialize(),
        success: (response) => {
            const coupon = response.coupon
            if (response.token) {
                Swal.fire({
                    position: 'top-end',
                    icon: 'success',
                    title: 'Coupon added',
                    showConfirmButton: false,
                    timer: 1500
                })
                window.location.href = `/validCoupon/${coupon}`;
            } else if (response.user) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Coupon already taken!',
                })
            } else if (response.min) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Add more products to apply coupon!',
                })
            } else if (response.max) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Coupon limit exceeded!',
                })
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Invalid Coupon!',
                })
            }
        },
    });
});

$("#checkout-form").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: "/placeOrder",
        method: "post",
        data: $("#checkout-form").serialize(),
        success: (response) => {

            console.log(response);
            if (response.cod) {
                console.log("reached here");
                window.location.href = "/orderSuccessCOD";
                console.log(response);
            } else {
                razorpayPayment(response);
            }
        },
    });
});

function razorpayPayment(order) {
    var options = {
        key: "rzp_test_P5UVBo7REfUbfI", // Enter the Key ID generated from the Dashboard
        amount: order.order.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "BRING",
        description: "Test Transaction",
        image: "/public/img/LOGO.png",
        order_id: order.order.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        callback_url: "https://eneqd3r9zrjok.x.pipedream.net/",
        handler: function (response) {
            // alert(response.razorpay_payment_id);
            // alert(response.razorpay_order_id);
            // alert(response.razorpay_signature)
            verifyPayment(response, order);
        },
        prefill: {
            name: "BRING",
            email: "BRING@brototype.com",
            contact: "216987239134",
        },
        notes: {
            address: "Razorpay Corporate Office",
        },
        theme: {
            color: "#D10024",
        },
    };
    function verifyPayment(payment, order) {
        $.ajax({
            url: "/verify-payment",
            data: {
                payment,
                order,
            },
            method: "post",
            success: (response) => {
                if (response.cod) {
                    console.log("worked");
                    location.href = "/orderSuccess";
                } else {
                    alert("payment failed");
                }
            },
        });
    }
    var rzp1 = new Razorpay(options);
    rzp1.open();
}


//signup

$("#registering").submit((e) => {
    e.preventDefault();
    $.ajax({
        url: "/signup",
        method: "post",
        data: $("#registering").serialize(),
        success: (response) => {
            const newUser = response.users;
            if (response.empty == true) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Please fill all the fields!',
                })
            } else if (response.match == true) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Passwords must match!',
                })
            } else if (response.users == true) {
                Swal.fire('User already exists with same email')
            } else if (response.wrong == true) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: 'Something went wrong!',
                })
            } else if (response.keys == true) {
                window.location.href = `/otp/${newUser}`;
            }
        }
    });
});


function deleteCart(prodId) {
    Swal.fire({
        title: 'Are you sure ?',
        showDenyButton: true,
        showCancelButton: true,
        confirmButtonText: 'Add to wishlist',
        denyButtonText: `Delete`,
    }).then((result) => {
        
        if (result.isConfirmed) {
            Swal.fire('Moved to wishlist!', '', 'success')
            window.location.href = `/addToWishListFromCart/${prodId}`;
        } else if (result.isDenied) {
            Swal.fire('Deleted', '', 'info')
            window.location.href = `/deleteCart/${prodId}`;
        }
    })
}
