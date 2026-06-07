'use client'
import { useState } from 'react'

const EMOJI_GROUPS = {
  '❤️ Amour': ['❤️','💕','💖','💗','💓','💝','😘','😍','🥰','💋'],
  '😂 Fun': ['😂','🤣','😊','😁','😄','😆','🤭','😎','🥳','🎉'],
  '👍 React': ['👍','👎','👏','🙌','🤝','✌️','🤞','💪','🙏','✅'],
  '😢 Émotions': ['😢','😭','😔','😟','🥺','😤','😠','😱','🤯','😴'],
  '🔥 Hype': ['🔥','⚡','💥','🚀','🌟','✨','💫','🎯','🏆','👑'],
]

interface Props {
  onSelect: (emoji: string) => void
}

export default function InputEmojiPicker({ onSelect }: Props) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState(0)
  const tabs = Object.keys(EMOJI_GROUPS)
  const emojis = Object.values(EMOJI_GROUPS)[tab]

  return (
    <div style={{ position:'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:18, color: open ? '#534AB7' : '#444', padding:'0 2px' }}>
        😊
      </button>

      {open && (
        <div style={{ position:'absolute', bottom:'120%', right:0, background:'#1a1a2e', borderRadius:16, border:'0.5px solid rgba(255,255,255,0.15)', boxShadow:'0 8px 32px rgba(0,0,0,0.8)', zIndex:9999, width:280, overflow:'hidden' }}>
          {/* Tabs */}
          <div style={{ display:'flex', borderBottom:'0.5px solid rgba(255,255,255,0.08)', padding:'6px 8px', gap:4, overflowX:'auto' }}>
            {tabs.map((t, i) => (
              <button key={t} onClick={() => setTab(i)}
                style={{ background: tab===i ? 'rgba(83,74,183,0.3)' : 'transparent', border:'none', cursor:'pointer', borderRadius:8, padding:'4px 8px', fontSize:11, color: tab===i ? '#534AB7' : '#666', whiteSpace:'nowrap' }}>
                {t}
              </button>
            ))}
          </div>
          {/* Emojis */}
          <div style={{ display:'flex', flexWrap:'wrap', padding:8, gap:4 }}>
            {emojis.map(e => (
              <button key={e} onClick={() => { onSelect(e); setOpen(false) }}
                style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:24, padding:4, borderRadius:8, transition:'background 0.1s' }}
                onMouseEnter={ev => (ev.currentTarget.style.background='rgba(255,255,255,0.1)')}
                onMouseLeave={ev => (ev.currentTarget.style.background='transparent')}>
                {e}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
