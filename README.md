# 🛡️ Aapda Mitra - Disaster Preparedness Platform

![Smart India Hackathon 2025](https://img.shields.io/badge/SIH-2025-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Problem Statement (Government of Punjab)

**Problem**: Schools and colleges in India lack proper disaster preparedness. Guidelines exist only on paper, drills are poorly conducted, and there's no structured disaster education system.

**Our Solution**: Aapda Mitra - A gamified digital platform that transforms disaster preparedness education through interactive learning, AI-powered assistance, and virtual drills.

## ✨ Key Features

### 🎮 Gamification System
- **Interactive Quizzes**: Topic-specific disaster preparedness quizzes with multiple difficulty levels
- **Badge System**: Earn badges for achievements and milestones with visual progress tracking
- **Leaderboard**: Real-time school-wise and individual rankings with live updates
- **Points & Levels**: Comprehensive progress tracking with experience points and level progression
- **Multiplayer Games**: Rescue Rush Pro game with real-time multiplayer support
- **Streak Tracking**: Daily and weekly activity streaks for sustained engagement

### 🤖 AI-Powered Learning
- **Smart Chatbot**: 24/7 AI assistant for disaster-related queries with Gemini integration
- **Adaptive Quizzes**: AI-generated quizzes based on performance and learning patterns
- **Personalized Recommendations**: Region-specific disaster content (Punjab focus)
- **AI Summarization**: Plain-language summaries of weather alerts and emergency information
- **Performance Analysis**: AI-powered analysis of drill performance and learning outcomes

### 🚨 Virtual Reality Drills
- **VR Earthquake Drills**: A-Frame powered earthquake response simulations
- **VR Fire Evacuation**: Interactive fire safety and evacuation procedures
- **VR Flood Response**: Flood safety measures and evacuation training
- **VR Cyclone Preparedness**: Cyclone safety protocols and shelter procedures
- **Real-time Scoring**: Performance tracking with detailed analytics
- **Multi-device Support**: Works on desktop, mobile, and VR headsets

### 📊 Advanced Admin Dashboard
- **Real-time Analytics**: Live monitoring of school preparedness scores and metrics
- **Participation Tracking**: Comprehensive drill and quiz participation statistics
- **Data Visualization**: Interactive charts and graphs using Recharts
- **Report Generation**: Automated CSV/JSON export of preparedness reports
- **Drill Scheduling**: Plan and manage emergency drill sessions
- **User Management**: Complete user administration and role management
- **Export Functionality**: Export data in multiple formats for analysis

### 🌐 Multilingual Support
- **English**: Full interface and content support
- **Hindi (हिंदी)**: Complete localization with cultural context
- **Punjabi (ਪੰਜਾਬੀ)**: Regional language support for Punjab schools
- **Dynamic Language Switching**: Real-time language change without page reload

### 📞 Emergency Communication System
- **Real-time Chat**: Socket.IO powered chat between users and administrators
- **Emergency Contact Directory**: Quick access to region-specific helpline numbers
- **Admin Broadcast**: Mass communication capabilities for emergency alerts
- **SMS Integration**: Twilio-powered SMS alerts for critical notifications
- **Emergency Kit Builder**: Interactive tool to build personalized emergency kits
- **Emergency Card Swap**: Digital emergency contact card sharing

### 🗺️ Disaster Mapping & Alerts
- **Real-time Weather Alerts**: OpenWeather API integration with NDMA fallback
- **Interactive Disaster Map**: Google Maps integration showing disaster zones
- **Location-based Alerts**: Radius-based alert filtering and notifications
- **Evacuation Routes**: Safe escape route planning and visualization
- **Alert Severity Levels**: Minor, moderate, severe, and extreme alert classifications
- **AI Alert Summaries**: Human-readable summaries of technical weather data

### 📚 Learning Management System
- **Interactive Modules**: Rich multimedia learning content with progress tracking
- **Module Player**: Advanced player with bookmarking and note-taking
- **Quiz Generator**: AI-powered quiz creation with adaptive difficulty
- **Learning Paths**: Structured learning progression for different disaster types
- **Progress Analytics**: Detailed learning analytics and performance insights
- **Content Management**: Admin tools for creating and managing educational content

### 🎯 Real-time Features
- **Live Leaderboards**: Instant updates when scores are submitted
- **Socket Communication**: Real-time updates across all connected clients
- **Live Alerts**: Real-time weather and emergency alert monitoring
- **Multiplayer Synchronization**: Real-time game state synchronization
- **Live Chat**: Instant messaging between users and administrators

### 🔒 Security & Authentication
- **JWT Authentication**: Secure token-based authentication system
- **Role-based Access Control**: Student, Teacher, and Admin role management
- **Password Security**: Bcrypt hashing with salt for password protection
- **Input Validation**: Comprehensive input sanitization and validation
- **CORS Configuration**: Secure cross-origin request handling
- **Helmet Security**: HTTP security headers and protection

### 📱 Mobile & Responsive Design
- **Mobile-first Design**: Optimized for all screen sizes and devices
- **Touch-friendly Interface**: Gesture support for mobile interactions
- **Progressive Web App**: Works offline with service worker support
- **Accessibility**: WCAG compliant components and navigation
- **Cross-platform Compatibility**: Works on iOS, Android, and desktop browsers

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/Aapda-Mitra.git
cd Aapda-Mitra
```

2. **Install Backend Dependencies**
```bash
cd server
npm install
```

3. **Configure Environment Variables**
Create `.env` file in server directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/aapda-mitra
JWT_SECRET=your_jwt_secret_key_here
OPENAI_API_KEY=your_openai_api_key_here
NODE_ENV=development
```

4. **Install Frontend Dependencies**
```bash
cd ../client
npm install
```

5. **Start MongoDB**
```bash
mongod
```

6. **Run the Application**

Backend (from server directory):
```bash
npm start
```

Frontend (from client directory):
```bash
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🏗️ Project Structure

```
Aapda-Mitra/
├── client/                    # React Frontend (Vite)
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── GameCanvas.jsx        # VR game integration
│   │   │   ├── LeaderboardRealtime.jsx # Live leaderboard
│   │   │   ├── LiveAlerts.jsx        # Weather alerts
│   │   │   ├── ModulePlayer.jsx      # Learning module player
│   │   │   ├── DisasterMap.jsx       # Interactive maps
│   │   │   ├── FloatingChatIcon.jsx  # Chat interface
│   │   │   └── ...                   # 20+ other components
│   │   ├── pages/           # Page components
│   │   │   ├── AdminDashboard.jsx    # Admin analytics
│   │   │   ├── Lobby.jsx            # Game lobby
│   │   │   ├── GamePlay.jsx         # Game play interface
│   │   │   ├── Modules.jsx          # Learning modules
│   │   │   ├── LeaderboardPage.jsx  # Rankings display
│   │   │   └── ...                  # 15+ other pages
│   │   ├── contexts/        # React contexts
│   │   │   ├── AuthContext.jsx      # Authentication state
│   │   │   └── ThemeContext.jsx     # Dark/light theme
│   │   ├── utils/           # Utility functions
│   │   │   ├── gameSocket.js        # Socket.IO client
│   │   │   ├── api.js              # API utilities
│   │   │   └── i18n.js             # Internationalization
│   │   ├── locales/         # Translation files
│   │   │   ├── en.json             # English translations
│   │   │   ├── hi.json             # Hindi translations
│   │   │   └── pa.json             # Punjabi translations
│   │   └── styles/          # Global styles
│   │       ├── global.css           # Base styles
│   │       └── dark-mode.css        # Dark theme styles
│   ├── public/
│   │   └── assets/vr/       # VR scenes (A-Frame)
│   │       ├── earthquake-classroom.html
│   │       ├── fire-building.html
│   │       ├── flood-city.html
│   │       └── cyclone-yard.html
│   └── package.json
│
├── server/                   # Node.js Backend
│   ├── controllers/         # Route controllers
│   │   ├── userController.js        # User management
│   │   ├── quizController.js        # Quiz operations
│   │   ├── adminController.js       # Admin functions
│   │   └── chatbotController.js     # AI chatbot
│   ├── models/             # MongoDB models
│   │   ├── User.js                 # User schema
│   │   ├── Quiz.js                 # Quiz schema
│   │   ├── GameSession.js          # Multiplayer games
│   │   ├── GameScore.js            # Game scoring
│   │   ├── Module.js               # Learning modules
│   │   ├── DrillResult.js          # VR drill results
│   │   └── Score.js                # General scoring
│   ├── routes/             # API routes
│   │   ├── userRoutes.js           # User endpoints
│   │   ├── quizRoutes.js           # Quiz endpoints
│   │   ├── games.js                # Game endpoints
│   │   ├── leaderboard.js          # Leaderboard endpoints
│   │   ├── modules.js              # Learning modules
│   │   ├── alerts.js               # Weather alerts
│   │   ├── emergency.js            # Emergency contacts
│   │   ├── chat.js                 # Real-time chat
│   │   └── adminRoutes.js          # Admin endpoints
│   ├── services/           # Business logic services
│   │   ├── aiService.js            # AI integration
│   │   ├── weatherService.js       # Weather API
│   │   ├── socketService.js        # Socket.IO service
│   │   ├── sms.services.js         # SMS notifications
│   │   └── alert.services.js       # Alert management
│   ├── middleware/         # Custom middleware
│   │   └── authMiddleware.js       # JWT authentication
│   ├── config/             # Configuration files
│   │   └── db.js                   # Database configuration
│   └── package.json
│
├── websockets/              # WebSocket service
│   ├── index.js            # Socket.IO server
│   └── package.json
│
├── test/                    # Testing files
│   └── debug.js            # Debug utilities
│
├── .env.example            # Environment variables template
├── setup.sh               # Setup script
├── README.md              # Main documentation
├── README_DEMO.md         # Demo guide
├── README_PRODUCTION.md   # Production setup
├── DOCUMENTATION.md       # Technical documentation
└── PATCH_SUMMARY.md       # Implementation summary
```

## 🔧 Technology Stack

### Frontend
- **React 18** - Modern UI Framework with hooks and context
- **Vite** - Fast build tool and development server
- **Tailwind CSS** - Utility-first CSS framework for styling
- **Framer Motion** - Advanced animations and transitions
- **React Router v6** - Client-side routing and navigation
- **i18next** - Comprehensive internationalization framework
- **Recharts** - Advanced data visualization and charting
- **Socket.IO Client** - Real-time communication
- **A-Frame** - WebXR framework for VR experiences
- **React Icons** - Comprehensive icon library
- **Axios** - HTTP client for API communication

### Backend
- **Node.js** - JavaScript runtime environment
- **Express.js** - Fast, unopinionated web framework
- **MongoDB** - NoSQL document database
- **Mongoose** - MongoDB object modeling for Node.js
- **Socket.IO** - Real-time bidirectional event-based communication
- **JWT** - JSON Web Tokens for secure authentication
- **bcryptjs** - Password hashing with salt
- **Helmet** - Security middleware for Express
- **CORS** - Cross-Origin Resource Sharing middleware
- **Morgan** - HTTP request logger middleware
- **Express Validator** - Input validation and sanitization

### AI & External Services
- **OpenAI API** - GPT models for AI chatbot and content generation
- **Google Gemini AI** - Alternative AI service with fallback support
- **OpenWeather API** - Real-time weather data and alerts
- **Twilio** - SMS messaging service for emergency alerts
- **Google Maps API** - Interactive mapping and geolocation services

### Development & Deployment
- **Nodemon** - Development server with auto-restart
- **CSV Writer** - Data export functionality
- **Node Cron** - Task scheduling for automated processes
- **Dotenv** - Environment variable management
- **PM2** - Production process manager (recommended)

## 📱 Features Breakdown

### For Students
- **Learning & Assessment**
  - Take interactive quizzes with multiple difficulty levels
  - Complete VR drills for earthquake, fire, flood, and cyclone preparedness
  - Access rich multimedia learning modules with progress tracking
  - Participate in multiplayer games and competitions
  - Use AI chatbot for instant disaster-related assistance

- **Gamification & Progress**
  - Earn badges and achievements for milestones
  - Track points, levels, and learning streaks
  - Compete on real-time leaderboards (global, school, regional)
  - View detailed progress analytics and performance insights
  - Unlock new content and challenges based on progress

- **Emergency Preparedness**
  - Access emergency contact directory with region-specific numbers
  - Build personalized emergency kits with interactive tools
  - Share emergency contact cards digitally
  - Receive real-time weather alerts and emergency notifications
  - View interactive disaster maps with evacuation routes

### For Teachers
- **Class Management**
  - Monitor individual and class-wide performance metrics
  - Create custom quizzes and learning content
  - Schedule and manage drill sessions
  - Track student participation and engagement
  - Send announcements and emergency alerts

- **Analytics & Reporting**
  - View comprehensive participation reports
  - Access teaching resources and lesson plans
  - Generate progress reports for parents and administrators
  - Monitor learning outcomes and skill development
  - Export data for further analysis

- **Communication**
  - Real-time chat with students and administrators
  - Broadcast emergency alerts and important updates
  - Manage class-specific communication channels

### For Administrators
- **School-wide Management**
  - Comprehensive analytics dashboard with real-time metrics
  - Generate compliance and preparedness reports
  - Manage users, roles, and permissions
  - Track school-wide preparedness scores and trends
  - Configure regional settings and emergency protocols

- **Content & System Management**
  - Create and manage educational content and modules
  - Schedule system-wide drills and emergency exercises
  - Export data in multiple formats (CSV, JSON)
  - Monitor system performance and usage statistics
  - Manage integration with external services (weather, SMS)

- **Emergency Management**
  - Send emergency alerts and notifications
  - Monitor real-time disaster situations
  - Coordinate emergency response activities
  - Access disaster mapping and evacuation planning tools
  - Manage emergency communication channels

## 🎯 SIH 2024 Alignment

This solution directly addresses the Punjab Government's problem statement by:

1. **Digital Transformation**: Converting paper guidelines into interactive digital content
2. **Engagement**: Gamification ensures active participation vs. passive learning
3. **Measurement**: Real-time tracking of preparedness levels
4. **Accessibility**: Multilingual support for wider reach
5. **Scalability**: Cloud-ready architecture for state-wide deployment
6. **AI Integration**: Modern tech stack with AI-powered features

## 🔌 API Endpoints

### Authentication
- `POST /api/users/register` - User registration
- `POST /api/users/login` - User login
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Quizzes & Learning
- `GET /api/quiz` - Get all quizzes with filtering
- `POST /api/quiz/:id/submit` - Submit quiz answers
- `GET /api/modules` - Get learning modules
- `POST /api/modules/:id/complete` - Mark module complete
- `GET /api/quiz/generate` - AI-generated quiz creation

### Games & Drills
- `GET /api/games/list` - List available game sessions
- `POST /api/games/create` - Create new game session
- `POST /api/games/:id/join` - Join game session
- `POST /api/games/:id/score` - Submit game score
- `POST /api/drills/start` - Start VR drill session
- `POST /api/drills/:id/result` - Submit drill results

### Leaderboards & Analytics
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/schools` - School rankings
- `GET /api/leaderboard/user/:id` - User-specific stats
- `GET /api/admin/dashboard` - Admin dashboard metrics
- `GET /api/admin/export` - Export data (CSV/JSON)

### Alerts & Communication
- `GET /api/alerts/current` - Current weather alerts
- `GET /api/alerts/nearby` - Location-based alerts
- `POST /api/alerts/broadcast` - Broadcast alert (admin)
- `GET /api/emergency/contacts` - Emergency contact directory
- `POST /api/chat/send` - Send chat message
- `GET /api/chat/history` - Get chat history

### Admin Management
- `GET /api/admin/users` - User management
- `POST /api/admin/drills/schedule` - Schedule drill
- `GET /api/admin/analytics` - Detailed analytics
- `POST /api/admin/announcements` - Send announcements

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication with expiration
- **Password Security**: Bcrypt hashing with salt for password protection
- **Role-based Access Control**: Student, Teacher, and Admin role management
- **Input Validation**: Comprehensive input sanitization using Express Validator
- **CORS Configuration**: Secure cross-origin request handling
- **Helmet Security**: HTTP security headers and protection
- **Environment Variable Protection**: Sensitive data stored in environment variables
- **Rate Limiting**: Protection against brute force attacks (configurable)
- **Data Encryption**: Sensitive data encrypted in transit and at rest

## 📈 Future Enhancements

- [ ] Mobile application (React Native)
- [ ] Offline mode capability
- [ ] VR/AR drill simulations
- [ ] Integration with school management systems
- [ ] Real-time collaboration features
- [ ] Advanced analytics dashboard
- [ ] SMS/WhatsApp alerts
- [ ] Parent portal

## 🤝 Contributing

We welcome contributions! Please see our contributing guidelines for details.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 👥 Team

**Team Aapda Mitra** - Smart India Hackathon 2024
- Built with ❤️ for Punjab Schools
- Empowering disaster preparedness through technology

## 📞 Support

For support, email contact@aapdamitra.org or raise an issue in the GitHub repository.

## 🏆 Achievements

- Smart India Hackathon 2024 Participant
- Government of Punjab Problem Statement
- Focus on UN SDG Goal 11: Sustainable Cities and Communities

---

**"Tayyar Punjab, Surakshit Punjab"** (Prepared Punjab, Safe Punjab) 🛡️