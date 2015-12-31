/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');

module.exports = {
    info: function(req, res) {
    	sails.controllers.product.getSoldItem(req.param('id'), function( product) {
            res.ok(product);
        })
    },
    sendSocketInfo: function (productId){
    	sails.controllers.product.getSoldItem(productId, function(newproduct) {
          sails.sockets.blast('infoProduct', newproduct);
      });
    },
    getSoldItem: function(productId, callback) {
        var totalSold = 0;
        var now = new Date();
        var limitData = new Date(now.getTime() - sails.config.general.cartExpires*60000);
        sails.controllers.cart.clearOldItems();
        
        Product.findOne({id: productId}).exec(function(err, product) {
          if (err) return res.serverError(err);

          if (product){
            Cart.find({
                product: productId, updatedAt: { '>=': limitData }
            }).exec(function(err, items) {
            	if (err) return res.serverError(err);
                async.each(items, function(item, next) {
                    if (item.option != undefined && product.options) {
                        product.options.forEach(function(opt) {
                            if (item.option == opt.name) {
                            	if (opt.sold == undefined) opt.sold = 0;
                                opt.sold += parseInt(item.qty);
                            }
                        })
                    } 
                    totalSold += parseInt(item.qty);
                    next();
                }, function() {
                  product.sold = totalSold;
                	callback(product);
                })
            });
          }else{
            callback(null);
          }
        });
    },
    index: function(req, res, next) {
        Category.find({
            slug: req.param('slug')
        }).populate('products').exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                var response = [];
                if (data.length > 0) {
                    response = {
                        products: data[0].toJSON().products,
                        category: data[0].name
                    };
                }
                return res.view(response);
            }
        });
    },

    show: function(req, res, next) {
        Product.findOne({
            slug: req.param('slug'),
            status: "active"
        }, function(err, product) {
            if (err) return res.serverError(err);
            if (product)
            	sails.controllers.product.getSoldItem(product.id, function(data, options) {
                    product.realStock = data;
                    return res.view({
                    	product: product
                	});
                })
            else
                return res.view('404');
        });
    }
};
