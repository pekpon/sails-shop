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
                    //, _.pluck(model, 'session')
                    Cart.watch(req.socket);
                }
                callback(null, model);
            }
        });
    },
    Destroy: function(req, res) {
        if (!req.isSocket || req.param("id") == null) {
            res.json({
                code: 404
            });
            return;
        }
        Cart.destroy({
            id: req.param("id")
        }).exec(function deleteCB(err) {
            sails.sockets.broadcast(req.session.id, "removeItem", {
                id: req.param("id")
            });
        });
    },
    amount: function (sessionID, callback){
    	Cart.find({
            session: sessionID,
        }).populate('product').exec(function(err, cart) {
            if (err) {
                sails.log.debug('Failed to get the list of products in the cart');
                callback("Failed to get the list of products in the cart", null);
            } else {
            	var cartAmount = 0;
                async.each(cart, function(cartline, next) {
		            var pline = parseInt(cartline.qty) * parseFloat(cartline.product.price);
		            cartAmount = parseFloat(cartAmount) + parseFloat(pline);
		            next();
		        }, function(err) {
		        	if (err) {
                        sails.log.error("Error in calculating the amount of cart");
                        callback("Error in calculating the amount of cart");
                    } else {
                    	callback(null, cartAmount);
                    }
		        });
            }
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

            	// Open a new order
                Order.create({
                    status: 2, shippingAddress: user, user: user.id,  comments: "", amount: cartAmount, tax: 21
                }, function(err, order) {
                    if (err) {
                        sails.log.error("Error open new order");
                        callback ("Error open new order")
                    } else {
                    	var orderLines = [];
		                async.each(cart, function(cartline, next) {
		                	var pline = parseInt(cartline.qty) * parseFloat(cartline.product.price);
		                	cartAmount = parseFloat(cartAmount) + parseFloat(pline);
		                	// Insert Cart line into OrderLines
		                	OrderLine.create({name: cartline.product.name, description: cartline.product.description, slug: cartline.product.slug, price: cartline.product.price, shipping: cartline.product.shipping, option: cartline.option, quantity:cartline.qty, images: cartline.product.images, productId: cartline.product.id, order: order.id}, 
		                		function(err,data){
	                    		if (err) {
			                        sails.log.error("Error on insert order lines");
			                        callback("Error on insert order lines");
			                    } else {
			                    	//Restart stock pieces
			                    	var newStock = parseInt(cartline.product.stock) - parseInt(quantity.quantity);
			                    	Product.update(cartline.product.id, {stock: newStock},  function(err, product){
			                    		if (err) {
			                        		sails.log.error("Error on change prodcut stock");
			                        		callback("Error on change prodcut stock");
			                    		}else{
			                    			next();
			                    		}
			                    	});
			                    }
	                    	});
		                }, function(err) {
		                    if (err) {
		                        sails.log.error("Error on prepare order lines");
		                        callback("Error on prepare order lines");
		                    } else {
		                    	order.amount = cartAmount;
		                    	order.save();
		                    	callback (null, order);
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
