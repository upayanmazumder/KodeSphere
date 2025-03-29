const axios = require("axios");
const { generateGitHubAppJWT } = require("../utils/github"); // Utility function

const createUser = require("./createUser");

// @desc  Get GitHub App installed repositories
// @route GET /github/repos
const getUserRepositories = async (req, res) => {
  console.log("Fetching user repositories...");

  try {
    const { githubUserId } = req.query;
    if (!githubUserId) {
      return res.status(400).json({ error: "GitHub user ID is required" });
    }

    const jwtToken = generateGitHubAppJWT();

    const installationsRes = await axios.get(
      "https://api.github.com/app/installations",
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    if (!installationsRes.data.length) {
      return res.status(404).json({ error: "No installations found" });
    }

    const userInstallation = installationsRes.data.find(
      (inst) => inst.account.id.toString() === githubUserId
    );
    if (!userInstallation) {
      return res
        .status(403)
        .json({ error: "No installation found for this user" });
    }

    const installationId = userInstallation.id;

    const tokenRes = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      {
        headers: {
          Authorization: `Bearer ${jwtToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const accessToken = tokenRes.data.token;

    const reposRes = await axios.get(
      "https://api.github.com/installation/repositories",
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/vnd.github+json",
        },
      }
    );

    const repos = reposRes.data.repositories;

    createUser(repos);

    res.json({ repos });
  } catch (error) {
    console.error("Error fetching repositories:", error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserRepositories };
