# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with a black + red dark theme
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **AI Training**: Upload a CSV/Excel file and train a model via the backend `/ai/train` endpoint
- **AI Inference**: Enter one or more test cases and get recommendations via the backend `/ai/infer` endpoint

## Getting Started

In the project directory, you can run:

### `npm start`

Runs the app in development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

## Configuration

The frontend can call the backend API on the same origin by default.
To point to a different backend host (e.g., localhost:8000), set the following environment variable:

- REACT_APP_API_BASE_URL (see `.env.example`)

Example:
```
REACT_APP_API_BASE_URL=http://localhost:8000
```

## AI Training Feature

- Go to the main dashboard.
- Use the "Train Your Cleaning Model" section to upload a `.csv`, `.xlsx`, or `.xls` file.
- Optionally provide `target_column` and `task_type` (`classification` or `regression`), otherwise the backend will infer or default.
- Click "Start Training" to upload and start training.
- You will see progress and a success or error message. On success, details (model_id, task_type, target_column, model_path, metrics) are displayed.

### Sample Dataset Template

A ready-to-use CSV template is included to help you get started:

- Download link in the UI: In the "Train Your Cleaning Model" section, click "Download sample CSV template".
- Direct URL: `/static/sample_dataset.csv`

Template columns:
- `home_size_sqft`
- `rooms`
- `pets_count`
- `clutter_level` (use values like: low, medium, high)
- `duration_minutes` (example target variable)

You can download the CSV, edit it with your own data, and re-upload it for training.

## AI Inference Feature

- After successfully training a model, use the "Test Your Model with Cases" section.
- Choose Single or Batch input mode.
- Paste a JSON object (single) or a JSON array of objects (batch) that match the feature names used for training.
- Click "Run Inference" to receive predictions. The backend returns `{ "recommended_minutes": <number> }`.

## Theming

- The entire app uses a modern dark theme with black surfaces, bold red accents, and high-contrast white text.
- Theme variables live in `src/App.css` and `src/components/ModelTrainer.module.css`.
- Key variables:
  - Backgrounds: `--bg-primary`, `--bg-secondary`
  - Text: `--text-primary`, `--text-secondary`
  - Accent Red: `--red-600`, `--red-500`
  - Borders: `--border-color`
- Components (cards, buttons, forms, alerts) have rounded corners and accessible focus outlines.

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
