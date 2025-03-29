const express = require("express");
const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const router = express.Router();

// Generate JWT for GitHub App
function generateGitHubAppJWT() {
  const privateKey = fs.readFileSync(process.env.GITHUB_PRIVATE_KEY_PATH, "utf8");

  return jwt.sign(
    {
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 600,
      iss: process.env.GITHUB_APP_ID,
    },
    privateKey,
    { algorithm: "RS256" }
  );
}

// Get User Repositories via GitHub App
router.get("/repos", async (req, res) => {
  try {
    const jwtToken = generateGitHubAppJWT();

    // Get installation ID
    const installationsRes = await axios.get("https://api.github.com/app/installations", {
      headers: { Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json" },
    });

    if (!installationsRes.data.length) {
      return res.status(404).json({ error: "No installation found" });
    }

    const installationId = installationsRes.data[0].id;

    // Exchange JWT for installation access token
    const tokenRes = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      { headers: { Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json" } }
    );

    const accessToken = tokenRes.data.token;

    // Fetch repositories
    const reposRes = await axios.get("https://api.github.com/installation/repositories", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
    });

    res.json({ repos: reposRes.data.repositories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
