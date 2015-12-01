/* JS FUNCTIONS */

$(function() {


});

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
