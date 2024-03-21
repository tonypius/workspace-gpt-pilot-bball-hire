const express = require('express');
const multer = require('multer');
const TransferPlayer = require('../models/TransferPlayer');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();
const upload = multer({ dest: 'uploads/' });

router.get('/create', isAuthenticated, (req, res) => {
  console.log("Accessing the transfer player profile creation form.");
  res.render('transferPlayers/create');
});

router.post('/create', isAuthenticated, upload.single('academicTranscripts'), async (req, res) => {
  try {
    let transferPlayerData = req.body;
    if (req.file) {
      transferPlayerData.academicTranscripts = req.file.path;
      console.log(`Received file for academic transcripts: ${req.file.filename}`);
    }
    const newTransferPlayer = await TransferPlayer.create(transferPlayerData);
    console.log(`New transfer player profile created: ${newTransferPlayer._id}`);
    res.redirect('/transferPlayers/search');
  } catch (error) {
    console.error('Error creating transfer player profile:', error);
    res.status(500).send("Failed to create transfer player profile. Please try again.");
  }
});

router.get('/search', isAuthenticated, (req, res) => {
  console.log("Accessing the transfer player profile search form.");
  res.render('transferPlayers/search');
});

router.get('/search/results', isAuthenticated, async (req, res) => {
  try {
    const query = {};
    Object.keys(req.query).forEach(key => {
      if (req.query[key]) query[key] = req.query[key];
    });

    const transferPlayers = await TransferPlayer.find(query);
    console.log(`Found ${transferPlayers.length} transfer player(s) matching search criteria.`);
    res.render('transferPlayers/results', { transferPlayers });
  } catch (error) {
    console.error('Error performing search operation for transfer players:', error);
    res.status(500).send('Failed to perform search operation.');
  }
});

module.exports = router;