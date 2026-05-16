// Server proxy for forwarding requests to an Ollama-compatible API
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  // Use a local Ollama-compatible API by default.
  const OLLAMA_URL = 'http://localhost:11434';
  const OLLAMA_API_KEY = null;

  try {
    const upstreamUrl = `${OLLAMA_URL.replace(/\/$/, '')}/api/chat`;

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text();

    // Try to parse JSON response, otherwise stream raw text
    try {
      const json = JSON.parse(text);
      return res.status(upstream.status).json(json);
    } catch (e) {
      res.status(upstream.status).send(text);
    }
  } catch (err) {
    console.error('Ollama proxy error', err);
    return res.status(500).json({ error: 'Proxy error' });
  }
}
