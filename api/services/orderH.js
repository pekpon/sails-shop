module.exports = {

  status: function (stat, lang) {
    var status = "";
    
    if(lang && lang == "es"){
      switch(stat){
        case "0": status = "<span class='text-danger'>Cancelado</span>"; break;
        case "1": status = "<span class='text-warning'>Pendiente de pago</span>"; break;
        case "2": status = "<span class='text-warning'>Pendiente</span>"; break;
        case "3": status = "<span class='text-success'>Enviado</span>"; break;
        case "4": status = "<span class='text-muted'>Completedo</span>"; break;
        default: status = "..."; break;
      }
    }else{
      switch(stat){
        case "0": status = "Canceled"; break;
        case "1": status = "Pending of payment"; break;
        case "2": status = "Pending"; break;
        case "3": status = "Shipped"; break;
        case "4": status = "Completed"; break;
        default: status = "..."; break;
      }
    }
    
    
    return status;
  }
};

//0 = canceled, 1 = pending_of_payment, 2 = pending, 3 = shipped, 4 = complete