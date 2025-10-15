import React, { useState } from 'react';
import { getApiBaseUrl } from '../api/client';

/**
 * PUBLIC_INTERFACE
 * InferenceForm
 * A UI component that lets users input test cases (as JSON records), posts them to /ai/infer,
 * and displays a minimal recommendation response: { "recommended_minutes": <number> }.
 * Provides feedback if no model is trained or on errors.
 */
function InferenceForm() {
  const apiBaseUrl = getApiBaseUrl();
  if (process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.debug('[InferenceForm] API base URL:', apiBaseUrl);
  }

  const [inputMode, setInputMode] = useState('single'); // 'single' | 'batch'
  const [singleRecord, setSingleRecord] = useState('{}');
  const [batchRecords, setBatchRecords] = useState('[\n  {}\n]');
  const [status, setStatus] = useState('idle'); // idle | requesting | success | error
  const [message, setMessage] = useState('');
  const [recommendedMinutes, setRecommendedMinutes] = useState(null);

  const exampleSingle = JSON.stringify(
    { home_size_sqft: 1200, rooms: 3, pets_count: 1, clutter_level: 'medium' },
    null,
    2
  );
  const exampleBatch = JSON.stringify(
    [
      { home_size_sqft: 900, rooms: 2, pets_count: 0, clutter_level: 'low' },
      { home_size_sqft: 2000, rooms: 4, pets_count: 2, clutter_level: 'high' }
    ],
    null,
    2
  );

  const parsePayload = () => {
    try {
      if (inputMode === 'single') {
        const obj = JSON.parse(singleRecord || '{}');
        if (Array.isArray(obj)) {
          return { records: obj };
        }
        return { records: [obj] };
      } else {
        const arr = JSON.parse(batchRecords || '[]');
        if (!Array.isArray(arr)) {
          throw new Error('Batch mode expects a JSON array of objects.');
        }
        return { records: arr };
      }
    } catch (err) {
      throw new Error('Invalid JSON. Please fix the input JSON.');
    }
  };

  // PUBLIC_INTERFACE
  const runInference = async () => {
    let payload;
    try {
      payload = parsePayload();
      if (!payload.records || !Array.isArray(payload.records) || payload.records.length === 0) {
        setStatus('error');
        setMessage('Please provide at least one record.');
        setRecommendedMinutes(null);
        return;
      }
    } catch (err) {
      setStatus('error');
      setMessage(err.message || 'Invalid input.');
      setRecommendedMinutes(null);
      return;
    }

    try {
      setStatus('requesting');
      setMessage('Running inference...');
      setRecommendedMinutes(null);

      const url = `${apiBaseUrl}/ai/infer`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const contentType = response.headers.get('content-type') || '';
      let data;
      try {
        if (contentType.includes('application/json')) {
          data = await response.json();
        } else {
          const text = await response.text();
          data = { detail: text };
        }
      } catch (parseErr) {
        data = { detail: 'Unable to parse response body.' };
      }

      if (!response.ok) {
        const detailArr = Array.isArray(data?.detail) ? data.detail.map(d => d?.msg).filter(Boolean) : null;
        const detail =
          (detailArr && detailArr.length ? detailArr.join('; ') : null) ||
          data?.detail ||
          data?.message ||
          `HTTP ${response.status} ${response.statusText || ''}`.trim();
        setStatus('error');
        setMessage(detail || 'Inference failed. Ensure a model is trained.');
        setRecommendedMinutes(null);
        return;
      }

      // Expect minimal response: { "recommended_minutes": <number> }
      const minutes = data?.recommended_minutes;
      if (typeof minutes !== 'number') {
        setStatus('error');
        setMessage('Unexpected response from server. Missing "recommended_minutes".');
        setRecommendedMinutes(null);
        return;
      }

      setStatus('success');
      setMessage('Inference completed successfully.');
      setRecommendedMinutes(minutes);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error('[InferenceForm] Inference error:', err);
      setStatus('error');
      const hint = err?.message?.includes('Failed to fetch')
        ? 'Failed to reach the API. Check BASE_URL, protocol (https), correct port (3001), and CORS settings.'
        : (err?.message || 'An unexpected error occurred while running inference.');
      setMessage(hint);
      setRecommendedMinutes(null);
    }
  };

  const reset = () => {
    setStatus('idle');
    setMessage('');
    setRecommendedMinutes(null);
  };

  const isBusy = status === 'requesting';

  return (
    <div style={containerStyle}>
      <h2 style={titleStyle}>Get Recommended Cleaning Time</h2>
      <p style={subtitleStyle}>
        Paste one or more records as JSON and click "Run Inference" to get the recommended cleaning minutes
        from the latest trained model. If multiple records are provided, the first will be used.
      </p>

      <div style={cardStyle}>
        <div style={tabsRowStyle} role="tablist" aria-label="Input mode tabs">
          <button
            role="tab"
            aria-selected={inputMode === 'single'}
            onClick={() => setInputMode('single')}
            disabled={isBusy}
            style={{ ...tabButtonStyle, ...(inputMode === 'single' ? tabActiveStyle : {}) }}
          >
            Single record
          </button>
          <button
            role="tab"
            aria-selected={inputMode === 'batch'}
            onClick={() => setInputMode('batch')}
            disabled={isBusy}
            style={{ ...tabButtonStyle, ...(inputMode === 'batch' ? tabActiveStyle : {}) }}
          >
            Batch records
          </button>
        </div>

        <div style={formRowStyle}>
          {inputMode === 'single' ? (
            <>
              <label htmlFor="singleRecord" style={labelStyle}>Record (JSON)</label>
              <textarea
                id="singleRecord"
                rows={10}
                style={textareaStyle}
                placeholder={exampleSingle}
                value={singleRecord}
                onChange={(e) => setSingleRecord(e.target.value)}
                disabled={isBusy}
              />
              <div style={hintStyle}>
                Tip: Provide a JSON object. Example:
                <pre style={preInlineStyle}>{exampleSingle}</pre>
              </div>
            </>
          ) : (
            <>
              <label htmlFor="batchRecords" style={labelStyle}>Records (JSON Array)</label>
              <textarea
                id="batchRecords"
                rows={12}
                style={textareaStyle}
                placeholder={exampleBatch}
                value={batchRecords}
                onChange={(e) => setBatchRecords(e.target.value)}
                disabled={isBusy}
              />
              <div style={hintStyle}>
                Tip: Provide a JSON array of objects. Example:
                <pre style={preInlineStyle}>{exampleBatch}</pre>
              </div>
            </>
          )}
        </div>

        <div style={buttonRowStyle}>
          <button
            onClick={runInference}
            disabled={isBusy}
            style={{ ...primaryButtonStyle, opacity: isBusy ? 0.7 : 1 }}
            aria-label="Send cases to the model and get the recommended minutes"
          >
            {isBusy ? 'Running...' : 'Run Inference'}
          </button>

          <button
            onClick={reset}
            disabled={isBusy}
            style={secondaryButtonStyle}
            aria-label="Reset inference form"
          >
            Reset
          </button>
        </div>

        {status === 'success' && (
          <div style={{ ...alertStyle, ...successStyle }} role="status" aria-live="polite">
            <strong style={{ color: '#39d98a' }}>Success: </strong><span>{message}</span>
            {typeof recommendedMinutes === 'number' && (
              <div style={resultStyle}>
                <div style={{ fontSize: 16, color: 'var(--text-secondary)' }}>
                  Recommended cleaning time:
                </div>
                <div style={{ fontSize: 28, fontWeight: 800, marginTop: 4, color: 'var(--text-primary)' }}>
                  {recommendedMinutes} minutes
                </div>
              </div>
            )}
          </div>
        )}

        {status === 'error' && (
          <div style={{ ...alertStyle, ...errorStyle }} role="alert" aria-live="assertive">
            <strong style={{ color: 'var(--button-text)' }}>Error: </strong><span>{message}</span>
            <div style={helperBlockStyle}>
              • Ensure you have trained a model first in the "Train Your Cleaning Model" section above.<br />
              • Check that your JSON structure matches the feature names used during training.<br />
              • If you changed target or features, re-train the model accordingly.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/* Inline styles aligned to black/red theme */
const containerStyle = {
  maxWidth: 840,
  margin: '1.25rem auto',
  padding: '0 1rem',
  textAlign: 'left',
};

const titleStyle = {
  margin: 0,
  fontSize: '1.6rem',
  letterSpacing: 0.2,
  color: 'var(--text-primary)',
};

const subtitleStyle = {
  marginTop: '0.25rem',
  color: 'var(--text-secondary)',
};

const cardStyle = {
  background: 'var(--bg-secondary)',
  border: `1px solid var(--border-color)`,
  borderRadius: '1.1rem',
  padding: '1rem',
  marginTop: '0.75rem',
  boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
};

const tabsRowStyle = {
  display: 'flex',
  gap: '0.5rem',
  marginBottom: '0.75rem',
};

const tabButtonStyle = {
  background: 'transparent',
  color: 'var(--text-primary)',
  border: `1px solid var(--border-color)`,
  borderRadius: '999px',
  padding: '8px 12px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
};
const tabActiveStyle = {
  background: 'linear-gradient(90deg, #FF1744 0%, #D50000 100%)',
  color: '#ffffff',
  borderColor: 'transparent',
  boxShadow: '0 0 0 3px rgba(255,23,68,0.35)',
};

const formRowStyle = {
  marginBottom: '1rem',
};

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 800,
  color: 'var(--text-primary)',
};

const textareaStyle = {
  display: 'block',
  width: '100%',
  padding: '12px 14px',
  borderRadius: '1.1rem',
  border: `1px solid var(--border-color)`,
  background: 'var(--input-bg)',
  color: 'var(--text-primary)',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  minHeight: 200,
  outline: 'none',
  boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.04)',
};
const hintStyle = {
  marginTop: 6,
  fontSize: 12,
  color: 'var(--text-muted)',
};
const preInlineStyle = {
  background: '#121212',
  border: `1px solid var(--border-color)`,
  padding: '0.5rem',
  borderRadius: '1rem',
  overflowX: 'auto',
  marginTop: 6,
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
  background: 'linear-gradient(90deg, #FF1744 0%, #D50000 100%)',
  color: 'var(--button-text)',
  border: '1px solid transparent',
  borderRadius: '1.1rem',
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
  boxShadow: '0 10px 24px rgba(213,0,0,0.35)',
};
const secondaryButtonStyle = {
  backgroundColor: 'transparent',
  color: 'var(--text-primary)',
  border: `1px solid var(--border-color)`,
  borderRadius: '1.1rem',
  padding: '10px 16px',
  fontSize: 14,
  fontWeight: 800,
  cursor: 'pointer',
};

const alertStyle = {
  marginTop: '1rem',
  padding: '0.85rem 1rem',
  borderRadius: '1.1rem',
  border: '1px solid transparent',
  background: '#121212',
};
const successStyle = {
  background: 'linear-gradient(180deg, rgba(46,204,113,0.12), rgba(46,204,113,0.06))',
  borderColor: 'rgba(46,204,113,0.35)',
};
const errorStyle = {
  background: 'linear-gradient(180deg, rgba(213,0,0,0.20), rgba(255,23,68,0.12))',
  borderColor: 'rgba(213,0,0,0.55)',
};

const resultStyle = {
  marginTop: 8,
  lineHeight: 1.6,
};

const helperBlockStyle = {
  marginTop: 8,
  fontSize: 13,
  color: 'var(--text-secondary)',
};

export default InferenceForm;
