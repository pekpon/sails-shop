/**
 * OrderController
 *
 * @description :: Server-side logic for managing orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	
  myorders: function(req, res, next) {
    Order.find({user: req.user.id}, function(err, orders){
      console.log("ORDERS");
      return res.view('order/myorders', {orders: orders});
    });
  },
  
  showmyorder: function(req, res, next) {
    Order.find({user: req.user.id, id: req.param('id')}).populate("lines").exec(function (err, data){
      if ( err ) res.json({error: err });  
      res.view ('order/show',{order: data[0]});
    });
  }
  
};

