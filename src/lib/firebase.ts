import { initializeApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { initializeFirestore, type Firestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
} as const

const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.projectId)

let app: ReturnType<typeof initializeApp> | null = null
let auth: Auth | null = null
let db: Firestore | null = null

if (isConfigured) {
  app = initializeApp(firebaseConfig)
  auth = getAuth(app)
  db = initializeFirestore(app, {
    // Use long-polling instead of streaming to avoid QUIC protocol errors
    // on networks that block or misroute HTTP/2 and gRPC connections.
    experimentalForceLongPolling: true,
    // Let Firestore manage its own connection retries silently.
    ignoreUndefinedProperties: true,
  })
}

export { app, auth, db, isConfigured }
