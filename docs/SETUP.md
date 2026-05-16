# Setup and Deployment

This document contains setup, development, and deployment steps for running the project locally and on platforms such as Vercel. The instructions were moved out of the main README to keep that file concise and focused on the project description.

## Local development

1. Install dependencies.

```bash
npm install
```

2. Start Ollama (local deployment)

```bash
ollama serve
```

3. Start the Vite frontend.

```bash
npm run dev
```

## Environment Variables

- `VITE_OLLAMA_URL`: optional Ollama base URL for the browser client (local-only; not required when using server-side proxy)

## Deployment (Vercel)

Recommended: host the frontend on Vercel and keep your Ollama API key secret using a serverless proxy.

1. In your Vercel Project Settings → Environment Variables add:
  - `OLLAMA_URL` — the base URL for your Ollama deployment (e.g. https://api.ollama.cloud)
  - `OLLAMA_API_KEY` — the API key you generated (do NOT expose this to the browser)

2. The project includes a serverless proxy at `api/ollama.js` that forwards requests to `${OLLAMA_URL}/api/chat` using the server-side key. This keeps secrets out of client bundles.

3. For local development, you can continue using `VITE_OLLAMA_URL` to point at a local Ollama: e.g. `http://localhost:11434`.

## Security notes

- Never store `OLLAMA_API_KEY` in `VITE_*` env vars — those are embedded in the client.
- If you accidentally exposed a key (for example by pasting it into chat), revoke/regenerate it immediately in your provider dashboard.
