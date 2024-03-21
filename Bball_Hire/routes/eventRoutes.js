const express = require('express');
const Event = require('../models/Event');
const { isAuthenticated } = require('./middleware/authMiddleware');
const router = express.Router();

// POST endpoint for creating a new event
router.post('/events/create', isAuthenticated, async (req, res) => {
  try {
    const { title, description, location, date } = req.body;
    const newEvent = await Event.create({ title, description, location, date, organizer: req.session.userId });
    console.log(`New event created: ${newEvent.title}`);
    res.status(201).json(newEvent);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event', details: error.message });
  }
});

// GET endpoint to list all events
router.get('/events', async (req, res) => {
  try {
    const events = await Event.find().populate('organizer', 'username');
    console.log(`Fetched ${events.length} events`);
    res.status(200).json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events', details: error.message });
  }
});

// GET endpoint to fetch a single event by its ID
router.get('/events/:id', async (req, res) => {
  try {
    const eventId = req.params.id;
    const event = await Event.findById(eventId).populate('organizer', 'username').populate('participants', 'username');
    if (!event) {
      console.log(`Event with ID ${eventId} not found`);
      return res.status(404).json({ error: 'Event not found' });
    }
    console.log(`Fetched event: ${event.title}`);
    res.status(200).json(event);
  } catch (error) {
    console.error(`Error fetching event with ID ${req.params.id}:`, error);
    res.status(500).json({ error: 'Failed to fetch event', details: error.message });
  }
});

// POST endpoint for joining an event
router.post('/events/join/:id', isAuthenticated, async (req, res) => {
  const eventId = req.params.id;
  const userId = req.session.userId;

  try {
    const event = await Event.findById(eventId);
    if (!event.participants.includes(userId)) {
      event.participants.push(userId);
      await event.save();
      console.log(`User ${userId} joined event ${eventId}`);
      // Populate participants to emit updated list
      await event.populate('participants', 'username');
      req.app.get('socketio').to(eventId).emit('updateParticipants', event.participants);
      console.log(`Emitted updateParticipants for event ${eventId}`);
    } else {
      console.log(`User ${userId} is already a participant of event ${eventId}`);
    }

    res.status(200).json({
      message: 'Successfully joined the event',
      participants: event.participants
    });
  } catch (error) {
    console.error(`Error joining event ${eventId} by user ${userId}:`, error);
    res.status(500).send('Failed to join event.');
  }
});

module.exports = router;