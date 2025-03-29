const axios = require("axios");
const { generateGitHubAppJWT } = require("../utils/github"); // Utility function

// @desc  Import user repositories from GitHub
// @route POST /github/import

async function importUserRepositories(req, res) {
  console.log("Importing user repositories..."); // Log the start of the import process

  const { user } = req; // Get the authenticated user
  if (!user || !user.githubToken) {
    console.error("GitHub authentication required."); // Log the error
    return res.status(401).json({ message: "GitHub authentication required." });
  }

  console.log("Using GitHub Token:", user.githubToken); // Log the GitHub token for debugging

  try {
    const response = await axios.get("https://api.github.com/user/repos", {
      headers: {
        Authorization: `Bearer ${user.githubToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    console.log("Response from GitHub API:", response.data); // Log the response data
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: "No repositories found for the user." });
    }

    const repositories = response.data;

    // Process and save repositories to the database (assuming saveRepositories function exists)
    await saveRepositories(user.githubId, repositories);

    return res.status(200).json({ message: "Repositories imported successfully", repositories });
  } catch (error) {
    console.error("Error fetching user repositories:", error); // Log the error for debugging
    return res.status(500).json({ error: "Failed to import repositories" });
  }
}

// @desc  Get GitHub App installed repositories
// @route GET /github/repositories
const getUserRepositories = async (req, res) => {
  try {
    const jwtToken = generateGitHubAppJWT();

    // Get installations
    const installationsRes = await axios.get("https://api.github.com/app/installations", {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    if (!installationsRes.data.length) {
      return res.status(404).json({ error: "No GitHub App installation found" });
    }

    const installationId = installationsRes.data[0].id;

    // Exchange JWT 
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

    // Get repositories
    const reposRes = await axios.get("https://api.github.com/installation/repositories", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github+json",
      },
    });

    return res.json({ repositories: reposRes.data.repositories });
  } catch (error) {
    console.error("Error fetching repositories:", error); 
    return res.status(500).json({ error: error.message });
  }
};

module.exports = { getUserRepositories, importUserRepositories };
