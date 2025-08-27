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

Set the backend base URL if different from same-origin:

- REACT_APP_API_BASE_URL

Example:
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

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
