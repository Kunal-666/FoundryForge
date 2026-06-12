import { create } from 'zustand'

export type ConnectionStatus = 'idle' | 'connecting' | 'connected' | 'error'

interface ConnectionState {
  status: ConnectionStatus
  errorMessage: string | null
  lastSuccessAt: Date | null
  lastErrorAt: Date | null
  setConnecting: () => void
  setConnected: () => void
  setError: (message: string) => void
  setIdle: () => void
}

export const useConnectionStore = create<ConnectionState>((set) => ({
  status: 'idle',
  errorMessage: null,
  lastSuccessAt: null,
  lastErrorAt: null,

  setConnecting: () =>
    set({ status: 'connecting', errorMessage: null }),

  setConnected: () =>
    set({
      status: 'connected',
      errorMessage: null,
      lastSuccessAt: new Date(),
    }),

  setError: (message) =>
    set({
      status: 'error',
      errorMessage: message,
      lastErrorAt: new Date(),
    }),

  setIdle: () =>
    set({ status: 'idle', errorMessage: null }),
}))
