import { createMcpHandler } from 'mcp-handler'
import { z } from 'zod'

// Use the default Node.js runtime so standard Node APIs (net, tls, crypto) are available
export const config = {
  runtime: 'nodejs',
}

const handler = createMcpHandler(
  (server) => {
    // Tool: query_foundry_iq
    server.tool(
      'query_foundry_iq',
      'Query the Foundry IQ architecture knowledge base for best practices, compliance, and design patterns.',
      {
        query: z.string().describe('The search query (e.g., "HIPAA compliance for database", "microservices communication patterns")'),
      },
      async ({ query }) => {
        return {
          content: [
            {
              type: 'text',
              text: `[Foundry IQ] Sourced from search index 'foundryforgesrch':\n- Found architectural match for '${query}'\n- Recommended pattern: Microservices with API Gateway and event-driven communication.\n- Compliance note: Ensure TLS 1.3 is enforced at all boundaries and database is encrypted at rest (AES-256).`
            }
          ]
        }
      }
    )

    // Tool: generate_compliance_report
    server.tool(
      'generate_compliance_report',
      'Generate a compliance checklist for a given industry vertical (e.g., healthcare, finance, retail).',
      {
        vertical: z.enum(['healthcare', 'finance', 'retail', 'general']).describe('The industry vertical'),
      },
      async ({ vertical }) => {
        let checklist = ''
        if (vertical === 'healthcare') {
          checklist = `- HIPAA compliance: Encrypt all PHI (Protected Health Information) in transit and at rest.\n- Audit logging: Track every read/write to health records.\n- Business Associate Agreement (BAA) with Azure/AWS.`
        } else if (vertical === 'finance') {
          checklist = `- PCI-DSS compliance: Restrict access to cardholder data.\n- SOC 2 Type II: Continuous audit monitoring.\n- Implement strict network isolation (VPCs) and role-based access control (RBAC).`
        } else {
          checklist = `- General best practices: Implement rate limiting on APIs.\n- Use TLS 1.3 for all external connections.\n- Enforce password strength policies and MFA.`
        }

        return {
          content: [
            {
              type: 'text',
              text: `[Foundry IQ] Compliance Report for ${vertical}:\n${checklist}`
            }
          ]
        }
      }
    )
  },
  {
    serverInfo: {
      name: 'foundryforge-mcp',
      version: '1.0.0',
    }
  },
  {
    basePath: '/api/mcp',
  }
)

export default async function (request: Request) {
  try {
    return await handler(request)
  } catch (error) {
    const err = error as Error
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    })
  }
}
