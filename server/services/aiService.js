// server/services/aiService.js
// AI service with Gemini integration and fallback responses

const { GoogleGenerativeAI } = require('@google/generative-ai');

class AIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    this.isAvailable = !!this.apiKey;
    
    if (this.isAvailable) {
      try {
        this.genAI = new GoogleGenerativeAI(this.apiKey);
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
        console.log('AI Service initialized with Gemini');
      } catch (error) {
        console.error('Failed to initialize Gemini:', error);
        this.isAvailable = false;
      }
    } else {
      console.log('AI Service running in fallback mode (no API key)');
    }
  }

  async summarizeWeatherAlert(alert) {
    if (!this.isAvailable) {
      return this.getFallbackAlertSummary(alert);
    }

    try {
      const prompt = `
        Summarize this weather alert in simple, clear language for students and teachers:
        
        Type: ${alert.type}
        Severity: ${alert.severity}
        Title: ${alert.title}
        Description: ${alert.description}
        Location: ${alert.location}
        
        Provide a brief summary (2-3 sentences) that explains:
        1. What is happening
        2. What people should do
        3. Any immediate actions needed
        
        Keep it simple and educational for school children.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const summary = response.text();

      return {
        summary: summary.trim(),
        ai: true,
        confidence: 0.9
      };
    } catch (error) {
      console.error('AI summarization error:', error);
      return this.getFallbackAlertSummary(alert);
    }
  }

  async generateQuizQuestion(topic, difficulty, performance) {
    if (!this.isAvailable) {
      return this.getFallbackQuizQuestion(topic, difficulty);
    }

    try {
      const prompt = `
        Generate a ${difficulty} difficulty quiz question about ${topic} for disaster preparedness education.
        
        Previous performance: ${performance || 'No previous data'}
        
        Create a multiple-choice question with:
        1. A clear, educational question
        2. 4 answer options (A, B, C, D)
        3. One correct answer
        4. A brief explanation of why the answer is correct
        
        Format the response as JSON:
        {
          "question": "Question text here",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctIndex": 0,
          "explanation": "Explanation here",
          "points": 10
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      // Try to parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const questionData = JSON.parse(jsonMatch[0]);
        return {
          ...questionData,
          ai: true,
          confidence: 0.8
        };
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      console.error('AI quiz generation error:', error);
      return this.getFallbackQuizQuestion(topic, difficulty);
    }
  }

  async analyzeDrillPerformance(drillData) {
    if (!this.isAvailable) {
      return this.getFallbackDrillAnalysis(drillData);
    }

    try {
      const prompt = `
        Analyze this disaster preparedness drill performance and provide feedback:
        
        Drill Type: ${drillData.drillType}
        Score: ${drillData.score}/100
        Performance Metrics:
        - Accuracy: ${drillData.performance.accuracy}%
        - Speed: ${drillData.performance.speed}%
        - Safety: ${drillData.performance.safety}%
        - Teamwork: ${drillData.performance.teamwork}%
        - Decision Making: ${drillData.performance.decisionMaking}%
        
        Time Taken: ${drillData.timeTaken} seconds
        Completed Steps: ${drillData.completedSteps.length}
        Missed Steps: ${drillData.missedSteps.length}
        
        Provide analysis in JSON format:
        {
          "analysis": "Overall performance analysis",
          "strengths": ["strength1", "strength2"],
          "weaknesses": ["weakness1", "weakness2"],
          "recommendations": ["recommendation1", "recommendation2"],
          "nextSteps": ["next step1", "next step2"],
          "confidence": 0.8
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const analysis = JSON.parse(jsonMatch[0]);
        return {
          ...analysis,
          ai: true
        };
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      console.error('AI drill analysis error:', error);
      return this.getFallbackDrillAnalysis(drillData);
    }
  }

  async generateEmergencyInstructions(alertType, severity) {
    if (!this.isAvailable) {
      return this.getFallbackEmergencyInstructions(alertType, severity);
    }

    try {
      const prompt = `
        Generate emergency instructions for a ${severity} severity ${alertType} alert.
        
        Provide clear, step-by-step instructions that are appropriate for:
        - School children (ages 8-18)
        - Teachers and staff
        - Emergency coordinators
        
        Format as JSON:
        {
          "immediateActions": ["action1", "action2", "action3"],
          "safetySteps": ["step1", "step2", "step3"],
          "communication": ["comm1", "comm2"],
          "evacuation": ["evac1", "evac2"],
          "aftermath": ["after1", "after2"]
        }
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const instructions = JSON.parse(jsonMatch[0]);
        return {
          ...instructions,
          ai: true,
          confidence: 0.9
        };
      } else {
        throw new Error('Invalid JSON response from AI');
      }
    } catch (error) {
      console.error('AI emergency instructions error:', error);
      return this.getFallbackEmergencyInstructions(alertType, severity);
    }
  }

  // Fallback methods when AI is not available
  getFallbackAlertSummary(alert) {
    const summaries = {
      earthquake: `An earthquake alert has been issued. This means there's a risk of ground shaking. Stay calm and follow your school's earthquake safety procedures.`,
      flood: `A flood alert has been issued. This means there's a risk of flooding in your area. Move to higher ground and avoid walking through floodwaters.`,
      fire: `A fire alert has been issued. This means there's a fire risk. Follow your school's fire evacuation procedures and move to the designated safe area.`,
      cyclone: `A cyclone alert has been issued. This means there's a risk of strong winds and heavy rain. Stay indoors and away from windows.`
    };

    return {
      summary: summaries[alert.type] || `A ${alert.severity} ${alert.type} alert has been issued. Please follow your school's emergency procedures.`,
      ai: false,
      confidence: 0.5
    };
  }

  getFallbackQuizQuestion(topic, difficulty) {
    const questions = {
      earthquake: {
        easy: {
          question: "What should you do during an earthquake?",
          options: [
            "Run outside immediately",
            "Drop, Cover, and Hold On",
            "Stand in a doorway",
            "Hide under a table"
          ],
          correctIndex: 1,
          explanation: "Drop, Cover, and Hold On is the safest action during an earthquake.",
          points: 10
        },
        medium: {
          question: "What is the safest place to be during an earthquake?",
          options: [
            "Outside in an open field",
            "Under a sturdy table or desk",
            "In a doorway",
            "Near windows"
          ],
          correctIndex: 1,
          explanation: "Under a sturdy table or desk provides the best protection from falling objects.",
          points: 15
        },
        hard: {
          question: "What should you do if you're outside during an earthquake?",
          options: [
            "Run to the nearest building",
            "Stay in an open area away from buildings",
            "Stand under a tree",
            "Go to your car"
          ],
          correctIndex: 1,
          explanation: "Stay in an open area away from buildings, trees, and power lines.",
          points: 20
        }
      },
      flood: {
        easy: {
          question: "What should you do if you see floodwaters?",
          options: [
            "Walk through them to get home",
            "Avoid them and find higher ground",
            "Swim across them",
            "Drive through them"
          ],
          correctIndex: 1,
          explanation: "Always avoid floodwaters and move to higher ground for safety.",
          points: 10
        }
      }
    };

    const topicQuestions = questions[topic] || questions.earthquake;
    const difficultyQuestions = topicQuestions[difficulty] || topicQuestions.easy;

    return {
      ...difficultyQuestions,
      ai: false,
      confidence: 0.6
    };
  }

  getFallbackDrillAnalysis(drillData) {
    const score = drillData.score;
    let analysis = '';
    let strengths = [];
    let weaknesses = [];
    let recommendations = [];

    if (score >= 80) {
      analysis = 'Excellent performance! You demonstrated strong disaster preparedness skills.';
      strengths = ['High accuracy', 'Good time management', 'Strong safety awareness'];
      recommendations = ['Continue practicing regularly', 'Help train other students'];
    } else if (score >= 60) {
      analysis = 'Good performance with room for improvement.';
      strengths = ['Basic safety knowledge', 'Reasonable response time'];
      weaknesses = ['Some steps missed', 'Could improve accuracy'];
      recommendations = ['Practice more drills', 'Review safety procedures'];
    } else {
      analysis = 'Needs improvement. Focus on basic safety procedures.';
      weaknesses = ['Low accuracy', 'Missed critical steps', 'Slow response time'];
      recommendations = ['Review emergency procedures', 'Practice basic drills', 'Ask for help from teachers'];
    }

    return {
      analysis,
      strengths,
      weaknesses,
      recommendations,
      nextSteps: ['Continue learning', 'Practice regularly', 'Stay prepared'],
      confidence: 0.7,
      ai: false
    };
  }

  getFallbackEmergencyInstructions(alertType, severity) {
    const instructions = {
      earthquake: {
        immediateActions: ['Drop to the ground', 'Take cover under a sturdy table', 'Hold on until shaking stops'],
        safetySteps: ['Stay indoors', 'Stay away from windows', 'Don\'t use elevators'],
        communication: ['Listen to emergency broadcasts', 'Check on family members'],
        evacuation: ['Wait for all-clear signal', 'Use stairs, not elevators'],
        aftermath: ['Check for injuries', 'Assess building damage', 'Listen for updates']
      },
      flood: {
        immediateActions: ['Move to higher ground', 'Avoid walking through floodwaters', 'Turn off electricity'],
        safetySteps: ['Stay away from rivers and streams', 'Don\'t drive through flooded areas'],
        communication: ['Listen to weather updates', 'Contact emergency services if needed'],
        evacuation: ['Follow evacuation routes', 'Take emergency supplies'],
        aftermath: ['Wait for all-clear', 'Check for damage', 'Avoid contaminated water']
      },
      fire: {
        immediateActions: ['Activate fire alarm', 'Evacuate immediately', 'Close doors behind you'],
        safetySteps: ['Use stairs, not elevators', 'Stay low to avoid smoke', 'Feel doors before opening'],
        communication: ['Call emergency services', 'Account for all people'],
        evacuation: ['Follow evacuation plan', 'Meet at designated area'],
        aftermath: ['Wait for all-clear', 'Don\'t re-enter building', 'Report missing persons']
      }
    };

    return {
      ...instructions[alertType] || instructions.earthquake,
      ai: false,
      confidence: 0.8
    };
  }

  async generateLearningContent(hazardType, ageGroup = '8-16') {
    if (!this.isAvailable) {
      return this.getFallbackLearningContent(hazardType, ageGroup);
    }

    try {
      const prompt = `
        Generate comprehensive learning content for a ${hazardType} safety module for children aged ${ageGroup}.
        
        Create an interactive digital learning book with the following structure:
        
        1. Introduction: What is a ${hazardType}? (2-3 sentences, kid-friendly)
        2. Learning Objectives: 4-6 key learning goals with emojis
        3. How it Happens: Scientific explanation in simple terms
        4. Safety Tips: Practical safety advice with key terms
        5. Real Story: A historical event presented as a story with timeline
        6. Interactive Activity: A "What would you do?" scenario with 4 options
        7. Summary: Key safety tips recap
        8. Certificate Message: Motivational completion message
        
        Format as JSON with this structure:
        {
          "introduction": {
            "title": "What is a ${hazardType}?",
            "text": "Kid-friendly explanation here",
            "icon": "appropriate emoji"
          },
          "objectives": [
            "🌍 How ${hazardType}s happen",
            "🏠 How to stay safe",
            "🚨 What to do during emergency",
            "📱 How to get help",
            "🆘 How to help others",
            "📚 Where to learn more"
          ],
          "content": [
            {
              "title": "How ${hazardType}s Happen",
              "text": "Scientific explanation in simple terms",
              "keyTerms": ["Term 1", "Term 2", "Term 3"]
            },
            {
              "title": "Safety Tips",
              "text": "Practical safety advice",
              "keyTerms": ["Safety Term 1", "Safety Term 2"]
            }
          ],
          "story": {
            "title": "The Great ${hazardType} of [Year]",
            "text": "Historical story in kid-friendly language",
            "timeline": ["Event 1", "Event 2", "Event 3", "Event 4", "Event 5"]
          },
          "activity": {
            "question": "You're in [scenario] when a ${hazardType} happens. What should you do?",
            "options": [
              "Option A - Wrong answer",
              "Option B - Correct answer",
              "Option C - Wrong answer",
              "Option D - Wrong answer"
            ],
            "correct": 1,
            "explanation": "Why the correct answer is right"
          },
          "summary": [
            "🌍 ${hazardType}s happen when [reason]",
            "🏠 [Main safety tip]",
            "🚨 [Emergency action]",
            "📱 [How to get help]",
            "🆘 [How to help others]"
          ],
          "certificate": {
            "title": "Congratulations!",
            "subtitle": "You are a ${hazardType} Safety Hero!",
            "message": "You've learned how to stay safe during ${hazardType}s. Share your knowledge with family and friends!"
          }
        }
        
        Make it engaging, educational, and age-appropriate. Use simple language and include relevant emojis.
      `;

      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();
      
      // Try to parse JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      // Fallback to structured response
      return this.getFallbackLearningContent(hazardType, ageGroup);
    } catch (error) {
      console.error('Error generating learning content:', error);
      return this.getFallbackLearningContent(hazardType, ageGroup);
    }
  }

  getFallbackLearningContent(hazardType, ageGroup) {
    const fallbackContent = {
      earthquake: {
        introduction: {
          title: "What is an Earthquake?",
          text: "An earthquake is when the ground shakes! It happens when big pieces of Earth's crust move and bump into each other.",
          icon: "🌍"
        },
        objectives: [
          "🌍 How earthquakes happen",
          "🏠 How to make your home safer",
          "🚨 What to do during an earthquake",
          "📱 How to get emergency alerts",
          "🆘 How to help others safely",
          "📚 Where to find more information"
        ],
        content: [
          {
            title: "How Earthquakes Happen",
            text: "The Earth's surface is made of huge pieces called tectonic plates. When these plates move, they can cause earthquakes. The shaking happens when energy is released from deep underground.",
            keyTerms: ["Tectonic Plates", "Seismic Waves", "Epicenter"]
          },
          {
            title: "Safety Tips",
            text: "When you feel the ground shaking: Drop, Cover, and Hold On! Find a sturdy table or desk and hold on tight until the shaking stops.",
            keyTerms: ["Drop, Cover, Hold On", "Sturdy Furniture", "Stay Indoors"]
          }
        ],
        story: {
          title: "The Great Earthquake of 1906",
          text: "In 1906, a huge earthquake hit San Francisco. It was so strong that buildings fell down and fires started everywhere. But people helped each other and rebuilt the city!",
          timeline: ["April 18, 1906", "5:12 AM", "Magnitude 7.9", "3,000+ deaths", "City rebuilt"]
        },
        activity: {
          question: "You're in your classroom when an earthquake starts. What should you do?",
          options: [
            "Run outside quickly",
            "Drop, cover, and hold on under your desk",
            "Stand in the doorway",
            "Go to the window"
          ],
          correct: 1,
          explanation: "The safest thing is to drop, cover, and hold on under a sturdy desk or table!"
        },
        summary: [
          "🌍 Earthquakes happen when tectonic plates move",
          "🏠 Drop, Cover, and Hold On during shaking",
          "📱 Sign up for emergency alerts",
          "🆘 Help others after the shaking stops",
          "📚 Learn more about earthquake safety"
        ],
        certificate: {
          title: "Congratulations!",
          subtitle: "You are an Earthquake Safety Hero!",
          message: "You've learned how to stay safe during earthquakes. Share your knowledge with family and friends!"
        }
      },
      fire: {
        introduction: {
          title: "What is Fire?",
          text: "Fire is a chemical reaction that produces heat and light. It needs three things: fuel, oxygen, and heat. We call this the Fire Triangle!",
          icon: "🔥"
        },
        objectives: [
          "🔥 How fires start and spread",
          "🚫 How to prevent fires at home",
          "🚨 What to do if there's a fire",
          "📞 How to call emergency services",
          "🆘 How to help others safely",
          "📚 Fire safety rules to remember"
        ],
        content: [
          {
            title: "The Fire Triangle",
            text: "Fire needs three things to burn: Fuel (something to burn), Oxygen (air), and Heat (spark or flame). Remove any one of these, and the fire goes out!",
            keyTerms: ["Fire Triangle", "Fuel", "Oxygen", "Heat"]
          },
          {
            title: "Fire Prevention",
            text: "Never play with matches, lighters, or candles. Keep flammable things away from heat sources. Always have working smoke detectors in your home!",
            keyTerms: ["Smoke Detectors", "Fire Extinguisher", "Escape Plan"]
          }
        ],
        story: {
          title: "The Great Fire of London",
          text: "In 1666, a small fire in a bakery grew into a huge fire that burned for 4 days! It destroyed most of London, but people learned important lessons about fire safety.",
          timeline: ["September 2, 1666", "Pudding Lane Bakery", "4 days of burning", "13,000+ houses destroyed", "New fire safety laws"]
        },
        activity: {
          question: "What should you do if your clothes catch fire?",
          options: [
            "Run around to put it out",
            "Stop, Drop, and Roll",
            "Jump up and down",
            "Blow on the flames"
          ],
          correct: 1,
          explanation: "Stop, Drop, and Roll is the safest way to put out flames on your clothes!"
        },
        summary: [
          "🔥 Fire needs fuel, oxygen, and heat",
          "🚫 Never play with matches or lighters",
          "🚨 Stop, Drop, and Roll if clothes catch fire",
          "📞 Call 911 for help",
          "🏠 Have a family escape plan"
        ],
        certificate: {
          title: "Congratulations!",
          subtitle: "You are a Fire Safety Hero!",
          message: "You've learned how to prevent fires and stay safe. Share your knowledge with family and friends!"
        }
      },
      thunderstorm: {
        introduction: {
          title: "What is a Thunderstorm?",
          text: "A thunderstorm is a storm with thunder and lightning! It happens when warm, moist air rises quickly and meets cold air high in the sky.",
          icon: "⛈️"
        },
        objectives: [
          "⛈️ How thunderstorms form",
          "⚡ Why lightning happens",
          "🌧️ What causes thunder",
          "🏠 How to stay safe indoors",
          "🚗 What to do if caught outside",
          "📱 How to track storms"
        ],
        content: [
          {
            title: "Lightning and Thunder",
            text: "Lightning is electricity in the sky! When it happens, it heats the air so fast that it makes a loud sound called thunder. Light travels faster than sound, so we see lightning before we hear thunder.",
            keyTerms: ["Lightning", "Thunder", "Electricity", "Sound Waves"]
          },
          {
            title: "Storm Safety",
            text: "When you hear thunder, go indoors immediately! Stay away from windows, don't use electronics, and avoid water. If you're outside, find a low spot and crouch down.",
            keyTerms: ["Indoor Safety", "Lightning Rod", "Storm Shelter"]
          }
        ],
        story: {
          title: "The Great Storm of 1987",
          text: "In 1987, a huge storm hit England with winds over 100 mph! It knocked down millions of trees and caused lots of damage, but people helped each other clean up.",
          timeline: ["October 15, 1987", "100+ mph winds", "15 million trees down", "18 deaths", "Community cleanup"]
        },
        activity: {
          question: "What should you do if you're outside during a thunderstorm?",
          options: [
            "Stand under a tall tree",
            "Find a low spot and crouch down",
            "Run to the nearest building",
            "Lie flat on the ground"
          ],
          correct: 1,
          explanation: "Find a low spot and crouch down to avoid being the tallest object around!"
        },
        summary: [
          "⛈️ Thunderstorms have lightning and thunder",
          "🏠 Go indoors when you hear thunder",
          "⚡ Stay away from windows and electronics",
          "🌧️ Avoid water during storms",
          "📱 Use weather apps to track storms"
        ],
        certificate: {
          title: "Congratulations!",
          subtitle: "You are a Thunderstorm Safety Hero!",
          message: "You've learned how to stay safe during thunderstorms. Share your knowledge with family and friends!"
        }
      },
      heatwave: {
        introduction: {
          title: "What is a Heatwave?",
          text: "A heatwave is when it's much hotter than normal for several days in a row. It can be dangerous if we don't stay cool and drink lots of water!",
          icon: "☀️"
        },
        objectives: [
          "☀️ What causes heatwaves",
          "🌡️ How heat affects our bodies",
          "💧 Why water is so important",
          "🏠 How to stay cool indoors",
          "👕 What clothes to wear",
          "🆘 How to help others"
        ],
        content: [
          {
            title: "Heat and Your Body",
            text: "When it's very hot, our bodies work hard to stay cool by sweating. But if it's too hot, we can get sick. That's why we need to drink water and stay in cool places!",
            keyTerms: ["Sweating", "Dehydration", "Heat Stroke", "Body Temperature"]
          },
          {
            title: "Staying Cool",
            text: "Wear light, loose clothes in light colors. Stay indoors during the hottest part of the day. Drink lots of water and eat cool foods like fruits and vegetables!",
            keyTerms: ["Hydration", "Shade", "Cool Clothing", "Water Intake"]
          }
        ],
        story: {
          title: "The European Heatwave of 2003",
          text: "In 2003, Europe had its hottest summer in 500 years! Many people got sick from the heat, but communities came together to help each other stay cool.",
          timeline: ["Summer 2003", "Hottest in 500 years", "70,000+ deaths", "Community help", "Better heat plans"]
        },
        activity: {
          question: "What should you do if someone is feeling dizzy from the heat?",
          options: [
            "Give them hot tea",
            "Move them to a cool place and give water",
            "Make them exercise",
            "Put them in the sun"
          ],
          correct: 1,
          explanation: "Move them to a cool place and give them water to help them cool down!"
        },
        summary: [
          "☀️ Heatwaves are very hot weather",
          "💧 Drink lots of water",
          "🏠 Stay indoors during hottest hours",
          "👕 Wear light, loose clothes",
          "🆘 Help others who might be struggling"
        ],
        certificate: {
          title: "Congratulations!",
          subtitle: "You are a Heatwave Safety Hero!",
          message: "You've learned how to stay safe during heatwaves. Share your knowledge with family and friends!"
        }
      }
    };

    const result = fallbackContent[hazardType] || fallbackContent.earthquake;
    return result;
  }
}

module.exports = new AIService();
