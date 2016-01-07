var paypal = require('paypal-rest-sdk');
var async = require('async');

// var Redsys = require('redsys');


var paymentController = {
    updateUser: function (data, callback){
        
        var dataUpdate = {
            name: data.name,
            surname: data.surname,
            phone: data.phone,
            city: data.city,
            address: data.address,
            cp: data.cp,
            country: data.country,
            province: data.province
        }
        
        if (data.id && data.id != undefined) { // User exists Update Info
            User.update({id: data.id, email: data.email }, dataUpdate, function (err, user) {
                if (err) {     
                    callback(err.description );
                }else{
                    dataUpdate.id = data.id;
                    dataUpdate.email = data.email;
                    callback(null, dataUpdate); // transport user info in req.session
                }
            });
        }else if (data.password && data.password == data.repassword){
            User.findOne({email: data.email}, function (err, userData){
                if (err) {
                    callback( err );
                }else{
                    if (userData){
                        callback("Email exists, Please select another email address.");
                    }else{
                        var InsertData = dataUpdate;
                        InsertData.email = data.email;
                        InsertData.password = data.password;
                        console.log("Account not exists:", InsertData);
                        User.create(InsertData, function (err, user){
                            if (err) {    
                                callback( err );
                            }else{
                                delete InsertData.password;
                                InsertData.id = user.id;
                                callback(null, InsertData); // transport user info in req.session
                            } 
                        });
                    }
                }
            });
            
        }else{
            var user = dataUpdate;
            user.email = data.email;
            callback(null, user); // transport user info in req.session
        }
    },
    payment: function (req, res) {
        var data = req.param("data");
        var self = this;
        self.updateUser(data, function (err, user){
            if (err) {
                sails.log.error(err);
                res.json({error: err});
                return;
            }else{
                req.session.userDetails = user;
                switch (data.method) {
                    case "paypal":
                        self.paypal(req, res, user);
                        break;
                    case "redsys":
                        self.creditCard(req, res);
                        break;
                    default:
                        sails.log.error('Incorrect payment method.');
                        res.json({error:'Incorrect payment method.'});
                        break;
                }
            }
        })
        
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
    paypal: function(req, res, user) {
        var currency = "EUR";
        var tax = 21;

        sails.controllers.cart.cartContents(req, function(error, cart) {
        	if (error) {
                sails.log.error (error);
                res.json({error: error });
                return;
            } 
            
            var cartAmount = 0;
            var shipping = 0;
            var items = [];
          
            var amountSubtotal = 0.00;
            var amountTax = 0.00;
          
            async.each(cart, function(cartline, next) {

	            var priceLine = parseInt(cartline.qty) * parseFloat(cartline.product.price);
	            cartAmount = parseFloat(cartAmount) + parseFloat(priceLine);

	            if(cartline.product.shipping > shipping) shipping = cartline.product.shipping;
	            var itemTax = (parseFloat(cartline.product.price) / 100) * tax;
                var p = cartline.product.price - itemTax;
      
                amountSubtotal += parseFloat(p);
                amountTax += parseFloat(itemTax);

	            items.push ({"name": cartline.product.name ,"description": cartline.product.description + " (" + cartline.option + ")", "quantity": cartline.qty, "price": parseFloat(p).toFixed(2), "sku": cartline.product.id, "tax": parseFloat(itemTax).toFixed(2) ,"currency": currency})
                console.log("PRICE: "+parseFloat(p).toFixed(2)+ ", TAX: " +parseFloat(itemTax).toFixed(2));
                
	            next();
	        }, function(err) {
	        	if (err) {
                    sails.log.error("Error in calculating the amount of cart");
                    res.json({error: "Error in calculating the amount of cart" });
                    return;
                } else {

                    if ( cartAmount == 0 ) { 
                		var error = "The total amount of the order is 0."
                		sails.log.error(error);
        	            res.json({error: error });
        	            return;
                	}

                	var cartTax = (parseFloat(cartAmount) / 100) * tax;
                	var subtotal = parseFloat(cartAmount) - parseFloat(cartTax)
                	var totalCartAmount = parseFloat(cartAmount) + parseFloat(shipping);

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
                                "total": parseFloat(totalCartAmount).toFixed(2),
                                "details": {
                                	"subtotal": amountSubtotal.toFixed(2),
        				        	"tax": amountTax.toFixed(2),
        				         	"shipping": parseFloat(shipping).toFixed(2)
        				        }
                            },
                            "description": 'Order from ' + sails.config.settings.shopName ,
                            "item_list": { "items": items, 
        	                    "shipping_address": {
        		                    "recipient_name": user.name.concat(" ").concat(user.surname).substring(0, 50),
        		                    "line1": user.address,
        		                    "city": user.city,
        		                    "country_code": "ES",
        		                    "postal_code": user.cp
        		                }
        		            }
                        }]
                    };
                  
                    console.log(JSON.stringify(payment, null, 2));
                  
                    paypal.configure(sails.config.settings.paypal);

                    paypal.payment.create(payment, function(error, payment) {
        	            if (error) {
        	                sails.log.error (error);
        	                res.json({error: error.description });
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
                            res.json({redirect: redirectUrl });
        	            }
        	        });
                }
            });
        });
        
    },
    test: function(req, res){
        Order.find({id:1}).populate("lines").exec(function (err, data){
            if ( err ) res.json({error: err });  
            res.view ("receipt",{layout: null, order: data[0]});
        });
        
    },
  
    transport: function(req, res){
      sails.log("Redsys callback");
      sails.log(req.allParams());
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
                res.json({error: error });
                return;
            } else {
            	sails.controllers.cart.finish(req.session.id, user, function(err, order){
            		if (err) {
                        sails.log.error(err);
                        res.json({error: err });
                        return;
                    } else {
                        var fs = require('fs');
                        var ejs = require('ejs');

                        var html = fs.readFileSync('./views/'+sails.config.settings.template+'/receipt.ejs', 'utf8');
                        var file = ejs.compile(html)({ order: order });
                    	
                    	var subject = sails.config.settings.shopName + " order confirmation nº " + order.id;
                    	var text = "<b>ORDER CONFIRMATION</b><br><br>Hello " + user.name + " " + user.surname + ",<br><br><b>Thank you for shopping at " + sails.config.settings.shopName + "!</b><br><br>Your order has been successfully placed and the full details are listed down below.<br><br>Once your order has been shipped you will be notified by an email that contains your invoice as an attachment<br><br>If you have any queries regarding your order please email us at <a href=\"mailto:" + sails.config.settings.contactEmail + "\">" + sails.config.settings.contactEmail + "</a>. Don’t forget to specify your order number in the subject of your email.<br><br>Kind regards,<br><br>" + sails.config.settings.shopName + " team<br>";
                        mail.send(text + file,
                            subject,
                            order.shippingAddress.email,
                            order.shippingAddress.name + " " + order.shippingAddress.surname,
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
