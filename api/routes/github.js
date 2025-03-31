const express = require("express");
const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const router = express.Router();

const { getUserRepositories } = require("../controllers/githubController");

router.get("/repos", getUserRepositories);

module.exports = router;
