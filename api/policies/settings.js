module.exports = function(req, res, next) {
  
  Settings.find(function (err, settings){
    if (err) {
      res.serverError();      
    } else {
      
      var x = {};
      for(var i = 0; i < settings.length; i++){
        x[settings[i].key] = settings[i].value;
      }
      res.settings = x;
      next();
    }
  });
  
};
