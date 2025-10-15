# CleanAssist Frontend

CleanAssist is a modern, lightweight dashboard that interfaces with the CleanAssist AI backend for training and inference. It features a clean black + red dark theme and minimal dependencies.

## Features

- Modern, responsive UI with accessible contrast
- AI Training: Upload CSV/Excel to train a model via `/ai/train`
- AI Inference: Send cases to `/ai/infer` to get recommended cleaning minutes
- Sample dataset template available from the UI

## Getting Started

In the project directory, run:

### `npm start`
Runs the app in development mode. Open http://localhost:3000 in your browser.

### `npm test`
Launches the test runner in watch mode.

### `npm run build`
Builds the app for production to the `build` folder.

## Configuration

Set the backend base URL if different from same-origin.

Preferred variable (new):
- REACT_APP_BASE_URL

Legacy/alternate (still supported):
- REACT_APP_API_BASE_URL

Usage notes:
- Components read `process.env.REACT_APP_BASE_URL` for constructing API endpoints (e.g., `${REACT_APP_BASE_URL}/ai/train` and `${REACT_APP_BASE_URL}/ai/infer`).
- If `REACT_APP_BASE_URL` is not set, components fall back to `REACT_APP_API_BASE_URL` when available.
- If neither is set, the app defaults to `http://localhost:3001` (backend preview port).
- Do not include a trailing slash in the value.

Example .env:
```
REACT_APP_BASE_URL=http://localhost:3001
# Optional fallback:
# REACT_APP_API_BASE_URL=http://localhost:3001
```

A starter `.env.example` file is included. Copy it to `.env` and update values for your environment.

Response handling alignment:
- Training success is detected when backend returns HTTP 200 with `status: "success"` and payload including: `model_id`, `task_type`, `target_column`, `metrics`, `model_path`.
- On success, the UI displays key metrics like MAE and R2 when available.
- On any error (HTTP ≥ 400), the UI parses and shows `detail` or `message` from the response when present, else shows a helpful fallback.

If your deployment also uses Supabase (not required for core features here), ensure:
- REACT_APP_SUPABASE_URL
- REACT_APP_SUPABASE_KEY

Note: Do not commit actual secrets; use environment variables.

## AI Training

- Use the "Train Your Cleaning Model" section to upload `.csv`, `.xlsx`, or `.xls`
- Optionally specify `target_column` and `task_type` (`classification` | `regression`)
- On success, the app displays model details and metrics

Sample CSV:
- Download from the UI ("Sample CSV") or `/static/sample_dataset.csv`

## AI Inference

- Use the "Get Recommended Cleaning Time" section
- Submit one or more records as JSON
- The backend returns: `{ "recommended_minutes": <number> }`

## Theme

- Dark theme with black surfaces, red accents, and white text
- Theme variables in `src/App.css` and `src/components/ModelTrainer.module.css`
