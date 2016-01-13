/**
 * ProductController
 *
 * @description :: Server-side logic for managing Products
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */



var CartController = {
  	index: function(req, res){
        Cart.find({}).sort('session ASC').populate('product').exec(function(err, data) {
            if (err) {
                throw err;
            } else {
                return res.view({
		          layout:'layouts/dashboardLayout', 
		          carts: data
		        });
            }
        });
    }
};

module.exports = CartController;
