/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  myorders: function(req, res, next) {
    console.log("ORDERS");
    Order.find({user: req.user.id}, function(err, orders){
      return res.view('order/myorders', {orders: orders});
    });
  }
  
};

