import React, { useState, useEffect } from 'react';
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

        {/* Single, modern, application-branded title */}
        <h1 style={{ margin: 0, fontSize: '2.2rem', letterSpacing: 0.3 }}>CleanAssist</h1>
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
