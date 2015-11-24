/**
 * CartController
 *
 * @description :: Server-side logic for managing carts
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */
var async = require('async');

/**
 * `addToSession()`
 * return quantity
 */
var _addToSession = function(req, id, quantity) { 
  var result = quantity;
  if (req.session.cart) {
    var index = _.findIndex(req.session.cart, { id: id });    
    if(index != -1) {
      var y = parseInt(req.session.cart[index].qty) + parseInt(quantity);
      req.session.cart[index].qty = (y +'');
      result = req.session.cart[index].qty;
    } else {
      req.session.cart.push({id:id, qty: quantity});    
    }
  } else {
    req.session.cart = [];
    req.session.cart.push({id:id, qty: quantity});
  }
  _addOrRemoveFromCart(req, id);
  return result;
}

var _addOrRemoveFromCart = function(req, id) {
  var index = _.findIndex(req.session.cart, { id: id });    
  if (index > -1 && req.session.cart[index].qty <= 0) {
    req.session.cart.splice(index, 1);
  }
}

module.exports = {
  
  show: function (req, res) {
    var cart = req.session.cart;
    var products = [];
    
    async.each(cart, function(productIt, callback) {
      Product.findOne(productIt.id, function(err, product){
        product.qty = productIt.qty;
        products.push(product);
        callback();
      });
    }, function(err){
        if( err ) {
          return err;
        } else {
          return res.view({products: products});
        }
    });
  },
  
  /**
   * `CartController.add()`
   */
  add: function (req, res) {
    var productId = req.param('product');
    var quantity = req.param('quantity');;
    Product.findCart(productId, function(err, product) {
      if (err) {
        res.json({code:500});
      } else {
        if(!product || (product.stock <= 0 && quantity > 0)) {
          res.json({code:404});
        } else {
          product.qty = _addToSession(req, productId, quantity);
          if(product.qty <= 0) product = {};
          Reservation.updateFromCart(product, req.session.id, function(err, reservation) {
            if (err) {
              res.json({code:500});
            } else {
              //LOAD PRODUCTS --> NO V0
              res.json({code:200});
            }
          });
        }
      }
    });
  },
  
  checkout: function (req, res) {
    var cart = req.session.cart;
    var products = [];
    
    async.each(cart, function(productIt, callback) {
      Product.findOne(productIt.id, function(err, product){
        product.qty = productIt.qty;
        products.push(product);
        callback();
      });
    }, function(err){
        if( err ) {
          return err;
        } else {
          return res.view({products: products});
        }
    });
  },

  /**
   * `CartController.delete()`
   */
  delete: function (req, res) {
    var productId = req.param('product');

    //Remove from session one product
    if (req.session.cart) {
      var index = _.findIndex(req.session.cart, { id: productId });
      if (index > -1) {
        req.session.cart.splice(index, 1);
      }
    }

    Reservation.updateFromCart({id:productId,qty:0}, req.session.id, function(err, reservation) {
      if (err) {
        res.json({code:500});    
      } else {            
        cart.loadProducts(req.session.cart, req.getLocale(), function(err, lCart) {
          if (err) {
            res.serverError();      
          } else {
            if(req.session.coupon) {  
              req.session.coupon = null;
            }
            res.json({code:200, cart: lCart, weight: cart.getWeight(lCart)});
          }
        });
      }
    });
  },	
};

