# Aapda Mitra - Demo Ready Full-Stack Disaster Preparedness Platform

## 🚀 Quick Start Guide

This is a **demo-ready** full-stack prototype implementing four core VVI features:
- **A. Interactive Disaster Education Modules** (course + gamified quizzes + progress)
- **B. Region-specific Alerts** (OpenWeather + NDMA fallback + AI plain-language summaries)
- **C. Emergency Communication** (real-time chat between users & admin broadcast + emergency directory)
- **D. Admin Dashboards** (preparedness scores, drill participation, drill scheduling + export)

Plus **SIH-ready game + VR drill integration** and **real-time leaderboard** for gamified elements.

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Git

## 🛠️ Installation & Setup

### 1. Clone and Setup Environment

```bash
# Clone the repository
git clone <repository-url>image.png
cd Aapda-Mitra

# Copy environment file
cp .env.example .env

# Edit .env file with your configuration
# At minimum, set:
# - MONGODB_URI (your MongoDB connection string)
# - JWT_SECRET (any random string)
# - CLIENT_URL=http://localhost:5173
```

### 2. Install Dependencies

```bash
# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Start the Application

```bash
# Terminal 1: Start the server
cd server
npm run dev

# Terminal 2: Start the client
cd client
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

## 🎮 Demo Script

### Step 1: Initial Setup
1. Open two browser windows/tabs
2. Navigate to http://localhost:5173 in both
3. Register two different user accounts (one as admin, one as student)

### Step 2: Admin Dashboard Demo
1. Login as admin user
2. Navigate to `/admin` to see the enhanced dashboard
3. Explore the four tabs:
   - **Overview**: Real-time metrics and charts
   - **Analytics**: Recent activity and user statistics
   - **Management**: Schedule drills and manage content
   - **Exports**: Export data as CSV files

### Step 3: Game Lobby Demo
1. Login as student user in the second browser
2. Navigate to `/game/lobby`
3. Create a new game session:
   - Click "Create Session"
   - Choose "Rescue Rush Pro" game type
   - Set mode to "Desktop"
   - Add a description
   - Click "Create Session"

### Step 4: Multiplayer Game Demo
1. In the first browser (admin), join the created session
2. Host starts the game
3. Both players play the game simultaneously
4. Watch real-time score updates
5. Observe leaderboard updates in real-time

### Step 5: VR Drill Demo
1. Create a new session with "VR Drill" type
2. Join the session
3. Start the game to load the VR scene
4. Complete the earthquake or fire drill
5. Watch score submission and leaderboard updates

### Step 6: Education Modules Demo
1. Navigate to `/modules`
2. Browse available modules
3. Click on a module to start learning
4. Complete lessons and quizzes
5. Watch progress tracking and points earned

### Step 7: Live Alerts Demo
1. Navigate to `/game/lobby` to see the LiveAlerts widget
2. View nearby alerts (simulated data)
3. Click "Get AI Summary" on any alert
4. See AI-generated plain-language summaries

### Step 8: Real-time Communication Demo
1. Open multiple browser windows
2. Join the same game session
3. Watch real-time participant updates
4. See live leaderboard changes
5. Observe admin broadcast capabilities

## 🔧 Key Features Demonstrated

### A. Interactive Disaster Education Modules
- ✅ Course content with lessons
- ✅ Gamified quizzes with points
- ✅ Progress tracking
- ✅ Adaptive difficulty
- ✅ Multi-language support

### B. Region-specific Alerts
- ✅ OpenWeather API integration
- ✅ NDMA fallback mode
- ✅ AI plain-language summaries
- ✅ Real-time alert updates
- ✅ Location-based filtering

### C. Emergency Communication
- ✅ Real-time chat between users
- ✅ Admin broadcast capabilities
- ✅ Emergency contact directory
- ✅ School-specific communication
- ✅ Socket.IO integration

### D. Admin Dashboards
- ✅ Preparedness scores tracking
- ✅ Drill participation metrics
- ✅ Drill scheduling system
- ✅ Data export functionality
- ✅ Real-time analytics

### Bonus: SIH-Ready Game + VR Integration
- ✅ Rescue Rush Pro game
- ✅ VR drill scenes (A-Frame)
- ✅ Real-time multiplayer
- ✅ Leaderboard system
- ✅ Mobile-friendly design

