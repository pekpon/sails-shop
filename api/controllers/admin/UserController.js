module.exports = {
  
  index: function(req, res, next) {
      User.find(function(err, users){
        return res.view({
          layout:'layouts/dashboardLayout', 
          users: users
        });
      });
    },
}