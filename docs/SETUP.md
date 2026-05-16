# Local Development

This project is intended to be developed and run locally. The instructions below help you get started with a local Ollama-compatible API and the Vite frontend.

1. Install dependencies.

```bash
npm install
```

2. Start Ollama (if using a local Ollama instance)

```bash
ollama serve
```

3. Start the Vite frontend.

```bash
npm run dev
```

Environment variable:
- `VITE_OLLAMA_URL`: optional base URL for the Ollama-compatible API the client should call. Defaults to `http://localhost:11434` when not set.

This document no longer contains deployment platform instructions — it focuses on local development only.
