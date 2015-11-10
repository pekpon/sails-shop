/**
* Product.js
*
* @description :: TODO: You might write a short summary of how this model works and what it represents here.
* @docs        :: http://sailsjs.org/#!documentation/models
*/
var async = require('async');

module.exports = {

  tableName: 'products',

  attributes: {
  
    name : { type: 'string'},
    description : { type: 'string'},
    slug : { 
      type: 'string', 
      unique: true
    },
    stock: {type: 'int'},
    images: { type: 'array'},
    category: {
      model: 'category'
    }
  
  },
  
  findCart: function (condition, cb) {
    Product.findOne(condition, function (err, productWithStock) {
      if (err) {
        cb(err, null);
      } else {
        Product.checkStockReservations(productWithStock, function (err, product) {
          if (err) {
            cb(err, null);
          } else {
            //Load Images
            //Image is empty, return empty array
            cb(null, product);
          }
        });
      }    
    });
  },

  checkStockReservations: function (product, cb) {
    Reservation.find({product:product.id, purchased:false, expiry:{ '>=': new Date() }}, function(err, reservations) {
      async.reduce(reservations, 0, function(memo, reservation, rcb){
        rcb(null, memo + parseInt(reservation.qty));
      }, function(err, result){
        product.stock = product.stock-result;
        cb(err, product);
      });      
    });
  }
  
};

