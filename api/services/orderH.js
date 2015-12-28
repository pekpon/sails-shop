module.exports = {

  status: function (order) {
    var status = "";
    switch(order.status){
      case "0": status = "Canceled"; break;
      case "1": status = "Pending of payment"; break;
      case "2": status = "Pending"; break;
      case "3": status = "Shipped"; break;
      case "4": status = "Completed"; break;
    }
    
    return status;
  }
}

//0 = canceled, 1 = pending_of_payment, 2 = pending, 3 = shipped, 4 = complete