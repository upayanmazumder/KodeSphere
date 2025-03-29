const express = require("express");
const passport = require("passport");

const router = express.Router();

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/github/callback", passport.authenticate("github", {
  failureRedirect: "http://localhost:3000/login",
  session: true
}), (req, res) => {
  res.redirect("http://localhost:3000/dashboard");
});

router.get("/logout", (req, res) => {
  req.logout(() => {
    res.redirect("http://localhost:3000");
  });
});

module.exports = router;
