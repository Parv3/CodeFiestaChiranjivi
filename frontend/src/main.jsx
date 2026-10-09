import React, { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("UI Caught Error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#F5F4F0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'system-ui, sans-serif'
        }}>
          <div style={{
            maxWidth: '400px',
            backgroundColor: '#FFFFFF',
            padding: '24px',
            borderRadius: '16px',
            border: '1px solid #E3E0D8',
            textAlign: 'center',
            boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
          }}>
            <h2 style={{ fontSize: '18px', color: '#B3261E', margin: '0 0 8px' }}>Something went wrong</h2>
            <p style={{ fontSize: '13px', color: '#6B675F', margin: '0 0 16px', lineHeight: 1.4 }}>
              {this.state.error?.message || 'An unexpected rendering error occurred.'}
            </p>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
              style={{
                padding: '10px 18px',
                borderRadius: '8px',
                backgroundColor: '#1B4D3E',
                color: '#FFFFFF',
                border: 'none',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

