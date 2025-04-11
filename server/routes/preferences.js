const express = require('express');
const router = express.Router();
const User = require('../models/User');

// Save user preferences
router.post('/save', async (req, res) => {
  const { email, preferences } = req.body;
  try {
    const user = await User.findOneAndUpdate(
      { email },
      { preferences },
      { new: true, upsert: true }
    );
    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get user preferences
router.get('/:email', async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    res.status(200).json(user?.preferences || {});
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
