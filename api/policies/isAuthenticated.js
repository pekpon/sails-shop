module.exports = function(req, res, next) {
   if (req.isAuthenticated()) {
        return next();
    }
    else{
        req.session.backurl = req.originalUrl;
        return res.redirect('/login');
    }
};