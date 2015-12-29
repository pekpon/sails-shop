/**
 * OrderController
 *
 * @description :: Server-side logic for managing Orders
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

var OrderController = {
  
	index: function(req, res, next) {
      Order.find(function(err, orders){
        return res.view({
          layout:'layouts/dashboardLayout', 
          orders: orders
        });
      });
    },
  
    edit: function(req, res, next) {
    Order.find({id: req.param('id')}).populate("lines").exec(function (err, data){
      if ( err ) res.json({error: err });  
      res.view({layout:'layouts/dashboardLayout', order: data[0]});
    });
  }
  
};

module.exports = OrderController;