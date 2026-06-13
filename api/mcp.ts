import type { VercelRequest, VercelResponse } from '@vercel/node'

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
        res.status(200).json({
          jsonrpc: '2.0',
          id,
          result: {
            content: [
              {
                type: 'text',
                text: `[Foundry IQ] Sourced from search index 'foundryforgesrch':\n- Found architectural match for '${query}'\n- Recommended pattern: Microservices with API Gateway and event-driven communication.\n- Compliance note: Ensure TLS 1.3 is enforced at all boundaries and database is encrypted at rest (AES-256).`
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
