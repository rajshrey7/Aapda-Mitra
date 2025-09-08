// server/routes/emergency.js
// Emergency communication and contact directory endpoints

const express = require('express');
const { body, validationResult } = require('express-validator');
const { protect, admin } = require('../middleware/authMiddleware');

const router = express.Router();

// Get emergency contacts by school
router.get('/contacts/:schoolId', async (req, res) => {
  try {
    const { schoolId } = req.params;
    
    // Mock emergency contacts data - in real implementation, use EmergencyContact model
    const contacts = {
      school: schoolId,
      primaryContacts: [
        {
          name: 'Principal',
          role: 'Principal',
          phone: '+91-9876543210',
          email: 'principal@school.edu',
          isPrimary: true,
          available24x7: false
        },
        {
          name: 'Emergency Coordinator',
          role: 'Emergency Coordinator',
          phone: '+91-9876543211',
          email: 'emergency@school.edu',
          isPrimary: true,
          available24x7: true
        }
      ],
      emergencyServices: [
        {
          name: 'Police',
          number: '100',
          description: 'Emergency police assistance',
          isActive: true
        },
        {
          name: 'Fire Department',
          number: '101',
          description: 'Fire and rescue services',
          isActive: true
        },
        {
          name: 'Ambulance',
          number: '102',
          description: 'Medical emergency services',
          isActive: true
        },
        {
          name: 'Disaster Management',
          number: '108',
          description: 'Disaster emergency helpline',
          isActive: true
        }
      ],
      regionalContacts: [
        {
          name: 'District Emergency Officer',
          role: 'District Emergency Officer',
          phone: '+91-9876543212',
          email: 'deo@district.gov.in',
          jurisdiction: 'Punjab',
          isActive: true
        },
        {
          name: 'NDMA Regional Office',
          role: 'NDMA Regional Office',
          phone: '+91-9876543213',
          email: 'regional@ndma.gov.in',
          jurisdiction: 'North India',
          isActive: true
        }
      ],
      lastUpdated: new Date()
    };

    res.json({
      status: 'success',
      data: contacts
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch emergency contacts'
    });
  }
});

// Broadcast emergency message (admin only)
router.post('/broadcast', protect, admin, [
  body('message').trim().isLength({ min: 1, max: 1000 }).withMessage('Message is required and must be less than 1000 characters'),
  body('priority').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid priority level'),
  body('targetType').isIn(['school', 'region', 'all']).withMessage('Invalid target type'),
  body('targetId').optional().isString().withMessage('Target ID must be a string')
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

    const { message, priority, targetType, targetId, title } = req.body;

    const broadcast = {
      id: Date.now().toString(),
      title: title || 'Emergency Broadcast',
      message,
      priority,
      targetType,
      targetId,
      sentBy: req.user._id,
      sentAt: new Date(),
      status: 'sent'
    };

    // Emit to socket clients
    if (global.io) {
      const room = targetType === 'all' ? 'emergency' : `emergency:${targetType}:${targetId}`;
      global.io.to(room).emit('admin:broadcast', broadcast);
    }

    // SMS fallback stub (in real implementation, integrate with Twilio)
    try {
      await sendSMSFallback(broadcast);
      broadcast.smsStatus = 'sent';
    } catch (smsError) {
      console.error('SMS fallback failed:', smsError);
      broadcast.smsStatus = 'failed';
    }

    res.status(201).json({
      status: 'success',
      data: broadcast
    });
  } catch (error) {
    console.error('Broadcast emergency message error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to broadcast emergency message'
    });
  }
});

