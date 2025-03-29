const express = require("express");
const passport = require("passport");

const router = express.Router();

// GitHub OAuth Login
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

// GitHub OAuth Callback
router.get(
  "/github/callback",
  passport.authenticate("github", { failureRedirect: "/" }),
  (req, res) => {
    res.redirect("/dashboard"); // Redirect after successful login
  }
);

// Logout Route
router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("/");
  });
});

module.exports = router;
