var paypal = require('paypal-rest-sdk');
var Redsys = require('redsys');


var paymentController = {
    
    payment: function (req, res) {
        var dataUpdate = {
            name: req.param("user"),
            surname: req.param("user"),
            phone: req.param("user"),
            city: req.param("user"),
            address: req.param("user"),
            cp: req.param("user"),
            country: req.param("user"),
            province: req.param("user")
        }

        var user = dataUpdate;
        user.id = req.param("id");
        user.email = req.param("email");

        req.session.userDetails = user;

        if (user.id && user.id != undefined) {
            User.update({id: user.id, email: user.email }, dataUpdate, function (err,user) {
                if (err) {     
                    sails.log.error(err);
                    res.render('cart/checkOut', {
                        cart: {}, messagePayment: err.description
                    });
                    return;
                } 
            });
        }

        var method = req.param("method");

        switch (method) {
            case "paypal":
                this.paypal(req, res);
                break;
            case "redsys":
                this.creditCard(req, res);
                break;
            default:
                sails.log.error('Incorrect payment method.');
                res.render('cart/checkOut', {
                    cart: {}, messagePayment:'Incorrect payment method.'
                });
        }
}

    },
    creditCard: function(req, res) {
    
		var user = req.param("user");
        if (user.id) {

        	var dataUpdate = {
		        name: user.name,
		        surname: user.surname,
		        phone: user.phone,
		        city: user.city,
		        address: user.address,
		        cp: user.cp,
		        country: user.country,
		        province: user.province
        	}

        	User.update({id: user.id, email: user.email }, dataUpdate, function (err,user) {
		    	if (err) {     
		        	sails.log.error(err);
		        	res.json({ 'error': error });
		        	return;
		      	} 
		    });
        }

        sails.controllers.cart.amount(req, res, function(err, amount) {
        	if ( amount == 0 ) { 
        		var error = {description: "The total amount of the order is 0."};
        		sails.log.error(error);
	            res.json({ 'error': error });
	            return;
        	}

        	
        });



		Order.findOne(orderId).populate('user').populate('products').exec(function(err, order) {
		    if (err) {
		        sails.log.error(err);
		        res.serverError();
		    } else {
		        if (req.user && order.user.username == req.user.username) {
		            //send mail
		            if (order) {
		                order.taxes = Order.getTaxes(order);
		                //get total to pay
		                var totalToPay = (order.price - order.offer) + order.shipping.cost;
		                if (order.coupon && order.coupon.discount > 0) {
		                    totalToPay = totalToPay - order.coupon.discount;
		                }
		                //round to two decimals
		                var finalPrice = totalToPay.toFixed(2);

		                var html = receipt.html(order, req.getLocale());
		                mail.send("<table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td style='text-align: center;'><a href='https://iberigourmet.com/en'><img src='http://i.imgur.com/qmTfByH.jpg'></a></td></tr></table><hr><br>" + req.__('mail.text.transfer', order.user.name + " " + order.user.surname, finalPrice, order.ref + 1000) + "<br>" + html,
		                    req.__('mail.subject.neworder', order.ref + 1000),
		                    order.user.mail,
		                    order.user.username,
		                    function(err, message) {
		                        sails.log(err || message);
		                    });

		            }
		            //send response
		            res.view('payment/transferSuccess', {
		                order: order
		            });
		        } else {
		            res.notFound();
		        }
		    }
		});
	},
    paypal: function(req, res) {
        var currency = "EUR";

        sails.controllers.cart.amount(req.session.id, function(err, amount) {
        	if ( amount == 0 ) { 
        		var error = "The total amount of the order is 0."
        		sails.log.error(error);
	            res.render('cart/checkOut', { cart: {}, messagePayment: error });
	            return;
        	}
        	
        	var payment = {
                "intent": "sale",
                "payer": {
                    "payment_method": 'paypal'
                },
                "redirect_urls": {
                    "return_url": sails.getBaseurl() + "/payment/execute",
                    "cancel_url": sails.getBaseurl() + "/payment/cancel"
                },
                "transactions": [{
                    "amount": {
                        "currency": currency,
                        "total": amount
                    },
                    "description": 'Order from Sails Shop ' + amount + " " + currency + "."
                }]
            };
            paypal.configure(sails.config.general.paypal);

            paypal.payment.create(payment, function(error, payment) {
	            if (error) {
	                sails.log.error (error);
	                res.render('cart/checkOut', { cart: {}, messagePayment: error.description });
                    return;
	            } else {
	                req.session.paymentId = payment.id;
	                var redirectUrl;
	                for (var i = 0; i < 3; i++) {
	                    var link = payment.links[i];
	                    if (link.method === 'REDIRECT') {
	                        redirectUrl = link.href;
	                    }
	                }
                    res.redirect(redirectUrl);
	            }
	        });
        })
    },

    execute: function(req, res) {
        var user = req.session.userDetails;
        var paymentId = req.session.paymentId;
        var payerId = req.param('PayerID');
        var orderId = req.param('order');
        var self = this;

        var details = {
            "payer_id": payerId
        };
        var payment = paypal.payment.execute(paymentId, details, function(error, payment) {
            if (error) {
                sails.log.error(error);
                res.render('cart/checkOut', { cart: {}, messagePayment: error.description });
                return;
            } else {
            	sails.controllers.cart.finish(req.session.id, user, function(err, order){
            		if (err) {
                        sails.log.error(err);
                        res.render('cart/checkOut', { cart: {}, messagePayment: err.description });
                        return;
                    } else {
                    	var html = receipt.html(order, req.getLocale());
                    	var subject = sails.config.general.shopName + " order confirmation nº " + order.id;
                    	var text = "<b>ORDER CONFIRMATION</b><br><br>Hello " + user.name + " " + user.surname + ",<br><br><b>Thank you for shopping at " + sails.config.general.shopName + "!</b><br><br>Your order has been successfully placed and the full details are listed down below.<br><br>Once your order has been shipped you will be notified by an email that contains your invoice as an attachment<br><br>If you have any queries regarding your order please email us at <a href=\"mailto:" + sails.config.general.contactEmail + "\">" + sails.config.general.contactEmail + "</a>. Don’t forget to specify your order number in the subject of your email.<br><br>Kind regards,<br><br>" + sails.config.general.shopName + " team";
                        mail.send(text + html,
                            subject,
                            user.email,
                            user.name + " " + user.surname,
                            function(err, message) {
                                sails.log(err || message);
                        });
                       	res.view('payment/success',{order: order});
                    }
            	})

            }
        });
    },

    cancel: function(req, res) {
        res.view('cart/checkOut', {
            cart: {}, messagePayment:'Payment has been canceled.'
        });
    }
};

module.exports = paymentController;
