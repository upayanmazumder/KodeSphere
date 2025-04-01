const User = require("../models/User.js");

const createUser = async (repos) => {
  if (!repos || repos.length === 0) {
    throw new Error("No repositories found for the user.");
  }

  const username = repos[0]?.owner?.login;
  const githubId = repos[0]?.owner?.id;
  const avatarUrl = repos[0]?.owner?.avatar_url;

  if (!username || !githubId || !avatarUrl) {
    throw new Error("Owner information is missing in the repository data.");
  }

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    console.log("User already exists:", username);
    return existingUser;
  }

  const newUser = await User.create({
    githubId,
    username,
    avatarUrl,
    repositories: repos.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
    })),
    accessToken: "",
  });

  console.log("✅ New user created with username:", username);
  return newUser;
};

module.exports = createUser;
