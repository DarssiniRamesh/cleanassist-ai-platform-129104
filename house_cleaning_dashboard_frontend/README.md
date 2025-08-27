# Lightweight React Template for KAVIA

This project provides a minimal React template with a clean, modern UI and minimal dependencies.

## Features

- **Lightweight**: No heavy UI frameworks - uses only vanilla CSS and React
- **Modern UI**: Clean, responsive design with KAVIA brand styling
- **Fast**: Minimal dependencies for quick loading times
- **Simple**: Easy to understand and modify
- **AI Training**: Upload a CSV/Excel file and train a model via the backend `/ai/train` endpoint

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

## Customization

### Colors

The main brand colors are defined as CSS variables in `src/App.css`.

### Components

This template uses pure HTML/CSS components instead of a UI framework. You can find component styles in `src/App.css`. 

Common components include:
- Buttons (`.btn`, `.btn-large`)
- Container (`.container`)
- Navigation (`.navbar`)
- Typography (`.title`, `.subtitle`, `.description`)

## Learn More

To learn React, check out the [React documentation](https://reactjs.org/).
