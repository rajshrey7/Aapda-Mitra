// 1. Import the Google Generative AI package
const { GoogleGenerativeAI } = require('@google/generative-ai');
const OpenAI = require('openai'); // You can remove this line if not used elsewhere

// 2. Initialize the Gemini client with your API key from environment variables
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'dummy-key-for-development');

// Disaster preparedness knowledge base (remains the same)
const disasterKnowledgeBase = {
  earthquake: {
    before: [
      'Identify safe spots in each room (under sturdy tables, against interior walls)',
      'Practice "Drop, Cover, and Hold On" drills',
      'Secure heavy items and furniture to walls',
      'Prepare emergency kit with water, food, first aid, flashlight',
      'Know how to turn off gas, water, and electricity'
    ],
    during: [
      'DROP to hands and knees immediately',
      'Take COVER under a sturdy desk, table, or against an interior wall',
      'HOLD ON to your shelter and protect your head/neck with arms',
      'Stay where you are until shaking stops',
      'If outdoors, move away from buildings, trees, and power lines'
    ],
    after: [
      'Check for injuries and provide first aid',
      'Check for damage, smell gas leaks',
      'Turn off utilities if damaged',
      'Stay out of damaged buildings',
      'Expect aftershocks'
    ]
  },
  flood: {
    before: [
      'Know your area\'s flood risk',
      'Have evacuation routes planned',
      'Keep important documents in waterproof container',
      'Install check valves in plumbing',
      'Stock emergency supplies including battery-powered radio'
    ],
    during: [
      'Move immediately to higher ground',
      'Never walk in moving water',
      'Do not drive through flooded areas',
      'Stay away from power lines and electrical wires',
      'Turn off utilities at main switches if instructed'
    ],
    after: [
      'Return home only when authorities say it\'s safe',
      'Avoid floodwater - it may be contaminated',
      'Check for structural damage before entering buildings',
      'Clean and disinfect everything that got wet',
      'Watch for snakes and other animals'
    ]
  },
  fire: {
    before: [
      'Install smoke alarms on every level',
      'Plan and practice fire escape routes',
      'Keep fire extinguishers in key locations',
      'Never leave cooking unattended',
      'Keep matches and lighters away from children'
    ],
    during: [
      'Get out immediately - don\'t stop for belongings',
      'Feel doors with back of hand before opening',
      'Stay low under smoke',
      'Stop, Drop, and Roll if clothes catch fire',
      'Once out, stay out - never go back inside'
    ],
    after: [
      'Call emergency services from outside',
      'Get medical attention for burns immediately',
      'Do not enter building until fire department says it\'s safe',
      'Contact insurance company',
      'Look for structural damage'
    ]
  }
};

// @desc    Chat with AI bot
// @route   POST /api/chatbot/chat
// @access  Private
const chat = async (req, res) => {
  try {
    const { message, context, language } = req.body;

    // 3. If no Gemini key, use knowledge base (updated the environment variable check)
    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'dummy-key-for-development') {
      console.log('Using fallback knowledge base.');
      const response = generateKnowledgeBaseResponse(message);
      return res.json({
        status: 'success',
        data: {
          response,
          isFromKnowledgeBase: true
        }
      });
    }

    // 4. Get the Gemini model (using flash model for better rate limits)
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Create system prompt (now called a system instruction for Gemini)
    const systemInstruction = `You are Aapda Mitra, an AI assistant specializing in disaster preparedness education for schools in Punjab, India. 
  You provide clear, actionable advice about:
  - Earthquake safety and preparedness
  - Flood prevention and response
  - Fire safety measures
  - First aid procedures
  - Emergency planning for schools
  - Region-specific disasters in Punjab
  
  Always provide practical, age-appropriate advice. Be encouraging and supportive.
  If asked in Hindi or Punjabi, respond in the same language.
  Current context: ${context || 'General inquiry'}`;

    // 5. Construct the payload for Gemini and make the API call
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: message }] }],
      systemInstruction: {
        parts: [{ text: systemInstruction }],
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 500,
      },
    });

    // 6. Extract the response text
    const response = await result.response.text();

    res.json({
      status: 'success',
      data: {
        response,
        isFromKnowledgeBase: false
      }
    });
  } catch (error) {
    console.error('Chat error:', error);

    // Check error type and provide appropriate fallback
    let response;
    if (error.message && error.message.includes('429')) {
      console.log('Rate limit exceeded, using knowledge base fallback');
      response = generateKnowledgeBaseResponse(req.body.message) + 
        '\n\n⚠️ Note: AI service is temporarily unavailable due to high usage. This response is from our knowledge base.';
    } else if (error.message && error.message.includes('API_KEY_INVALID')) {
      console.log('Invalid API key, using knowledge base fallback');
      response = generateKnowledgeBaseResponse(req.body.message) + 
        '\n\n⚠️ Note: AI service configuration issue. This response is from our knowledge base.';
    } else {
      console.log('API error, using knowledge base fallback');
      response = generateKnowledgeBaseResponse(req.body.message) + 
        '\n\n⚠️ Note: AI service temporarily unavailable. This response is from our knowledge base.';
    }
    res.json({
      status: 'success',
      data: {
        response,
        isFromKnowledgeBase: true,
        error: error.message || 'API temporarily unavailable'
      }
    });
  }
};

