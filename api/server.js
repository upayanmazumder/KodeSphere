require("dotenv").config();
const express = require("express");

const session = require("express-session");
const cors = require("cors");
const passport = require("passport");
const connectDB = require("./database/db");

require("dotenv").config();
require("./Auth/github");


const authRoutes = require("./Routes/auth");

const userRoutes = require("./Routes/users");


const app = express();

connectDB();

app.use(cors({ origin: "http://localhost:3000", credentials: true }));

app.use(session({
  secret: process.env.SESSION_SECRET || "secret",
  resave: false,
  saveUninitialized: true,
}));

app.use(passport.initialize());
app.use(passport.session());

app.use("/auth", authRoutes);
app.use("/user", userRoutes);

app.listen(5000, () => console.log("✅ Server running on http://localhost:5000"));
