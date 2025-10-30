# Notebook Pro Frontend

Notebook Pro is a web-based application for creating, organizing, and managing notes. This frontend implements a modern Ocean Professional theme and supports mock mode (localStorage) by default.

## Features

- Sidebar with categories
- Top bar with global search and brand
- Main area with note list and editor (title, content, category, tags)
- Create, edit, delete notes (CRUD)
- Create categories
- Search across title/content/tags
- Persistence via `localStorage` when backend is not configured
- API client scaffold that reads environment variables and gracefully falls back to mock mode
- Basic routing for category and note (`/c/:categoryId`, `/n/:noteId`)

## Environment Variables

Set these variables (optional). If not set, the app functions fully in mock mode with localStorage:

- REACT_APP_API_BASE
- REACT_APP_BACKEND_URL
- REACT_APP_FRONTEND_URL
- REACT_APP_WS_URL
- REACT_APP_NODE_ENV
- REACT_APP_NEXT_TELEMETRY_DISABLED
- REACT_APP_ENABLE_SOURCE_MAPS
- REACT_APP_PORT
- REACT_APP_TRUST_PROXY
- REACT_APP_LOG_LEVEL
- REACT_APP_HEALTHCHECK_PATH
- REACT_APP_FEATURE_FLAGS
- REACT_APP_EXPERIMENTS_ENABLED

If `REACT_APP_API_BASE` (or `REACT_APP_BACKEND_URL`) is defined, an API client scaffold is enabled (no live calls required). Otherwise, the UI uses mock mode and persists to `localStorage`.

## Scripts

- `npm start` – Start development at http://localhost:3000 (port configured by CRA)
- `npm test` – Run tests
- `npm run build` – Production build

## Notes

- Theme colors are defined in `src/theme.css` (Ocean Professional).
- The app uses `react-router-dom` for basic routing.
- If a backend becomes available, wire `src/services/api.js` methods to your endpoints and toggle by setting `REACT_APP_API_BASE`.
