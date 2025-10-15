import React, { useState, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import './App.css';
import InferenceForm from './components/InferenceForm';
import TrainPage from './pages/TrainPage';

/**
 * PUBLIC_INTERFACE
 * App
 * Main application entry for the CleanAssist dashboard frontend.
 * Applies a global modern dark (black) + red theme with accessible contrast.
 * Provides navigation and routes for Home and AI Training.
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

  // Simple Home component rendering both sections on one page
  const Home = () => (
    <main style={{ paddingBottom: '3rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
      <div className="card" style={{ margin: '1rem auto', maxWidth: 980 }}>
        {/* Training embedded on the home page as before */}
        <TrainPage />
      </div>
      <div className="card" style={{ margin: '1rem auto', maxWidth: 980 }}>
        <InferenceForm />
      </div>
    </main>
  );

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

        {/* Simple top navigation */}
        <nav aria-label="Primary" style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
          <Link className="App-link" to="/" aria-label="Go to Home">
            Home
          </Link>
          <Link className="App-link" to="/ai/train" aria-label="Go to AI Training">
            AI Training
          </Link>
        </nav>
      </header>

      {/* Application routes */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/ai/train" element={<TrainPage />} />
      </Routes>
    </div>
  );
}

export default App;
