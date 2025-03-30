const express = require("express");
const axios = require("axios");
const { Octokit } = require("@octokit/rest");

const router = express.Router();

// Repository analysis route
router.post("/analyze-repo", async (req, res) => {
  try {
    const { repoUrl } = req.body;

    if (!repoUrl) {
      return res.status(400).json({ error: "Repository URL is required" });
    }

    // Validate GitHub URL format
    const urlRegex = /^(https?:\/\/)?github\.com\/[^/\s]+\/[^/\s]+$/;
    if (!urlRegex.test(repoUrl)) {
      return res.status(400).json({ error: "Invalid GitHub repository URL" });
    }

    const [owner, repo] = repoUrl.split("/").slice(-2);

    // Initialize Octokit with environment token
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN,
      userAgent: "Kodesphere/v1.0.0",
    });

    // Get repository content with error handling
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

    // Analyze repository
    const projectType = await analyzeRepository(contents);

    // Generate Docker configuration
    const dockerConfig = generateDockerConfig(projectType);

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

// Repository analysis with Perplexity integration
async function analyzeRepository(contents) {
  const fileNames = contents.map((item) => item.name);
  const fileExtensions = new Set(
    fileNames.map((name) => name.split(".").pop())
  );

  // First check for obvious tech stack indicators
  if (fileNames.includes("package.json")) return "node";
  if (fileNames.includes("requirements.txt")) return "python";
  if (fileNames.includes("pom.xml")) return "java";
  if (fileNames.includes("go.mod")) return "golang";

  // Fallback to AI analysis
  try {
    const response = await axios.post(
      "https://api.perplexity.ai/analyze",
      {
        files: fileNames,
        context: "Determine appropriate Docker configuration",
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.PERPLEXITY_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );
    return response.data.projectType || "node";
  } catch (error) {
    console.error("Perplexity API Error:", error);
    return "node"; // Fallback to Node.js
  }
}

// Docker configuration generator
function generateDockerConfig(projectType) {
  const configs = {
    node: {
      dockerfile: `# Optimized Node.js Dockerfile
FROM node:16-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --production
COPY . .
RUN npm run build

FROM node:16-alpine
WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY package*.json ./
EXPOSE 3000
USER node
CMD ["npm", "start"]`,
      dockerCompose: `# Node.js Docker Compose
version: '3.8'
services:
  app:
    build: .
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    volumes:
      - ./:/app
      - /app/node_modules`,
    },
    python: {
      dockerfile: `# Python Dockerfile
FROM python:3.8-slim-buster AS builder
WORKDIR /app
COPY requirements.txt .
RUN pip install --user -r requirements.txt

FROM python:3.8-slim-buster
WORKDIR /app
COPY --from=builder /root/.local /root/.local
COPY . .
ENV PATH=/root/.local/bin:$PATH
EXPOSE 5000
CMD ["python", "app.py"]`,
      dockerCompose: `# Python Docker Compose
version: '3.8'
services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - FLASK_ENV=production
    volumes:
      - ./:/app`,
    },
  };

  return configs[projectType] || configs.node;
}

module.exports = router;
