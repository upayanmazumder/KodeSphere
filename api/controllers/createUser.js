const User = require("../models/User.js");

const createUser = async (repos) => {
  const username = repos[0].owner.login;
  const githubId = repos[0].owner.id;
  const avatarUrl = repos[0].owner.avatar_url;

  const existingUser = await User.findOne({ username });

  if (existingUser) {
    console.log("User already exists:", username);
    return existingUser;
  }

  // Create new user
  const newUser = await User.create({
    githubId,
    username,
    avatarUrl,
    repositories: repos.map((repo) => ({
      name: repo.name,
      url: repo.html_url,
    })),
    accessToken: "", // Store access token if needed
  });

  console.log("✅ New user created with username:", username);
};

module.exports = createUser;
