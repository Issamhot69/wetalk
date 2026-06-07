'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Sending:', { email, password })
    setLoading(true)
    try {
      const res = await fetch('http://localhost:9020/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      console.log('Response:', data)
      if (!res.ok) throw new Error(data.message || 'Erreur')
      setAuth(data.user, data.token)
      toast.success(`Bienvenue ${data.user.username} 👋`)
      router.push('/chat')
    } catch (err: any) {
      toast.error(err?.message || 'Identifiants invalides')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">💬</div>
          <h1 className="text-3xl font-bold text-white">Connexion</h1>
          <p className="text-gray-400 mt-2">Content de vous revoir !</p>
        </div>
        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              className="input-base"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Mot de passe</label>
            <input
              type="password"
              className="input-base"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-50"
          >
            {loading ? 'Connexion...' : 'Se connecter'}
          </button>
        </form>
        <p className="text-center text-gray-500 mt-6">
          Pas encore de compte ?{' '}
          <Link href="/register" className="text-primary-500 hover:underline">
            S'inscrire
          </Link>
        </p>
      </div>
    </main>
  )
}
