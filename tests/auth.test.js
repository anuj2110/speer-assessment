const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const User = require("../models/User");
require("dotenv").config();

describe("Authentication Endpoints", () => {
  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await User.deleteMany({});
  });

  test("should sign up a new user", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      username: "testuser",
      password: "testpassword",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("token");
    expect(response.body).toHaveProperty("userId");

    const user = await User.findOne({ username: "testuser" });
    expect(user).not.toBeNull();
  });

  test("should not sign up with existing username", async () => {
    await User.create({
      username: "existinguser",
      password: "existingpassword",
    });

    const response = await request(app).post("/api/auth/signup").send({
      username: "existinguser",
      password: "testpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Username already exists");
  });

  test("should not sign up with invalid credentials", async () => {
    const response = await request(app).post("/api/auth/signup").send({
      username: "",
      password: "testpassword",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe(
      "Please provide username>3 characters and password>6 characters"
    );
  });

  test("should log in an existing user", async () => {
    await User.create({
      username: "testuser",
      password: "testpassword",
    });

    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty("token");
  });

  test("should not log in with incorrect credentials", async () => {
    await User.create({
      username: "testuser",
      password: "testpassword",
    });

    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "wrongpassword",
    });

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Invalid credentials");
  });

  test("should not log in with missing credentials", async () => {
    const response = await request(app).post("/api/auth/login").send({
      username: "testuser",
    });

    expect(response.status).toBe(400);
    expect(response.body.error).toBe("Invalid credentials");
  });
});
