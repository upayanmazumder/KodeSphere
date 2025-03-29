require("dotenv").config();
const express = require("express");
const axios = require("axios");

const session = require("express-session");
const cors = require("cors");
const connectDB = require("./database/db");

const githubAuthRoutes = require("./Routes/auth/github");
const userRoutes = require("./Routes/users");

const app = express();

app.use(express.json());

connectDB();

// ___________________________________________________________________________________________

app.use(cors({ origin: ["http://localhost:3000", "https://ks.upayan.dev"], credentials: true }));

// ___________________________________________________________________________________________

app.use("/auth", githubAuthRoutes);
app.use("/user", userRoutes);

// ___________________________________________________________________________________________

app.listen(8080, () =>
  console.log("✅ Server running on http://localhost:8080")
);
