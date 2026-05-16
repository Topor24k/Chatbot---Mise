# Mise Chatbot

## Setup

1. Install dependencies.

```bash
npm install
```

2. Start Ollama.

```bash
ollama serve
```

3. Start the Vite frontend.

```bash
npm run dev
```

## Environment Variables

- `VITE_OLLAMA_URL`: optional Ollama base URL for the browser client
A short note: This workspace includes a recent developer exercise where 10 small commits were added to demonstrate commit history and provide QA notes. These are included under the `commits/` folder.

## Deployment (Vercel)

Recommended: host the frontend on Vercel and keep your Ollama API key secret using a serverless proxy.

1. In your Vercel Project Settings → Environment Variables add:
	- `OLLAMA_URL` — the base URL for your Ollama deployment (e.g. https://api.ollama.cloud)
	- `OLLAMA_API_KEY` — the API key you generated (do NOT expose this to the browser)

2. The project includes a serverless proxy at `api/ollama.js` that forwards requests to `${OLLAMA_URL}/api/chat` using the server-side key. This keeps secrets out of client bundles.

3. For local development, you can continue using `VITE_OLLAMA_URL` to point at a local Ollama: e.g. `http://localhost:11434`.

Security notes:
- Never store `OLLAMA_API_KEY` in `VITE_*` env vars — those are embedded in the client.
- If you accidentally exposed a key (for example by pasting it into chat), revoke/regenerate it immediately in your provider dashboard.

