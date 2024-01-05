const express = require('express');
const { getNotes, getNoteById, createNote, updateNote, deleteNote, shareNote } = require('../controllers/notes');

const router = express.Router();

router.get('/', getNotes);
router.get('/:id', getNoteById);
router.post('/', createNote);
router.put('/:id', updateNote);
router.delete('/:id', deleteNote);
router.post('/:id/share', shareNote);

module.exports = router;