import { useState } from 'react'
import { motion } from 'framer-motion'
import { ChevronRight, File, Folder, Copy, Check, Download } from 'lucide-react'
import { cn, downloadFile, copyToClipboard } from '@/lib/utils'
import type { ParsedFile } from '@/lib/utils'
import JSZip from 'jszip'

interface TreeNode {
  name: string
  type: 'file' | 'folder'
  children: TreeNode[]
  file?: ParsedFile
}

function buildTree(files: ParsedFile[]): TreeNode[] {
  const root: TreeNode[] = []

  for (const file of files) {
    const parts = file.path.split('/')
    let current = root

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i]
      const isLast = i === parts.length - 1

      if (isLast) {
        current.push({ name: part, type: 'file', children: [], file })
      } else {
        let folder = current.find(n => n.name === part && n.type === 'folder') as TreeNode | undefined
        if (!folder) {
          folder = { name: part, type: 'folder', children: [], file: undefined }
          current.push(folder)
        }
        current = folder.children
      }
    }
  }

  return root
}

function FileNode({ node, depth = 0 }: { node: TreeNode; depth?: number }) {
  const [expanded, setExpanded] = useState(true)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className={cn(
          'flex w-full items-center gap-1.5 rounded-md px-2 py-1 text-left text-xs transition-colors',
          node.type === 'file'
            ? 'text-text-muted hover:text-text hover:bg-surface-hover'
            : 'text-text font-medium',
        )}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
      >
        {node.type === 'folder' ? (
          <>
            <ChevronRight
              className={cn('h-3 w-3 text-text-dim transition-transform', expanded && 'rotate-90')}
            />
            <Folder className="h-3.5 w-3.5 text-primary/60" />
            <span>{node.name}</span>
          </>
        ) : (
          <>
            <span className="w-3.5" />
            <File className="h-3.5 w-3.5 text-text-dim" />
            <span className="truncate">{node.name}</span>
          </>
        )}
      </button>

      {node.type === 'folder' && expanded && node.children.map((child, i) => (
        <FileNode key={`${child.name}-${i}`} node={child} depth={depth + 1} />
      ))}
    </div>
  )
}

function downloadParsedFile(file: ParsedFile) {
  downloadFile(file.path.split('/').pop() || 'file', file.content)
}

async function downloadAllAsZip(files: ParsedFile[]) {
  const zip = new JSZip()
  for (const f of files) {
    zip.file(f.path, f.content)
  }
  const blob = await zip.generateAsync({ type: 'blob' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'generated-files.zip'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

interface FileTreeProps {
  files: ParsedFile[]
  onSelect?: (file: ParsedFile) => void
  selectedPath?: string
}

export function FileTree({ files, onSelect, selectedPath }: FileTreeProps) {
  const [copiedPath, setCopiedPath] = useState<string | null>(null)
  const [zipping, setZipping] = useState(false)
  const tree = buildTree(files)

  const handleCopyAll = async () => {
    const allContent = files.map(f => `// ${f.path}\n${f.content}`).join('\n\n')
    await copyToClipboard(allContent)
    setCopiedPath('__all__')
    setTimeout(() => setCopiedPath(null), 2000)
  }

  const handleDownloadAll = async () => {
    setZipping(true)
    try {
      await downloadAllAsZip(files)
    } finally {
      setZipping(false)
    }
  }

  if (files.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-3 py-2">
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-primary" />
          <span className="text-xs font-semibold text-text">Generated Files</span>
          <span className="text-[10px] text-text-dim">({files.length})</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleDownloadAll}
            disabled={zipping}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
          >
            <Download className="h-3 w-3" />
            {zipping ? 'Zipping…' : 'Download All'}
          </button>
          <button
            onClick={handleCopyAll}
            className="flex items-center gap-1 rounded-md px-2 py-1 text-[10px] text-text-dim hover:text-text hover:bg-surface-hover transition-colors"
          >
            {copiedPath === '__all__' ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
            {copiedPath === '__all__' ? 'Copied' : 'Copy All'}
          </button>
        </div>
      </div>
      <div className="p-1">
        {tree.map((node, i) => (
          <FileNode key={`${node.name}-${i}`} node={node} />
        ))}
      </div>
      <div className="border-t border-border px-3 py-2">
        {files.map((f) => (
          <FilePreview
            key={f.path}
            file={f}
            isSelected={f.path === selectedPath}
            onSelect={() => onSelect?.(f)}
          />
        ))}
      </div>
    </div>
  )
}

function FilePreview({ file, isSelected, onSelect }: { file: ParsedFile; isSelected: boolean; onSelect?: () => void }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation()
    await copyToClipboard(file.content)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'group mb-2 rounded-lg border transition-all overflow-hidden',
        isSelected
          ? 'border-primary/30 bg-primary/5'
          : 'border-border hover:border-border-hover',
      )}
    >
      <div
        className="flex items-center justify-between px-3 py-2 cursor-pointer"
        onClick={onSelect}
      >
        <div className="flex items-center gap-2 min-w-0">
          <File className="h-3.5 w-3.5 shrink-0 text-text-dim" />
          <span className="text-xs font-medium text-text truncate">{file.path}</span>
          <span className="text-[10px] text-text-dim shrink-0">{file.language}</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={(e) => { e.stopPropagation(); downloadParsedFile(file) }}
            className="shrink-0 rounded p-1 text-text-dim opacity-0 group-hover:opacity-100 hover:text-text transition-all"
            title="Download file"
          >
            <Download className="h-3 w-3" />
          </button>
          <button
            onClick={handleCopy}
            className="shrink-0 rounded p-1 text-text-dim opacity-0 group-hover:opacity-100 hover:text-text transition-all"
          >
            {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          </button>
        </div>
      </div>
      <pre className="overflow-x-auto border-t border-border bg-background/50 p-3 text-[11px] leading-relaxed text-text-muted font-mono max-h-48 scrollbar-thin">
        <code>{file.content}</code>
      </pre>
    </motion.div>
  )
}
