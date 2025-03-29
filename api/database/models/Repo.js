const mongoose = require("mongoose");

const RepoSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  repoName: { type: String, required: true },
  repoUrl: { type: String, required: true },
  deployedUrl: { type: String },
});

module.exports = mongoose.model("Repo", RepoSchema);
