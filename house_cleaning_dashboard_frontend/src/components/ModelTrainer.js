import React, { useState, useMemo } from 'react';

/**
 * PUBLIC_INTERFACE
 * ModelTrainer
 * A UI component to upload a CSV/Excel dataset, post it to the backend /ai/train endpoint,
 * and display training progress, success, or error status with details.
 */
function ModelTrainer() {
  const [file, setFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [taskType, setTaskType] = useState('');
  const [status, setStatus] = useState('idle'); // idle | uploading | training | success | error
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  // PUBLIC_INTERFACE
  // Backend URL for training endpoint; can be overridden by env at build time.
  // If REACT_APP_API_BASE_URL is not set, will default to same origin.
  const apiBaseUrl = useMemo(() => {
    // IMPORTANT: This expects REACT_APP_API_BASE_URL to be provided in environment by orchestrator if needed.
    return process.env.REACT_APP_API_BASE_URL || '';
  }, []);

  // Validate selected file type
  const isValidFile = (f) => {
    if (!f) return false;
    const name = (f.name || '').toLowerCase();
    return (
      name.endsWith('.csv') ||
      name.endsWith('.xlsx') ||
      name.endsWith('.xls')
    );
  };

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (f && !isValidFile(f)) {
      setMessage('Invalid file type. Please select a .csv, .xlsx, or .xls file.');
      setStatus('error');
      setFile(null);
      return;
    }
    setFile(f);
    setMessage('');
    setStatus('idle');
    setResult(null);
    setProgress(0);
  };

  // PUBLIC_INTERFACE
  const startTraining = async () => {
    if (!file) {
      setStatus('error');
      setMessage('Please choose a dataset file before starting training.');
      return;
    }
    if (!isValidFile(file)) {
      setStatus('error');
      setMessage('Invalid file type. Please select a .csv, .xlsx, or .xls file.');
      return;
    }

    try {
      setStatus('uploading');
      setMessage('Uploading dataset...');
      setProgress(20);

      const formData = new FormData();
      formData.append('file', file);
      if (targetColumn.trim()) formData.append('target_column', targetColumn.trim());
      if (taskType.trim()) formData.append('task_type', taskType.trim()); // 'classification' | 'regression'

      // NOTE: Using fetch; for progress we simulate steps due to fetch lacking native upload progress in browsers.
      const response = await fetch(`${apiBaseUrl}/ai/train`, {
        method: 'POST',
        body: formData,
      });

      setStatus('training');
      setMessage('Training in progress...');
      setProgress(60);

      const contentType = response.headers.get('content-type') || '';
      let payload = null;
      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        // Fallback text for non-JSON
        const text = await response.text();
        payload = { status: response.ok ? 'success' : 'error', detail: text };
      }

      if (!response.ok) {
        setStatus('error');
        setMessage(payload?.detail || payload?.message || 'Training failed. Please check your dataset and try again.');
        setProgress(0);
        setResult(null);
        return;
      }

      setStatus('success');
      setProgress(100);
      setMessage('Model trained successfully!');
      setResult(payload);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('An unexpected error occurred while training. Please try again later.');
      setProgress(0);
      setResult(null);
    }
  };

  const reset = () => {
    setFile(null);
    setTargetColumn('');
    setTaskType('');
    setStatus('idle');
    setMessage('');
    setResult(null);
    setProgress(0);
  };

  const isBusy = status === 'uploading' || status === 'training';

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Train Your Cleaning Model</h2>
      <p style={subtitleStyle}>
        Upload a dataset (.csv, .xlsx, .xls). Optionally provide the target column and task type.
      </p>

      <div style={cardStyle}>
        <div style={formRowStyle}>
          <label htmlFor="dataset" style={labelStyle}>Dataset file</label>
          <input
            id="dataset"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileChange}
            disabled={isBusy}
            style={inputStyle}
          />
          {file && <div style={fileInfoStyle}>Selected: {file.name}</div>}
        </div>

        <div style={formRowStyle}>
          <label htmlFor="targetColumn" style={labelStyle}>Target column (optional)</label>
          <input
            id="targetColumn"
            type="text"
            placeholder="e.g., price, is_dirty"
            value={targetColumn}
            onChange={(e) => setTargetColumn(e.target.value)}
            disabled={isBusy}
            style={textInputStyle}
          />
        </div>

        <div style={formRowStyle}>
          <label htmlFor="taskType" style={labelStyle}>Task type (optional)</label>
          <select
            id="taskType"
            value={taskType}
            onChange={(e) => setTaskType(e.target.value)}
            disabled={isBusy}
            style={selectStyle}
          >
            <option value="">Auto detect</option>
            <option value="classification">Classification</option>
            <option value="regression">Regression</option>
          </select>
        </div>

        <div style={buttonRowStyle}>
          <button
            onClick={startTraining}
            disabled={!file || isBusy}
            style={{ ...primaryButtonStyle, opacity: (!file || isBusy) ? 0.7 : 1 }}
            aria-label="Start training the model with the uploaded dataset"
          >
            {isBusy ? 'Processing...' : 'Start Training'}
          </button>
          <button
            onClick={reset}
            disabled={isBusy && status !== 'error'}
            style={secondaryButtonStyle}
            aria-label="Reset training form"
          >
            Reset
          </button>
        </div>

        {isBusy && (
          <div style={progressWrapperStyle} aria-live="polite">
            <div style={progressBarTrackStyle}>
              <div style={{ ...progressBarFillStyle, width: `${progress}%` }} />
            </div>
            <div style={progressTextStyle}>
              {status === 'uploading' ? 'Uploading dataset...' : 'Training in progress...'}
            </div>
          </div>
        )}

        {status === 'success' && (
          <div style={{ ...alertStyle, ...successStyle }} role="status" aria-live="polite">
            <strong>Success: </strong>{message}
            {result && (
              <div style={resultStyle}>
                <div><strong>Model ID:</strong> {result.model_id || 'N/A'}</div>
                <div><strong>Task Type:</strong> {result.task_type || 'N/A'}</div>
                <div><strong>Target Column:</strong> {result.target_column || 'N/A'}</div>
                <div><strong>Artifact Path:</strong> {result.model_path || 'N/A'}</div>
                {result.metrics && (
                  <details style={detailsStyle}>
                    <summary>Metrics</summary>
                    <pre style={preStyle}>{JSON.stringify(result.metrics, null, 2)}</pre>
                  </details>
                )}
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div style={{ ...alertStyle, ...errorStyle }} role="alert" aria-live="assertive">
            <strong>Error: </strong>{message}
          </div>
        )}
      </div>
    </div>
  );
}

