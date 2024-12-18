const express = require('express');
const { v4: uuidv4 } = require('uuid'); // UUID for generating unique IDs
const Poll = require('../models/Poll'); // Poll model
const router = express.Router();
const axios = require('axios');
require('dotenv').config();

console.log('Poll model:', Poll); // Debugging: Ensure Poll is imported correctly

// Create a poll
router.post('/', async (req, res) => {
  const { user_id, creator_email, title, options, expires_at } = req.body;

  // Validate the input
  if (!user_id || !creator_email || !title || !options || options.length < 2) {
    return res.status(400).json({ error: 'Invalid poll data' });
  }

  // Validate expiration date
  const currentTime = new Date();
  const expirationTime = new Date(expires_at);

  if (isNaN(expirationTime)) {
    return res.status(400).json({ error: 'Invalid expiration date format' });
  }

  const minimumExpirationTime = new Date(currentTime.getTime() + 5 * 60 * 1000); // Current time + 5 minutes

  if (expirationTime < minimumExpirationTime) {
    return res
      .status(400)
      .json({ error: 'Expiration date must be at least 5 minutes from now' });
  }

  // Create poll object
  const poll = new Poll({
    poll_id: uuidv4(),
    user_id,
    creator_email,
    title,
    options: options.map((text) => ({
      option_id: uuidv4(),
      text,
      votes: 0,
    })),
    expires_at: expirationTime,
  });

  try {
    const createdPoll = await poll.save();

     // Generate the shareable link
     const shareableLink = `${process.env.FRONTEND_URL}/polls/${createdPoll.poll_id}`; // Frontend URL for polls

    // Send a request to the Analytics Service to initialize analytics for this poll
    const analyticsPayload = {
      poll_id: createdPoll.poll_id,
      title: createdPoll.title,
      results: createdPoll.options.map((option) => ({
        option_id: option.option_id,
        text: option.text,
        votes: 0,
      })),
    };

    await axios.post('http://analytics-service:3004/', analyticsPayload);

    res.status(201).json({
      poll: createdPoll,
      link: shareableLink, // Include the link in the response
    });
  } catch (error) {
    console.error('Error creating poll:', error.message);
    res.status(500).json({ error: 'Error creating poll' });
  }
});

// Retrieve all polls
router.get('/', async (req, res) => {
  try {
    const polls = await Poll.find();
    res.json(polls);
  } catch (error) {
    console.error('Error fetching polls:', error.message);
    res.status(500).json({ error: 'Error fetching polls' });
  }
});

// Retrieve a specific poll by poll_id
router.get('/:id', async (req, res) => {
  try {
    const poll = await Poll.findOne({ poll_id: req.params.id });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json(poll);
  } catch (error) {
    console.error('Error fetching poll:', error.message);
    res.status(500).json({ error: 'Error fetching poll' });
  }
});

// Delete a poll
router.delete('/:id', async (req, res) => {
  try {
    const poll = await Poll.findOneAndDelete({ poll_id: req.params.id });
    if (!poll) {
      return res.status(404).json({ error: 'Poll not found' });
    }
    res.json({ message: 'Poll deleted successfully' });
  } catch (error) {
    console.error('Error deleting poll:', error.message);
    res.status(500).json({ error: 'Error deleting poll' });
  }
});

router.get('/user/:userId', async (req, res) => {
  try {
    const polls = await Poll.find({ user_id: req.params.userId });
    res.json(polls);
  } catch (error) {
    console.error('Error fetching user polls:', error.message);
    res.status(500).json({ error: 'Error fetching user polls' });
  }
});

module.exports = router;
