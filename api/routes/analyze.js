const express = require("express");
const axios = require("axios");

const router = express.Router();

const getAIresponse = require("./getAIresponse");

router.post("/analyze-repo", async (req, res) => {
  const { Octokit } = await import("@octokit/rest");

  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    const urlRegex = /^(https?:\/\/)?github\.com\/[^/\s]+\/[^/\s]+$/;
    if (!urlRegex.test(repoUrl)) {
      return res.status(400).json({ error: "Invalid GitHub repository URL" });
    }

    const [owner, repo] = repoUrl.split("/").slice(-2);

    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: "Kodesphere/v1.0.0",
    });

    let contents;
    try {
      const response = await octokit.repos.getContent({
        owner,
        repo,
        path: "",
      });
      contents = response.data;
    } catch (error) {
      console.error("GitHub API Error:", error);
      return res.status(error.status || 500).json({
        error: "Failed to access repository",
        details: error.response?.data?.message || error.message,
      });
    }

    console.log("Repository Contents:", contents);

    const configs = await analyzeRepository(contents);

    const dockerConfig = generateDockerConfig(configs);

    res.json({
      dockerfile: dockerConfig.dockerfile,
      dockerCompose: dockerConfig.dockerCompose,
    });
  } catch (error) {
    console.error("Analysis Error:", error);
    res.status(500).json({
      error: "Analysis failed",
      details: error.message,
    });
  }
});

async function analyzeRepository(contents) {
  const fileNames = contents.map((item) => item.name);

  console.log("File Names:", fileNames);

  const nameString = fileNames.join(", ");

  const aiPrompt1 = `Analyze the following file names and determine the most likely programming language or framework (node, python, java, go) used in the repository: ${nameString}. The give me only the dockerfile for the project. Dont say here it is or anything in the response, just give me the dockerfile contents. There should not be anything else in your response other than dockerfile contents. The content should start from FROM text directly`;

  const aiPrompt2 = `Analyze the following file names and determine the most likely programming language or framework (node, python, java, go) used in the repository: ${nameString}. The give me only the docker-compose.yml for the project. Dont say here it is or anything in the response, just give me the docker-compose.yml contents. There should not be anything else in your response other than docker-compose.yml contents. The content should start from services: text directly`;

  try {
    const aiResponseDockerfile = await getAIresponse(aiPrompt1);
    const aiResponseDockerCompose = await getAIresponse(aiPrompt2, true);

    const configs = {
      dockerfile: aiResponseDockerfile,
      dockerCompose: aiResponseDockerCompose,
    };

    return configs;
  } catch (error) {
    console.error("Perplexity API Error:", error);
    return "node";
  }
}

function generateDockerConfig(configs) {
  return configs;
}

module.exports = router;
