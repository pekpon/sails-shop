/* JS FUNCTIONS */

$(function(){
  
  
});

function addToCart(product){
  $.post('/addtocart', {product: product}, function(data){
    console.log(data);
  });
}