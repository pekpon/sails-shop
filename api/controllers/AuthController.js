var passport = require('passport');

module.exports = {

    _config: {
        actions: false,
        shortcuts: false,
        rest: false
    },
    
    printLogin: function(req, res) {
      res.view('auth/login');
    },
  
    printSignUp: function(req, res) {
      res.view('auth/signup');
    },
  
    login: function(req, res) {

        console.log(req.url);
        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.send({
                    message: info.message,
                    user: user
                });
            }
            req.logIn(user, function(err) {
                if (err) res.send(err);
                if (req.param('page') == "checkout")
                  return res.redirect('/cart/checkout');
                else
                  return res.redirect('/');
            });

        })(req, res);
    },

    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    }
};
