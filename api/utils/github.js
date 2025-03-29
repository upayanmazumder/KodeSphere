const fs = require("fs");
const jwt = require("jsonwebtoken");

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

module.exports = { generateGitHubAppJWT };
