import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import { Toaster } from 'react-hot-toast';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            fontFamily: "'DM Sans', sans-serif",
            fontSize: '14px',
            borderRadius: '12px',
            border: '1px solid #e2e6ec',
            boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
          },
          success: { iconTheme: { primary: '#00C896', secondary: '#fff' } },
          error:   { iconTheme: { primary: '#FF4D4F', secondary: '#fff' } },
        }}
      />
    </BrowserRouter>
  </React.StrictMode>
);
