// test/debug.js
// Debug script to test critical APIs and connections

const axios = require('axios');
const mongoose = require('mongoose');
require('dotenv').config();

const BASE_URL = process.env.CLIENT_URL || 'http://localhost:5000';

async function testAPI(endpoint, method = 'GET', data = null) {
  try {
    const config = {
      method,
      url: `${BASE_URL}${endpoint}`,
      headers: {
        'Content-Type': 'application/json'
      }
    };
    
    if (data) {
      config.data = data;
    }
    
    const response = await axios(config);
    console.log(`✅ ${method} ${endpoint} - Status: ${response.status}`);
    return { success: true, status: response.status, data: response.data };
  } catch (error) {
    console.log(`❌ ${method} ${endpoint} - Error: ${error.message}`);
    return { success: false, error: error.message };
  }
}

async function testMongoDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/aapda-mitra', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected');
    await mongoose.disconnect();
    return true;
  } catch (error) {
    console.log(`❌ MongoDB Connection Error: ${error.message}`);
    return false;
  }
}

async function testEnvironmentVariables() {
  console.log('\n🔍 Checking Environment Variables:');
  
  const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
  const optionalVars = ['OPENWEATHER_API_KEY', 'GEMINI_API_KEY', 'MAPBOX_API_KEY', 'TWILIO_ACCOUNT_SID', 'TWILIO_AUTH_TOKEN'];
  
  requiredVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`❌ ${varName} is missing`);
    }
  });
  
  optionalVars.forEach(varName => {
    if (process.env[varName]) {
      console.log(`✅ ${varName} is set`);
    } else {
      console.log(`⚠️  ${varName} is not set (optional)`);
    }
  });
}

async function runTests() {
  console.log('🚀 Starting Aapda Mitra Debug Tests\n');
  
  // Test environment variables
  await testEnvironmentVariables();
  
  // Test MongoDB connection
  console.log('\n🔍 Testing MongoDB Connection:');
  await testMongoDB();
  
  // Test API endpoints
  console.log('\n🔍 Testing API Endpoints:');
  
  const endpoints = [
    '/api/health',
    '/api/quiz',
    '/api/users/leaderboard',
    '/api/alerts/active',
    '/api/emergency/procedures',
    '/api/chat/rooms',
    '/api/games/list',
    '/api/leaderboard/global',
    '/api/modules'
  ];
  
  for (const endpoint of endpoints) {
    await testAPI(endpoint);
  }
  
  // Test protected endpoints (should fail without auth)
  console.log('\n🔍 Testing Protected Endpoints (should fail without auth):');
  await testAPI('/api/users/profile');
  await testAPI('/api/admin/dashboard');
  
  console.log('\n✨ Debug tests completed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { testAPI, testMongoDB, testEnvironmentVariables };
