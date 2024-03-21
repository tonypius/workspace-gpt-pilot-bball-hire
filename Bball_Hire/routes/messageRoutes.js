const express = require('express');
const { isAuthenticated } = require('./middleware/authMiddleware');
const { hasRole } = require('./middleware/roleMiddleware');
const Message = require('../models/Message');
const router = express.Router();

// Route to send a message
router.post('/messages/send', isAuthenticated, hasRole('coach'), async (req, res) => {
  try {
    const { receiverId, messageContent } = req.body;
    const message = await Message.create({
      senderId: req.session.userId,
      receiverId,
      messageContent
    });
    console.log(`Message sent successfully. Message ID: ${message._id}`);
    res.status(200).json({ message: 'Message sent successfully', messageId: message._id });
  } catch (error) {
    console.error('Error sending message:', error.message);
    console.error(error.stack);
    res.status(500).send('Failed to send message.');
  }
});

// Route to retrieve messages for a user
router.get('/messages/:userId', isAuthenticated, hasRole('coach'), async (req, res) => {
  try {
    const userId = req.params.userId;
    if (req.session.userId !== userId) {
      console.log('Unauthorized access attempt to messages.');
      return res.status(403).send('Unauthorized access to messages.');
    }
    const messages = await Message.find({
      $or: [{ senderId: userId }, { receiverId: userId }]
    }).populate('senderId receiverId', 'username');
    console.log(`Messages retrieved successfully for user ID: ${userId}`);
    res.status(200).json(messages);
  } catch (error) {
    console.error('Error retrieving messages:', error.message);
    console.error(error.stack);
    res.status(500).send('Failed to retrieve messages.');
  }
});

module.exports = router;