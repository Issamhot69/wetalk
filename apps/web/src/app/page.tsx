import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-dark-900">
      <div className="text-center space-y-6 animate-fade-in">
        <div className="text-6xl">💬</div>
        <h1 className="text-5xl font-bold bg-gradient-to-r from-primary-500 to-purple-500 bg-clip-text text-transparent">
          WeTalk
        </h1>
        <p className="text-gray-400 text-lg max-w-md">
          La messagerie intelligente qui comprend vos émotions
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/login" className="btn-primary text-lg px-8 py-3">
            Se connecter
          </Link>
          <Link href="/register" className="glass rounded-xl px-8 py-3 text-lg hover:bg-white/10 transition-all">
            S'inscrire
          </Link>
        </div>
        <div className="flex gap-8 justify-center text-sm text-gray-500 pt-4">
          <span>🔐 Chiffrement E2E</span>
          <span>🤖 IA Émotionnelle</span>
          <span>⚡ Temps réel</span>
        </div>
      </div>
    </main>
  )
}
