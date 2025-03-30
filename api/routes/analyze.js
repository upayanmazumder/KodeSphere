const express = require("express");

const router = express.Router(); // ✅ Define router before using it

const { analyzeUserRepo } = require("../controllers/analyzeController");

// ✅ Ensure this function uses the authenticated user's GitHub ID
router.get("/analyze-repo", analyzeUserRepo);

module.exports = router;
