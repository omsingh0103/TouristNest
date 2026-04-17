// middlewares/isAuth.js
module.exports = (req, res, next) => {
  if (req.session && req.session.isLoggedIn) {
    req.user = req.session.user;
    return next();
  }
  console.log("🔒 Access Denied: User not logged in. Redirecting to /login");
  res.redirect("/login");
};