'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/lib/store'

export default function ChatLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const token = useAuthStore((s) => s.token)

  useEffect(() => {
    if (!token) router.push('/login')
  }, [token, router])

  if (!token) return null

  return <div className="h-screen flex overflow-hidden bg-dark-900">{children}</div>
}
