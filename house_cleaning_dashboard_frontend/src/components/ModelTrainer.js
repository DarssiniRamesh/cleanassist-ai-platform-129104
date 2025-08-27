import React, { useMemo, useState, useRef, useCallback } from 'react';

/**
 * PUBLIC_INTERFACE
 * ModelTrainer
 * A polished, modern UI to upload a CSV/Excel dataset, post it to /ai/train,
 * and display clear status: ready, uploading, training, error, success.
 * Features:
 * - Expressive drag-and-drop upload area with file type hints
 * - Clear progression and statuses with iconography
 * - Contextual helper tips and sample dataset link
 * - Clean spacing and typography
 */
function ModelTrainer() {
  const apiBaseUrl = useMemo(() => process.env.REACT_APP_API_BASE_URL || '', []);
  const [file, setFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [taskType, setTaskType] = useState('');
  const [status, setStatus] = useState('ready'); // ready | uploading | training | error | success
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const dropRef = useRef(null);
  const inputRef = useRef(null);

  const isValidFile = useCallback((f) => {
    if (!f) return false;
    const name = (f.name || '').toLowerCase();
    return name.endsWith('.csv') || name.endsWith('.xlsx') || name.endsWith('.xls');
  }, []);

  const attachFile = useCallback((f) => {
    if (!f) return;
    if (!isValidFile(f)) {
      setStatus('error');
      setMessage('Invalid file type. Please select a .csv, .xlsx, or .xls file.');
      setFile(null);
      setResult(null);
      setProgress(0);
      return;
    }
    setFile(f);
    setStatus('ready');
    setMessage('');
    setResult(null);
    setProgress(0);
  }, [isValidFile]);

  const onFileChange = (e) => {
    const f = e.target.files?.[0] || null;
    if (!f) return;
    attachFile(f);
  };

  const onDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget?.classList?.remove('drag-over');
    const f = e.dataTransfer?.files?.[0];
    if (f) attachFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget?.classList?.add('drag-over');
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget?.classList?.remove('drag-over');
  };

  // PUBLIC_INTERFACE
  const startTraining = async () => {
    if (!file) {
      setStatus('error');
      setMessage('Please add a dataset first. You can drag & drop or browse to upload.');
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
      setProgress(25);

      const formData = new FormData();
      formData.append('file', file);
      if (targetColumn.trim()) formData.append('target_column', targetColumn.trim());
      if (taskType.trim()) formData.append('task_type', taskType.trim());

      const response = await fetch(`${apiBaseUrl}/ai/train`, { method: 'POST', body: formData });

      // Simulate progress between upload and server processing
      setStatus('training');
      setMessage('Training in progress...');
      setProgress(65);

      const contentType = response.headers.get('content-type') || '';
      let payload;
      if (contentType.includes('application/json')) {
        payload = await response.json();
      } else {
        const text = await response.text();
        payload = { status: response.ok ? 'success' : 'error', detail: text };
      }

      if (!response.ok) {
        setStatus('error');
        setMessage(payload?.detail || payload?.message || 'Training failed. Please check your dataset and try again.');
        setResult(null);
        setProgress(0);
        return;
      }

      setStatus('success');
      setMessage('Model trained successfully!');
      setResult(payload);
      setProgress(100);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setMessage('An unexpected error occurred while training. Please try again later.');
      setResult(null);
      setProgress(0);
    }
  };

  const reset = () => {
    setFile(null);
    setTargetColumn('');
    setTaskType('');
    setStatus('ready');
    setMessage('');
    setResult(null);
    setProgress(0);
  };

  const isBusy = status === 'uploading' || status === 'training';

  const statusIcon = {
    ready: '📄',
    uploading: '☁️',
    training: '⚙️',
    success: '✅',
    error: '❌',
  }[status] || '📄';

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Train Your Cleaning Model</h2>
      <p style={subtitleStyle}>
        Upload a dataset (.csv, .xlsx, .xls). Optionally set a target column and task type.
        The backend will handle preprocessing and training.
      </p>

      <div style={cardStyle}>
        {/* Status header */}
        <div style={statusHeader}>
          <span aria-hidden="true" style={statusIconStyle}>{statusIcon}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={statusTitle}>
              {status === 'ready' && 'Ready to upload'}
              {status === 'uploading' && 'Uploading dataset'}
              {status === 'training' && 'Training in progress'}
              {status === 'success' && 'Training complete'}
              {status === 'error' && 'Something went wrong'}
            </div>
            <div style={statusSubTitle}>
              {status === 'ready' && 'Drag & drop your file here or click Browse below.'}
              {status === 'uploading' && 'Hold tight while we send your file to the server.'}
              {status === 'training' && 'We are building your model. This may take a moment.'}
              {status === 'success' && 'Your model is trained and ready for inference.'}
              {status === 'error' && (message || 'Please review your dataset and try again.')}
            </div>
          </div>
        </div>

        {/* Upload area */}
        <div
          ref={dropRef}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          style={{
            ...dropZoneStyle,
            ...(isBusy ? { opacity: 0.6, pointerEvents: 'none' } : {}),
          }}
          aria-label="Dataset upload area"
        >
          <div style={dropZoneInner}>
            <div style={dropIcon}>📦</div>
            <div style={dropTitle}>Drag & drop your dataset</div>
            <div style={dropHint}>
              CSV or Excel files only (.csv, .xlsx, .xls).
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isBusy}
                style={ghostButtonStyle}
                aria-label="Browse files to upload dataset"
              >
                Browse files
              </button>
            </div>
          </div>
          <input
            ref={inputRef}
            id="dataset"
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={onFileChange}
            style={{ display: 'none' }}
          />
        </div>

        {/* Selected file preview */}
        {file && (
          <div style={fileCard} aria-live="polite">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true">🗂️</span>
              <div style={{ fontWeight: 600 }}>{file.name}</div>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={isBusy}
              style={chipButton}
              aria-label="Remove selected file"
            >
              Remove
            </button>
          </div>
        )}

        {/* Extra options */}
        <div style={gridRow}>
          <div style={gridCol}>
            <label htmlFor="targetColumn" style={labelStyle}>Target column (optional)</label>
            <input
              id="targetColumn"
              type="text"
              placeholder="e.g., duration_minutes"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              disabled={isBusy}
              style={textInputStyle}
            />
            <div style={fieldHint}>
              If left blank, the server may use the last column in your data.
            </div>
          </div>
          <div style={gridCol}>
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
            <div style={fieldHint}>
              Choose manually or let the backend infer from your target values.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={buttonRowStyle}>
          <button
            onClick={startTraining}
            disabled={!file || isBusy}
            style={{ ...primaryButtonStyle, opacity: (!file || isBusy) ? 0.7 : 1 }}
            aria-label="Start model training"
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
          <a
            href="/static/sample_dataset.csv"
            download
            style={linkLikeButton}
            aria-label="Download sample dataset template CSV"
          >
            ⬇️ Sample CSV
          </a>
        </div>

        {/* Progress */}
        {(status === 'uploading' || status === 'training') && (
          <div style={progressWrapperStyle} aria-live="polite">
            <div style={progressLabelRow}>
              <span style={{ fontWeight: 600 }}>{status === 'uploading' ? 'Uploading' : 'Training'}</span>
              <span>{progress}%</span>
            </div>
            <div style={progressBarTrackStyle}>
              <div style={{ ...progressBarFillStyle, width: `${progress}%` }} />
            </div>
            <div style={progressTextStyle}>
              {status === 'uploading' ? 'Uploading dataset...' : 'Training in progress...'}
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div style={{ ...alertStyle, ...successStyle }} role="status" aria-live="polite">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true">🎉</span>
              <div>
                <div style={{ fontWeight: 700 }}>Success</div>
                <div>{message}</div>
              </div>
            </div>
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

        {/* Error */}
        {status === 'error' && (
          <div style={{ ...alertStyle, ...errorStyle }} role="alert" aria-live="assertive">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true">⚠️</span>
              <div>
                <div style={{ fontWeight: 700 }}>Error</div>
                <div>{message || 'An error occurred. Please check your file and try again.'}</div>
              </div>
            </div>
            <div style={helperBlockStyle}>
              • Ensure your file is a CSV or Excel (.csv, .xlsx, .xls).<br />
              • Verify the header row and that the target column exists (if specified).<br />
              • Try the sample CSV to validate the flow.
            </div>
          </div>
        )}
      </div>

      {/* Contextual tips */}
      <div style={tipsCard}>
        <div style={{ fontWeight: 700, marginBottom: 8 }}>Tips</div>
        <ul style={tipsList}>
          <li>Use clear column names; avoid spaces or special characters if possible.</li>
          <li>Target column is usually your outcome variable (e.g., duration_minutes).</li>
          <li>For classification, target values should be discrete categories.</li>
          <li>For regression, target values should be numeric.</li>
        </ul>
      </div>
    </div>
  );
}

