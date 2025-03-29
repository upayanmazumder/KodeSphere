const express = require("express");
const User = require("../database/models/User");

const router = express.Router();

router.get("/me", async (req, res) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authenticated" });
  }
  res.json(req.user);
});

module.exports = router;
