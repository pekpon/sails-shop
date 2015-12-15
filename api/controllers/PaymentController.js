var paypal = require('paypal-rest-sdk');
var Redsys = require('redsys');

var paypalConfigOpts = {
    'host': 'api.paypal.com',
    'port': '',
    'client_id': 'ASbNe9uSqdbVRn6WXJq0QsYHXeUNIImacdoyA7G3ov16BVtGuGoYV-5oB10cTl4gju8hC4A6a2VyMwUu',
    'client_secret': 'EFPx8E9Qxgpgv0v3_3Xl82Aid3WtEdQR_9mq7QvvCLAfoewWedfPi6PdbnLNh5Fsd0w2I6reJxiJctWc'
};

var redsysConfigOpts = {
    "merchant": {
        "code": 000000000,
        "terminal": "1",
        "titular": 'Pedro Gracia',
        "name": "SailsShop",
        "secret": 'QWERTYUIOP0123456789'
    },
    'test': true
};

var currency = "EUR";
var amount = 20;
var payment_method = "redsys" // "paypal" // "redsys"

var paymentController = {
  creditcard: function(req, res) {
    switch(payment_method) {
        case "paypal":
            this.creditcardPaypal(req, res);
            break;
        case "redsys":
             this.creditCardRedsys(req, res);
            break;
        default:
           res.render( "payment/error",{error: {'httpStatusCode': 000, 'message': 'Please select a payment method.'}});
    }
  },

  creditCardRedsys: function (req, res){
    var redsys = new Redsys({
      "merchant": redsysConfigOpts.merchant,
      "language": "auto",
      "test": redsysConfigOpts.test
    });
    var d = new Date();
    var orderId= "SaSh" + d.getTime();
    formData = redsys.create_payment({
      total: amount,
      currency: currency,
      order: orderId,
      description: 'Order from Sails Shop ' + amount + " " + currency+ ".",
      data: "CART DATA",
      transaction_type: 0,
      redirect_urls: {
        callback: "http://"+req.host+"/payment/ok",
        return_url: "http://"+req.host+"/payment/ok",
        cancel_url: "http://"+req.host+"/payment/cancel",
      }
    });
  },

  creditcardPaypal: function(req, res) {
    var name = req.param('cardHolder');
    if (name == undefined){ res.view( "payment/index",{layout: 'layout'}); return 0;}
    var firstName = name.split(' ').slice(0, -2).join(' ');
    var lastName = name.split(' ').slice(-2).join(' ');

    var fundingInstruments = [{
        "credit_card": {
          "type": req.param('type'),
          "number": req.param('number').replace(/ /g,''),
          "expire_month": req.param('expireMonth'),
          "expire_year": "20" + req.param('expireYear'),
          "first_name": firstName,
          "last_name": lastName,
          "cvv2":req.param('ccv')
        }
    }];
    //console.log(fundingInstruments);
    var payment = {
      "intent": "sale",
      "payer": {
        "payment_method": 'credit_card',
        "funding_instruments": fundingInstruments
      },
      "redirect_urls":{
        "return_url": "http://"+req.host+"/payment/execute",
        "cancel_url": "http://"+req.host+"/payment/cancel"
      },
      "transactions": [{
        "amount": {
          "currency": currency,
          "total": amount
        },
        "description": 'Order from Sails Shop ' + amount + " " + currency+ "."
      }]
    };
    paypal.configure(paypalConfigOpts);
    console.log(payment);
    paypal.payment.create(payment, function (error, payment) {
      if (error) {
        console.log(error);
        res.render('payment/error', { 'error': error });
      } else {
        req.session.paymentId = payment.id;
        var redirectUrl;
        for(var i=0; i < 3; i++) {
          var link = payment.links[i];
          if (link.method === 'REDIRECT') {
            redirectUrl = link.href;
          }
        }
        res.redirect(redirectUrl);
        // res.render('create', { 'payment': payment });
      }
    });
  },

  paypal: function(req,res) {
    var currency = "EUR";
    var amount = 20;
    var payment = {
      "intent": "sale",
      "payer": {
        "payment_method": 'paypal'
      },
      "redirect_urls":{
        "return_url": "http://"+req.host+"/payment/execute",
        "cancel_url": "http://"+req.host+"/payment/cancel"
      },
      "transactions": [{
        "amount": {
          "currency": currency,
          "total": amount
        },
        "description": 'Order from Sails Shop ' + amount + " " + currency+ "."
      }]
    };
    paypal.configure(paypalConfigOpts);
    paypal.payment.create(payment, function (error, payment) {
      if (error) {
        console.log(error);
        res.render('payment/error', { 'error': error });
      } else {
        req.session.paymentId = payment.id;
        var redirectUrl;
        for(var i=0; i < 3; i++) {
          var link = payment.links[i];
          if (link.method === 'REDIRECT') {
            redirectUrl = link.href;
          }
        }
        res.redirect(redirectUrl);
        // res.render('create', { 'payment': payment });
      }
    });
  },

  updateOrder: function (req, res){
    sails.log("IN UPDATE ORDER");
    sails.log(req.allParams());
    var orderId = req.param('order');
    var code = parseInt(req.param('Ds_Response'));
    var paid = (code < 100) ? true : false;

    var hashcode = req.param('Ds_Amount') + req.param('Ds_Order') + req.param('Ds_MerchantCode') + req.param('Ds_Currency') + req.param('Ds_Response') + sails.config.iberigourmet.redsys.secret;
    var hash = crypto.createHash('sha1').update(hashcode).digest("hex");
    
    sails.log(hashcode);
    sails.log(hash);
    sails.log(req.param('Ds_Signature').toLowerCase());

    if( hash == req.param('Ds_Signature').toLowerCase()) {
      //change order status
      Order.findOne(orderId).populate('user').populate('products').exec(function (err,order) {
        if(err) {
          sails.log.error(err);
          res.serverError();
        } else {        
          if (order) {
            var status = 0;
            if(paid) {
              status = 2;
            } 
            Order.update(orderId, {status:status}, function (err,orderU) {
              if(err) {
                sails.log.error(err);
                res.serverError();
              } else {
                if(paid) {
                  //send mail
                  order.taxes = Order.getTaxes(order);

                  var html = receipt.html(order, req.getLocale());
                  mail.send("<table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td style='text-align: center;'><a href='https://iberigourmet.com/en'><img src='http://i.imgur.com/qmTfByH.jpg'></a></td></tr></table><hr><br>" + req.__('mail.text.neworder', order.user.name+" "+order.user.surname) + "<br>" + html,
                  req.__('mail.subject.neworder', order.ref + 1000),
                  order.user.mail,
                  order.user.username,
                  function(err, message) {
                    sails.log(err || message);
                  });
                }
                //send response
                res.json({});
              }
            });
          } else {
            res.json({});
          }
        }
      });
    } else {
      //hash is not correct
      res.json({});
    }
  },
  
  ok: function (req, res){
    //empty cart
    req.session.cart = [];
    var orderId = req.param('order');
    Order.findOne(orderId).populate('user').populate('products').exec(function (err,order) {
      if(err) {
        sails.log.error(err);
        res.serverError();
      } else {
        //send response
        res.view('payment/success', {order:order});
      }
    });
  },

  execute: function (req, res) {
    var paymentId = req.session.paymentId;
    var payerId = req.param('PayerID');
    var orderId = req.param('order');
    var self = this;

    var details = { "payer_id": payerId };
    var payment = paypal.payment.execute(paymentId, details, function (error, payment) {
      if (error) {
        sails.log.error(error);
        res.serverError();
        //res.render('payment/error', { 'error': error });
      } else {
        //empty cart
        req.session.cart = [];

        //reduce stock for purchased products
        Reservation.reduceStock(req.session.id, function(err) {        
          //disable reservations        
          Reservation.setPurchased(req.session.id, function(err) {});
        });
        //change order status
        Order.update(orderId, {status:2}, function (err,orderU) {
          Order.findOne(orderId).populate('user').populate('products').exec(function (err,order) {
            if(err) {
              sails.log.error(err);
              res.serverError();
            } else {
              //send mail
              if (order) {    
                order.taxes = Order.getTaxes(order);

                var html = receipt.html(order, req.getLocale());
                mail.send("<table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td style='text-align: center;'><img src='http://i.imgur.com/qmTfByH.jpg'></td></tr></table><hr><br>" + req.__('mail.text.neworder', order.user.name+" "+order.user.surname) + "<br>" + html,
                req.__('mail.subject.neworder',order.ref+1000),
                order.user.mail,
                order.user.username,
                function(err, message) {
                  sails.log(err || message);
                });

              }
              //send response
              res.view('payment/success', { 'payment': payment , order:order});
            }
          });
        });
      }
    });
  },

  cancel: function (req, res) {
    //TODO disable purchased products
    Order.update(req.param('order'), {status:0}, function (err,order) {        
      res.view('payment/cancel');
    });
  },

  orderIsAlreadyPaid: function (res, response){
    /// Set order as paid
    res.render('payment/success', { 'payment': response });
  },

  transfer: function(req, res) {
    var orderId = req.param('order');

    Order.findOne(orderId).populate('user').populate('products').exec(function (err,order) {
      if(err) {
        sails.log.error(err);
        res.serverError();
      } else {
        if(req.user && order.user.username == req.user.username) {
          //send mail
          if (order) {    
            order.taxes = Order.getTaxes(order);
            //get total to pay
            var totalToPay = (order.price - order.offer) + order.shipping.cost;
            if(order.coupon && order.coupon.discount > 0) {
              totalToPay = totalToPay - order.coupon.discount;
            }
            //round to two decimals
            var finalPrice = totalToPay.toFixed(2);

            var html = receipt.html(order, req.getLocale());
            mail.send("<table width='100%' border='0' cellspacing='0' cellpadding='0'><tr><td style='text-align: center;'><a href='https://iberigourmet.com/en'><img src='http://i.imgur.com/qmTfByH.jpg'></a></td></tr></table><hr><br>" + req.__('mail.text.transfer', order.user.name+" "+order.user.surname, finalPrice, order.ref+1000) + "<br>" + html,
            req.__('mail.subject.neworder',order.ref+1000),
            order.user.mail,
            order.user.username,
            function(err, message) {
              sails.log(err || message);
            });

          }
          //send response
          res.view('payment/transferSuccess', {order: order});
        } else {
          res.notFound();
        }
      }
    });
  }
};

module.exports = paymentController;