import React from "react";

function App() {
  return React.createElement('div', {
    style: {
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      minHeight: '100vh',
      backgroundColor: '#e3f2fd',
      fontFamily: 'Arial, sans-serif'
    }
  }, 
    React.createElement('h1', {
      style: {
        color: '#1976d2',
        fontSize: '3em',
        textAlign: 'center'
      }
    }, '🚀 Aapda Mitra - Ultra Basic Test')
  );
}

export default App;
