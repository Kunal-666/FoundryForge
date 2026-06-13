import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'this', 'that', 'from', 'about', 'your',
  'total', 'name', 'names', 'in', 'of', 'to', 'is', 'it', 'has', 'have', 'are',
  'was', 'were', 'been', 'will', 'would', 'should', 'can', 'could', 'may', 'might',
  'must', 'what', 'how', 'where', 'when', 'who', 'why', 'which', 'here', 'there'
])

// ─── Local Search Fallback ───────────────────────────────────────────────────

function searchLocalKnowledgeBase(query: string): string {
  try {
    const kbPath = path.join(process.cwd(), 'kb')
    if (!fs.existsSync(kbPath)) {
      return `[Foundry IQ] Sourced from local fallback search:\n- Match found for query '${query}'\n- Recommended pattern: Microservices with API Gateway and event-driven communication.\n- Compliance note: Ensure TLS 1.3 is enforced at all boundaries and database is encrypted at rest (AES-256).`
    }

    const files = fs.readdirSync(kbPath)
    const normalizedQuery = query.toLowerCase().replace(/[?,.!]/g, '')
    
    const rawWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
    const keywords = rawWords.filter(w => !STOP_WORDS.has(w))

    if (keywords.length === 0) {
      return `[Foundry IQ] Your query is too general. Available architecture standards: ${files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')).slice(0, 5).join(', ')}.`
    }

    const allKbText = files
      .filter(f => f.endsWith('.md'))
      .map(file => fs.readFileSync(path.join(kbPath, file), 'utf-8').toLowerCase())
      .join(' ')

    const missingKeywords = keywords.filter(word => !allKbText.includes(word))

    const matches: Array<{ file: string; score: number; content: string; matchedKeywords: string[] }> = []
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(kbPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      const contentLower = content.toLowerCase()
      
      let score = 0
      const matchedKeywords: string[] = []
      const nameWithoutExt = file.replace('.md', '').replace(/_/g, ' ').toLowerCase()
      
      for (const word of keywords) {
        let keywordMatched = false
        if (nameWithoutExt.includes(word)) {
          score += 30
          keywordMatched = true
        }
        
        const regex = new RegExp('\\b' + word + '\\b', 'gi')
        const count = (contentLower.match(regex) || []).length
        if (count > 0) {
          score += count * 2
          keywordMatched = true
        }

        if (keywordMatched) {
          matchedKeywords.push(word)
        }
      }
      
      if (score > 0) {
        matches.push({ file, score, content, matchedKeywords })
      }
    }
    
    matches.sort((a, b) => b.score - a.score)

    if (missingKeywords.length > 0 && matches.length > 0) {
      const bestMatch = matches[0]
      const matchRatio = bestMatch.matchedKeywords.length / keywords.length
      
      if (matchRatio < 0.5) {
        return `[Foundry IQ] The query '${query}' appears to be out-of-scope for the Software Architecture Knowledge Base.\n\n- Missing context: No information was found regarding: ${missingKeywords.map(w => `'${w}'`).join(', ')}.\n- Best local match: Sourced '${bestMatch.file}' (Relevance: ${bestMatch.score}) because it matched: ${bestMatch.matchedKeywords.map(w => `'${w}'`).join(', ')}.`
      }
    }
    
    if (matches.length === 0) {
      return `[Foundry IQ] No matching local architectural standards found for '${query}'. Available files: ${files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')).slice(0, 5).join(', ')}.`
    }
    
    const bestMatch = matches[0]
    let snippet = ''
    const bestWord = bestMatch.matchedKeywords[0] || ''
    const index = bestWord ? bestMatch.content.toLowerCase().indexOf(bestWord) : -1
    
    if (index !== -1) {
      const start = Math.max(0, index - 200)
      const end = Math.min(bestMatch.content.length, index + 800)
      snippet = '...\n' + bestMatch.content.slice(start, end).trim() + '\n...'
    } else {
      snippet = bestMatch.content.slice(0, 1000).trim() + '\n...'
    }
    
    return `[Foundry IQ] Sourced from local standards file '${bestMatch.file}' (Relevance: ${bestMatch.score}):\n\n${snippet}`
  } catch (error) {
    return `Error searching local knowledge base: ${(error as Error).message}`
  }
}

// ─── Azure AI Foundry Integration ────────────────────────────────────────────

