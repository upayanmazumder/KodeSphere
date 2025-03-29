const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  email: { type: String },
  avatar: { type: String },
  subdomain: { type: String, unique: true }
});

module.exports = mongoose.model("User", UserSchema);
