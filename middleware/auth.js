module.exports = {
  isLoggedIn: function(req, res, next) {
    if (req.session && req.session.user) {
      return next();
    }
    req.flash('error_msg', 'Please log in to view that page.');
    res.redirect('/login');
  },
  isAdmin: function(req, res, next) {
    if (req.session && req.session.user && req.session.user.role === 'admin') {
      return next();
    }
    req.flash('error_msg', 'Access Denied: Admin privileges required.');
    res.redirect('/');
  }
};