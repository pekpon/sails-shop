/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var slugg = require('slugg');

module.exports = {
  
	index: function(req, res, next) {
       Category.find({ slug: req.param('slug') }).populate('products').exec(function(err, data) {
          if (err) {
              throw err;
          } else {
            var response = [];
            if ( data.length >0 ){ 
              response = {products: data[0].toJSON().products, category: data[0].name}; 
            }
            return res.view( response );
          }
      });
    },
  
    show: function(req, res, next) {
      Product.findOne({slug: req.param('slug'), status: "active"}, function(err, product){
        if(err) return res.serverError(err);
        if(product)
          return res.view({product: product});
        else
          return res.view('404');
      });
    }
};

