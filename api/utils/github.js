const fs = require("fs");
const jwt = require("jsonwebtoken");
const path = require("path");
require("dotenv").config();

function generateGitHubAppJWT() {
  let privateKey;
  try {
    const privateKeyPath = process.env.GITHUB_PRIVATE_KEY_PATH;
    if (!privateKeyPath) {
      throw new Error("GITHUB_PRIVATE_KEY_PATH is not defined in .env file.");
    }

    privateKey = fs.readFileSync(privateKeyPath, "utf8");
    console.log("Private key file read successfully.");
  } catch (error) {
    console.error("Error reading private key file:", error.message);
    throw error;
  }

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

module.exports = { generateGitHubAppJWT };
