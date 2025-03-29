const passport = require("passport");

// @desc  Initiate GitHub OAuth login
// @route GET /auth/github
const githubLogin = passport.authenticate("github", { scope: ["user:email"] });

// @desc  GitHub OAuth callback
// @route GET /auth/github/callback
const githubCallback = (req, res) => {
  passport.authenticate("github", { failureRedirect: "/login" }, (err, user) => {
    if (err || !user) {
      return res.redirect("/login");
    }
    req.login(user, (err) => {
      if (err) return res.redirect("/login");
      return res.redirect("/dashboard");
    });
  })(req, res);
};

// @desc  Logout user
// @route GET /auth/logout
const logout = (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
};

module.exports = { githubLogin, githubCallback, logout };
