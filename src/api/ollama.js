export async function sendMessage(messages, model = "qwen2.5:7b", extraBody = {}) {
  const ollamaUrl = import.meta.env.VITE_OLLAMA_URL || 'http://localhost:11434';
  try {
    const res = await fetch(`${ollamaUrl}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model,
        messages,
        stream: false,
        ...extraBody,
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`Ollama API error: ${res.status} ${text}`);
    }

    const data = await res.json().catch(() => null);
    if (!data) throw new Error('Ollama returned invalid JSON');
    if (typeof data?.error === 'string' && data.error.trim()) {
      throw new Error(data.error);
    }

    // Direct Ollama responses use `{ message: { content } }`; older helpers may return `message` as a string.
    if (typeof data?.message === 'string') {
      return data.message;
    }

    return data?.message?.content ?? null;
  } catch (err) {
    console.warn('sendMessage failed', err);
    throw err;
  }
}