/**
 * One-time script: uploads the demo video to Firebase Storage
 * using the REST API (no SDK auth issues).
 *
 * Run with:  node scripts/upload-demo-video.mjs
 */

import { readFileSync } from 'fs'
import { resolve, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = resolve(__dirname, '..')

const BUCKET      = 'foundryforge-c1008.firebasestorage.app'
const OBJECT_NAME = 'public%2Fdemo.mp4'   // URL-encoded "public/demo.mp4"
const API_KEY     = 'AIzaSyC0qERZX9q9d2hXM9fzxNJGSN_7iMHkoew'

const VIDEO_PATH = resolve(ROOT, 'src', 'assets',
  'FoundryForge - AI Software Architect - Google Chrome 2026-06-14 01-28-10.mp4')

console.log('📹  Reading video file …')
const fileBuffer = readFileSync(VIDEO_PATH)
const fileSizeMB = (fileBuffer.byteLength / 1024 / 1024).toFixed(1)
console.log(`    Size: ${fileSizeMB} MB`)

// ── Use Firebase Storage REST API (resumable upload) ─────────────────────────
const uploadURL =
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o?uploadType=media` +
  `&name=${OBJECT_NAME}&key=${API_KEY}`

console.log('☁️   Uploading to Firebase Storage via REST API …')
console.log('    (uploading 127 MB — please wait ~2 minutes on a typical connection)\n')

const response = await fetch(uploadURL, {
  method: 'POST',
  headers: {
    'Content-Type': 'video/mp4',
    'Content-Length': String(fileBuffer.byteLength),
    'Cache-Control': 'public, max-age=31536000',
  },
  body: fileBuffer,
  // Node 22 fetch supports this natively
  duplex: 'half',
})

if (!response.ok) {
  const text = await response.text()
  console.error('❌  Upload failed:', response.status, response.statusText)
  console.error(text)
  process.exit(1)
}

const data = await response.json()
const token = data.downloadTokens

// Build the permanent public download URL
const downloadURL =
  `https://firebasestorage.googleapis.com/v0/b/${BUCKET}/o/${OBJECT_NAME}` +
  `?alt=media&token=${token}`

console.log('✅  Upload complete!\n')
console.log('🔗  Download URL (copy this):')
console.log(downloadURL)
console.log()
