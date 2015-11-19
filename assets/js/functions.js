/* JS FUNCTIONS */

$(function(){
  
  
});

function addToCart(product){
  $.post('/addtocart', {product: product}, function(data){
    if(data.code == 200){
      //SHOW MESSAGE
      $(".alert.alert-success").fadeIn();
      //UPDATE CART
    }
  });
}