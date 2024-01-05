const Note = require("../models/Notes");
const User = require("../models/User");
const getNotes = async (req, res) => {
  try {
    const userId = req.user._id;

    const notes = await Note.find({ userId });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getNoteById = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json(note);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const createNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const { title, content } = req.body;

    const newNote = new Note({ title, content, userId });
    await newNote.save();

    res.status(201).json({
      title: newNote.title,
      content: newNote.content,
      userId: newNote.userId,
    });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const updateNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const { title, content } = req.body;

    const updatedNote = await Note.findOneAndUpdate(
      { _id: noteId, userId },
      { title, content },
      { new: true }
    );

    if (!updatedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note updated successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const deleteNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;

    const deletedNote = await Note.findOneAndDelete({ _id: noteId, userId });

    if (!deletedNote) {
      return res.status(404).json({ error: "Note not found" });
    }

    res.json({ message: "Note deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const shareNote = async (req, res) => {
  try {
    const userId = req.user._id;
    const noteId = req.params.id;
    const { sharedUserId } = req.body;

    const note = await Note.findOne({ _id: noteId, userId });
    if (!note) {
      return res.status(404).json({ error: "Note not found" });
    }

    const sharedUser = await User.findById(sharedUserId);
    if (!sharedUser) {
      return res.status(404).json({ error: "User to share with not found" });
    }

    if (note.sharedWith.includes(sharedUserId)) {
      return res
        .status(400)
        .json({ error: "Note already shared with this user" });
    }

    note.sharedWith.push(sharedUserId);
    await note.save();

    res.json({ message: "Note shared successfully" });
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = {
  getNotes,
  getNoteById,
  createNote,
  updateNote,
  deleteNote,
  shareNote,
};
