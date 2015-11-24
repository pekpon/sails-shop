/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
  
  account: function(req, res, next) {
    if (req.user){
      User.findOne(req.user.id, function(err, user){
        if (err) throw err;
        return res.view({user: user});
      });
    }else{
      return res.redirect('/login');
    }
  },
  
  update: function(req, res, next) {
    
    var paramObj = {
        name: req.param('name'),
        surname: req.param('surname'),
        phone: req.param('phone'),
        city: req.param('city'),
        address: req.param('address'),
        cp: req.param('cp'),
        country: req.param('country'),
        province: req.param('province'),
        surname: req.param('surname'),
    }

    User.update(req.user.id, paramObj, function (err,user) {
      if (err) {     
        sails.log.error(err);
      } else {
        req.flash('success', 'Changes saved!');
        res.redirect('/account');
      }
    });

  }
  
};

