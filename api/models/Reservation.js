/**
* Reservation.js
*
* @description :: Cart reservation model, for controling product stocks
* @docs        :: http://sailsjs.org/#!documentation/models
*/

module.exports = {

  tableName: 'reservations',

  attributes: {

    qty : { type: 'int' },
    expiry : { type: 'date' },
    session : { type: 'string' },
    purchased : { type: 'boolean', defaultsTo: false },
    product: {
      model: 'Product'
    }
  },

  updateFromCart: function (product, sessionId, cb) {
    if (parseInt(product.qty) > 0){
      Reservation.find({product:product.id,session:sessionId}).exec( function(err, reservations) {
        if (err) {
          cb(err, null);
        } else {
          if (reservations[0]) {
            //reservation exists, update it
            var paramsU = {
              qty: product.qty,
              expiry: utils.addMinutes(new Date(), 20)
            }
            Reservation.update({product:product.id,session:sessionId}, paramsU, function(err, reservation) {
              cb(err, reservation[0]);
            });            
          } else {
            //reservation doesn't exist, create it
            var paramsC = {
              qty: product.qty,
              session: sessionId,
              product: product.id,
              expiry: utils.addMinutes(new Date(), 20)
            }
            Reservation.create(paramsC, function(err, reservation) {
              cb(err, reservation);
            });
          }
        }
      });
    } else {
      //product deleted, remove reservation
      Reservation.find({product:product.id,session:sessionId}).exec( function(err, reservations) {
        if (err) {
            cb(err, null);
        } else {
          if (reservations[0]) {
            Reservation.destroy(reservations[0].id, function (err, deleted) {
              cb(err, deleted);
            });
          } else {
            cb(null, null);
          }
        }
      });
    }
  },

  updateAll: function (products, sessionId, updateParams, mCb) {
    if(products && products.length > 0) {
      async.each(products, function(product, cb) {
        Reservation.update({product:product.id,session:sessionId}, updateParams, function(err, reservation) {
          cb(err);
        });       
      },mCb)
    } else {
      mCb(null);
    }
  },

  reduceStock: function (sessionId, mCb) {
    Reservation.find({session:sessionId,purchased:false})
    .populate('product')
    .then(function(reservations){
      sails.log(reservations);
      return reservations;      
    }).map(function(reservation) {
      var stock = reservation.product.stock - reservation.qty;
      stock = (stock < 0) ? 0 : stock; 
      Product.update({id:reservation.product.id}, {stock:stock}, function(err, product){
        return reservation;
      });
    }).then(function(reservations) {
      mCb(null);
    }).catch(function(err) {
      mCb(err);
    });          
  },

  setPurchased: function (sessionId, mCb) {
    Reservation.find({session:sessionId,purchased:false})
    .then(function(reservations){
      return Reservation.update({session:sessionId}, {purchased:true});      
    }).then(function(reservation) {
      mCb(null);
    }).catch(function(err) {
      mCb(err);
    });          
  }
};

