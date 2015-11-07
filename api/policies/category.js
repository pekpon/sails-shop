module.exports = function(req, res, next) {
  
  Category.find(function (err, categories){
    if (err) {
      res.serverError();      
    } else {
      res.menu = categories;
      next();
    }
  });
  
};
