const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const passport = require("passport");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
require("./config/passport");

const authRoutes = require("./routes/auth");
const githubRoutes = require("./routes/github");
const analyzeRoutes = require("./routes/analyze");

const app = express();

try {
  app.use(cors());
  app.use(express.json());
  app.use(
    session({
      secret: process.env.SESSION_SECRET,
      resave: false,
      saveUninitialized: true,
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.use("/auth", authRoutes);
  app.use("/github", githubRoutes);
  app.use("/", analyzeRoutes);

  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB Connection Error:", err));

  const PORT = process.env.API_PORT || 5000;
  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
    console.log(
      `GitHub API status: ${
        process.env.GITHUB_TOKEN ? "Authenticated" : "Not configured"
      }`
    );
  });
} catch (error) {
  console.error("An error occurred while starting the server:", error);
}
