const express = require("express");
const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const router = express.Router(); // ✅ Define router before using it

const { getUserRepositories } = require("../controllers/githubController");

// ✅ Ensure this function uses the authenticated user's GitHub ID
router.get("/repos", getUserRepositories);

module.exports = router;
