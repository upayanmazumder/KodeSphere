const express = require("express");
const axios = require("axios");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");
const path = require("path");

dotenv.config();

const router = express.Router(); // ✅ Define router before using it
<<<<<<< HEAD

const { getUserRepositories } = require("../controllers/githubController");

// ✅ Ensure this function uses the authenticated user's GitHub ID
router.get("/repos", getUserRepositories);
=======

const { importUserRepositories } = require("../controllers/githubController");

// GitHub App Login
router.post('/login', async (req, res) => {
  try {
    const jwtToken = generateGitHubAppJWT();

    const installationsRes = await axios.get("https://api.github.com/app/installations", {
      headers: { Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json" },
    });

    if (!installationsRes.data.length) {
      return res.status(404).json({ error: "No installation found" });
    }

    const installationId = installationsRes.data[0].id;

    const tokenRes = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      { headers: { Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json" } }
    );

    const accessToken = tokenRes.data.token;

    res.redirect(`/dashboard?access_token=${accessToken}`);
  } catch (error) {
    console.error("Error during GitHub App login:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/import', importUserRepositories); 

// Generate GitHub App JWT
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

// ✅ Ensure this function uses the authenticated user's GitHub ID
router.get("/repos", async (req, res) => {
  try {
    const { githubUserId } = req.query;
    if (!githubUserId) {
      return res.status(400).json({ error: "GitHub user ID is required" });
    }

    const jwtToken = generateGitHubAppJWT();

    const installationsRes = await axios.get("https://api.github.com/app/installations", {
      headers: { Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json" },
    });

    if (!installationsRes.data.length) {
      return res.status(404).json({ error: "No installations found" });
    }

    const userInstallation = installationsRes.data.find(inst => inst.account.id.toString() === githubUserId);
    if (!userInstallation) {
      return res.status(403).json({ error: "No installation found for this user" });
    }

    const installationId = userInstallation.id;

    const tokenRes = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      { headers: { Authorization: `Bearer ${jwtToken}`, Accept: "application/vnd.github+json" } }
    );

    const accessToken = tokenRes.data.token;

    const reposRes = await axios.get("https://api.github.com/installation/repositories", {
      headers: { Authorization: `Bearer ${accessToken}`, Accept: "application/vnd.github+json" },
    });

    res.json({ repos: reposRes.data.repositories });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({ error: error.message });
  }
});
>>>>>>> main

module.exports = router; 
