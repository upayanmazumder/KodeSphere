const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  repositories: [
    {
      name: { type: String, required: true },
      url: { type: String, required: true },
    },
  ],

  githubId: { type: String, required: true, unique: true },
  username: { type: String, required: true },
  avatar: { type: String },
  accessToken: { type: String },
});

module.exports = mongoose.model("User", UserSchema);
