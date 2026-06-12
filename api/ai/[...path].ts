import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const endpoint = process.env.FOUNDRY_ENDPOINT
  const apiKey = process.env.FOUNDRY_API_KEY

  if (!endpoint || !apiKey) {
    res.status(500).json({ error: 'FOUNDRY_ENDPOINT and FOUNDRY_API_KEY must be set on the server' })
    return
  }

  try {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    res.status(response.status).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy request failed'
    res.status(502).json({ error: message })
  }
}
