const express = require("express");
const mongoose = require("mongoose");
const rateLimit = require("express-rate-limit");
const authRoutes = require("./routes/auth");
const noteRoutes = require("./routes/notes");
const searchRoutes = require("./routes/search");
const { authenticateUser } = require("./middlewares/auth");
require("dotenv").config();
const app = express();


app.use(express.json());



const limiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 100,
});

app.use("/api/", limiter);

// Authentication routes
app.use("/api/auth", authRoutes);

// Middleware to authenticate user for note-related routes
app.use("/api/notes", authenticateUser);

// Note routes
app.use("/api/notes", noteRoutes);

// Search routes
app.use("/api/search", authenticateUser);
app.use("/api/search", searchRoutes);


module.exports = app;
