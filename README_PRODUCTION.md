# Aapda Mitra - Production Ready Setup

## 🚀 Overview

Aapda Mitra is a comprehensive disaster preparedness platform featuring:
- **Interactive VR Drills** with A-Frame integration
- **Real-time Leaderboards** with Recharts visualization
- **Weather Alerts** with Socket.IO real-time updates
- **Admin Dashboard** with comprehensive analytics
- **Gamification** with badges, points, and achievements

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose
- **Socket.IO** for real-time communication
- **JWT** authentication
- **Helmet** for security
- **CORS** enabled

### Frontend
- **React 18** with Vite
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Recharts** for data visualization
- **A-Frame** for VR experiences
- **Socket.IO Client** for real-time updates

## 📋 Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🚀 Quick Start

### 1. Clone and Install Dependencies

```bash
# Clone the repository
git clone <repository-url>
cd Aapda-Mitra

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 2. Environment Setup

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=5000
NODE_ENV=production
CLIENT_URL=http://localhost:5173

# Database
MONGODB_URI=mongodb://localhost:27017/aapda-mitra

# JWT
JWT_SECRET=your-super-secret-jwt-key-here

# Optional API Keys (for enhanced features)
OPENWEATHER_API_KEY=your-openweather-api-key
GEMINI_API_KEY=your-google-gemini-api-key
MAPBOX_ACCESS_TOKEN=your-mapbox-token
TWILIO_ACCOUNT_SID=your-twilio-sid
TWILIO_AUTH_TOKEN=your-twilio-token

# Fallback Mode (set to true if API keys are not available)
NDMA_FALLBACK_MODE=true
```

### 3. Start the Application

#### Option A: Start Both Servers (Recommended)
```bash
# From the root directory
npm run dev
```

#### Option B: Start Servers Separately
```bash
# Terminal 1 - Backend
cd server
npm run dev

# Terminal 2 - Frontend
cd client
npm run dev
```

### 4. Access the Application

- **Frontend**: http://localhost:5173 (or 5174 if 5173 is busy)
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎮 Features

### 1. Interactive VR Drills
- **Earthquake Response Drill**: Practice Drop, Cover, and Hold On
- **Fire Evacuation Drill**: Learn safe evacuation procedures
- **Flood Response Drill**: Understand flood safety measures
- **Real-time Scoring**: Track performance with checkpoints
- **Timer Integration**: Time-based challenges

### 2. Real-time Leaderboards
- **Global Rankings**: Top performers across all schools
- **School Rankings**: Performance comparison by institution
- **Analytics Dashboard**: Performance trends and insights
- **Badge System**: Achievement recognition

### 3. Weather Alerts
- **Real-time Alerts**: Socket.IO powered notifications
- **Multiple Alert Types**: Rain, wind, thunderstorm, flood
- **Severity Levels**: Minor, moderate, severe, extreme
- **Location-based**: Region-specific alerts

### 4. Admin Dashboard
- **Comprehensive Metrics**: Users, schools, drills, scores
- **Data Visualization**: Charts and graphs with Recharts
- **Export Functionality**: CSV/JSON data export
- **Drill Scheduling**: Plan and manage emergency drills
- **Real-time Updates**: Live data refresh

### 5. Gamification
- **Points System**: Earn points for completing activities
- **Badge Unlocks**: Achievement-based rewards
- **Streak Tracking**: Daily and weekly streaks
- **Level Progression**: Experience-based leveling
- **Animated Feedback**: Framer Motion animations

## 🔧 API Endpoints

### Authentication
- `POST /api/users/login` - User login
- `POST /api/users/register` - User registration
- `GET /api/users/profile` - Get user profile

### Leaderboard
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/leaderboard/schools` - School rankings
- `GET /api/leaderboard/user/:id` - User-specific stats

### Games & Drills
- `GET /api/games/list` - Available games
- `POST /api/games/create` - Create game session
- `POST /api/games/:id/join` - Join game
- `POST /api/games/:id/score` - Submit score

### Modules
- `GET /api/modules` - List education modules
- `GET /api/modules/:id` - Get module details
- `POST /api/modules/:id/complete` - Mark module complete

### Alerts
- `GET /api/alerts/current` - Current weather alerts
- `POST /api/alerts/broadcast` - Broadcast alert (admin)

### Admin
- `GET /api/admin/dashboard` - Dashboard metrics
- `GET /api/admin/export` - Export data
- `GET /api/admin/drills/participation` - Drill participation stats
- `POST /api/admin/drills/schedule` - Schedule drill

## 🎨 UI Components

### Core Components
- **WeatherAlertBanner**: Global alert notifications
- **GamificationElements**: Points, badges, achievements
- **LeaderboardRealtime**: Live leaderboard updates
- **ModulePlayer**: Interactive education modules
- **GameCanvas**: VR drill integration

### Pages
- **LeaderboardPage**: Comprehensive rankings with charts
- **DrillsPage**: VR drill selection and execution
- **AdminDashboard**: Analytics and management
- **Modules**: Education module browser
- **Lobby**: Game session browser

## 🔒 Security Features

- **JWT Authentication**: Secure token-based auth
- **Helmet Security**: HTTP security headers
- **CORS Configuration**: Cross-origin request handling
- **Input Validation**: Express-validator integration
- **Error Handling**: Centralized error management

## 📱 Responsive Design

- **Mobile-first**: Optimized for all screen sizes
- **Touch-friendly**: Gesture support for mobile
- **Progressive Enhancement**: Works without JavaScript
- **Accessibility**: WCAG compliant components

## 🚀 Production Deployment

### Environment Variables
Ensure all production environment variables are set:
- Database connection strings
- JWT secrets
- API keys for external services
- CORS origins for production domains

### Build Process
```bash
# Build frontend for production
cd client
npm run build

# The built files will be in client/dist/
```

### Database Setup
- Ensure MongoDB is running
- Create production database
- Set up proper indexes for performance
- Configure backup strategies

### Security Checklist
- [ ] Change default JWT secret
- [ ] Set up HTTPS in production
- [ ] Configure proper CORS origins
- [ ] Set up rate limiting
- [ ] Enable MongoDB authentication
- [ ] Set up monitoring and logging

## 🐛 Troubleshooting

### Common Issues

1. **Port Conflicts**
   - Backend: Change PORT in .env file
   - Frontend: Vite will automatically find available port

2. **MongoDB Connection**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env
   - Verify network connectivity

3. **CORS Errors**
   - Update CLIENT_URL in server .env
   - Check CORS configuration in server/index.js

4. **API Key Issues**
   - Set NDMA_FALLBACK_MODE=true for demo
   - API features will show fallback messages

### Debug Mode
```bash
# Enable debug logging
NODE_ENV=development npm run dev
```

## 📊 Performance

- **Lazy Loading**: Components loaded on demand
- **Code Splitting**: Optimized bundle sizes
- **Caching**: API response caching
- **Compression**: Gzip compression enabled
- **CDN Ready**: Static assets optimized

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Check the troubleshooting section
- Review API documentation
- Open an issue on GitHub

---

**Aapda Mitra** - Building resilient communities through technology 🚀
