import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { SessionMode } from '@/types'
import { MODE_CONFIG } from '@/data/mock'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function generateId(): string {
  return crypto.randomUUID?.() ?? Math.random().toString(36).slice(2, 11)
}

export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function truncate(str: string, max: number): string {
  return str.length > max ? str.slice(0, max) + '...' : str
}

export interface ParsedFile {
  path: string
  language: string
  content: string
}

export function parseFilesFromMarkdown(text: string): ParsedFile[] {
  const files: ParsedFile[] = []
  const regex = /```(\w+)(?::([^\n]+))?\n([\s\S]*?)```/g
  let match

  while ((match = regex.exec(text)) !== null) {
    const language = match[1]
    const filePath = match[2]?.trim()
    const content = match[3]

    if (filePath) {
      files.push({ path: filePath, language, content })
      continue
    }

    // Fallback: look for a file path in the line(s) before the code block.
    // Common patterns: "**path/to/file**", "### path/to/file", "path/to/file"
    const before = text.slice(0, match.index).trimEnd().split('\n')
    const preceding = before.at(-1)?.trim()
    if (preceding) {
      const pathMatch = preceding.match(
        /(?:\*\*|###?\s*)?([a-zA-Z0-9_\-./]+\.[a-zA-Z0-9]+(?:\.[a-zA-Z0-9]+)?)\s*(?:\*\*)?$/,
      )
      if (pathMatch) {
        files.push({ path: pathMatch[1], language, content })
      }
    }
  }

  return files
}

export function getFileIcon(path: string): string {
  const ext = path.split('.').pop()?.toLowerCase()
  const iconMap: Record<string, string> = {
    ts: 'TypeScript',
    tsx: 'React',
    js: 'JavaScript',
    jsx: 'React',
    json: 'JSON',
    css: 'CSS',
    html: 'HTML',
    py: 'Python',
    rs: 'Rust',
    go: 'Go',
    sql: 'SQL',
    md: 'Markdown',
    yml: 'YAML',
    yaml: 'YAML',
    toml: 'TOML',
    dockerfile: 'Docker',
    sh: 'Shell',
    bat: 'Batch',
  }
  return iconMap[ext || ''] || 'File'
}

export function getModeLabel(mode: SessionMode): string {
  return MODE_CONFIG[mode]?.label || mode
}

export function dedupLines(text: string, maxLines = 10): string {
  if (!text) return ''
  const lines = text.split('\n')
  const split: string[] = []
  for (const line of lines) {
    split.push(...line.replace(/\. - /g, '.\n- ').split('\n'))
  }
  const seen = new Set<string>()
  const deduped: string[] = []
  for (const line of split) {
    const cur = line.trim()
    if (!cur) { deduped.push(line); continue }
    const key = cur.toLowerCase().replace(/[^\w]/g, '').slice(0, 40)
    if (!key || !seen.has(key)) {
      if (key) seen.add(key)
      deduped.push(line)
    }
  }
  let kept = 0
  return deduped.filter(l => (l.trim() ? ++kept <= maxLines : true)).join('\n')
}

export function downloadFile(name: string, content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

export async function copyToClipboard(text: string): Promise<void> {
  await navigator.clipboard.writeText(text)
}