## 🎯 Demo Highlights

### Real-time Features
- **Live Leaderboard**: Updates instantly when scores are submitted
- **Multiplayer Games**: Multiple players can join and play simultaneously
- **Socket Communication**: Real-time chat and notifications
- **Live Alerts**: Simulated weather alerts with AI summaries

### Gamification
- **Points System**: Earn points for completing modules and games
- **Achievements**: Badges and achievements for milestones
- **Leaderboards**: Global, school, and regional rankings
- **Progress Tracking**: Visual progress bars and completion stats

### AI Integration
- **Smart Summaries**: AI-generated plain-language alert summaries
- **Adaptive Quizzes**: AI-powered question generation
- **Performance Analysis**: AI analysis of drill performance
- **Fallback Mode**: Works without API keys using deterministic responses

### VR Experience
- **A-Frame Integration**: Web-based VR scenes
- **Interactive Drills**: Earthquake and fire evacuation drills
- **PostMessage Communication**: VR scene to parent communication
- **Mobile Compatible**: Works on mobile devices

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Ensure MongoDB is running
   - Check MONGODB_URI in .env file
   - Default: `mongodb://localhost:27017/aapda-mitra`

2. **Socket Connection Failed**
   - Check if server is running on port 5000
   - Verify CORS settings
   - Check browser console for errors

3. **VR Scenes Not Loading**
   - Ensure A-Frame CDN is accessible
   - Check browser compatibility
   - Try refreshing the page

4. **AI Features Not Working**
   - Check if API keys are set in .env
   - App works in fallback mode without keys
   - Check console for AI service errors

### Performance Tips

1. **For Large Demos**
   - Use Chrome/Edge for best performance
   - Close unnecessary browser tabs
   - Ensure stable internet connection

2. **Mobile Testing**
   - Use responsive design mode in browser
   - Test touch interactions
   - Check mobile-specific features

## 📊 Expected Demo Results

When running the demo script:

✅ **No runtime crashes** on startup  
✅ **Game lobby loads** and lists sessions  
✅ **Host can create session**; other browser can join  
✅ **Start game**; after completion score is submitted and saved to DB  
✅ **Leaderboard updates** in real-time (<1s)  
✅ **API endpoints return** aggregated results  
✅ **Admin dashboard** shows metrics  
✅ **AI summarization** returns human-friendly summaries  

## 🚀 Production Deployment

For production deployment:

1. **Environment Variables**
   - Set `NODE_ENV=production`
   - Use production MongoDB URI
   - Set secure JWT_SECRET
   - Configure API keys

2. **Security**
   - Enable HTTPS
   - Configure CORS properly
   - Set up rate limiting
   - Use helmet for security headers

3. **Performance**
   - Use Redis for session storage
   - Implement caching
   - Set up CDN for static assets
   - Configure load balancing

## 📝 API Documentation

### Key Endpoints

- `GET /api/games/list` - List available game sessions
- `POST /api/games/create` - Create new game session
- `GET /api/leaderboard/global` - Global leaderboard
- `GET /api/modules` - List education modules
- `GET /api/alerts/nearby` - Get nearby alerts
- `GET /api/admin/dashboard` - Admin dashboard data

### Socket Events

- `game:created` - New game session created
- `player:joined` - Player joined session
- `leaderboard:update` - Leaderboard updated
- `admin:broadcast` - Admin broadcast message

## 🎉 Success Criteria

The demo is successful when:

1. ✅ All four VVI features work as specified
2. ✅ Multiplayer games function correctly
3. ✅ Real-time updates work across browsers
4. ✅ VR drills complete and submit scores
5. ✅ AI features provide meaningful output
6. ✅ Admin dashboard shows live data
7. ✅ No critical errors in console
8. ✅ Mobile-friendly interface works

## 📞 Support

For issues or questions:
- Check the console for error messages
- Verify all dependencies are installed
- Ensure MongoDB is running
- Check network connectivity for API calls

---

**Ready for SIH Demo! 🚀**

This platform demonstrates a complete disaster preparedness solution with gamification, real-time communication, AI integration, and VR capabilities - all running locally and ready for demonstration.
