const express = require('express');
const Feedback = require('../models/Feedback');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

router.post('/feedback', isAuthenticated, async (req, res) => {
  try {
    await Feedback.create({ content: req.body.content });
    console.log('Feedback submitted successfully');
    res.status(200).json({ message: 'Feedback submitted successfully' });
  } catch (error) {
    console.error('Error submitting feedback:', error.message);
    console.error(error.stack);
    res.status(500).send('Failed to submit feedback.');
  }
});

module.exports = router;