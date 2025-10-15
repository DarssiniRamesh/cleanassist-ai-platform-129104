import React from 'react';
import ModelTrainer from '../components/ModelTrainer';

/**
 * PUBLIC_INTERFACE
 * TrainPage
 * A dedicated page for AI training, accessible at /ai/train.
 * Renders a clear heading and the model training UI.
 */
function TrainPage() {
  return (
    <div style={{ padding: '0 1rem', maxWidth: 980, margin: '0 auto' }}>
      <h2 style={{ margin: '1.25rem 0 0.5rem 0', color: 'var(--text-primary)' }}>AI Training</h2>
      <div className="card" style={{ margin: '0.5rem 0 1.5rem 0' }}>
        <ModelTrainer />
      </div>
    </div>
  );
}

export default TrainPage;
