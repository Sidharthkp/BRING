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
                window.location.href = "/orderSuccess";
                console.log(response);
            } else {
                razorpayPayment(response);
            }
        },
    });
});

function razorpayPayment(order) {
    console.log(order.order.id,"order")
    var options = {
        key: "rzp_test_P5UVBo7REfUbfI", // Enter the Key ID generated from the Dashboard
        amount: 2342, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        currency: "INR",
        name: "BRING",
        description: "Test Transaction",
        image: "",
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
            email: "gaurav.kumar@example.com",
            contact: "9999999999",
        },
        notes: {
            address: "Razorpay Corporate Office",
        },
        theme: {
            color: "#3399cc",
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