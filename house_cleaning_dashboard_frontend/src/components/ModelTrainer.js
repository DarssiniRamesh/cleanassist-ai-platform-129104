import React, { useState, useRef, useCallback } from 'react';
import styles from './ModelTrainer.module.css';
import { getApiBaseUrl } from '../api/client';

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
  // Use centralized API base URL helper
  const apiBaseUrl = getApiBaseUrl();
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[ModelTrainer] API base URL:', apiBaseUrl);
  }
  const [file, setFile] = useState(null);
  const [targetColumn, setTargetColumn] = useState('');
  const [taskType, setTaskType] = useState('');
  const [status, setStatus] = useState('ready'); // ready | uploading | training | error | success
  const [message, setMessage] = useState('');
  const [result, setResult] = useState(null);
  const [progress, setProgress] = useState(0);

  const dropRef = useRef(null);
  const inputRef = useRef(null);
  const [isDragOver, setIsDragOver] = useState(false);

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
    setIsDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) attachFile(f);
  };

  const onDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
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

    // Validate target column only if provided (do not block otherwise)
    const providedTarget = targetColumn.trim();
    if (providedTarget && /\s/.test(providedTarget)) {
      setStatus('error');
      setMessage('Target column must not contain spaces. Please use an exact column name as in the header.');
      return;
    }

    try {
      setStatus('uploading');
      setMessage('Uploading dataset...');
      setProgress(25);

      const formData = new FormData();
      formData.append('file', file);
      if (providedTarget) formData.append('target_column', providedTarget);
      if (taskType.trim()) formData.append('task_type', taskType.trim());

      const url = `${apiBaseUrl}/ai/train`;
      const response = await fetch(url, { method: 'POST', body: formData });

      // Simulate progress between upload and server processing
      setStatus('training');
      setMessage('Training in progress...');
      setProgress(65);

      const contentType = response.headers.get('content-type') || '';
      let payload;
      try {
        if (contentType.includes('application/json')) {
          payload = await response.json();
        } else {
          const text = await response.text();
          payload = { status: response.ok ? 'success' : 'error', detail: text };
        }
      } catch (parseErr) {
        // Fallback if body is unreadable
        payload = { status: response.ok ? 'success' : 'error', detail: 'Unable to parse response body.' };
      }

      if (process.env.NODE_ENV !== 'production') {
        // eslint-disable-next-line no-console
        console.debug('[ModelTrainer] Train response:', { ok: response.ok, status: response.status, payload });
      }

      // Handle HTTP errors with specific messages when possible
      if (!response.ok) {
        const detailArr = Array.isArray(payload?.detail) ? payload.detail.map(d => d?.msg).filter(Boolean) : null;
        const specific =
          (detailArr && detailArr.length ? detailArr.join('; ') : null) ||
          payload?.detail ||
          payload?.message ||
          `HTTP ${response.status} ${response.statusText || ''}`.trim();
        setStatus('error');
        setMessage(specific || 'Training failed. Please check your dataset and try again.');
        setResult(null);
        setProgress(0);
        return;
      }

      // Align with backend contract:
      // { status, model_id, task_type, target_column, metrics, model_path }
      const trainStatus = (payload?.status || '').toString().toLowerCase();
      if (trainStatus && trainStatus !== 'success') {
        setStatus('error');
        setMessage(payload?.detail || payload?.message || `Training returned status: ${payload?.status}`);
        setResult(null);
        setProgress(0);
        return;
      }

      // Success case: ensure presence of expected keys; if missing, still render but warn in dev
      if (process.env.NODE_ENV !== 'production') {
        const expectedKeys = ['status', 'model_id', 'task_type', 'target_column', 'metrics', 'model_path'];
        const missing = expectedKeys.filter(k => !(k in (payload || {})));
        if (missing.length) {
          // eslint-disable-next-line no-console
          console.warn('[ModelTrainer] Missing keys in train response:', missing);
        }
      }

      setStatus('success');
      setMessage('Model trained successfully!');
      setResult(payload);
      setProgress(100);
    } catch (err) {
      // Network/CORS/mixed content errors or unexpected issues
      // eslint-disable-next-line no-console
      console.error('[ModelTrainer] Training error:', err);
      setStatus('error');
      const hint = err?.message?.includes('Failed to fetch')
        ? 'Failed to reach the API. Check BASE_URL, protocol (https), correct port (3001), and CORS settings.'
        : (err?.message || 'An unexpected error occurred while training. Please try again later.');
      setMessage(hint);
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
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Train Your Cleaning Model</h2>
        <p className={styles.subtitle}>
          Upload a dataset (.csv, .xlsx, .xls). Optionally set a target column and task type.
          The backend will handle preprocessing and training.
        </p>
      </div>

      <div className={styles.trainerCard}>
        {/* Status header */}
        <div className={styles.statusHeader}>
          <span aria-hidden="true" className={styles.statusIcon}>{statusIcon}</span>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div className={styles.statusTitle}>
              {status === 'ready' && 'Ready to upload'}
              {status === 'uploading' && 'Uploading dataset'}
              {status === 'training' && 'Training in progress'}
              {status === 'success' && 'Training complete'}
              {status === 'error' && 'Something went wrong'}
            </div>
            <div className={styles.statusSubTitle}>
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
          className={`${styles.dropzone} ${isDragOver ? styles.dragOver : ''}`}
          style={isBusy ? { opacity: 0.6, pointerEvents: 'none' } : undefined}
          aria-label="Dataset upload area"
        >
          <div className={styles.dropInner}>
            <div className={styles.dropIcon}>📦</div>
            <div className={styles.dropTitle}>Drag & drop your dataset</div>
            <div className={styles.dropHint}>
              CSV or Excel files only (.csv, .xlsx, .xls).
            </div>
            <div style={{ marginTop: 10 }}>
              <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={isBusy}
                className={styles.btnGhost}
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
          <div className={styles.fileCard} aria-live="polite">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span aria-hidden="true">🗂️</span>
              <div style={{ fontWeight: 600 }}>{file.name}</div>
            </div>
            <button
              onClick={() => setFile(null)}
              disabled={isBusy}
              className={styles.chip}
              aria-label="Remove selected file"
            >
              Remove
            </button>
          </div>
        )}

        {/* Extra options */}
        <div className={styles.grid}>
          <div>
            <label htmlFor="targetColumn" className={styles.label}>Target column (optional)</label>
            <input
              id="targetColumn"
              type="text"
              placeholder="e.g., duration_minutes"
              value={targetColumn}
              onChange={(e) => setTargetColumn(e.target.value)}
              disabled={isBusy}
              className={styles.input}
            />
            <div className={styles.fieldHint}>
              If left blank, the server may use the last column in your data.
            </div>
          </div>
          <div>
            <label htmlFor="taskType" className={styles.label}>Task type (optional)</label>
            <select
              id="taskType"
              value={taskType}
              onChange={(e) => setTaskType(e.target.value)}
              disabled={isBusy}
              className={styles.select}
            >
              <option value="">Auto detect</option>
              <option value="classification">Classification</option>
              <option value="regression">Regression</option>
            </select>
            <div className={styles.fieldHint}>
              Choose manually or let the backend infer from your target values.
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className={styles.actions}>
          <button
            onClick={startTraining}
            disabled={!file || isBusy}
            className={styles.btnPrimary}
            style={{ opacity: (!file || isBusy) ? 0.7 : 1 }}
            aria-label="Start model training"
          >
            {isBusy ? 'Processing...' : 'Start Training'}
          </button>
          <button
            onClick={reset}
            disabled={isBusy && status !== 'error'}
            className={styles.btnSecondary}
            aria-label="Reset training form"
          >
            Reset
          </button>
          <a
            href="/static/sample_dataset.csv"
            download
            className={styles.btnLink}
            aria-label="Download sample dataset template CSV"
          >
            ⬇️ Sample CSV
          </a>
        </div>

        {/* Progress */}
        {(status === 'uploading' || status === 'training') && (
          <div className={styles.progress} aria-live="polite">
            <div className={styles.progressHeader}>
              <span style={{ fontWeight: 700 }}>{status === 'uploading' ? 'Uploading' : 'Training'}</span>
              <span>{progress}%</span>
            </div>
            <div className={styles.progressTrack}>
              <div className={styles.progressFill} style={{ width: `${progress}%` }} />
            </div>
            <div className={styles.progressText}>
              {status === 'uploading' ? 'Uploading dataset...' : 'Training in progress...'}
            </div>
          </div>
        )}

        {/* Success */}
        {status === 'success' && (
          <div className={`${styles.alert} ${styles.success}`} role="status" aria-live="polite">
            <div className={styles.alertContent}>
              <span aria-hidden="true">🎉</span>
              <div>
                <div style={{ fontWeight: 800 }}>Success</div>
                <div>{message}</div>
              </div>
            </div>
            {result && (
              <div className={styles.result}>
                <div><strong>Model ID:</strong> {result.model_id || 'N/A'}</div>
                <div><strong>Task Type:</strong> {result.task_type || 'N/A'}</div>
                <div><strong>Target Column:</strong> {result.target_column || 'N/A'}</div>
                <div><strong>Artifact Path:</strong> {result.model_path || 'N/A'}</div>

                {result.metrics && (
                  <>
                    <div style={{ marginTop: 8 }}>
                      <strong>Key Metrics:</strong>
                      <div style={{ marginTop: 4 }}>
                        {typeof result.metrics.MAE === 'number' && (
                          <div>MAE: {result.metrics.MAE.toFixed(4)}</div>
                        )}
                        {typeof result.metrics.R2 === 'number' && (
                          <div>R2: {result.metrics.R2.toFixed(4)}</div>
                        )}
                        {typeof result.metrics.n_features === 'number' && (
                          <div>n_features: {result.metrics.n_features}</div>
                        )}
                        {typeof result.metrics.n_samples === 'number' && (
                          <div>n_samples: {result.metrics.n_samples}</div>
                        )}
                      </div>
                    </div>
                    <details className={styles.details}>
                      <summary>All Metrics</summary>
                      <pre className={styles.pre}>{JSON.stringify(result.metrics, null, 2)}</pre>
                    </details>
                  </>
                )}
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {status === 'error' && (
          <div className={`${styles.alert} ${styles.error}`} role="alert" aria-live="assertive">
            <div className={styles.alertContent}>
              <span aria-hidden="true">⚠️</span>
              <div>
                <div style={{ fontWeight: 800 }}>Error</div>
                <div>{message || 'An error occurred. Please check your file and try again.'}</div>
              </div>
            </div>
            <div className={styles.result}>
              • Ensure your file is a CSV or Excel (.csv, .xlsx, .xls).<br />
              • If you filled Target column, ensure it exactly matches a column header in your dataset.<br />
              • Omit Target column to let the backend select the last column by default.<br />
              • Try the Sample CSV to validate the flow.
            </div>
          </div>
        )}
      </div>

      {/* Contextual tips */}
      <div className={styles.panel}>
        <div className={styles.panelTitle}>Tips</div>
        <ul className={styles.tips}>
          <li>Use clear column names; avoid spaces or special characters if possible.</li>
          <li>Target column is usually your outcome variable (e.g., duration_minutes).</li>
          <li>For classification, target values should be discrete categories.</li>
          <li>For regression, target values should be numeric.</li>
        </ul>
      </div>
    </div>
  );
}

export default ModelTrainer;
