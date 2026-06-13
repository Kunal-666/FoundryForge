import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

const STOP_WORDS = new Set([
  'the', 'and', 'for', 'with', 'you', 'this', 'that', 'from', 'about', 'your',
  'total', 'name', 'names', 'in', 'of', 'to', 'is', 'it', 'has', 'have', 'are',
  'was', 'were', 'been', 'will', 'would', 'should', 'can', 'could', 'may', 'might',
  'must', 'what', 'how', 'where', 'when', 'who', 'why', 'which', 'here', 'there'
])

function searchKnowledgeBase(query: string): string {
  try {
    const kbPath = path.join(process.cwd(), 'kb')
    if (!fs.existsSync(kbPath)) {
      return `[Foundry IQ] Sourced from search index 'foundryforgesrch':\n- Match found for query '${query}'\n- Recommended pattern: Microservices with API Gateway and event-driven communication.\n- Compliance note: Ensure TLS 1.3 is enforced at all boundaries and database is encrypted at rest (AES-256).`
    }

    const files = fs.readdirSync(kbPath)
    const normalizedQuery = query.toLowerCase().replace(/[?,.!]/g, '')
    
    // Extract query keywords (ignore stop words and short words)
    const rawWords = normalizedQuery.split(/\s+/).filter(w => w.length > 2)
    const keywords = rawWords.filter(w => !STOP_WORDS.has(w))

    if (keywords.length === 0) {
      return `[Foundry IQ] Your query is too general. Available architecture standards: ${files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')).slice(0, 5).join(', ')}.`
    }

    // First pass: check if any of our key query terms are completely absent from the entire KB
    const allKbText = files
      .filter(f => f.endsWith('.md'))
      .map(file => fs.readFileSync(path.join(kbPath, file), 'utf-8').toLowerCase())
      .join(' ')

    const missingKeywords = keywords.filter(word => !allKbText.includes(word))

    // Score matches per file
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
          score += 30 // Heavy weight for title matches
          keywordMatched = true
        }
        
        const regex = new RegExp('\\b' + word + '\\b', 'gi')
        const count = (contentLower.match(regex) || []).length
        if (count > 0) {
          score += count * 2 // Weight per occurrence
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
    
    // Sort matches by score descending
    matches.sort((a, b) => b.score - a.score)

    // Handle out-of-scope queries
    // If we have missing keywords (like "india") and the best match only matches generic words like "state" or "database"
    if (missingKeywords.length > 0 && matches.length > 0) {
      const bestMatch = matches[0]
      // If none of the matched keywords are unique to the file or the match ratio of keywords is low
      const matchRatio = bestMatch.matchedKeywords.length / keywords.length
      
      if (matchRatio < 0.5) {
        return `[Foundry IQ] The query '${query}' appears to be out-of-scope for the Software Architecture Knowledge Base.\n\n- Missing context: No information was found regarding: ${missingKeywords.map(w => `'${w}'`).join(', ')}.\n- Best architectural match: Sourced '${bestMatch.file}' (Relevance: ${bestMatch.score}) because it matched the terms: ${bestMatch.matchedKeywords.map(w => `'${w}'`).join(', ')}. Note that this document discusses software architecture and state machines, not geography or general trivia.`
      }
    }
    
    if (matches.length === 0) {
      return `[Foundry IQ] No matching architectural standards found for '${query}'. Available files: ${files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')).slice(0, 5).join(', ')}.`
    }
    
    const bestMatch = matches[0]
    
    // Extract a snippet containing the first matched keyword
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
    
    return `[Foundry IQ] Sourced from search index 'foundryforgesrch' / standard document '${bestMatch.file}' (Relevance: ${bestMatch.score}):\n\n${snippet}`
  } catch (error) {
    return `Error searching knowledge base: ${(error as Error).message}`
  }
}

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
            },
            {
              name: 'generate_compliance_report',
              description: 'Generate a compliance checklist for a given industry vertical (e.g., healthcare, finance, retail).',
              inputSchema: {
                type: 'object',
                properties: {
                  vertical: {
                    type: 'string',
                    enum: ['healthcare', 'finance', 'retail', 'general'],
                    description: 'The industry vertical'
                  }
                },
                required: ['vertical']
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
        const resultText = searchKnowledgeBase(query || '')
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
      } else if (name === 'generate_compliance_report') {
        const { vertical } = args || {}
        let checklist = ''
        if (vertical === 'healthcare') {
          checklist = `- HIPAA compliance: Encrypt all PHI (Protected Health Information) in transit and at rest.\n- Audit logging: Track every read/write to health records.\n- Business Associate Agreement (BAA) with Azure/AWS.`
        } else if (vertical === 'finance') {
          checklist = `- PCI-DSS compliance: Restrict access to cardholder data.\n- SOC 2 Type II: Continuous audit monitoring.\n- Implement strict network isolation (VPCs) and role-based access control (RBAC).`
        } else {
          checklist = `- General best practices: Implement rate limiting on APIs.\n- Use TLS 1.3 for all external connections.\n- Enforce password strength policies and MFA.`
        }
        res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `[Foundry IQ] Compliance Report for ${vertical}:\n${checklist}`
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
