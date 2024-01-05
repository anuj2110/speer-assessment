const Note = require("../models/Notes");

const searchNotes = async (req, res) => {
  try {
    const userId = req.user._id;
    const query = req.query.q;

    // Search for notes based on keywords for the authenticated user
    const notes = await Note.find({ userId, $text: { $search: query } });
    res.json(notes);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports = { searchNotes };
