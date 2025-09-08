import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { Toaster } from 'react-hot-toast';
import './styles/global.css';
import './utils/i18n';
import App from './App';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Full setup with all features
try {
  const root = ReactDOM.createRoot(document.getElementById("root"));
  root.render(
    React.createElement(React.StrictMode, null,
      React.createElement(BrowserRouter, null,
        React.createElement(QueryClientProvider, { client: queryClient },
          React.createElement(App),
          React.createElement(Toaster, {
            position: "top-right",
            toastOptions: {
              duration: 3000,
              style: { background: "#333", color: "#fff" },
              success: { iconTheme: { primary: "#22c55e", secondary: "#fff" } },
              error: { iconTheme: { primary: "#ef4444", secondary: "#fff" } },
            }
          })
        )
      )
    )
  );
  console.log("✅ Full React app rendered successfully");
} catch (err) {
  console.error("❌ React render failed:", err);
  document.body.innerHTML = "<h1 style='color:red; padding: 20px;'>React failed to render. Check console.</h1>";
}