# Code Sense UI

A React + TypeScript interface for ingesting code repositories and chatting with an AI about them. Users can login/sign up (Stripe subscription on signup), ingest repositories, track ingestion status, and ask questions in a ChatGPT-like UI.

## Features

- **Authentication** – login and signup with Stripe checkout on signup.
- **Repository ingestion** – ingest via GitHub URL, local path, or upload a zip file. Sends `repo_path` and `job_id` to `POST /ingest`.
- **Job status** – polls `GET /status/{job_id}` and displays progress.
- **Chat interface** – ask questions via `POST /query` in a clean chat UI.
- **Repo selection** – switch between ingested repos and start new chats.

## Development

```bash
npm install
npm run dev
```

Set environment variables in `.env`:

```
VITE_API_URL=http://localhost:8000
VITE_STRIPE_PK=pk_test_your_key
```

Then open `http://localhost:5173` in your browser.

### Demo login credentials

To explore the app without a backend, log in with:

- **Email:** `demo@codesense.com`
- **Password:** `password123`

## Building

```bash
npm run build
```

## Testing

Currently no automated tests.
