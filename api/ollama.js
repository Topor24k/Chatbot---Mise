// Vercel serverless proxy for Ollama API
// For production, set OLLAMA_URL and OLLAMA_API_KEY in Vercel Project Settings
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  const OLLAMA_URL = process.env.OLLAMA_URL;
  const OLLAMA_API_KEY = process.env.OLLAMA_API_KEY;

  // Debug: do not log secret values — only presence
  console.log('api/ollama handler init - OLLAMA_URL present?', !!OLLAMA_URL, 'OLLAMA_API_KEY present?', !!OLLAMA_API_KEY);

  if (!OLLAMA_URL) {
    return res.status(500).json({ error: 'OLLAMA_URL not set in environment' });
  }

  try {
    const upstreamUrl = `${OLLAMA_URL.replace(/\/$/, '')}/api/chat`;
    console.log('api/ollama upstream URL:', upstreamUrl);

    const upstream = await fetch(upstreamUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(OLLAMA_API_KEY ? { Authorization: `Bearer ${OLLAMA_API_KEY}` } : {}),
      },
      body: JSON.stringify(req.body),
    });

    const text = await upstream.text();
    console.log('api/ollama upstream status:', upstream.status);
    console.log('api/ollama upstream response snippet:', text.slice(0, 1000));

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
