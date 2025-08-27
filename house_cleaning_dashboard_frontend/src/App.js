import React, { useState, useEffect, useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import ModelTrainer from './components/ModelTrainer';
import InferenceForm from './components/InferenceForm';

/**
 * PUBLIC_INTERFACE
 * App
 * Main application entry for the CleanAssist dashboard frontend.
 * Applies a global modern dark (black) + red theme with accessible contrast.
 * Renders the model trainer and inference form within elevated cards.
 */
function App() {
  // Default to dark theme for the new black/red design
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    // Apply theme attribute for CSS variables
    document.documentElement.setAttribute('data-theme', theme);
    // Ensure body uses dark background to edges
    document.body.style.backgroundColor = 'var(--bg-primary)';
    document.body.style.color = 'var(--text-primary)';
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    // Theme is fixed to dark for this design iteration.
    // Kept for future extensibility; no-op currently.
    setTheme('dark');
  };

  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_BASE_URL || '', []);

  return (
    <div className="App">
      <header className="App-header">
        <button
          className="theme-toggle"
          onClick={toggleTheme}
          aria-label="Black and red theme active"
          title="Black & Red Theme"
        >
          ❤️ Black & Red
        </button>
        <img src={logo} className="App-logo" alt="CleanAssist logo" />
        <p className="subtitle" style={{ marginTop: 8, fontSize: 14 }}>
          API Base: <span className="App-link">{apiBaseUrl || 'Same Origin'}</span>
        </p>
        <p style={{ maxWidth: 760, lineHeight: 1.55, fontSize: 14, marginTop: 12, color: 'var(--text-secondary)' }}>
          After training, use the form below to infer a single recommended cleaning time in minutes.
          The backend returns: {`{ "recommended_minutes": <number> }`}.
        </p>
      </header>

      <main style={{ paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
        <div className="card" style={{ margin: '1rem auto', maxWidth: 980 }}>
          <ModelTrainer />
        </div>
        <div className="card" style={{ margin: '1rem auto', maxWidth: 980 }}>
          <InferenceForm />
        </div>
      </main>
    </div>
  );
}

export default App;
