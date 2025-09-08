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
}

module.exports = new AIService();
