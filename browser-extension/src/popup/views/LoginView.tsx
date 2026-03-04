import { useState } from 'preact/hooks'
import { login } from '@shared/api-client'
import { storeAuth } from '@shared/storage'

interface Props {
  onLogin: (email: string) => void
}

export function LoginView({ onLogin }: Props) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: Event) => {
    e.preventDefault()
    setError('')

    if (!email.trim() || !password) {
      setError('Please enter your email and password.')
      return
    }

    setLoading(true)
    try {
      const data = await login(email.trim(), password)
      await storeAuth({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        user_email: data.user?.email || email.trim(),
        user_id: data.user?.id || '',
      })
      onLogin(data.user?.email || email.trim())
    } catch (err) {
      setError((err as Error).message || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <p class="subtitle">Log in to capture job descriptions and generate resumes.</p>
      <form onSubmit={handleSubmit}>
        <div class="field">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onInput={(e) => setEmail((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        <div class="field">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onInput={(e) => setPassword((e.target as HTMLInputElement).value)}
            required
          />
        </div>
        {error && <div class="error">{error}</div>}
        <button type="submit" class="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </div>
  )
}
