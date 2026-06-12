import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import { execSync } from 'child_process'

const FOUNDRY_TARGET = 'https://foundryforge-resource.services.ai.azure.com'

let bearerToken = ''
let lastFetch = 0

const TOKEN_RESOURCES = [
  FOUNDRY_TARGET,
  'https://ai.azure.com',
  'https://cognitiveservices.azure.com',
]

function ensureToken() {
  const now = Date.now()
  if (!bearerToken || now - lastFetch > 45 * 60 * 1000) {
    for (const resource of TOKEN_RESOURCES) {
      try {
        bearerToken = execSync(
          `az account get-access-token --resource ${resource} --query accessToken -o tsv`,
          { encoding: 'utf-8', timeout: 10000 },
        ).trim()
        if (bearerToken) {
          lastFetch = now
          console.log(`[proxy] Acquired Bearer token for resource: ${resource}`)
          return bearerToken
        }
      } catch {
        // try next resource
      }
    }
    console.warn(
      '\n  ⚠  Could not acquire Azure Bearer token.\n' +
      '  The Foundry agent uses OBO auth, which requires a user token.\n' +
      '  Run `az login` to authenticate Azure CLI, then restart the dev server.\n'
    )
    bearerToken = ''
  }
  return bearerToken
}

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api/ai': {
        target: FOUNDRY_TARGET,
        changeOrigin: true,
        rewrite: (p) => p.replace(/^\/api\/ai/, ''),
        configure: (proxy) => {
          proxy.on('proxyReq', (_proxyReq, req) => {
            const token = ensureToken()
            if (token) {
              _proxyReq.setHeader('Authorization', `Bearer ${token}`)
            }
          })
          proxy.on('proxyRes', (proxyRes, req) => {
            if (proxyRes.statusCode === 401) {
              let body = ''
              proxyRes.on('data', (chunk) => { body += chunk })
              proxyRes.on('end', () => {
                try {
                  const parsed = JSON.parse(body)
                  console.error(`\n  ✖  Foundry API 401 (${req.url?.split('?')[0]}): ${parsed.error?.message || body}\n`)
                } catch {
                  console.error(`\n  ✖  Foundry API 401 (${req.url?.split('?')[0]}): ${body}\n`)
                }
              })
            }
          })
        },
      },
    },
  },
})
