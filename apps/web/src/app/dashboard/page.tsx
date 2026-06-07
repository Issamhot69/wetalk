'use client'
import { useEffect, useState } from 'react'
import { useAuthStore, useChatStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { getT, languages } from '@/lib/i18n'

const API = 'http://localhost:9020/api/v1'
const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517']
const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]

export default function DashboardPage() {
  const router = useRouter()
  const { user, token } = useAuthStore()
  const { lang, setLang } = useChatStore()
  const [stats, setStats] = useState({ users: 0, messages: 0, channels: 0, online: 0 })
  const [users, setUsers] = useState<any[]>([])
  const [showLang, setShowLang] = useState(false)
  const [ready, setReady] = useState(false)
  const T = getT(lang)
  const isRTL = languages.find(l => l.code === lang)?.rtl
  const currentLang = languages.find(l => l.code === lang)

  useEffect(() => {
    const stored = localStorage.getItem('wetalk-auth')
    if (!stored) { router.push('/login'); return }
    const parsed = JSON.parse(stored)
    if (!parsed?.state?.token) { router.push('/login'); return }
    setReady(true)
    loadStats(parsed.state.token)
  }, [])

  const loadStats = async (tok: string) => {
    try {
      const res = await fetch(`${API}/users/search?q=a`, {
        headers: { Authorization: `Bearer ${tok}` }
      })
      const data = await res.json()
      setUsers(Array.isArray(data) ? data : [])
      setStats({ users: data.length || 2, messages: 42, channels: 3, online: 1 })
    } catch {}
  }

  if (!ready) return (
    <div style={{ height:'100vh', background:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#534AB7', fontSize:32 }}>💬</div>
    </div>
  )

  const statCards = [
    { label: T.users,         value: stats.users,    icon:'👥', color:'#534AB7', bg:'rgba(83,74,183,0.15)' },
    { label: T.totalMessages, value: stats.messages, icon:'💬', color:'#1D9E75', bg:'rgba(29,158,117,0.15)' },
    { label: 'Channels',      value: stats.channels, icon:'📡', color:'#378ADD', bg:'rgba(55,138,221,0.15)' },
    { label: T.activeNow,     value: stats.online,   icon:'🟢', color:'#22c55e', bg:'rgba(34,197,94,0.15)' },
  ]

  return (
    <div dir={isRTL ? 'rtl' : 'ltr'} style={{ minHeight:'100vh', background:'#0d0d14', color:'#e8e8f0', fontFamily:'system-ui' }}>

      {/* Header */}
      <div style={{ background:'#13131f', borderBottom:'0.5px solid rgba(255,255,255,0.06)', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ fontSize:24 }}>💬</div>
          <div>
            <div style={{ fontSize:15, fontWeight:500, color:'#e8e8f0' }}>WeTalk</div>
            <div style={{ fontSize:11, color:'#555' }}>{T.dashboard}</div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowLang(!showLang)}
              style={{ display:'flex', alignItems:'center', gap:8, background:'#1e1e2e', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'7px 12px', cursor:'pointer', color:'#ddd', fontSize:13 }}>
              <span style={{ fontSize:16 }}>{currentLang?.flag}</span>
              <span>{currentLang?.nativeName}</span>
              <span style={{ fontSize:10, color:'#555' }}>▼</span>
            </button>
            {showLang && (
              <div style={{ position:'absolute', top:44, right:0, background:'#1e1e2e', borderRadius:12, border:'0.5px solid rgba(255,255,255,0.1)', zIndex:100, width:220, maxHeight:320, overflowY:'auto' }}>
                <div style={{ padding:'8px 14px 6px', fontSize:11, color:'#555', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
                  {T.language} — {languages.length} langues
                </div>
                {languages.map(l => (
                  <div key={l.code} onClick={() => { setLang(l.code as any); setShowLang(false) }}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'9px 14px', cursor:'pointer', background: lang === l.code ? 'rgba(83,74,183,0.2)' : 'transparent', fontSize:13, color:'#ddd' }}>
                    <span style={{ fontSize:18, flexShrink:0 }}>{l.flag}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontSize:13, color:'#ddd' }}>{l.nativeName}</div>
                      <div style={{ fontSize:11, color:'#555' }}>{l.label}</div>
                    </div>
                    {lang === l.code && <span style={{ color:'#534AB7' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button onClick={() => router.push('/chat')}
            style={{ background:'#534AB7', border:'none', borderRadius:10, padding:'8px 16px', color:'white', fontSize:13, cursor:'pointer', fontWeight:500 }}>
            → {T.chats}
          </button>

          <div style={{ display:'flex', alignItems:'center', gap:8 }}>
            <div style={{ width:32, height:32, borderRadius:'50%', background:getColor(user?.username||'T'), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:500 }}>
              {user?.username?.[0]?.toUpperCase() || 'T'}
            </div>
            <span style={{ fontSize:13, color:'#aaa' }}>{user?.username}</span>
          </div>
        </div>
      </div>

      <div style={{ padding:'32px', maxWidth:1200, margin:'0 auto' }}>

        {/* Stats */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16, marginBottom:32 }}>
          {statCards.map(card => (
            <div key={card.label} style={{ background:'#13131f', borderRadius:14, padding:'20px', border:'0.5px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', gap:14 }}>
              <div style={{ width:48, height:48, borderRadius:12, background:card.bg, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22 }}>
                {card.icon}
              </div>
              <div>
                <div style={{ fontSize:24, fontWeight:500, color:card.color }}>{card.value}</div>
                <div style={{ fontSize:12, color:'#555', marginTop:2 }}>{card.label}</div>
              </div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, marginBottom:32 }}>

          {/* Users */}
          <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0' }}>{T.users}</div>
              <div style={{ fontSize:12, color:'#555' }}>{users.length} total</div>
            </div>
            <div>
              {users.length === 0 ? (
                <div style={{ padding:'32px', textAlign:'center', color:'#444', fontSize:13 }}>Aucun utilisateur trouvé</div>
              ) : users.slice(0,8).map((u: any) => (
                <div key={u.id} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px' }}>
                  <div style={{ position:'relative' }}>
                    <div style={{ width:36, height:36, borderRadius:'50%', background:getColor(u.username), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:500 }}>
                      {u.username[0].toUpperCase()}
                    </div>
                    <div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, borderRadius:'50%', background: u.isOnline ? '#22c55e' : '#444', border:'2px solid #13131f' }}></div>
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color:'#ddd' }}>{u.username}</div>
                    <div style={{ fontSize:11, color: u.isOnline ? '#22c55e' : '#555' }}>{u.isOnline ? T.online : T.offline}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0' }}>🌍 {T.language} — {languages.length} langues</div>
            </div>
            <div style={{ maxHeight:280, overflowY:'auto' }}>
              {languages.map(l => (
                <div key={l.code} onClick={() => setLang(l.code as any)}
                  style={{ display:'flex', alignItems:'center', gap:12, padding:'8px 20px', cursor:'pointer', background: lang === l.code ? 'rgba(83,74,183,0.15)' : 'transparent' }}>
                  <span style={{ fontSize:20 }}>{l.flag}</span>
                  <div style={{ flex:1 }}>
                    <div style={{ fontSize:13, color: lang === l.code ? '#9B8FE8' : '#ddd' }}>{l.nativeName}</div>
                    <div style={{ fontSize:11, color:'#555' }}>{l.label} {l.rtl ? '· RTL' : ''}</div>
                  </div>
                  {lang === l.code && <span style={{ color:'#534AB7' }}>✓</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* AI Features */}
        <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)', padding:'24px' }}>
          <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0', marginBottom:20 }}>🤖 Features IA — WeTalk</div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:14 }}>
            {[
              { icon:'🌍', title:'Traduction IA',    desc:'Temps réel, 40 langues', color:'#534AB7', active:true },
              { icon:'😊', title:'Émotion IA',       desc:'Analyse sentiments',     color:'#1D9E75', active:true },
              { icon:'🎵', title:'Audio cercle',     desc:'Visualiseur animé',      color:'#D85A30', active:true },
              { icon:'🔐', title:'Chiffrement E2E',  desc:'Signal Protocol',        color:'#378ADD', active:false },
              { icon:'🎙️', title:'Transcription',   desc:'Voix vers texte',        color:'#D4537E', active:false },
              { icon:'📊', title:'Analytics',        desc:'Stats avancées',         color:'#BA7517', active:false },
              { icon:'🤖', title:'Chatbot IA',       desc:'Assistant intégré',      color:'#534AB7', active:false },
              { icon:'📌', title:'Messages épinglés',desc:'Important d\'abord',     color:'#1D9E75', active:false },
            ].map(f => (
              <div key={f.title} style={{ background:'#0d0d14', borderRadius:12, padding:'16px', border:`0.5px solid ${f.active ? f.color+'40' : 'rgba(255,255,255,0.06)'}` }}>
                <div style={{ fontSize:24, marginBottom:8 }}>{f.icon}</div>
                <div style={{ fontSize:13, fontWeight:500, color: f.active ? '#e8e8f0' : '#666', marginBottom:4 }}>{f.title}</div>
                <div style={{ fontSize:11, color:'#555', marginBottom:10 }}>{f.desc}</div>
                <div style={{ fontSize:10, padding:'3px 8px', borderRadius:20, display:'inline-block', background: f.active ? f.color+'25' : 'rgba(255,255,255,0.05)', color: f.active ? f.color : '#444' }}>
                  {f.active ? '✓ Actif' : '⏳ Bientôt'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px}`}</style>
    </div>
  )
}
