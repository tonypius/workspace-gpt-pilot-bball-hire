const express = require('express');
const multer = require('multer');
const Player = require('../models/Player');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/create', isAuthenticated, (req, res) => {
  console.log("Accessing the player profile creation form.");
  res.render('players/create');
});

router.post('/create', isAuthenticated, upload.single('academicTranscripts'), async (req, res) => {
  try {
    const playerData = req.body;
    if (req.file) {
      console.log(`Received file for academic transcripts: ${req.file.filename}`);
      playerData.academicTranscripts = req.file.path;
    }
    const newPlayerProfile = await Player.create(playerData);
    console.log(`New player profile created: ${newPlayerProfile._id}`);
    res.redirect('/');
  } catch (error) {
    console.error('Error creating player profile:', error.message);
    console.error(error.stack);
    res.status(500).send("Failed to create player profile. Please try again.");
  }
});

router.get('/search', isAuthenticated, (req, res) => {
  console.log("Accessing the player profile search form.");
  res.render('players/search');
});

router.get('/search/results', isAuthenticated, async (req, res) => {
  try {
    const query = {};
    if (req.query.position) query.position = req.query.position;
    if (req.query.city) query.city = req.query.city;
    // Add more fields as necessary for filtering
    const players = await Player.find(query);
    console.log(`Found ${players.length} player(s) matching search criteria.`);
    res.render('players/results', { players });
  } catch (error) {
    console.error('Search error:', error.message);
    console.error(error.stack);
    res.status(500).send('Failed to perform search operation.');
  }
});

module.exports = router;