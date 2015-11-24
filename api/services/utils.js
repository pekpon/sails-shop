var moment = require('moment');

module.exports = {

  parseDate: function (date) {
    return moment(date).format('DD/MM/YYYY hh:mm');
  },

  onlyDate: function (date) {
    return moment(date).format('DD/MM/YYYY');
  },

  getShipping: function (products){
    var shipping = 0;
    
    for(var i in products){
      if(products[i].shipping > shipping) shipping = products[i].shipping;
    }
    
    return shipping;
  },
  
  getProductsTotal: function (products){
    var total = 0;
    
    for(var i in products)
      total += products[i].price * products[i].qty;
    
    return total;
  },
  
  getOrderTotal: function (products){
    var total = this.getProductsTotal(products) + this.getShipping(products);
    return Math.round(total * 100) / 100;
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
  }
};
