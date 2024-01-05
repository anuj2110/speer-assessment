const User = require("../models/User");
const jwt = require("jsonwebtoken");

const signUp = async (req, res) => {
  try {
    const { username, password } = req.body;
    if (username.length < 3 || password.length < 6) {
      return res.status(400).json({
        error: "Please provide username>3 characters and password>6 characters",
      });
    }
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: "Username already exists" });
    }

    const newUser = new User({ username, password });
    await newUser.save();
    const token = jwt.sign({ userId: newUser._id }, "secretKey", {
      expiresIn: "1h",
    });
    res.status(201).json({ token, userId: newUser._id });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const validPassword = await user.comparePassword(password);
    if (!validPassword) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user._id }, "secretKey", {
      expiresIn: "1h",
    });
    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { signUp, login };
