const express = require('express');
const { searchNotes } = require('../controllers/search');

const router = express.Router();

router.get('/', searchNotes);

module.exports = router;