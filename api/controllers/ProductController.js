/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');

module.exports = {
  
	index: function(req, res, next) {
      Category.findOne({slug: req.param('slug')}, function(err, cat){
        if(err){
          throw err;
        }else{
          Product.find({category:cat.id},function(err2, products){
            if(err2) {
              throw err2;
            }else{
              return res.view({products: products}); 
            }
          });
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

