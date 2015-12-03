/* JS FUNCTIONS */
function addOption(){
  $('.options').append('<p>Name: <input type="text" name="oname" class="" id="" placeholder="Option" required> Stock: <input type="number" name="ostock" class="" id="" placeholder="Stock" value="0" min="0" required> <a href="javascript:void(0)" onclick="removeOption(this)">Remove</a></p>');
}

function removeOption(e){
  $(e).parent().remove();
}


AsyncForEach = function (array, fn, callback) {
    array = array.slice(0);
    var counter=-1;
    function processOne() {
        var item = array.pop();
        counter++;
        fn(item, counter, function(result) {
            if(array.length > 0) {
                setTimeout(processOne, 0);
            } else {
                callback();
            }
        });
    }
    if(array.length > 0) {
        setTimeout(processOne, 0);
    } else {
        callback();
    }
};



var sailsShop = angular.module('sailsShop', []);

sailsShop.controller('shopController', function($scope) {
    $scope.cart = [];
    $scope.itemsInCart = 0;
    $scope.totalOrder = 0;

    getCart();
    function getCart(){
        io.socket.get("/cart", function (data, jwres){
            console.log(data);
            data.qty2 = parseInt(data.qty);
            $scope.cart = data;
            recalculeItemsInCart();
        });
    }

    $scope.saveCartItem = function(index){
        console.log("/cart/" + $scope.cart[index].id);
        io.socket.put("/cart/" + $scope.cart[index].id, {qty: $scope.cart[index].qty}, function (data, jwres){
            console.log(data)
            recalculeItemsInCart();
        })
    }
    
    $scope.addToCart = function (id, quantity){
        if (quantity == undefined) { quantity = 1; }
        io.socket.post("/cart", {product: id, qty: quantity}, function (data, jwres){
            var result = $.grep($scope.cart, function(e){ return e.product.id == data.product.id; });
            if (result.length > 0) {
                var index = $scope.cart.indexOf(result[0]);
                $scope.cart[index].qty = parseInt($scope.cart[index].qty) + parseInt(quantity);
            }else{
                $scope.cart.push(data);
            }
            recalculeItemsInCart();
            
            $(".alert.alert-success").fadeIn().fadeTo(2000, 500).slideUp(500, function(){
                $("#success-alert").alert('close');
            });
        });
    }


    $scope.removeCart = function(index){
        io.socket.delete("/cart", {id: $scope.cart[index].id}, function (data, jwres){
            if (index > -1) {
                $scope.cart.splice(index, 1);
                recalculeItemsInCart();
            }
        });
    }

    function recalculeItemsInCart(){
        var total = 0;
        var totalOrder = 0;
        AsyncForEach($scope.cart, 
            function(item, index, next){
                total += parseInt(item.qty);
                totalOrder += parseInt(item.qty) * item.product.price;
                next()
            }, 
            function (){
                $scope.itemsInCart = total;
                $scope.totalOrder = totalOrder;
                $scope.$apply();
        });
    }
});