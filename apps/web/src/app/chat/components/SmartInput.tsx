'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  value: string
  onChange: (v: string) => void
  onSend: () => void
  onStartTyping: () => void
  onStopTyping: () => void
  placeholder: string
  token: string
  isRTL?: boolean
}

const EMOTION_TRIGGERS: Record<string, string[]> = {
  'kiss':      ['💋 ', 'bisous 💋', '💋 je pense à toi'],
  'love':      ['❤️ ', 'je t\'aime ❤️', '💕 mon amour'],
  'hug':       ['🤗 ', 'gros câlin 🤗', '🫂 je t\'embrasse'],
  'sad':       ['😢 ', 'je suis là pour toi 💙', '🫂 courage'],
  'happy':     ['😊 ', 'je suis tellement heureux 😊', '🎉 super nouvelle !'],
  'merci':     ['🙏 ', 'merci beaucoup 🙏', '💖 merci infiniment'],
  'bonjour':   ['👋 ', 'bonjour ! comment ça va ? 😊', '🌟 bonne journée !'],
  'bonsoir':   ['🌙 ', 'bonsoir ! 🌙', '✨ bonne soirée'],
  'bisou':     ['💋 ', 'bisous 💋💋', '😘 gros bisou'],
  'je t\'aim': ['❤️ ', 'je t\'aime tellement ❤️', '💕 tu es tout pour moi'],
  'manque':    ['💭 ', 'tu me manques tellement 💕', '🥺 tu me manques'],
  'fier':      ['🌟 ', 'je suis fier de toi ! 🏆', '⭐ bravo à toi !'],
  'bravo':     ['👏 ', 'bravo ! excellent ! 🎉', '🏆 félicitations !'],
  'lol':       ['😂 ', '😂😂 trop drôle !', '🤣 je suis mort de rire'],
  'super':     ['🔥 ', 'super ! génial ! 🚀', '⚡ fantastique !'],
}

export default function SmartInput({ value, onChange, onSend, onStartTyping, onStopTyping, placeholder, token, isRTL }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [showSugg, setShowSugg] = useState(false)
  const [aiLoading, setAiLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const aiTimeout = useRef<any>(null)

  useEffect(() => {
    if (!value.trim()) { setSuggestions([]); setShowSugg(false); return }

    // Local emotion triggers
    const lower = value.toLowerCase()
    for (const [trigger, suggs] of Object.entries(EMOTION_TRIGGERS)) {
      if (lower.includes(trigger)) {
        setSuggestions(suggs)
        setShowSugg(true)
        return
      }
    }

    // AI suggestions after 1.5s
    clearTimeout(aiTimeout.current)
    if (value.length > 8) {
      aiTimeout.current = setTimeout(async () => {
        setAiLoading(true)
        try {
          const res = await fetch('http://localhost:9020/api/v1/ai/complete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
            body: JSON.stringify({ text: value }),
          })
          if (res.ok) {
            const data = await res.json()
            if (data.suggestions?.length) {
              setSuggestions(data.suggestions)
              setShowSugg(true)
            }
          }
        } catch {}
        setAiLoading(false)
      }, 1500)
    } else {
      setSuggestions([])
      setShowSugg(false)
    }

    return () => clearTimeout(aiTimeout.current)
  }, [value])

  const applySuggestion = (s: string) => {
    onChange(s)
    setShowSugg(false)
    inputRef.current?.focus()
  }

  return (
    <div style={{ flex:1, position:'relative' }}>
      {/* AI Suggestions */}
      {showSugg && suggestions.length > 0 && (
        <div style={{
          position:'absolute', bottom:'110%', left:0, right:0,
          background:'#1a1a2e', borderRadius:12,
          border:'0.5px solid rgba(83,74,183,0.4)',
          boxShadow:'0 8px 32px rgba(0,0,0,0.6)',
          overflow:'hidden', zIndex:100,
        }}>
          <div style={{ padding:'6px 12px 4px', fontSize:10, color:'#534AB7', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:6 }}>
            <span>🤖</span> <span>Suggestions IA</span>
            {aiLoading && <span style={{ marginLeft:'auto', fontSize:9, color:'#444' }}>analyse...</span>}
          </div>
          {suggestions.map((s, i) => (
            <div key={i} onClick={() => applySuggestion(s)}
              style={{ padding:'9px 14px', fontSize:13, color:'#ddd', cursor:'pointer', borderBottom: i < suggestions.length-1 ? '0.5px solid rgba(255,255,255,0.04)' : 'none', transition:'background 0.15s' }}
              onMouseEnter={e => (e.currentTarget.style.background='rgba(83,74,183,0.15)')}
              onMouseLeave={e => (e.currentTarget.style.background='transparent')}>
              {s}
            </div>
          ))}
          <div style={{ padding:'5px 12px', fontSize:10, color:'#444', textAlign:'right' }}>
            Tab ou clic pour compléter
          </div>
        </div>
      )}

      <input
        ref={inputRef}
        value={value}
        onChange={e => { onChange(e.target.value); onStartTyping() }}
        onKeyDown={e => {
          if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); setShowSugg(false); onSend() }
          if (e.key === 'Tab' && showSugg && suggestions[0]) { e.preventDefault(); applySuggestion(suggestions[0]) }
          if (e.key === 'Escape') setShowSugg(false)
        }}
        onBlur={() => { setTimeout(() => setShowSugg(false), 200); onStopTyping() }}
        placeholder={placeholder}
        style={{ width:'100%', background:'transparent', border:'none', outline:'none', fontSize:13, color:'#ddd', direction: isRTL?'rtl':'ltr' }}
      />
    </div>
  )
}
