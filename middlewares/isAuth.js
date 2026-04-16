// middlewares/isAuth.js
module.exports = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    req.user = req.session.user; // 🔥 THIS IS THE KEY LINE
    return next();
  }
  res.redirect("/login");
};