import React from "react";

function App() {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#f0f0f0',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{
        textAlign: 'center',
        padding: '2rem',
        backgroundColor: 'white',
        borderRadius: '10px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
      }}>
        <h1 style={{ color: '#333', fontSize: '2em', marginBottom: '1rem' }}>
          🚀 Aapda Mitra - Basic Test
        </h1>
        <p style={{ color: '#666', fontSize: '1.2em' }}>
          If you can see this, React is working!
        </p>
        <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#f8f9fa', borderRadius: '5px' }}>
          <p><strong>Frontend Status:</strong> ✅ Working</p>
          <p><strong>Backend API:</strong> Test Backend</p>
          <p><strong>Current Time:</strong> {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
}

export default App;
