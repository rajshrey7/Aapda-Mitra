# 🛡️ Aapda Mitra - Disaster Preparedness Platform

![Smart India Hackathon 2024](https://img.shields.io/badge/SIH-2024-blue)
![MERN Stack](https://img.shields.io/badge/Stack-MERN-green)
![License](https://img.shields.io/badge/License-MIT-yellow)

## 📋 Problem Statement (Government of Punjab)

**Problem**: Schools and colleges in India lack proper disaster preparedness. Guidelines exist only on paper, drills are poorly conducted, and there's no structured disaster education system.

**Our Solution**: Aapda Mitra - A gamified digital platform that transforms disaster preparedness education through interactive learning, AI-powered assistance, and virtual drills.

## ✨ Key Features

### 🎮 Gamification System
- **Interactive Quizzes**: Topic-specific disaster preparedness quizzes
- **Badge System**: Earn badges for achievements and milestones
- **Leaderboard**: School-wise and individual rankings
- **Points & Levels**: Progress tracking with experience points

### 🤖 AI-Powered Learning
- **Smart Chatbot**: 24/7 AI assistant for disaster-related queries
- **Adaptive Quizzes**: AI-generated quizzes based on performance
- **Personalized Recommendations**: Region-specific disaster content (Punjab focus)

### 🚨 Virtual Drills
- **Interactive Simulations**: Practice earthquake, fire, and flood responses
- **Guided Instructions**: Step-by-step emergency procedures
- **Performance Tracking**: Drill completion scores and analytics

### 📊 Admin Dashboard
- **Real-time Analytics**: Monitor school preparedness scores
- **Participation Tracking**: Track drill and quiz participation
- **Report Generation**: Automated preparedness reports
- **Announcement System**: Send emergency alerts and updates

### 🌐 Multilingual Support
- English
- Hindi (हिंदी)
- Punjabi (ਪੰਜਾਬੀ)

### 📞 Emergency Tools
- Quick access emergency contact directory
- Region-specific helpline numbers
- One-click emergency alerts

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
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── contexts/        # React contexts
│   │   ├── utils/           # Utility functions
│   │   ├── locales/         # Translation files
│   │   └── styles/          # Global styles
│   └── package.json
│
├── server/                   # Node.js Backend
│   ├── controllers/         # Route controllers
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── config/             # Configuration files
│   └── package.json
│
└── README.md
```

## 🔧 Technology Stack

### Frontend
- **React.js** - UI Framework
- **Tailwind CSS** - Styling
- **Framer Motion** - Animations
- **React Router** - Navigation
- **i18next** - Internationalization
- **Chart.js** - Data visualization
- **React Query** - State management

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **OpenAI API** - AI features

## 📱 Features Breakdown

### For Students
- Take interactive quizzes
- Participate in virtual drills
- Track progress with badges
- Compete on leaderboards
- Access emergency resources
- Chat with AI assistant

### For Teachers
- Monitor class performance
- Create custom quizzes
- Schedule drill sessions
- View participation reports
- Send announcements
- Access teaching resources

### For Administrators
- School-wide analytics
- Generate compliance reports
- Manage users and content
- Track preparedness metrics
- Send emergency alerts
- Configure regional settings

## 🎯 SIH 2024 Alignment

This solution directly addresses the Punjab Government's problem statement by:

1. **Digital Transformation**: Converting paper guidelines into interactive digital content
2. **Engagement**: Gamification ensures active participation vs. passive learning
3. **Measurement**: Real-time tracking of preparedness levels
4. **Accessibility**: Multilingual support for wider reach
5. **Scalability**: Cloud-ready architecture for state-wide deployment
6. **AI Integration**: Modern tech stack with AI-powered features

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (Student/Teacher/Admin)
- Input validation and sanitization
- CORS configuration
- Environment variable protection

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