module.exports = function(req, res, next) {
  
  var qty = 0;
  var cart = req.session.cart;
  
  if(cart){
    for(var i in cart){
      qty += cart[i].qty;
    }
  }
  
  req.cartItems = qty;
  next();
}