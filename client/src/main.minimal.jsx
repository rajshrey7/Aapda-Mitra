import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.ultra-basic';

// Ultra minimal setup
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(React.createElement(App));
  console.log("✅ React app rendered successfully");
} catch (err) {
  console.error("❌ React render failed:", err);
  document.body.innerHTML = "<h1 style='color:red; padding: 20px;'>React failed to render. Check console.</h1>";
}
