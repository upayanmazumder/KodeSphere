require("dotenv").config();
const express = require("express");
const jwt = require("jsonwebtoken");
const axios = require("axios");
const fs = require("fs");
const path = require("path");

const router = express.Router();

const GITHUB_APP_ID = process.env.GITHUB_APP_ID;
const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;
const PRIVATE_KEY_PATH = process.env.PRIVATE_KEY_PATH || path.join(__dirname, "private-key.pem");
const PRIVATE_KEY = fs.readFileSync(PRIVATE_KEY_PATH, "utf8");

function generateJWT() {
  const payload = {
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 10 * 60,
    iss: GITHUB_APP_ID,
  };

  return jwt.sign(payload, PRIVATE_KEY, { algorithm: "RS256" });
}

// after app installation we will hit this route from app webhook link which leads here
router.post("/github/callback", async (req, res) => {
  console.log("GitHub Callback");

  const data = req.body;

  const installation_id = data.installation.id;

  if (!installation_id) {
    return res.status(400).send("Missing installation_id");
  }

  console.log("Installation ID:", installation_id);

  try {
    const jwtToken = generateJWT();

    // exchange JWT for installation token
    const tokenRes = await axios.post(
      `https://api.github.com/app/installations/${installation_id}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const accessToken = tokenRes.data.token;

    // Now we can use this accessToken to make requests on behalf of the user

    // Example = get their repos which they gave access to while installing app
    const userRepos = await axios.get(
      "https://api.github.com/installation/repositories",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    console.log({ token: accessToken, repos: userRepos.data });
  } catch (err) {
    console.error(err);
    res.status(500).send("GitHub App Auth Failed");
  }
});

module.exports = router;