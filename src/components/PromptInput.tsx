import { useState, useRef, type KeyboardEvent } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sparkles, ArrowUp, Paperclip, X, File } from 'lucide-react'

export interface UploadedFile {
  name: string
  content: string
  language: string
}

interface PromptInputProps {
  onSubmit: (prompt: string, files?: UploadedFile[]) => void
  isLoading?: boolean
  placeholder?: string
  className?: string
}

export function PromptInput({
  onSubmit,
  isLoading = false,
  placeholder = "Describe your software idea...",
  className,
}: PromptInputProps) {
  const [value, setValue] = useState('')
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleSubmit = () => {
    const trimmed = value.trim()
    if (trimmed && !isLoading) {
      onSubmit(trimmed, uploadedFiles.length > 0 ? uploadedFiles : undefined)
      setValue('')
      setUploadedFiles([])
    }
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setValue(e.target.value)
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const readers = files.map(file => new Promise<UploadedFile>((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const ext = file.name.split('.').pop()?.toLowerCase() || ''
        resolve({ name: file.name, content: reader.result as string, language: ext })
      }
      reader.onerror = reject
      reader.readAsText(file)
    }))
    const results = await Promise.all(readers)
    setUploadedFiles(prev => [...prev, ...results])
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className={cn('relative', className)}
    >
      <div className="relative overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl shadow-black/20 transition-colors focus-within:border-primary/50">
        {uploadedFiles.length > 0 && (
          <div className="flex flex-wrap gap-1.5 px-4 pt-2.5 pb-1 border-b border-border/50">
            {uploadedFiles.map((f, i) => (
              <span
                key={i}
                className="inline-flex items-center gap-1 rounded-lg bg-primary/10 px-2 py-1 text-[10px] text-primary"
              >
                <File className="h-3 w-3" />
                <span className="truncate max-w-[120px]">{f.name}</span>
                <button onClick={() => removeFile(i)} className="hover:text-text transition-colors">
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        )}
        <div className="absolute top-3 left-4 text-text-dim">
          <Sparkles className="h-4 w-4" />
        </div>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          rows={3}
          className="w-full resize-none bg-transparent px-12 py-3 text-sm text-text placeholder:text-text-dim outline-none scrollbar-thin"
          disabled={isLoading}
        />
        <div className="absolute bottom-3 right-3 flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
            accept=".ts,.tsx,.js,.jsx,.py,.rs,.go,.java,.kt,.swift,.css,.html,.json,.md,.txt,.sql,.yml,.yaml,.toml,.sh,.bat,.dockerfile"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isLoading}
            className="rounded-lg p-1.5 text-text-dim hover:text-text hover:bg-surface-hover transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <Paperclip className="h-4 w-4" />
          </button>
          {value.trim() && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-xs text-text-dim"
            >
              <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] font-medium">
                ↵
              </kbd>
            </motion.span>
          )}
          <Button
            onClick={handleSubmit}
            disabled={!value.trim() || isLoading}
            size="icon"
            className={cn(
              'h-8 w-8 rounded-xl transition-all',
              value.trim()
                ? 'bg-primary text-white shadow-lg shadow-primary/30 hover:bg-primary-hover'
                : 'bg-surface-hover text-text-dim',
            )}
          >
            <ArrowUp className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </motion.div>
  )
}
