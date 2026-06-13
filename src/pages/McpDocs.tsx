import { Navbar } from '@/components/Navbar'
import { Card } from '@/components/ui/card'
import { Check, Copy, Terminal, Cpu, Settings as SettingsIcon } from 'lucide-react'
import { useState } from 'react'

export function McpDocs() {
  const [copiedSection, setCopiedSection] = useState<string | null>(null)

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text)
    setCopiedSection(id)
    setTimeout(() => setCopiedSection(null), 2000)
  }

  const vsCodeConfig = `{
  "github.copilot.mcp": {
    "foundryforge-mcp": {
      "type": "sse",
      "url": "https://foundry-forge-alpha.vercel.app/api/mcp/sse"
    }
  }
}`

  const claudeConfig = `{
  "mcpServers": {
    "foundryforge-mcp": {
      "type": "sse",
      "url": "https://foundry-forge-alpha.vercel.app/api/mcp/sse"
    }
  }
}`

  const streamableUrl = "https://foundry-forge-alpha.vercel.app/api/mcp/mcp"
  const sseUrl = "https://foundry-forge-alpha.vercel.app/api/mcp/sse"

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-32">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between border-b border-border pb-8 mb-8">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-text">Model Context Protocol (MCP)</h1>
            <p className="mt-2 text-lg text-text-muted">Connect your AI assistants directly to the FoundryForge knowledge engine.</p>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
            <Cpu className="h-6 w-6" />
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Main docs column */}
          <div className="lg:col-span-2 space-y-8 text-text-muted">
            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">What is MCP?</h2>
              <p className="leading-relaxed">
                Model Context Protocol is an open standard that lets AI models safely read data, search files, and run tools provided by your server. 
                By enabling the FoundryForge MCP server, tools like **GitHub Copilot** or **Codex Desktop** can query our architecture standards database and retrieve real-time compliance guides directly from your workspace.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">Available Tools</h2>
              <div className="space-y-4">
                <Card className="p-6 border-border/60 bg-surface/50 backdrop-blur-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Terminal className="h-4 w-4 text-primary" />
                    <code className="text-text font-semibold">query_foundry_iq</code>
                  </div>
                  <p className="text-sm mb-4">Queries the Foundry IQ knowledge base files (like stack detection, requirement analysis, and standard blueprints) to find relevant templates or compliance notes.</p>
                  <div className="text-xs bg-zinc-900 text-zinc-100 rounded-lg p-3">
                    <span className="text-zinc-400 font-mono">Input: </span>
                    <code className="text-emerald-400 font-mono">{"{ query: string }"}</code>
                  </div>
                </Card>


              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-text mb-4">Active Endpoints</h2>
              <div className="border border-border rounded-xl overflow-hidden bg-surface/20">
                <div className="flex items-center justify-between border-b border-border bg-surface/50 px-4 py-3">
                  <div className="text-sm font-semibold text-text">Streamable HTTP (Stateless)</div>
                  <button 
                    onClick={() => handleCopy(streamableUrl, 'stream')}
                    className="text-text-dim hover:text-text p-1 transition-colors"
                    aria-label="Copy streamable url"
                  >
                    {copiedSection === 'stream' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-emerald-400 bg-zinc-950 border border-zinc-800 rounded-lg m-2 break-all select-all">{streamableUrl}</div>
                <div className="px-4 pb-4 text-xs text-text-dim">
                  *Best for modern cloud clients like Codex Desktop using stateless HTTP connection.
                </div>

                <div className="flex items-center justify-between border-t border-b border-border bg-surface/50 px-4 py-3">
                  <div className="text-sm font-semibold text-text">SSE Transport (Stream)</div>
                  <button 
                    onClick={() => handleCopy(sseUrl, 'sse')}
                    className="text-text-dim hover:text-text p-1 transition-colors"
                    aria-label="Copy sse url"
                  >
                    {copiedSection === 'sse' ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
                <div className="p-4 font-mono text-xs text-emerald-400 bg-zinc-950 border border-zinc-800 rounded-lg m-2 break-all select-all">{sseUrl}</div>
                <div className="px-4 pb-4 text-xs text-text-dim">
                  *Used by client plugins (like VS Code Copilot or Claude Desktop) expecting a persistent server-sent events connection.
                </div>
              </div>
            </section>
          </div>

          {/* Configuration sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-primary/20 bg-primary/5">
              <div className="flex items-center gap-2 text-primary font-semibold mb-3">
                <SettingsIcon className="h-4 w-4" />
                <h3>Client Setup</h3>
              </div>
              <p className="text-xs text-text-muted leading-relaxed">
                Copy the snippets below and paste them into your client configuration files to start using the MCP server instantly.
              </p>
            </Card>

            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">VS Code Copilot (settings.json)</span>
                  <button 
                    onClick={() => handleCopy(vsCodeConfig, 'vscode')}
                    className="text-xs flex items-center gap-1 text-text-dim hover:text-text transition-colors"
                  >
                    {copiedSection === 'vscode' ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'vscode' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs p-4 bg-zinc-950 rounded-xl overflow-x-auto text-zinc-100 border border-zinc-800 select-all">
                  {vsCodeConfig}
                </pre>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-text uppercase tracking-wider">Claude Desktop Config</span>
                  <button 
                    onClick={() => handleCopy(claudeConfig, 'claude')}
                    className="text-xs flex items-center gap-1 text-text-dim hover:text-text transition-colors"
                  >
                    {copiedSection === 'claude' ? <Check className="h-3 w-3 text-primary" /> : <Copy className="h-3 w-3" />}
                    <span>{copiedSection === 'claude' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <pre className="text-xs p-4 bg-zinc-950 rounded-xl overflow-x-auto text-zinc-100 border border-zinc-800 select-all">
                  {claudeConfig}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