/* Styles: modern spacing, clean colors, and expressive elements */
const containerStyle = {
  maxWidth: 920,
  margin: '2rem auto',
  padding: '0 1rem',
  textAlign: 'left',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.9rem',
  letterSpacing: 0.2,
};

const subtitleStyle = {
  marginTop: '0.35rem',
  color: 'var(--text-secondary)',
  fontSize: 14,
};

const cardStyle = {
  background: 'var(--bg-secondary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 14,
  padding: '1.1rem',
  marginTop: '1rem',
};

const statusHeader = {
  display: 'flex',
  gap: 12,
  alignItems: 'flex-start',
  padding: '0.5rem 0 0.75rem 0',
  borderBottom: `1px dashed var(--border-color)`,
  marginBottom: '0.75rem',
};

const statusIconStyle = {
  fontSize: 24,
  lineHeight: '24px',
};

const statusTitle = {
  fontWeight: 700,
  fontSize: 16,
};

const statusSubTitle = {
  color: 'var(--text-secondary)',
  fontSize: 13,
  marginTop: 2,
};

const dropZoneStyle = {
  border: `2px dashed var(--border-color)`,
  borderRadius: 12,
  padding: '1rem',
  background: 'var(--bg-primary)',
  transition: 'all 0.2s ease',
};

