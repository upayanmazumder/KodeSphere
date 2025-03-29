const axios = require("axios");
const { generateGitHubAppJWT } = require("../utils/github"); // Utility function

// @desc  Fetch user repositories using GitHub App
// @route GET /github/repos
const getUserRepositories = async (req, res) => {
  try {
    const jwtToken = generateGitHubAppJWT();

    // Get installations
    const installationsRes = await axios.get("https://api.github.com/app/installations", {
      headers: { 
        Authorization: `Bearer ${jwtToken}`, 
        Accept: "application/vnd.github+json" 
      },
    });

    if (!installationsRes.data.length) {
      return res.status(404).json({ error: "No GitHub App installation found" });
    }

    const installationId = installationsRes.data[0].id;

    // Exchange JWT for installation access token
    const tokenRes = await axios.post(
      `https://api.github.com/app/installations/${installationId}/access_tokens`,
      {},
      { 
        headers: { 
          Authorization: `Bearer ${jwtToken}`, 
          Accept: "application/vnd.github+json" 
        } 
      }
    );

    const accessToken = tokenRes.data.token;

    // Get repositories
    const reposRes = await axios.get("https://api.github.com/installation/repositories", {
      headers: { 
        Authorization: `Bearer ${accessToken}`, 
        Accept: "application/vnd.github+json" 
      },
    });

    res.json({ repositories: reposRes.data.repositories });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserRepositories };
