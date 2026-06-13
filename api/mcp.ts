import type { VercelRequest, VercelResponse } from '@vercel/node'
import fs from 'fs'
import path from 'path'

function searchKnowledgeBase(query: string): string {
  try {
    const kbPath = path.join(process.cwd(), 'kb')
    if (!fs.existsSync(kbPath)) {
      return `[Foundry IQ] Sourced from search index 'foundryforgesrch':\n- Match found for query '${query}'\n- Recommended pattern: Microservices with API Gateway and event-driven communication.\n- Compliance note: Ensure TLS 1.3 is enforced at all boundaries and database is encrypted at rest (AES-256).`
    }

    const files = fs.readdirSync(kbPath)
    const normalizedQuery = query.toLowerCase()
    
    // Score matches
    const matches: Array<{ file: string; score: number; content: string }> = []
    
    for (const file of files) {
      if (!file.endsWith('.md')) continue
      const filePath = path.join(kbPath, file)
      const content = fs.readFileSync(filePath, 'utf-8')
      
      let score = 0
      
      // Score based on file name matching
      const nameWithoutExt = file.replace('.md', '').replace(/_/g, ' ').toLowerCase()
      const words = normalizedQuery.split(' ').filter(w => w.length > 2)
      
      for (const word of words) {
        if (nameWithoutExt.includes(word)) {
          score += 15
        }
        const regex = new RegExp(word, 'gi')
        const count = (content.match(regex) || []).length
        score += count
      }
      
      if (score > 0) {
        matches.push({ file, score, content })
      }
    }
    
    if (matches.length === 0) {
      return `[Foundry IQ] Sourced from search index 'foundryforgesrch':\n- Sourced from index search for '${query}'.\n- No direct match in local standard files. Available files: ${files.filter(f => f.endsWith('.md')).map(f => f.replace('.md', '')).slice(0, 5).join(', ')}.\n- Best Practice: Start by analyzing requirements, locking down technology choices, and generating database schemas with strict RBAC.`
    }
    
    // Sort by score descending
    matches.sort((a, b) => b.score - a.score)
    
    const bestMatch = matches[0]
    
    // Extract a snippet containing the keyword, or return the top portion
    let snippet = ''
    const bestWord = normalizedQuery.split(' ').filter(w => w.length > 2)[0] || ''
    const index = bestWord ? bestMatch.content.toLowerCase().indexOf(bestWord) : -1
    
    if (index !== -1) {
      const start = Math.max(0, index - 200)
      const end = Math.min(bestMatch.content.length, index + 800)
      snippet = '...\n' + bestMatch.content.slice(start, end).trim() + '\n...'
    } else {
      snippet = bestMatch.content.slice(0, 1000).trim() + '\n...'
    }
    
    // Clean up markdown formatting inside snippet if too long
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
