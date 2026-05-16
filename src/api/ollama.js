export async function sendMessage(messages, model = "qwen2.5:7b", extraBody = {}) {
  // In production, call the serverless proxy at `/api/ollama` so the API key
  // remains server-side. For local development, fall back to `VITE_OLLAMA_URL`.
  const base = import.meta.env.PROD ? '/api/ollama' : (import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434');

  const endpoint = import.meta.env.PROD ? `${base}` : `${base}/api/chat`;

  try {
    const res = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ model, messages, stream: false, ...extraBody }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama API error: ${res.status} ${text}`);
    }

    // Some proxies may return raw text or JSON
    const text = await res.text().catch(() => '');
    try {
      const data = JSON.parse(text);
      if (!data) throw new Error('Ollama returned invalid JSON');
      if (typeof data?.error === 'string' && data.error.trim()) throw new Error(data.error);
      if (typeof data?.message === 'string') return data.message;
      return data?.message?.content ?? null;
    } catch (err) {
      // Not JSON — return plain text
      return text || null;
    }
  } catch (err) {
    console.warn('sendMessage failed', err);
    throw err;
  }
}