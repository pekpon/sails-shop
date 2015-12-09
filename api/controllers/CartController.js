

module.exports = {
	cartContents: function (req, callback){
		Cart.find({session: req.session.id}).populate('product').exec(function (err, model){
			if (err) {
				sails.log.debug('Failed to get the list of products in the cart');
				callback("Failed to get the list of products in the cart", null);
            }else {
            	callback(null, model);
            }
		});
	},

	Create: function (req, res) {
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