const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  name: { type: String, required: true },
  subdomain: { type: String, required: true, unique: true },
  status: { type: String, enum: ["deployed", "failed"], default: "deployed" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Project", ProjectSchema);