// Get emergency broadcast history
router.get('/broadcast/history', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 20, targetType, priority } = req.query;

    // Mock broadcast history - in real implementation, query Broadcast model
    const history = [
      {
        id: '1',
        title: 'Earthquake Drill Scheduled',
        message: 'Emergency earthquake drill scheduled for tomorrow at 10 AM',
        priority: 'medium',
        targetType: 'all',
        sentAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        status: 'sent',
        smsStatus: 'sent'
      },
      {
        id: '2',
        title: 'Weather Alert',
        message: 'Heavy rainfall expected. Stay indoors and avoid flooded areas.',
        priority: 'high',
        targetType: 'region',
        targetId: 'Punjab',
        sentAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        status: 'sent',
        smsStatus: 'sent'
      }
    ];

    let filteredHistory = history;
    
    if (targetType) {
      filteredHistory = filteredHistory.filter(b => b.targetType === targetType);
    }
    
    if (priority) {
      filteredHistory = filteredHistory.filter(b => b.priority === priority);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const paginatedHistory = filteredHistory.slice(skip, skip + parseInt(limit));

    res.json({
      status: 'success',
      data: {
        broadcasts: paginatedHistory,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: filteredHistory.length,
          pages: Math.ceil(filteredHistory.length / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error('Get broadcast history error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch broadcast history'
    });
  }
});

// Get emergency procedures
router.get('/procedures', async (req, res) => {
  try {
    const { type, schoolId } = req.query;

    // Mock emergency procedures - in real implementation, use EmergencyProcedure model
    const procedures = [
      {
        id: '1',
        type: 'earthquake',
        title: 'Earthquake Emergency Procedure',
        steps: [
          'Drop, Cover, and Hold On',
          'Stay indoors until shaking stops',
          'Evacuate to designated safe area',
          'Account for all students and staff',
          'Wait for all-clear signal'
        ],
        duration: '5-10 minutes',
        responsiblePerson: 'Emergency Coordinator',
        lastUpdated: new Date()
      },
      {
        id: '2',
        type: 'fire',
        title: 'Fire Emergency Procedure',
        steps: [
          'Activate fire alarm',
          'Evacuate immediately via nearest exit',
          'Meet at designated assembly point',
          'Account for all students and staff',
          'Do not re-enter building until cleared'
        ],
        duration: '3-5 minutes',
        responsiblePerson: 'Fire Safety Officer',
        lastUpdated: new Date()
      },
      {
        id: '3',
        type: 'flood',
        title: 'Flood Emergency Procedure',
        steps: [
          'Move to higher ground immediately',
          'Avoid walking through floodwaters',
          'Turn off electricity and gas',
          'Listen to emergency broadcasts',
          'Wait for rescue or all-clear'
        ],
        duration: '10-30 minutes',
        responsiblePerson: 'Emergency Coordinator',
        lastUpdated: new Date()
      }
    ];

    let filteredProcedures = procedures;
    
    if (type) {
      filteredProcedures = filteredProcedures.filter(p => p.type === type);
    }

    res.json({
      status: 'success',
      data: filteredProcedures
    });
  } catch (error) {
    console.error('Get emergency procedures error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to fetch emergency procedures'
    });
  }
});

// Report emergency incident
router.post('/incident', protect, [
  body('type').isIn(['earthquake', 'fire', 'flood', 'medical', 'security', 'other']).withMessage('Invalid incident type'),
  body('severity').isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid severity level'),
  body('description').trim().isLength({ min: 1, max: 1000 }).withMessage('Description is required and must be less than 1000 characters'),
  body('location').trim().isLength({ min: 1, max: 200 }).withMessage('Location is required and must be less than 200 characters')
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

    const { type, severity, description, location, coordinates, casualties, injuries } = req.body;

    const incident = {
      id: Date.now().toString(),
      type,
      severity,
      description,
      location,
      coordinates,
      casualties: casualties || 0,
      injuries: injuries || 0,
      reportedBy: req.user._id,
      reportedAt: new Date(),
      status: 'reported',
      school: req.user.school,
      region: req.user.region
    };

    // Emit to socket clients (admin/emergency coordinators)
    if (global.io) {
      global.io.to('admin').emit('incident:reported', incident);
      global.io.to(`emergency:school:${req.user.school}`).emit('incident:reported', incident);
    }

    // Auto-notify emergency services for critical incidents
    if (severity === 'critical') {
      try {
        await notifyEmergencyServices(incident);
        incident.emergencyServicesNotified = true;
      } catch (notifyError) {
        console.error('Emergency services notification failed:', notifyError);
        incident.emergencyServicesNotified = false;
      }
    }

    res.status(201).json({
      status: 'success',
      data: incident
    });
  } catch (error) {
    console.error('Report incident error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to report incident'
    });
  }
});

// Helper function for SMS fallback
async function sendSMSFallback(broadcast) {
  // Mock SMS sending - in real implementation, integrate with Twilio
  console.log(`SMS sent: ${broadcast.title} - ${broadcast.message}`);
  return Promise.resolve();
}

// Helper function to notify emergency services
async function notifyEmergencyServices(incident) {
  // Mock emergency services notification
  console.log(`Emergency services notified: ${incident.type} at ${incident.location}`);
  return Promise.resolve();
}

module.exports = router;
