/* JS FUNCTIONS */

$(function() {


});

function addOption(){
  $('.options').append('<p>Name: <input type="text" name="oname" class="" id="" placeholder="Option" required> Stock: <input type="number" name="ostock" class="" id="" placeholder="Stock" value="0" min="0" required> <a href="javascript:void(0)" onclick="removeOption(this)">Remove</a></p>');
}

function removeOption(e){
  $(e).parent().remove();
}

function addToCart(product, quantity) {
    if (quantity == "undefined") {
        quantity = 1;
    }
    $.post('/addtocart', {
        product: product,
        quantity: quantity
    }, function(data) {
        if (data.code == 200) {
            //SHOW MESSAGE
            $(".alert.alert-success").fadeIn().fadeTo(2000, 500).slideUp(500, function(){
				$("#success-alert").alert('close');
			});
            //UPDATE CART
        }
    });
}
