/* JS FUNCTIONS */
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

    getCart();
    function getCart(){
        io.socket.get("/cart", function (data, jwres){
            console.log(data);
            $scope.cart = data;
            recalculeItemsInCart();
        });
    }

    $scope.addToCart = function (id, quantity){
        if (quantity == undefined) { quantity = 1; }
        io.socket.post("/cart", {product: id, qty: quantity}, function (data, jwres){
            $scope.cart.push(data);
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
        AsyncForEach($scope.cart, 
            function(item, index, next){
                total += parseInt(item.qty);
                next()
            }, 
            function (){
                $scope.itemsInCart = total;
                $scope.$apply();
        });
    }
});