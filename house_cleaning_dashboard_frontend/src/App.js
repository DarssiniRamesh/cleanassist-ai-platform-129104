import React, { useState, useEffect, useMemo } from 'react';
import logo from './logo.svg';
import './App.css';
import ModelTrainer from './components/ModelTrainer';

// PUBLIC_INTERFACE
function App() {
  const [theme, setTheme] = useState('light');

  // Effect to apply theme to document element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // PUBLIC_INTERFACE
  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_BASE_URL || '', []);

  return (
    <div className="App">
      <header className="App-header">
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
        </button>
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Current theme: <strong>{theme}</strong>
        </p>
        <p className="App-link" style={{ marginTop: 0, fontSize: 14 }}>
          API Base: {apiBaseUrl || 'Same Origin'}
        </p>
      </header>

      <main style={{ paddingBottom: '3rem' }}>
        <ModelTrainer />
      </main>
    </div>
  );
}

export default App;
