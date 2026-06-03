// Server proxy for forwarding requests to an Ollama-compatible API.
// Notes:
// - This proxy simply relays the client's chat payloads to a local or
//   remote Ollama-compatible API (defaults to http://localhost:11434).
// - The client may pass a `model` identifier (e.g. `qwen2.5:7b`) in the
//   request body; the Ollama server will route the request to that model
//   if available. This file does not select or run models itself.
// - Configure the upstream Ollama URL in production by changing the
//   `OLLAMA_URL` value or by placing a proxy in front of this handler.
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