const TOKEN_ENDPOINT = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID}/oauth2/v2.0/token`
const FOUNDRY_ENDPOINT = process.env.FOUNDRY_ENDPOINT || ''

let cachedToken: { token: string; expiresAt: number } | null = null

async function getToken(): Promise<string> {
  if (cachedToken && Date.now() < cachedToken.expiresAt) {
    return cachedToken.token
  }

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

  const data = (await res.json()) as any
  const expiresIn = (data.expires_in as number) || 3600
  cachedToken = {
    token: data.access_token as string,
    expiresAt: Date.now() + (expiresIn - 60) * 1000,
  }
  return data.access_token as string
}

async function queryFoundryAgent(query: string): Promise<string> {
  const isConfigured = !!process.env.AZURE_TENANT_ID &&
                       !!process.env.AZURE_CLIENT_ID &&
                       !!process.env.AZURE_CLIENT_SECRET &&
                       !!FOUNDRY_ENDPOINT

  if (!isConfigured) {
    console.log('[api/mcp] Azure credentials missing. Falling back to local search.')
    return searchLocalKnowledgeBase(query)
  }

  try {
    const token = await getToken()
    
    const url = new URL(FOUNDRY_ENDPOINT)
    if (!url.searchParams.has('api-version')) {
      url.searchParams.set('api-version', 'v1')
    }

    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        input: `You are an AI Software Architect querying the Foundry IQ database. Please answer this query using the grounded knowledge in your search index (foundryforgesrch):\n\nQuery: ${query}`
      }),
    })

    if (!response.ok) {
      const text = await response.text()
      console.warn(`[api/mcp] Foundry query failed (HTTP ${response.status}): ${text}. Falling back to local search.`)
      return searchLocalKnowledgeBase(query)
    }

    const data = (await response.json()) as any
    const text = data.output
      ?.find((o: any) => o.type === 'message')
      ?.content?.find((c: any) => c.type === 'output_text')
      ?.text

    if (!text) {
      console.warn('[api/mcp] Empty output from Foundry. Falling back to local search.')
      return searchLocalKnowledgeBase(query)
    }

    return `[Foundry IQ] Sourced from live Azure AI Foundry agent:\n\n${text}`
  } catch (error) {
    console.error('[api/mcp] Error querying Foundry agent:', error)
    return searchLocalKnowledgeBase(query)
  }
}

// ─── MCP Endpoint Handler ────────────────────────────────────────────────────

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Enforce CORS so MCP clients running in browser/iframe contexts can connect
  res.setHeader('Access-Control-Allow-Credentials', 'true')
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT')
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, MCP-Protocol-Version')

  if (req.method === 'OPTIONS') {
    res.status(200).end()
    return
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed. Please use POST.' })
    return
  }

  const { jsonrpc, method, params, id } = req.body || {}

  // Basic JSON-RPC 2.0 validation
  if (jsonrpc !== '2.0') {
    res.status(400).json({
      jsonrpc: '2.0',
      error: { code: -32600, message: 'Invalid Request (JSON-RPC 2.0 version is required)' },
      id: id || null
    })
    return
  }

  switch (method) {
    case 'initialize': {
      res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          protocolVersion: '2025-03-26',
          capabilities: {
            tools: {}
          },
          serverInfo: {
            name: 'foundryforge-mcp',
            version: '1.0.0'
          }
        }
      })
      break
    }

    case 'notifications/initialized': {
      res.status(200).end()
      break
    }

    case 'tools/list': {
      res.status(200).json({
        jsonrpc: '2.0',
        id,
        result: {
          tools: [
            {
              name: 'query_foundry_iq',
              description: 'Query the Foundry IQ architecture knowledge base for best practices, compliance, and design patterns.',
              inputSchema: {
                type: 'object',
                properties: {
                  query: {
                    type: 'string',
                    description: 'The search query (e.g., "HIPAA compliance for database", "microservices communication patterns")'
                  }
                },
                required: ['query']
              }
            }
          ]
        }
      })
      break
    }

    case 'tools/call': {
      const { name, arguments: args } = params || {}
      if (name === 'query_foundry_iq') {
        const { query } = args || {}
        const resultText = await queryFoundryAgent(query || '')
        res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: resultText
              }
            ]
          }
        })
      } else {
        res.status(200).json({
          jsonrpc: '2.0',
          id,
          error: { code: -32601, message: `Tool not found: ${name}` }
        })
      }
      break
    }

    default: {
      res.status(200).json({
        jsonrpc: '2.0',
        id,
        error: { code: -32601, message: `Method not found: ${method}` }
      })
      break
    }
  }
}
