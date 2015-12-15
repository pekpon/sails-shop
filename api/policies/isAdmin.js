module.exports = function(req, res, next) {
   if (req.user.is_admin) {
        req.session.backurl = null;
        return next();
    }
    else{
        return res.redirect('/');
    }
};