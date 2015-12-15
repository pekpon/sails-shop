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

        passport.authenticate('local', function(err, user, info) {
            if ((err) || (!user)) {
                return res.view('auth/login', {
                    message: info.message,
                    user: user
                });
            }
            req.logIn(user, function(err) {

                if (err) res.send(err);
                if (req.session.backurl){
                  return res.redirect(req.session.backurl);
                }else if(req.param('url')){
                  return res.redirect(req.param('url'));
                }else{
                  return res.redirect('/');
                }
            });

        })(req, res);
    },

    logout: function(req, res) {
        req.logout();
        res.redirect('/');
    }
};
