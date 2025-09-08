# Aapda Mitra - Technical Documentation

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [API Documentation](#api-documentation)
3. [Database Schema](#database-schema)
4. [Frontend Components](#frontend-components)
5. [Deployment Guide](#deployment-guide)

## Architecture Overview

### Technology Stack
- **Frontend**: React.js with Tailwind CSS
- **Backend**: Node.js with Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **AI Integration**: OpenAI API
- **Internationalization**: i18next

### System Architecture
```
┌─────────────────────────────────────────┐
│           Client (React.js)             │
│  - Components                           │
│  - Pages                                │
│  - Context (Auth)                       │
│  - i18n (Multi-language)               │
└─────────────────────────────────────────┘
                    │
                    ▼
┌─────────────────────────────────────────┐
│         API Gateway (Express.js)        │
│  - Authentication Middleware            │
│  - Route Handlers                       │
│  - Error Handling                       │
└─────────────────────────────────────────┘
                    │
        ┌───────────┴───────────┐
        ▼                       ▼
┌──────────────┐       ┌──────────────────┐
│   MongoDB    │       │   OpenAI API     │
│  - Users     │       │  - Chatbot       │
│  - Quizzes   │       │  - Quiz Gen      │
│  - Scores    │       └──────────────────┘
└──────────────┘
```

## API Documentation

### Authentication Endpoints

#### POST /api/users/register
Register a new user.
```json
Request:
{
  "name": "string",
  "email": "string",
  "password": "string",
  "school": "string",
  "role": "student|teacher|admin",
  "class": "string (optional)",
  "region": "string"
}

Response:
{
  "status": "success",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "role": "string",
    "token": "JWT token",
    "badges": [],
    "points": 0,
    "level": 1
  }
}
```

#### POST /api/users/login
User login.
```json
Request:
{
  "email": "string",
  "password": "string"
}

Response:
{
  "status": "success",
  "data": {
    "_id": "string",
    "name": "string",
    "email": "string",
    "token": "JWT token"
  }
}
```

### Quiz Endpoints

#### GET /api/quiz
Get all available quizzes.
```json
Query Parameters:
- category: earthquake|flood|fire|cyclone|general
- difficulty: beginner|intermediate|advanced
- language: en|hi|pa

Response:
{
  "status": "success",
  "data": [
    {
      "_id": "string",
      "title": "string",
      "description": "string",
      "category": "string",
      "difficulty": "string",
      "questions": [],
      "duration": 15
    }
  ]
}
```

#### POST /api/quiz/:id/submit
Submit quiz answers.
```json
Request:
{
  "answers": ["answer1", "answer2", ...],
  "timeTaken": 300
}

Response:
{
  "status": "success",
  "data": {
    "score": {
      "totalPoints": 100,
      "percentage": 85,
      "correctAnswers": 8,
      "totalQuestions": 10,
      "passed": true
    },
    "badgesEarned": [],
    "userStats": {
      "totalPoints": 500,
      "level": 3
    }
  }
}
```

### Admin Endpoints
### VR Drill Endpoints

#### POST /api/drills/start
Start a VR drill session and receive a `sessionId`.
```json
Request:
{
  "drillType": "earthquake|flood|fire|cyclone",
  "duration": 60,
  "difficulty": "easy|medium|hard"
}

Response:
{
  "status": "success",
  "data": {
    "sessionId": "string",
    "drillType": "string",
    "duration": 60,
    "difficulty": "medium"
  }
}
```

#### POST /api/drills/:id/result
Submit a completed VR drill result.
```json
Request:
{
  "drillType": "earthquake|flood|fire|cyclone",
  "score": 85,
  "timeTaken": 42,
  "totalTime": 60,
  "performance": {
    "accuracy": 80,
    "speed": 70,
    "safety": 90,
    "teamwork": 60,
    "decisionMaking": 75
  },
  "completedSteps": [{"stepId":"x","stepName":"y","completed":true,"timeSpent":10,"score":20}],
  "missedSteps": [{"stepId":"m","stepName":"z","importance":"important","impact":"..."}],
  "difficulty": "medium",
  "metadata": {"device":"UA", "platform":"web"}
}

Response:
{
  "status": "success",
  "data": { /* DrillResult document */ }
}
```

#### GET /api/drills/leaderboard
Retrieve leaderboard for VR drills.
```json
Query:
{
  "drillType": "earthquake|flood|fire|cyclone",
  "drillMode": "vr",
  "school": "string",
  "region": "string",
  "limit": 10,
  "timeRange": "day|week|month"
}
```


#### GET /api/admin/dashboard
Get admin dashboard statistics.
```json
Response:
{
  "status": "success",
  "data": {
    "overview": {
      "totalUsers": 1234,
      "activeUsers": 456,
      "totalQuizzes": 50,
      "preparednessScore": 85
    },
    "usersByRole": [],
    "quizStats": [],
    "schoolStats": []
  }
}
```

## Database Schema

### User Schema
```javascript
{
  name: String (required),
  email: String (unique, required),
  password: String (hashed),
  role: Enum['student', 'teacher', 'admin'],
  school: String,
  class: String,
  badges: [{
    name: String,
    description: String,
    icon: String,
    earnedAt: Date
  }],
  points: Number,
  level: Number,
  quizzesTaken: [{
    quizId: ObjectId,
    score: Number,
    completedAt: Date
  }],
  drillsCompleted: [{
    drillType: String,
    completedAt: Date,
    score: Number
  }],
  preferredLanguage: Enum['en', 'hi', 'pa'],
  region: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Quiz Schema
```javascript
{
  title: String,
  description: String,
  category: Enum['earthquake', 'flood', 'fire', 'cyclone', 'general'],
  questions: [{
    question: String,
    questionType: Enum['multiple-choice', 'true-false'],
    options: [{
      text: String,
      isCorrect: Boolean
    }],
    correctAnswer: String,
    explanation: String,
    points: Number
  }],
  totalPoints: Number,
  duration: Number (minutes),
  difficulty: Enum['beginner', 'intermediate', 'advanced'],
  passingScore: Number (percentage),
  isAIGenerated: Boolean,
  createdBy: ObjectId,
  createdAt: Date
}
```

## Frontend Components

### Core Components
- **Navbar**: Navigation with language selector
- **Footer**: Site information and links
- **ProtectedRoute**: Route guard for authentication
- **LanguageSelector**: Multi-language switcher

### Feature Components
- **Quiz**: Quiz-taking interface
- **Leaderboard**: Rankings display
- **BadgeSystem**: Badge display and management
- **Chatbot**: AI-powered chat interface
- **DrillSimulation**: Virtual drill interface

### VR Scenes (A-Frame / WebXR)
- `client/public/assets/vr/earthquake-classroom.html`
- `client/public/assets/vr/fire-building.html`
- `client/public/assets/vr/flood-city.html`
- `client/public/assets/vr/cyclone-yard.html`

Notes:
- Optimized for low-end mobile: low-poly primitives, minimal textures.
- Uses new backend endpoints and optional Socket.IO for multiplayer sync.


### Pages
- **Home**: Landing page with features
- **Login/Register**: Authentication pages
- **Profile**: User dashboard
- **AdminDashboard**: Admin control panel
- **QuizList**: Browse quizzes
- **EmergencyContacts**: Emergency numbers

## Deployment Guide
After starting the server, ensure Helmet CSP allows:
- Scripts: `https://aframe.io`, `https://cdn.jsdelivr.net`, `https://cdn.socket.io`


### Prerequisites
- Node.js v14+
- MongoDB v4.4+
- PM2 (for production)
- Nginx (optional, for reverse proxy)

### Production Deployment

1. **Clone and Setup**
```bash
git clone <repository>
cd Aapda-Mitra
chmod +x setup.sh
./setup.sh
```

2. **Configure Environment**
```bash
# Edit server/.env
MONGODB_URI=your_production_mongodb_uri
JWT_SECRET=strong_random_secret
OPENAI_API_KEY=your_api_key
NODE_ENV=production
```

3. **Build Frontend**
```bash
cd client
npm run build
```

4. **Start with PM2**
```bash
# Install PM2 globally
npm install -g pm2

# Start backend
cd server
pm2 start index.js --name aapda-mitra-api

# Serve frontend (if not using CDN)
cd ../client
pm2 serve build 3000 --name aapda-mitra-frontend
```

5. **Configure Nginx (Optional)**
```nginx
server {
    listen 80;
    server_name yourdomain.com;

    location / {
        proxy_pass http://localhost:3000;
    }

    location /api {
        proxy_pass http://localhost:5000;
    }
}
```

### Docker Deployment
```dockerfile
# Dockerfile included in repository
docker-compose up -d
```

## Security Considerations

1. **Authentication**: JWT tokens with expiration
2. **Password Security**: Bcrypt hashing with salt
3. **Input Validation**: Express-validator for all inputs
4. **CORS**: Configured for specific origins
5. **Environment Variables**: Sensitive data in .env
6. **Rate Limiting**: Implement for production
7. **HTTPS**: Use SSL certificates in production

## Performance Optimization

1. **Database Indexing**: Indexes on frequently queried fields
2. **Caching**: Redis for session management (optional)
3. **Image Optimization**: Lazy loading and compression
4. **Code Splitting**: React lazy loading
5. **API Response Compression**: Gzip compression

## Testing

Run tests with:
```bash
# Backend tests
cd server
npm test

# Frontend tests
cd client
npm test
```

## Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   - Ensure MongoDB is running: `mongod`
   - Check connection string in .env

2. **Port Already in Use**
   - Change ports in .env and package.json
   - Kill existing processes: `lsof -i :PORT`

3. **OpenAI API Errors**
   - Verify API key in .env
   - Check API quota and limits

## Support

For issues and questions:
- GitHub Issues: [repository]/issues
- Email: contact@aapdamitra.org
- Documentation: This file

## License

MIT License - See LICENSE file for details.