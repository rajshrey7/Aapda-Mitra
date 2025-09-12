// server/routes/alerts.js
// Alert endpoints with OpenWeather integration and AI summarization

const express = require('express');
const { body, validationResult } = require('express-validator');
const WeatherService = require('../services/weatherService');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Check alerts from WeatherAPI by location (uses services/alert.services.js)
router.get('/weather', async (req, res) => {
  try {
    const { location } = req.query;

    if (!location || !location.trim()) {
      return res.status(400).json({
        status: 'error',
        message: 'Query parameter "location" is required'
      });
    }

    // Use CommonJS service
    const { checkWeatherAlert } = require('../services/alert.services');
    const result = await checkWeatherAlert(location.trim());

    return res.json({
      status: 'success',
      data: {
        isAlert: Boolean(result?.isAlert),
        alerts: Array.isArray(result?.alert) ? result.alert : []
      }
    });
  } catch (error) {
    console.error('WeatherAPI alert check error:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to check weather alerts'
    });
  }
});

// Get nearby alerts
router.get('/nearby', async (req, res) => {
  try {
    const { lat, lon, radius = 50 } = req.query;
    
    if (!lat || !lon) {
      return res.status(400).json({
        status: 'error',
        message: 'Latitude and longitude are required'
      });
    }

    const weatherService = new WeatherService();
    const alerts = await weatherService.getNearbyAlerts(parseFloat(lat), parseFloat(lon), parseInt(radius));

    res.json({
      status: 'success',
      data: {
        alerts,
        location: { lat: parseFloat(lat), lon: parseFloat(lon) },
        radius: parseInt(radius)
      }
    });
  } catch (error) {
    console.error('Nearby alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch nearby alerts'
    });
  }
});

// Get AI summary of alert
router.get('/summarize/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const aiService = require('../services/aiService');
    
    // Mock alert data - in real implementation, fetch from database
    const alert = {
      id,
      type: 'earthquake',
      severity: 'moderate',
      description: 'Earthquake detected in your area',
      details: 'Magnitude 5.2 earthquake detected 15km from your location. Expected intensity: Moderate shaking. Duration: 10-15 seconds.',
      location: 'Punjab, India',
      timestamp: new Date()
    };

    const summary = await aiService.summarizeWeatherAlert(alert);

    res.json({
      status: 'success',
      data: {
        alertId: id,
        summary,
        originalAlert: alert
      }
    });
  } catch (error) {
    console.error('Alert summarization error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate alert summary'
    });
  }
});

// Create manual alert (admin/teacher) with role targeting
router.post('/manual', protect, admin, [
  body('type').isIn(['earthquake', 'flood', 'fire', 'cyclone', 'tsunami', 'landslide']).withMessage('Invalid alert type'),
  body('severity').isIn(['low', 'moderate', 'high', 'critical']).withMessage('Invalid severity level'),
  body('title').trim().isLength({ min: 1, max: 200 }).withMessage('Title is required and must be less than 200 characters'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location is required and must be less than 200 characters'),
  body('coordinates.lat').isFloat({ min: -90, max: 90 }).withMessage('Valid latitude required'),
  body('coordinates.lon').isFloat({ min: -180, max: 180 }).withMessage('Valid longitude required'),
  body('targetRole').optional().isIn(['student', 'teacher']).withMessage('Invalid targetRole')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { type, severity, title, description, location, coordinates, affectedAreas, instructions, targetRole } = req.body;
    
    // Ensure coordinates are properly formatted
    let formattedCoordinates = null;
    if (coordinates) {
      formattedCoordinates = {
        lat: parseFloat(coordinates.lat || coordinates.latitude || 0),
        lng: parseFloat(coordinates.lng || coordinates.longitude || 0)
      };
    } else if (location) {
      // If no coordinates provided, try to geocode the location
      try {
        const { getLocationCoordinates } = require('../services/alert.services');
        const geocodedCoords = await getLocationCoordinates(location);
        formattedCoordinates = geocodedCoords;
        console.log(`Geocoded location "${location}" to coordinates:`, geocodedCoords);
      } catch (geocodeError) {
        console.error('Geocoding failed:', geocodeError);
        // Will use null coordinates, which will be handled by the frontend
      }
    }

    const alert = {
      type,
      severity,
      title,
      description,
      location,
      coordinates: formattedCoordinates,
      affectedAreas: affectedAreas || [],
      instructions: instructions || [],
      targetRole: targetRole || 'student',
      source: 'manual',
      createdBy: req.user._id,
      createdAt: new Date(),
      isActive: true
    };

    // Save to database (mock implementation)
    // In real implementation, save to Alert model
    const savedAlert = { ...alert, id: Date.now().toString() };

    // Emit to socket clients
    if (global.io) {
      // Emit both generic and role-targeted events
      global.io.emit('alert:issued', savedAlert);
      global.io.emit('alert:new', savedAlert);
      if (savedAlert.targetRole) {
        global.io.to(`role:${savedAlert.targetRole}`).emit('alert:new', savedAlert);
      }
    }

    // Generate AI summary
    try {
      const aiService = require('../services/aiService');
      const summary = await aiService.summarizeWeatherAlert(savedAlert);
      savedAlert.aiSummary = summary;
    } catch (aiError) {
      console.error('AI summarization failed:', aiError);
      savedAlert.aiSummary = 'AI summary unavailable';
    }

    res.status(201).json({
      status: 'success',
      data: savedAlert
    });
  } catch (error) {
    console.error('Create manual alert error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to create manual alert'
    });
  }
});

