const express = require("express");

const router = express.Router(); // ✅ Define router before using it

const { getUserRepositories } = require("../controllers/githubController");

// ✅ Ensure this function uses the authenticated user's GitHub ID
router.get("/repos", getUserRepositories);

module.exports = router;
