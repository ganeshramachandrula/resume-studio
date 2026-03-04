import { useState, useEffect } from 'preact/hooks'
import { getStoredAuth } from '@shared/storage'
import { LoginView } from './views/LoginView'
import { LoggedInView } from './views/LoggedInView'

export function App() {
  const [email, setEmail] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getStoredAuth().then((auth) => {
      setEmail(auth?.user_email ?? null)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <div>
      <div class="header">
        <div class="logo">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
        </div>
        <span class="title">Resume Studio</span>
      </div>
      {email
        ? <LoggedInView email={email} onLogout={() => setEmail(null)} />
        : <LoginView onLogin={(e) => setEmail(e)} />
      }
    </div>
  )
}
