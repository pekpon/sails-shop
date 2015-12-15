

module.exports = {
	cartContents: function (req, callback){
		Cart.find({session: req.session.id}).populate('product').exec(function (err, model){
			if (err) {
				sails.log.debug('Failed to get the list of products in the cart');
				callback("Failed to get the list of products in the cart", null);
            }else {
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
		if (!req.isSocket || req.param("id")==null ) { res.json({code:404});return; }
		Cart.destroy({id:req.param("id")}).exec(function deleteCB(err){
		  	sails.sockets.broadcast(req.session.id, "removeItem", { id: req.param("id") });
		});
	},
	Update: function (req, res) {
		if (!req.isSocket || req.param("id")==null ) { res.json({code:404});return; }
		Cart.update({id:req.param("id")},{qty:parseInt(req.param("qty"))}).exec(function afterwards(err, updated){
			if (err) {
				return res.serverError("Error update product of cart");
			}else{
				sails.sockets.broadcast(req.session.id, "saveItem", { item: updated[0] });
			}
		});
	},
	Create: function (req, res) {
		if (!req.isSocket) { res.json({code:404});return; }
		if(req.method=="POST" && req.param("product")!=null && req.param("qty")!=null ){

			Cart.findOne({session: req.session.id, product: req.param("product")}).exec(function (err, model){
				if (err) {
					return res.serverError("Error adding product to cart");
                }else {
                	if (model) {
                		var copyModel = model;
                		copyModel.qty = parseInt(copyModel.qty) + parseInt(req.param("qty"));
                		copyModel.save( function(err, model) {
                			if (err) {
								return res.serverError("Error adding product to cart");
	                		}else {
	                			sails.sockets.broadcast(req.session.id, "saveItem", { item: model });
		                		return res.ok(model);
		                	}
                		});
                	}else{
						Cart.create({qty: req.param("qty"), product: req.param("product"), session: req.session.id}, function(err, model){
							if (err) {
								return res.serverError("Error adding product to cart");
			                }else {
			                	Cart.findOne({id: model.id}).populate('product').exec(function (err, model){
			                		if (err) {
										return res.serverError("Error adding product to cart");
			                		}else {
			                			sails.sockets.broadcast(req.session.id, "addItem", { item: model });
				                		return res.ok(model);
				                	}
				                });
			                }
						});
					}
				}
			});
		}else{
			return res.badRequest();
		}
	},

	Find: function (req, res) {
		if (!req.isSocket) { res.json({code:404});return; }
		sails.controllers.cart.cartContents(req, function(err, model){
			if (err) {
				return res.serverError(err);
            }else {
            	return res.ok(model);
            }
		});
	},

	viewCheckOut: function (req, res){
		sails.controllers.cart.cartContents(req, function(err, model){
			if (err) {
				return res.serverError(err);
            }else {
            	return res.view('cart/checkOut', {cart: model});
            }
		});
	},

	viewCartDetails: function (req, res){
		sails.controllers.cart.cartContents(req, function(err, model){
			if (err) {
				return res.serverError(err);
            }else {
            	return res.view('cart/cartDetails', {cart: model});
            }
		});

	}
}