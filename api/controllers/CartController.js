var async = require('async');

module.exports = {
    cartContents: function(req, callback) {
        Cart.find({
            session: req.session.id
        }).populate('product').exec(function(err, model) {
            if (err) {
                sails.log.debug('Failed to get the list of products in the cart');
                callback("Failed to get the list of products in the cart", null);
            } else {
                if (req.isSocket) {
                    sails.sockets.join(req.socket, req.session.id);
                    Cart.watch(req.socket);
                }
                
                callback(null, model);
            }
        });
    },
    clearOldItems: function (){
        var now = new Date();
        var limit = sails.config.settings.cartExpires;
        var limitData = new Date(now.getTime() - limit*60000);

        Cart.find({
            updatedAt: { '<': limitData }
        }).exec(function(err, model) {
            model.forEach(function (item){
                Cart.destroy({
                    id: item.id
                }).exec(function (err) {
                    sails.sockets.broadcast(item.session, "removeItem", [{
                        id: item.id
                    }]);
                })
            });
        });
    },
    Destroy: function(req, res) {
        if (!req.isSocket || req.param("id") == null) {
            res.json({
                code: 404
            });
            return;
        }
        Cart.findOne({
            id: req.param("id")
        }).exec(function (err, model) {
            Cart.destroy({
                id: req.param("id")
            }).exec(function (err) {
                sails.controllers.product.sendSocketInfo(model.product);
                sails.sockets.broadcast(req.session.id, "removeItem", {
                    id: req.param("id")
                });
            });
        });
    },

    Update: function(req, res) {
        if (!req.isSocket || req.param("id") == null) {
            res.json({
                code: 404
            });
            return;
        }
        Cart.update({
            id: req.param("id")
        }, {
            qty: parseInt(req.param("qty"))
        }).exec(function afterwards(err, updated) {
            if (err) {
                return res.serverError("Error update product of cart");
            } else {
                sails.controllers.product.sendSocketInfo(updated[0].product);
                sails.sockets.broadcast(req.session.id, "saveItem", {
                    item: updated[0]
                });
            }
        });
    },
    Create: function(req, res) {
        if (!req.isSocket) {
            res.json({ code: 404 });
            return;
        }
        if (req.method == "POST" && req.param("product") != null && req.param("qty") != null) {

            Cart.findOne({
                session: req.session.id,
                product: req.param("product"),
                option: req.param("option")
            }).exec(function(err, model) {
                if (err) {
                    return res.serverError("Error adding product to cart");
                } else {
                    if (model) {
                        var copyModel = model;
                        copyModel.qty = parseInt(copyModel.qty) + parseInt(req.param("qty"));
                        copyModel.save(function(err, model) {
                            if (err) {
                                return res.serverError("Error adding product to cart");
                            } else {
                                sails.controllers.product.sendSocketInfo(copyModel.product);
                                sails.sockets.broadcast(req.session.id, "saveItem", {
                                    item: model
                                });
                                return res.ok(model);
                            }
                        });
                    } else {
                        Cart.create({
                            qty: req.param("qty"),
                            product: req.param("product"),
                            session: req.session.id,
                            option: req.param("option")
                        }, function(err, model) {
                            if (err) {
                                return res.serverError("Error adding product to cart");
                            } else {
                                sails.controllers.product.sendSocketInfo(req.param("product"));
                                
                                Cart.findOne({
                                    id: model.id
                                }).populate('product').exec(function(err, model) {
                                    if (err) {
                                        return res.serverError("Error adding product to cart");
                                    } else {
                                        sails.sockets.broadcast(req.session.id, "addItem", {
                                            item: model
                                        });
                                        return res.ok(model);
                                    }
                                });
                            }
                        });
                    }
                }
            });
        } else {
            return res.badRequest();
        }
    },
    finish: function(sessionID, user, callback) {
        Cart.find({
            session: sessionID
        }).populate('product').exec(function(err, cart) {
            if (err) {
                sails.log.error('Failed to get the list of products in the cart');
                callback ("Failed to get the list of products in the cart")
            } else {
            	var cartAmount = 0;
                var shipping = 0;

            	// Open a new order
                Order.create({
                    status: 2, shippingAddress: user, user: user.id,  comments: "", amount: cartAmount, tax: 21
                }, function(err, order) {
                    if (err) {
                        sails.log.error("Error open new order");
                        callback ("Error open new order")
                    } else {
                    	var orderLines = [];
		                async.eachSeries(cart, function(cartline, next) {
		                	var pline = parseInt(cartline.qty) * parseFloat(cartline.product.price);
		                	cartAmount = parseFloat(cartAmount) + parseFloat(pline);
                            if ( parseFloat(cartline.product.shipping) > parseFloat(shipping) ){
                              shipping = parseFloat(cartline.product.shipping);
                            }
                            cartline.product.shipping
		                	// Insert Cart line into OrderLines
                            OrderLine.create({name: cartline.product.name, description: cartline.product.description, price: cartline.product.price, shipping: cartline.product.shipping, option: cartline.option, quantity:cartline.qty, images: cartline.product.images, productId: cartline.product.id, order: order.id}, 
		                		function(err,data){
	                    		if (err) {
                                    sails.log.error(err);
                                    sails.log.error("Error on insert order lines");
			                        callback("Error on insert order lines");
			                    } else {
			                    	//Restart stock pieces
                                    Product.findOne(cartline.product.id, function(err, product){
                                        if (err){
                                            sails.log.error("Error on get product Info");
                                            callback("Error on get product Info");
                                        }else{
                                            async.series([
                                                function (nextTask){
                                                    if (cartline.option){
                                                        // If contains option reduce stock from it
                                                        Options = product.options;  
                                                        var newProductStock = 0;                                 
                                                        async.eachSeries(Options, function(Option, nextOption){
                                                            if (Option.name == cartline.option){
                                                                var newStock = parseInt(Option.stock) - parseInt(cartline.qty);
                                                                Option.stock = parseInt(newStock);
                                                            }
                                                            newProductStock += parseInt(Option.stock);
                                                            nextOption();
                                                        }, function(err){
                                                            if (err){
                                                                sails.log.error("Error on calculate new option/product stock");
                                                                callback("Error on calculate new option/product stock");
                                                            }else{
                                                                // Set new Options at the product.
                                                                product.stock = newProductStock;
                                                                product.options = Options;
                                                                nextTask();
                                                            }
                                                        });

                                                    }else{
                                                        // Reduce Stock
                                                        var newStock = parseInt(product.stock) - parseInt(cartline.qty);
                                                        product.stock = newStock;
                                                        nextTask();
                                                    }
                                                },
                                                function (nextTask){
                                                    // When set new Stock in product, save
                                                    product.save(function(err,s){
                                                        if (err) {
                                                            console.log("ERROR: ", err);
                                                        }
                                                        nextTask();
                                                      });
                                                }
                                            ], function (err){
                                                // Next cart item
                                                next();
                                            });
                                        }
                                    })
			                    	
			                    }
	                    	});
		                }, function(err) {
		                    if (err) {
		                        sails.log.error("Error on prepare order lines");
		                        callback("Error on prepare order lines");
		                    } else {
                                Order.count().exec(function countCB(err, num) {
                                  order.amount = cartAmount;
                                  order.shipping = shipping;
                                  order.number = parseInt(num) + 1728;
                                  order.save();
                                });

                                Cart.destroy({session: sessionID}).exec(function deleteCB(err){
                                    if (err) {
                                        sails.log.error("Error on remove cart");
                                        callback("Error on remove cart");
                                    } else {
                                        callback (null, order);
                                    }
                                });
		                    	
		                    }
		                });
                    }
                });
            }
        });
    },
    Find: function(req, res) {
        if (!req.isSocket) {
            res.json({
                code: 404
            });
            return;
        }
        sails.controllers.cart.cartContents(req, function(err, model) {
            if (err) {
                return res.serverError(err);
            } else {
                return res.ok(model);
            }
        });
    },
    viewCheckOut: function(req, res) {
    	sails.controllers.cart.cartContents(req, function(err, model) {
            if (err) {
                return res.serverError(err);
            } else {
                return res.view('cart/checkOut');
            }
        });
    },
    viewCartDetails: function(req, res) {
        sails.controllers.cart.cartContents(req, function(err, model) {
            if (err) {
                return res.serverError(err);
            } else {
                return res.view('cart/cartDetails', {
                    cart: model
                });
            }
        });

    }
}
