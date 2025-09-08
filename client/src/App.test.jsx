import React from 'react';

function AppTest() {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      backgroundColor: '#f0f0f0',
      minHeight: '100vh'
    }}>
      <h1 style={{ color: '#333', textAlign: 'center' }}>
        🚀 Aapda Mitra - Test Page
      </h1>
      <p style={{ textAlign: 'center', color: '#666' }}>
        If you can see this, React is working!
      </p>
      <div style={{ 
        margin: '20px auto', 
        padding: '20px', 
        backgroundColor: 'white', 
        borderRadius: '8px',
        maxWidth: '600px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <h2>Frontend Status: ✅ Working</h2>
        <p>Backend API: <a href="http://localhost:5000/api/health" target="_blank">Test Backend</a></p>
        <p>Current Time: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}

export default AppTest;
