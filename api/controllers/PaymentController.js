var paypal = require('paypal-rest-sdk');
var async = require('async');
var redsys  =  require('node-redsys-api');
redsys = new redsys.Redsys();
// var Redsys = require('redsys');


var paymentController = {
    updateUser: function (data, callback){
        
        var dataUpdate = {
            sessionID: data.sessionID,
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
            user.id = data.email;
            callback(null, user); // transport user info in req.session
        }
    },
    payment: function (req, res) {
        var data = req.param("data");
        data.sessionID = req.session.id;
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
                        self.redsys(req, res);
                        break;
                    default:
                        sails.log.error('Incorrect payment method.');
                        res.json({error:'Incorrect payment method.'});
                        break;
                }
            }
        })
        
    },
    redsysCallback: function(req, res){
        sails.log("Redsys callback");
        sails.log(req.allParams());
        var params = req.allParams();
        console.log("redsysCallback:", params);
        var notifikey = redsys.createMerchantSignatureNotif( sails.config.settings.redsys.key, params["Ds_MerchantParameters"]);
        var resp = redsys.decodeMerchantParameters( params["Ds_MerchantParameters"] );

        if ( params["Ds_Signature"] == notifikey +"=" ){
            if ( parseInt(resp["Ds_Response"]) < 100 ){
                sails.controllers.payment.finishPayment(resp["Ds_Order"], res);
            }
        };
    },
    redsysOk: function(req, res){
        var _orderID = req.session.orderID;
        sails.log("Redsys response ok");
        sails.log(req.allParams());
        Order.findOne({id: _orderID}).exec(function(err, order) {
            res.view('payment/success',{order: order});
            req.session.orderID = undefined;
        });
    },
    redsysCancel: function (req, res){
        sails.log("Redsys response cancel");
        sails.log(req.allParams());




        res.view('cart/checkOut', {
            cart: {}, messagePayment:'Payment has been canceled.'
        });
    },
    redsys: function(req, res) {
        sails.controllers.cart.cartContents(req, function(error, cart) {
            if (error) {
                sails.log.error (error);
                res.json({error: error });
                return;
            } 

            var cartAmount = 0;
            var shipping = 0;

            async.each(cart, function(cartline, next) {

                var priceLine = parseInt(cartline.qty) * parseFloat(cartline.product.price);
                cartAmount = parseFloat(cartAmount) + parseFloat(priceLine);

                if(cartline.product.shipping > shipping) shipping = cartline.product.shipping;
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

                    var settings = {
                        "version": sails.config.settings.redsys.version,
                        "key": sails.config.settings.redsys.key 
                    }

                    var user = req.session.userDetails;
                    var total = parseFloat(cartAmount) + parseFloat(shipping);

//if exists order delete
                    Order.find({user: user.id, status: 1}).exec(function(err, orders) {
                        orders.forEach( function( item ){
                             Order.destroy({id: item.id}).exec(function deleteCB(err){

                            });
                        });
                    });

                    Order.create({
                        status: 1, shippingAddress: user, user: user.id,  comments: "", amount: parseFloat(cartAmount), shipping: parseFloat(shipping), tax: 21
                    }, function(err, order) {
                        Order.count().exec(function countCB(err, num) {
                            order.number = parseInt(num) + 1728;
                            order.save();
                            req.session.orderID = order.id;
                            var rndnumber = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
                            var params = {
                                "DS_MERCHANT_AMOUNT": parseFloat(total).toFixed(2).toString().replace(".",""),
                                "DS_MERCHANT_ORDER": rndnumber + "-" + order.number.toString(),
                                "DS_MERCHANT_MERCHANTCODE":sails.config.settings.redsys.merchanCode,
                                "DS_MERCHANT_CURRENCY": sails.config.settings.redsys.currency,
                                "DS_MERCHANT_TRANSACTIONTYPE":"0",
                                "DS_MERCHANT_TERMINAL":sails.config.settings.redsys.terminal,
                                "DS_MERCHANT_MERCHANTURL":"http://cazoletos.com/payment/transport",
                                "DS_MERCHANT_URLOK":"http://localhost:1337/payment/ok",
                                "DS_MERCHANT_URLKO":"http://localhost:1337/payment/ko",
                                "DS_MERCHANT_PAYMETHODS": "C"
                            }
   
                            var signature = redsys.createMerchantSignature(sails.config.settings.redsys.key, params);
                            var MerchParams = redsys.createMerchantParameters(params);

                            var form = '<form action="' + sails.config.settings.redsys.url + '" method="post" id="redsys_form" name="redsys_form" >';
                                form += '<input type="hidden" name="Ds_MerchantParameters" value="' + MerchParams + '"/>';
                                form += '<input type="hidden" name="Ds_Signature" value="' + signature + '"/>';
                                form += '<input type="hidden" name="Ds_SignatureVersion" value="' + sails.config.settings.redsys.version + '"/>';
                                
                                form += '</form>';

                            res.json({form: form });
                        });
                        
                    })

                }
            })

        })
		
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
      
                amountSubtotal += parseInt(cartline.qty) * parseFloat(p);
                amountTax += parseInt(cartline.qty) * parseFloat(itemTax);
                var description = cartline.product.description;
                if (cartline.option) {
                    description+=" (" + cartline.option + ")";
                }
	            items.push ({"name": cartline.product.name ,"description": description, "quantity": cartline.qty, "price": parseFloat(p).toFixed(2), "sku": cartline.product.id, "tax": parseFloat(itemTax).toFixed(2) ,"currency": currency})
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

                    //if exists order delete
                    Order.find({user: user.id, status: 1}).exec(function(err, orders) {
                        orders.forEach( function( item ){
                             Order.destroy({id: item.id}).exec(function deleteCB(err){

                            });
                        });
                    });
                 
                    Order.create({
                        status: 1, shippingAddress: user, user: user.id,  comments: "", amount: parseFloat(cartAmount), shipping: parseFloat(shipping), tax: 21
                    }, function(err, order) {
                        Order.count().exec(function countCB(err, num) {
                            order.number = parseInt(num) + 1728;
                            order.save();

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
                                    "description": 'Order (' + order.number + ')from ' + sails.config.settings.shopName ,
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
                                    req.session.orderID = order.id;
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
                        });
                    });
                }
            });
        });
    },
    
    execute: function(req, res) {
        var _orderID = req.session.orderID;
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
                req.session.paymentId = undefined;
                req.session.orderID = undefined;
                sails.controllers.payment.finishPayment(_orderID, res);
            }
        });
    },

    finishPayment: function (orderID, res){
        sails.controllers.cart.cartToOrder(orderID, function(err, order){
            if (err) {
                sails.log.error(err);
                res.json({error: err });
                return;
            } else {
                var fs = require('fs');
                var ejs = require('ejs');

                var html = fs.readFileSync('./views/'+sails.config.settings.template+'/receipt.ejs', 'utf8');
                var file = ejs.compile(html)({ order: order });
                
                var subject = sails.config.settings.shopName + " order confirmation nº " + order.number;
                var text = "<b>ORDER CONFIRMATION</b><br><br>Hello " + order.shippingAddress.name + " " + order.shippingAddress.surname + ",<br><br><b>Thank you for shopping at " + sails.config.settings.shopName + "!</b><br><br>Your order has been successfully placed and the full details are listed down below.<br><br>Once your order has been shipped you will be notified by an email that contains your invoice as an attachment<br><br>If you have any queries regarding your order please email us at <a href=\"mailto:" + sails.config.settings.contactEmail + "\">" + sails.config.settings.contactEmail + "</a>. Don’t forget to specify your order number in the subject of your email.<br><br>Kind regards,<br><br>" + sails.config.settings.shopName + " team<br>";
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
    },
    cancel: function(req, res) {
        var _orderID = req.session.orderID;
        Order.destroy({id: _orderID}).exec(function deleteCB(err){
            req.session.paymentId = undefined;
            req.session.orderID = undefined;
        });
        res.view('cart/checkOut', {
            cart: {}, messagePayment:'Payment has been canceled.'
        });
    }
};

module.exports = paymentController;