/* Inline styles for simplicity and template consistency */
const containerStyle = {
  maxWidth: 840,
  margin: '2rem auto',
  padding: '0 1rem',
  textAlign: 'left',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.75rem',
};

const subtitleStyle = {
  marginTop: '0.25rem',
  color: 'var(--text-secondary)',
};

const cardStyle = {
  background: 'var(--bg-secondary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 12,
  padding: '1rem',
  marginTop: '1rem',
};

const formRowStyle = {
  marginBottom: '1rem',
};

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 600,
};

const inputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid var(--border-color)`,
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
};

const textInputStyle = {
  ...inputStyle,
};

const selectStyle = {
  ...inputStyle,
  cursor: 'pointer',
};

const fileInfoStyle = {
  marginTop: 6,
  fontSize: 12,
  color: 'var(--text-secondary)',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'center',
  marginTop: '0.5rem',
};

const primaryButtonStyle = {
  backgroundColor: 'var(--button-bg)',
  color: 'var(--button-text)',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const progressWrapperStyle = {
  marginTop: '1rem',
};

const progressBarTrackStyle = {
  width: '100%',
  height: 8,
  background: 'var(--border-color)',
  borderRadius: 6,
  overflow: 'hidden',
};

const progressBarFillStyle = {
  height: '100%',
  background: 'linear-gradient(90deg, var(--button-bg), #28a745)',
  transition: 'width 0.4s ease',
};

const progressTextStyle = {
  marginTop: 8,
  fontSize: 13,
  color: 'var(--text-secondary)',
};

const alertStyle = {
  marginTop: '1rem',
  padding: '0.75rem 1rem',
  borderRadius: 8,
  border: '1px solid transparent',
};

const successStyle = {
  background: 'rgba(40, 167, 69, 0.1)',
  borderColor: 'rgba(40, 167, 69, 0.3)',
};

const errorStyle = {
  background: 'rgba(220, 53, 69, 0.1)',
  borderColor: 'rgba(220, 53, 69, 0.3)',
};

const resultStyle = {
  marginTop: 8,
  lineHeight: 1.6,
};

const detailsStyle = {
  marginTop: 6,
};

const preStyle = {
  background: 'var(--bg-primary)',
  border: `1px solid var(--border-color)`,
  padding: '0.75rem',
  borderRadius: 8,
  overflowX: 'auto',
};

export default ModelTrainer;
