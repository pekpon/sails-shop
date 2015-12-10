/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');

module.exports = {
  
	index: function(req, res, next) {
       Category.find({ slug: req.param('slug') }).populate('products').exec(function(err, products) {
          if (err) {
              throw err;
          } else {
              return res.view({ products: products[0].products });
          }
      });
    },
  
    show: function(req, res, next) {
      Product.findOne({slug: req.param('slug')}, function(err, product){
        if(err) return res.serverError(err);
        if(product)
          return res.view({product: product});
        else
          return res.view('404');
      });
    }
};