// Cancel an alert (admin/teacher)
router.post('/cancel', protect, admin, [
  body('alertId').exists().withMessage('alertId is required'),
  body('targetRole').optional().isIn(['student', 'teacher']).withMessage('Invalid targetRole')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', errors: errors.array() });
    }

    const { alertId, targetRole } = req.body;

    if (global.io) {
      const payload = { alertId };
      global.io.emit('alert:cancel', payload);
      if (targetRole) {
        global.io.to(`role:${targetRole}`).emit('alert:cancel', payload);
      }
    }

    return res.json({ status: 'success', data: { alertId, canceled: true } });
  } catch (error) {
    console.error('Cancel alert error:', error);
    res.status(500).json({ status: 'error', message: 'Failed to cancel alert' });
  }
});

// Get all active alerts
router.get('/active', async (req, res) => {
  try {
    const { region, type, limit = 20 } = req.query;
    
    // Mock implementation - in real app, query Alert model
    const alerts = [
      {
        id: '1',
        type: 'earthquake',
        severity: 'moderate',
        title: 'Earthquake Alert - Punjab Region',
        description: 'Moderate earthquake detected in Punjab region',
        location: 'Punjab, India',
        coordinates: { lat: 31.1471, lon: 75.3412 },
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isActive: true
      },
      {
        id: '2',
        type: 'flood',
        severity: 'high',
        title: 'Flood Warning - River Areas',
        description: 'Heavy rainfall causing flood risk in river areas',
        location: 'River areas, Punjab',
        coordinates: { lat: 30.7333, lon: 76.7794 },
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isActive: true
      }
    ];

    let filteredAlerts = alerts;
    
    if (region) {
      filteredAlerts = filteredAlerts.filter(alert => 
        alert.location.toLowerCase().includes(region.toLowerCase())
      );
    }
    
    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => alert.type === type);
    }

    filteredAlerts = filteredAlerts.slice(0, parseInt(limit));

    res.json({
      status: 'success',
      data: filteredAlerts
    });
  } catch (error) {
    console.error('Get active alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch active alerts'
    });
  }
});

// Update alert status (admin only)
router.put('/:id/status', protect, admin, [
  body('isActive').isBoolean().withMessage('isActive must be a boolean'),
  body('status').optional().isIn(['active', 'resolved', 'cancelled']).withMessage('Invalid status')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        status: 'error',
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const { isActive, status } = req.body;

    // Mock implementation - in real app, update Alert model
    const updatedAlert = {
      id,
      isActive,
      status: status || (isActive ? 'active' : 'resolved'),
      updatedAt: new Date(),
      updatedBy: req.user._id
    };

    // Emit to socket clients
    if (global.io) {
      global.io.emit('alert:update', updatedAlert);
    }

    res.json({
      status: 'success',
      data: updatedAlert
    });
  } catch (error) {
    console.error('Update alert status error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to update alert status'
    });
  }
});

// Get alert history
router.get('/history', protect, admin, async (req, res) => {
  try {
    const { 
      startDate, 
      endDate, 
      type, 
      region, 
      page = 1, 
      limit = 20 
    } = req.query;

    // Mock implementation - in real app, query Alert model with date filters
    const history = [
      {
        id: '1',
        type: 'earthquake',
        severity: 'moderate',
        title: 'Earthquake Alert - Punjab Region',
        location: 'Punjab, India',
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        isActive: false,
        status: 'resolved'
      }
    ];

    res.json({
      status: 'success',
      data: {
        alerts: history,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: history.length,
          pages: 1
        }
      }
    });
  } catch (error) {
    console.error('Get alert history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch alert history'
    });
  }
});

// Get NDMA fallback alerts
router.get('/ndma/fallback', async (req, res) => {
  try {
    const weatherService = new WeatherService();
    const fallbackAlerts = await weatherService.generateFallbackAlerts();

    res.json({
      status: 'success',
      data: {
        alerts: fallbackAlerts,
        source: 'NDMA_FALLBACK',
        generatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('NDMA fallback alerts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to generate fallback alerts'
    });
  }
});

module.exports = router;
