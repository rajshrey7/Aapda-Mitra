const express = require('express');
const router = express.Router();
const aiService = require('../services/aiService');

// Generate learning module content for a specific hazard
router.post('/generate-content', async (req, res) => {
  try {
    const { hazardType, ageGroup = '8-16' } = req.body;

    if (!hazardType) {
      return res.status(400).json({ error: 'Hazard type is required' });
    }

    const validHazards = ['earthquake', 'fire', 'thunderstorm', 'heatwave'];
    if (!validHazards.includes(hazardType)) {
      return res.status(400).json({ error: 'Invalid hazard type' });
    }

    const content = await aiService.generateLearningContent(hazardType, ageGroup);
    res.json(content);
  } catch (error) {
    console.error('Error generating learning content:', error);
    res.status(500).json({ error: 'Failed to generate learning content' });
  }
});

// Get learning module content (with caching)
router.get('/content/:hazardType', async (req, res) => {
  try {
    const { hazardType } = req.params;
    const { ageGroup = '8-16' } = req.query;

    const validHazards = ['earthquake', 'fire', 'thunderstorm', 'heatwave'];
    if (!validHazards.includes(hazardType)) {
      return res.status(400).json({ error: 'Invalid hazard type' });
    }

    const content = await aiService.generateLearningContent(hazardType, ageGroup);
    res.json(content);
  } catch (error) {
    console.error('Error getting learning content:', error);
    res.status(500).json({ 
      error: 'Failed to get learning content',
      details: error.message 
    });
  }
});

module.exports = router;
