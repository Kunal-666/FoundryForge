import type { VercelRequest, VercelResponse } from '@vercel/node'

const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`
const FOUNDRY_ENDPOINT = process.env.FOUNDRY_ENDPOINT || ''

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

  // Azure AI Foundry unified endpoint (services.ai.azure.com) requires this specific audience
  const scope = 'https://ai.azure.com/.default'

  const body = new URLSearchParams({
    client_id: process.env.AZURE_CLIENT_ID!,
    client_secret: process.env.AZURE_CLIENT_SECRET!,
    scope,
    grant_type: 'client_credentials',
  })

  const res = await fetch(TOKEN_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body,
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`Token request failed: ${res.status} ${text}`)
  }

  const data = await res.json()
  const expiresIn = (data.expires_in as number) || 3600
  cachedToken = {
    token: data.access_token as string,
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  }
  return data.access_token as string
}

/** Append api-version=v1 to the endpoint URL if not already present. */
function buildTargetUrl(): string {
  const url = new URL(FOUNDRY_ENDPOINT)
  if (!url.searchParams.has('api-version')) {
    url.searchParams.set('api-version', 'v1')
  }
  return url.toString()
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Only allow POST
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' })
    return
  }

  const missing: string[] = []
  if (!process.env.AZURE_TENANT_ID) missing.push('AZURE_TENANT_ID')
  if (!process.env.AZURE_CLIENT_ID) missing.push('AZURE_CLIENT_ID')
  if (!process.env.AZURE_CLIENT_SECRET) missing.push('AZURE_CLIENT_SECRET')
  if (!FOUNDRY_ENDPOINT) missing.push('FOUNDRY_ENDPOINT')

  if (missing.length > 0) {
    res.status(500).json({ error: `Missing server env vars: ${missing.join(', ')}` })
    return
  }

  try {
    const token = await getToken()
    const targetUrl = buildTargetUrl()

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(req.body),
    })

    const responseText = await response.text()
    console.log(`[api/proxy] Azure response ${response.status}: ${responseText.slice(0, 500)}`)

    if (!responseText) {
      res.status(502).json({ error: `Empty response from Azure (HTTP ${response.status})` })
      return
    }

    let data: unknown
    try {
      data = JSON.parse(responseText)
    } catch {
      // Azure returned non-JSON (could be HTML error page or plain text)
      res.status(502).json({ error: `Non-JSON response from Azure (HTTP ${response.status}): ${responseText.slice(0, 300)}` })
      return
    }

    res.status(response.status).json(data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Proxy request failed'
    console.error('[api/proxy] Error:', message)
    res.status(502).json({ error: message })
  }
}