const dropZoneInner = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  textAlign: 'center',
};

const dropIcon = {
  fontSize: 30,
};

const dropTitle = {
  marginTop: 6,
  fontWeight: 700,
};

const dropHint = {
  marginTop: 4,
  color: 'var(--text-secondary)',
  fontSize: 13,
};

const ghostButtonStyle = {
  background: 'transparent',
  color: 'var(--text-primary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 8,
  padding: '8px 12px',
  fontSize: 14,
  fontWeight: 600,
  cursor: 'pointer',
};

const fileCard = {
  marginTop: 10,
  background: 'var(--bg-primary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 10,
  padding: '0.6rem 0.8rem',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 10,
};

const chipButton = {
  background: 'transparent',
  color: 'var(--text-primary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 9999,
  padding: '6px 10px',
  fontSize: 12,
  fontWeight: 600,
  cursor: 'pointer',
};

const gridRow = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: 12,
  marginTop: 12,
};

const gridCol = {
  display: 'flex',
  flexDirection: 'column',
};

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 600,
};

const textInputStyle = {
  display: 'block',
  width: '100%',
  padding: '10px 12px',
  borderRadius: 8,
  border: `1px solid var(--border-color)`,
  background: 'var(--bg-primary)',
  color: 'var(--text-primary)',
};

const selectStyle = {
  ...textInputStyle,
  cursor: 'pointer',
};

const fieldHint = {
  marginTop: 6,
  fontSize: 12,
  color: 'var(--text-secondary)',
};

const buttonRowStyle = {
  display: 'flex',
  gap: '0.75rem',
  alignItems: 'center',
  marginTop: '0.5rem',
  flexWrap: 'wrap',
};

const primaryButtonStyle = {
  backgroundColor: 'var(--button-bg)',
  color: 'var(--button-text)',
  border: 'none',
  borderRadius: 8,
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 700,
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

const linkLikeButton = {
  backgroundColor: 'transparent',
  color: 'var(--text-secondary)',
  border: `1px dashed var(--border-color)`,
  borderRadius: 8,
  padding: '10px 12px',
  fontSize: 13,
  fontWeight: 600,
  textDecoration: 'none',
};

const progressWrapperStyle = {
  marginTop: '1rem',
};

const progressLabelRow = {
  display: 'flex',
  justifyContent: 'space-between',
  fontSize: 13,
  marginBottom: 6,
};

const progressBarTrackStyle = {
  width: '100%',
  height: 10,
  background: 'var(--border-color)',
  borderRadius: 8,
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
  padding: '0.9rem 1rem',
  borderRadius: 10,
  border: '1px solid transparent',
};

const successStyle = {
  background: 'rgba(40, 167, 69, 0.08)',
  borderColor: 'rgba(40, 167, 69, 0.3)',
};

const errorStyle = {
  background: 'rgba(220, 53, 69, 0.08)',
  borderColor: 'rgba(220, 53, 69, 0.3)',
};

const resultStyle = {
  marginTop: 10,
  lineHeight: 1.6,
};

const detailsStyle = {
  marginTop: 8,
};

const preStyle = {
  background: 'var(--bg-primary)',
  border: `1px solid var(--border-color)`,
  padding: '0.75rem',
  borderRadius: 8,
  overflowX: 'auto',
};

const helperBlockStyle = {
  marginTop: 8,
  fontSize: 13,
  color: 'var(--text-primary)',
};

const tipsCard = {
  marginTop: '1rem',
  background: 'var(--bg-secondary)',
  border: `1px solid var(--border-color)`,
  borderRadius: 12,
  padding: '0.9rem 1rem',
};

const tipsList = {
  margin: 0,
  paddingLeft: '1rem',
  lineHeight: 1.6,
  fontSize: 14,
};

export default ModelTrainer;
