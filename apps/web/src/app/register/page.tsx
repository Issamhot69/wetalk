'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { authApi } from '@/lib/api'
import { useAuthStore } from '@/lib/store'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const router = useRouter()
  const setAuth = useAuthStore((s) => s.setAuth)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ username: '', email: '', password: '' })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password.length < 8) {
      toast.error('Mot de passe trop court (8 min)')
      return
    }
    setLoading(true)
    try {
      const res: any = await authApi.register(form)
      setAuth(res.user, res.token)
      toast.success('Compte créé ! Bienvenue 🎉')
      router.push('/chat')
    } catch (err: any) {
      toast.error(err?.message || 'Erreur lors de la création')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-900 px-4">
      <div className="w-full max-w-md animate-fade-in">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-bold text-white">Créer un compte</h1>
          <p className="text-gray-400 mt-2">Rejoignez WeTalk gratuitement</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-8 space-y-4">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Nom d'utilisateur</label>
            <input
              type="text"
              className="input-base"
              placeholder="johndoe"
              value={form.username}
              onChange={(e) => setForm({ ...form, username: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Email</label>
            <input
              type="email"
              className="input-base"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Mot de passe</label>
            <input
              type="password"
              className="input-base"
              placeholder="8 caractères minimum"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3 text-base mt-2 disabled:opacity-50"
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-6">
          Déjà un compte ?{' '}
          <Link href="/login" className="text-primary-500 hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </main>
  )
}
