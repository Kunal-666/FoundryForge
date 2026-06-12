import { create } from 'zustand'
import type { Settings } from '@/types'

const STORAGE_KEY = 'foundryforge_settings'

const defaults: Settings = {
  theme: 'dark',
  fontSize: 'md',
  autoSave: true,
  animationSpeed: 'normal',
}

function loadFromStorage(): Settings {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return { ...defaults }
    return { ...defaults, ...JSON.parse(raw) }
  } catch {
    return { ...defaults }
  }
}

function persist(state: Settings) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch { /* ignore */ }
}

interface SettingsStore extends Settings {
  setTheme: (theme: 'dark' | 'light') => void
  setFontSize: (size: 'sm' | 'md' | 'lg') => void
  setAutoSave: (enabled: boolean) => void
  setAnimationSpeed: (speed: 'slow' | 'normal' | 'fast') => void
  reset: () => void
}

export const useSettingsStore = create<SettingsStore>((set) => {
  const initial = loadFromStorage()

  return {
    ...initial,

    setTheme: (theme) => set((s) => {
      const next = { ...s, theme }
      persist(next)
      return next
    }),

    setFontSize: (fontSize) => set((s) => {
      const next = { ...s, fontSize }
      persist(next)
      return next
    }),

    setAutoSave: (autoSave) => set((s) => {
      const next = { ...s, autoSave }
      persist(next)
      return next
    }),

    setAnimationSpeed: (animationSpeed) => set((s) => {
      const next = { ...s, animationSpeed }
      persist(next)
      return next
    }),

    reset: () => {
      persist(defaults)
      set(defaults)
    },
  }
})
