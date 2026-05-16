export async function sendMessage(messages, model = "qwen2.5:7b", extraBody = {}) {
  // Use `VITE_OLLAMA_URL` to point the client at an Ollama-compatible API.
  // Defaults to a local Ollama instance if not provided.
  const base = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
  const endpoint = `${base.replace(/\/$/, '')}/api/chat`;

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