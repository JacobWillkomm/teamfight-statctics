module.exports = {
  ensureAdmin: function (req, res, next) {
    if(req.user.role === "admin"){
      return next();
    }else{
      res.redirect("/")
    }
  },
  ensureAuth: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  },
  ensureGuest: function (req, res, next) {
    if (!req.isAuthenticated()) {
      return next();
    } else {
      res.redirect("/");
    }
  }
};
