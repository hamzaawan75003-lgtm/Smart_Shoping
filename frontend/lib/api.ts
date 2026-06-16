import axios from 'axios'

const BACKEND_URL  = process.env.NEXT_PUBLIC_API_URL    || 'http://localhost:5000'
const AI_URL       = process.env.NEXT_PUBLIC_AI_URL     || 'http://localhost:8000'

// ─── Backend API (Express / Node) ─────────────────────────────────────────────
export const api = axios.create({
  baseURL: BACKEND_URL,
  headers: { 'Content-Type': 'application/json' },
})

// Auto-attach JWT if available
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token')
    if (token) config.headers['Authorization'] = `Bearer ${token}`
  }
  return config
})

// ─── AI API (FastAPI / Python) ────────────────────────────────────────────────
export const aiApi = axios.create({
  baseURL: AI_URL,
  headers: { 'Content-Type': 'application/json' },
})

export default api
