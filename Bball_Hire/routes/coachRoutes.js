const express = require('express');
const Coach = require('../models/Coach');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

router.get('/create', isAuthenticated, (req, res) => {
  res.render('coaches/create');
});

router.post('/create', isAuthenticated, async (req, res) => {
  try {
    const newCoach = await Coach.create(req.body);
    console.log(`New coach profile created for ${newCoach.name}`);
    res.redirect('/');
  } catch (error) {
    console.error('Coach profile creation error:', error.message);
    console.error(error.stack);
    res.status(500).send('Failed to create coach profile. Please try again.');
  }
});

module.exports = router;