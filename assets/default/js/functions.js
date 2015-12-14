/* JS FUNCTIONS */
$(function(){
  
  //SETTINGS FORM AJAX
  $(".ajaxForm").submit(function(event) {
      event.preventDefault();
      $.ajax({
        url: $(this).attr('action'),
        type: $(this).attr('method'),
        data: $(this).serialize(),
        success: function(dat) {
          window.location.replace($(".ajaxForm").data('redirect'));
        }
      });
  });
    $('.ajaxDelete').click(function(){
        var r = confirm("Are you sure?");
        if(r){
          $.ajax({
            url: '/'+$(this).data('model')+'/'+$(this).attr('id'),
            type: 'DELETE',
            success: function(data) {
              window.location.replace("/admin/"+$('.ajaxDelete').data('model'));
            }
          });
        }
    });

});


function addOption(){
  $('.options').append('<div class="row op"><div class="col-sm-7"><input type="text" name="oname" class="form-control col-sm-3" placeholder="Option" required></div><div class="col-sm-3"><input type="number" name="ostock" class="form-control" placeholder="Stock" value="0" min="0" required></div><div class="col-sm-2"><a href="javascript:void(0)" onclick="removeOption(this)" class="btn btn-danger btn-block"><i class="glyphicon glyphicon-trash"></i></a></div></div>');
  disableStock();
}

function disableStock(){
  $('#stockProduct').val(0);
  $('#stockProduct').prop('disabled', true);
}
function enableStock(){
  if($('.op').length < 1)
    $('#stockProduct').prop('disabled', false);
    
}

function removeOption(e){
  $(e).parent().parent().remove();
  enableStock();
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

sailsShop.run([ 'ngCart', function (ngCart) {
    ngCart.init();
}]);
sailsShop.service('ngCart', function($rootScope){
    this.init = function(){
        this.$cart = {
            amount : 0,
            count : 0,
            items : []
        };
        this.load();
    }
    
    this.load = function (){
        var _self = this;
        io.socket.get("/cart", function (data, jwres){
            _self.$cart.items = data;
            _self.recalculeItemsInCart();
        });
    }

    this.addItem = function(id, quantity){
        var _self = this;
        if (quantity == undefined) { quantity = 1; }
        io.socket.post("/cart", {product: id, qty: quantity}, function (data, jwres){
            var result = $.grep(_self.$cart.items, function(e){ return e.product.id == data.product.id; });
            if (result.length > 0) {
                var index = _self.$cart.items.indexOf(result[0]);
                _self.$cart.items[index].qty = parseInt(_self.$cart.items[index].qty) + parseInt(quantity);
                $rootScope.$broadcast('ngCart:itemUpdated', _self.$cart.items[index]);
            }else{
                _self.$cart.items.push(data);
                $rootScope.$broadcast('ngCart:itemAdded', data);
            }
            _self.recalculeItemsInCart();
        });
    }

    this.getCart = function(){
        return this.$cart;
    }

    this.removeItem = function (item) {
        var _self = this;
        var index = _self.$cart.items.indexOf(item);
        io.socket.delete("/cart", {id: _self.$cart.items[index].id}, function (data, jwres){
            if (index > -1) {
                _self.$cart.items.splice(index, 1);
                _self.recalculeItemsInCart();
            }
        });
    }

    this.removeItemByIndex = function (index) {
        var _self = this;
         _self.removeItem(_self.$cart.items[index]);
    }

    this.saveItem = function(index){
        io.socket.put("/cart/" +  _self.$cart.items[index].id, {qty:  _self.$cart.items[index].qty}, function (data, jwres){
            
        })
    }
    this.inCart= function (productID) {
        var _self = this;
        return $.grep(_self.$cart.items, function(e){ return e.product.id == productID; });
    }
    this.recalculeItemsInCart = function(){
        var _self = this;
        var total = 0;
        var totalOrder = 0;
        AsyncForEach(_self.$cart.items, 
            function(item, index, next){
                total += parseInt(item.qty);
                totalOrder += parseInt(item.qty) * item.product.price;
                next()
            }, 
            function (){
                _self.$cart.count = total;
                _self.$cart.amount = totalOrder;
                $rootScope.$broadcast('ngCart:change', {});
        });
    }
   
});
sailsShop.controller('shopController', function($scope, ngCart, $rootScope) {
    $scope.cart = ngCart;

    $rootScope.$on('ngCart:change', function(){
        $scope.$apply();
    });
});