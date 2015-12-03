module.exports = function(req, res, next) {
   if (req.user.is_admin) {
        return next();
    }
    else{
        return res.redirect('/');
    }
};