// The rest of the functions remain exactly the same
// ... (getDisasterTips, getEmergencyContacts, generateKnowledgeBaseResponse) ...

// @desc    Get disaster tips
// @route   GET /api/chatbot/tips
// @access  Public
const getDisasterTips = async (req, res) => {
  try {
    const { category, phase } = req.query;

    let tips = [];

    if (category && disasterKnowledgeBase[category]) {
      if (phase && disasterKnowledgeBase[category][phase]) {
        tips = disasterKnowledgeBase[category][phase];
      } else {
        // Return all phases for the category
        tips = {
          before: disasterKnowledgeBase[category].before,
          during: disasterKnowledgeBase[category].during,
          after: disasterKnowledgeBase[category].after
        };
      }
    } else {
      // Return tips for all categories
      tips = disasterKnowledgeBase;
    }

    res.json({
      status: 'success',
      data: tips
    });
  } catch (error) {
    console.error('Get tips error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching disaster tips'
    });
  }
};

// @desc    Get emergency contacts
// @route   GET /api/chatbot/emergency-contacts
// @access  Public
const getEmergencyContacts = async (req, res) => {
  try {
    const contacts = {
      national: {
        police: '100',
        fire: '101',
        ambulance: '108',
        disaster: '1078',
        women: '1091',
        child: '1098'
      },
      punjab: {
        stateEmergency: '112',
        cmHelpline: '1100',
        healthHelpline: '104',
        covidHelpline: '1075'
      },
      important: [
        {
          name: 'National Disaster Response Force',
          number: '011-26701700',
          description: 'For major disaster response'
        },
        {
          name: 'Punjab State Disaster Management Authority',
          number: '0172-2749378',
          description: 'State-level disaster coordination'
        },
        {
          name: 'Blood Bank',
          number: '1910',
          description: 'Blood donation and requirement'
        }
      ]
    };

    res.json({
      status: 'success',
      data: contacts
    });
  } catch (error) {
    console.error('Get emergency contacts error:', error);
    res.status(500).json({
      status: 'error',
      message: 'Error fetching emergency contacts'
    });
  }
};

// Helper function to generate response from knowledge base (remains the same)
function generateKnowledgeBaseResponse(message) {
  const lowerMessage = message.toLowerCase();

  // Check for disaster type mentions
  for (const [disaster, info] of Object.entries(disasterKnowledgeBase)) {
    if (lowerMessage.includes(disaster)) {
      // Check for phase mentions
      if (lowerMessage.includes('before') || lowerMessage.includes('prepare')) {
        return `Here are preparation tips for ${disaster}:\n\n` +
          info.before.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
      }
      if (lowerMessage.includes('during')) {
        return `Here's what to do during a ${disaster}:\n\n` +
          info.during.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
      }
      if (lowerMessage.includes('after')) {
        return `Here's what to do after a ${disaster}:\n\n` +
          info.after.map((tip, i) => `${i + 1}. ${tip}`).join('\n');
      }

      // Return general info about the disaster
      return `Here's comprehensive information about ${disaster} safety:\n\n` +
        `BEFORE:\n${info.before[0]}\n\n` +
        `DURING:\n${info.during[0]}\n\n` +
        `AFTER:\n${info.after[0]}\n\n` +
        `Would you like more detailed information about any specific phase?`;
    }
  }

  // Default response
  return `I'm Aapda Mitra, your disaster preparedness assistant for schools in Punjab, India. I can help you with:
  
  1. 🏔️ Earthquake safety and preparedness
  2. 💧 Flood prevention and response
  3. 🔥 Fire safety measures
  4. 🏥 First aid procedures
  5. 📞 Emergency contacts and planning
  6. 🏫 School-specific emergency protocols
  7. 🌪️ Region-specific disasters in Punjab
  
  Please ask me about any specific disaster or safety topic you'd like to learn about! I can provide detailed guidance for before, during, and after emergency situations.`;
}

module.exports = {
  chat,
  getDisasterTips,
  getEmergencyContacts
};