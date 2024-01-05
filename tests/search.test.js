const request = require("supertest");
const app = require("../app");
const User = require("../models/User");
const Note = require("../models/Notes");
const mongoose = require("mongoose");

require("dotenv").config();

describe("Search Endpoint", () => {
  let user;
  let token;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);
    user = await User.create({
      username: "testuser",
      password: "testpassword",
    });

    const loginResponse = await request(app).post("/api/auth/login").send({
      username: "testuser",
      password: "testpassword",
    });

    token = loginResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});
    await Note.deleteMany({});
    await mongoose.connection.close();
  });

  it("should search for notes based on keywords", async () => {
    await Note.create({
      title: "Test Note",
      content: "This is a test note.",
      userId: user._id,
    });
    const response = await request(app)
      .get("/api/search?q=test")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Test Note");
  });
});
