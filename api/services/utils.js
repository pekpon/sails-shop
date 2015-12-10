var moment = require('moment');

module.exports = {

  parseDate: function (date) {
    return moment(date).format('DD/MM/YYYY hh:mm');
  },

  onlyDate: function (date) {
    return moment(date).format('DD/MM/YYYY');
  },

  	getShipping: function (cart){
	    var shipping = 0;
	    for(var i in cart){
	      	if(cart[i].product.shipping > shipping) shipping = cart[i].product.shipping;
	    }
	    return shipping;
  	},
  
	getProductsTotal: function (cart){
		var total = 0;
		for(var i in cart){
			total += cart[i].product.price * cart[i].qty;
		}
		return total;
	},

	getOrderTotal: function (cart){
		var total = this.getProductsTotal(cart) + this.getShipping(cart);
		return Math.round(total * 100) / 100;
	},
  
  getOptions: function (products){
    var html = "";
    
    for(var i in products){
      html += '<div class="row"><div class="col-sm-7"><input type="text" name="oname" class="form-control col-sm-3" placeholder="Option" value="'+products[i].name+'" required></div><div class="col-sm-3"><input type="number" name="ostock" class="form-control" placeholder="Stock" value="'+products[i].stock+'" min="0" required></div><div class="col-sm-2"><a href="javascript:void(0)" onclick="removeOption(this)" class="btn btn-danger btn-block"><i class="glyphicon glyphicon-trash"></i></a></div></div>';
    }
    
    return html;
  },
  
  getFeaturedColSize: function (featured){
    var size = "4";
    
    switch(featured.length){
      case 1: size = "12"; break;
      case 2: size = "6"; break;
      case 3: size = "4"; break;
      case 4: size = "3"; break;
      default: size = "4"; break;
    }
    
    return size;
  },
  
  getMailchimpId: function(lang) {
    var id = "51f45e6d3e";
    
    switch(lang){
      case "ES": id = "51f45e6d3e"; break;
      case "EN": id = "3a5ed2644b"; break;
      case "FR": id = "dc2ee33560"; break;
      default: id = "51f45e6d3e"; break;
    }
    
    return id;
  },
  
  addMinutes: function(date, minutes) {
    return new Date(date.getTime() + minutes*60000);
  },

  redsysLang: function(local) {
    var lang = "0";
    if(local == "ES") {
      lang = "1"
    }
    if(local == "EN") {
      lang = "2"
    }
    if(local == "FR") {
      lang = "4"
    }

    return lang;
  },
  
  getMenu: function(){
    Category.find(function (err, categories){
      return categories;
    });
  }
};
