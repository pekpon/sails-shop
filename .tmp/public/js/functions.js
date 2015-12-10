/* JS FUNCTIONS */
$(function(){
  
  //SETTINGS FORM AJAX
  $("#addSettings").submit(function(event) {
      event.preventDefault();
      $.post('/settings', $('#addSettings').serialize(), function(data){
        window.location.replace("/admin/settings");
      });
  });
  $("#editSettings").submit(function(event) {
      event.preventDefault();
      $.ajax({
        url: $('#editSettings').attr('action'),
        type: 'PUT',
        data: $('#editSettings').serialize(),
        success: function(data) {
          window.location.replace("/admin/settings");
        }
      });
  })
    $('.deleteSettings').click(function(){
        var r = confirm("Are you sure?");
        if(r){
          $.ajax({
            url: '/settings/'+$(this).attr('id'),
            type: 'DELETE',
            success: function(data) {
              window.location.replace("/admin/settings");
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