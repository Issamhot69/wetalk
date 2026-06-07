'use client'
import { useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

interface Props {
  onSelect: (emoji: string) => void
  onClose: () => void
  anchorEl: HTMLElement | null
  isMe: boolean
}

const EMOJIS = ['❤️','😂','😮','😢','👍','🔥','🎉','👏','😘','💕']

export default function EmojiPicker({ onSelect, onClose, anchorEl, isMe }: Props) {
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node) &&
          anchorEl && !anchorEl.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [onClose, anchorEl])

  if (!anchorEl) return null

  const rect = anchorEl.getBoundingClientRect()
  const top = rect.top - 52 + window.scrollY
  const left = isMe ? rect.right - 240 : rect.left

  return createPortal(
    <div ref={ref} style={{
      position: 'fixed',
      top: top,
      left: Math.max(8, Math.min(left, window.innerWidth - 250)),
      background: '#1a1a2e',
      borderRadius: 28,
      padding: '8px 12px',
      display: 'flex',
      gap: 6,
      border: '0.5px solid rgba(255,255,255,0.2)',
      boxShadow: '0 8px 32px rgba(0,0,0,0.8)',
      zIndex: 99999,
    }}>
      {EMOJIS.map(e => (
        <button key={e}
          onMouseDown={ev => { ev.preventDefault(); ev.stopPropagation(); onSelect(e); onClose() }}
          style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, padding:'0 2px', lineHeight:1 }}>
          {e}
        </button>
      ))}
    </div>,
    document.body
  )
}
