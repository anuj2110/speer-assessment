const request = require("supertest");
const mongoose = require("mongoose");
const app = require("../app");
const Note = require("../models/Notes");
const User = require("../models/User");
require("dotenv").config();

describe("Note Endpoints", () => {
  let authToken;
  let userId;

  beforeAll(async () => {
    await mongoose.connect(process.env.MONGO_URI);

    const userResponse = await request(app).post("/api/auth/signup").send({
      username: "testuser",
      password: "testpassword",
    });
    userId = userResponse.body.userId;
    authToken = userResponse.body.token;
  });

  afterAll(async () => {
    await User.deleteMany({});

    await Note.deleteMany({});
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    await Note.deleteMany({});
  });

  test("should get all notes for an authenticated user", async () => {
    await Note.create({
      title: "Test Note",
      content: "This is a test note",
      userId: userId,
    });

    const response = await request(app)
      .get("/api/notes")
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.length).toBe(1);
    expect(response.body[0].title).toBe("Test Note");
  });

  test("should not get notes without authentication", async () => {
    const response = await request(app).get("/api/notes");

    expect(response.status).toBe(401);
    expect(response.body.error).toBe("Authentication failed");
  });

  test("should create a new note for an authenticated user", async () => {
    const noteData = {
      title: "New Note",
      content: "This is a new note",
    };

    const response = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${authToken}`)
      .send(noteData);

    expect(response.status).toBe(201);
    expect(response.body.title).toBe("New Note");
    expect(response.body.content).toBe("This is a new note");
    expect(response.body.userId).toBe(userId);
  });

  test("should update an existing note for an authenticated user", async () => {
    const existingNote = await Note.create({
      title: "Existing Note",
      content: "This is an existing note",
      userId: userId,
    });

    const updatedNoteData = {
      title: "Updated Note",
      content: "This is the updated note",
    };

    const response = await request(app)
      .put(`/api/notes/${existingNote._id}`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(updatedNoteData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Note updated successfully");

    const updatedNote = await Note.findById(existingNote._id);
    expect(updatedNote.title).toBe("Updated Note");
  });

  test("should delete an existing note for an authenticated user", async () => {
    const existingNote = await Note.create({
      title: "Note to be deleted",
      content: "This note will be deleted",
      userId: userId,
    });

    const response = await request(app)
      .delete(`/api/notes/${existingNote._id}`)
      .set("Authorization", `Bearer ${authToken}`);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Note deleted successfully");

    const deletedNote = await Note.findById(existingNote._id);
    expect(deletedNote).toBeNull();
  });

  test("should share a note with another user for the authenticated user", async () => {
    const noteToShare = await Note.create({
      title: "Note to Share",
      content: "This note will be shared",
      userId: userId,
    });

    const anotherUserResponse = await request(app)
      .post("/api/auth/signup")
      .send({
        username: "anotheruser",
        password: "anotherpassword",
      });

    const anotherUserId = anotherUserResponse.body.userId;
    const anotherUserAuthToken = anotherUserResponse.body.token;

    const shareNoteData = {
      sharedUserId: anotherUserId,
    };

    const response = await request(app)
      .post(`/api/notes/${noteToShare._id}/share`)
      .set("Authorization", `Bearer ${authToken}`)
      .send(shareNoteData);

    expect(response.status).toBe(200);
    expect(response.body.message).toBe("Note shared successfully");
    const sharedNote = await Note.findById(noteToShare._id);
    expect(sharedNote.sharedWith.length).toBe(1);
    expect(sharedNote.sharedWith[0].toString()).toBe(anotherUserId);
  });
});
