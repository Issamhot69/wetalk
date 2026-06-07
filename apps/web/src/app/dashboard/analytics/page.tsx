'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore, useChatStore } from '@/lib/store'
import { getT, languages } from '@/lib/i18n'

const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517']
const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]
const fmt = (n: number) => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')

const worldData = [
  { country:'Maroc',    flag:'🇲🇦', users:1240, growth:'+18%', active:89  },
  { country:'France',   flag:'🇫🇷', users:3420, growth:'+24%', active:156 },
  { country:'Russie',   flag:'🇷🇺', users:2890, growth:'+31%', active:203 },
  { country:'USA',      flag:'🇺🇸', users:5670, growth:'+45%', active:412 },
  { country:'Brésil',   flag:'🇧🇷', users:2100, growth:'+22%', active:178 },
  { country:'Inde',     flag:'🇮🇳', users:4320, growth:'+67%', active:389 },
  { country:'Chine',    flag:'🇨🇳', users:6780, growth:'+12%', active:521 },
  { country:'Nigeria',  flag:'🇳🇬', users:890,  growth:'+89%', active:67  },
  { country:'Allemagne',flag:'🇩🇪', users:1560, growth:'+19%', active:134 },
  { country:'Japon',    flag:'🇯🇵', users:2340, growth:'+8%',  active:198 },
]

const aiNotifs = [
  { id:1, icon:'📈', title:'Croissance explosive', msg:'Nigeria +89% — marché émergent', time:'2min',  color:'#1D9E75', read:false },
  { id:2, icon:'🔥', title:'Message viral',        msg:'"salut" partagé 1 240 fois',    time:'5min',  color:'#D85A30', read:false },
  { id:3, icon:'🏆', title:'Position mondiale',    msg:'WeTalk #3 en Maroc',            time:'12min', color:'#534AB7', read:false },
  { id:4, icon:'🤖', title:'IA Émotionnelle',      msg:'Score bonheur: 78% ↑',          time:'18min', color:'#378ADD', read:true  },
  { id:5, icon:'👥', title:'Nouveau record',       msg:'127 inscriptions/heure',        time:'24min', color:'#D4537E', read:true  },
  { id:6, icon:'🌍', title:'Traduction populaire', msg:'AR↔FR: 4 200 trad. aujourd\'hui', time:'31min', color:'#BA7517', read:true },
]

const feed = [
  { user:'alice',    action:'a envoyé un message', channel:'#général',    time:'à l\'instant', flag:'🇲🇦' },
  { user:'testuser', action:'a créé un groupe',    channel:'Team WeTalk', time:'il y a 1min',  flag:'🇫🇷' },
  { user:'bob',      action:'a rejoint',            channel:'#tech',       time:'il y a 2min',  flag:'🇷🇺' },
  { user:'sarah',    action:'a réagi ❤️',           channel:'#général',    time:'il y a 3min',  flag:'🇺🇸' },
  { user:'carlos',   action:'s\'est inscrit',       channel:'WeTalk',      time:'il y a 4min',  flag:'🇧🇷' },
  { user:'yuki',     action:'a envoyé un audio',    channel:'#music',      time:'il y a 5min',  flag:'🇯🇵' },
]

const weekData = [
  { day:'Lun', users:180, msgs:1240 },
  { day:'Mar', users:240, msgs:1680 },
  { day:'Mer', users:210, msgs:1450 },
  { day:'Jeu', users:310, msgs:2100 },
  { day:'Ven', users:380, msgs:2640 },
  { day:'Sam', users:420, msgs:2980 },
  { day:'Dim', users:460, msgs:3200 },
]

export default function AnalyticsPage() {
  const router = useRouter()
  const { lang, setLang } = useChatStore()
  const [mounted, setMounted] = useState(false)
  const [notifs, setNotifs] = useState(aiNotifs)
  const [totalUsers, setTotalUsers] = useState(31210)
  const [totalMsgs, setTotalMsgs] = useState(128440)
  const [activeNow, setActiveNow] = useState(2847)
  const [showLang, setShowLang] = useState(false)
  const currentLang = languages.find(l => l.code === lang)
  const unread = notifs.filter(n => !n.read).length

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('wetalk-auth')
    if (!stored || !JSON.parse(stored)?.state?.token) { router.push('/login'); return }
    const iv = setInterval(() => {
      setTotalUsers(v => v + Math.floor(Math.random() * 3))
      setTotalMsgs(v => v + Math.floor(Math.random() * 12))
      setActiveNow(v => Math.max(2000, v + Math.floor(Math.random() * 20) - 8))
    }, 2000)
    return () => clearInterval(iv)
  }, [])

  if (!mounted) return (
    <div style={{ height:'100vh', background:'#0d0d14', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ color:'#534AB7', fontSize:32 }}>💬</div>
    </div>
  )

  return (
    <div style={{ minHeight:'100vh', background:'#0d0d14', color:'#e8e8f0', fontFamily:'system-ui' }}>

      {/* Header */}
      <div style={{ background:'#13131f', borderBottom:'0.5px solid rgba(255,255,255,0.06)', padding:'0 32px', height:60, display:'flex', alignItems:'center', justifyContent:'space-between', position:'sticky', top:0, zIndex:50 }}>
        <div style={{ display:'flex', alignItems:'center', gap:16 }}>
          <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#555', fontSize:20 }}>←</button>
          <span style={{ fontSize:20 }}>💬</span>
          <div>
            <div style={{ fontSize:15, fontWeight:500, color:'#e8e8f0' }}>WeTalk Analytics IA</div>
            <div style={{ fontSize:11, color:'#1D9E75', display:'flex', alignItems:'center', gap:4 }}>
              <div style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s infinite' }}></div>
              Temps réel actif
            </div>
          </div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:12 }}>
          <div style={{ position:'relative' }}>
            <button style={{ width:36, height:36, borderRadius:10, background:'#1e1e2e', border:'none', cursor:'pointer', fontSize:18 }}>🔔</button>
            {unread > 0 && <div style={{ position:'absolute', top:-4, right:-4, width:18, height:18, borderRadius:'50%', background:'#D85A30', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'white' }}>{unread}</div>}
          </div>
          <div style={{ position:'relative' }}>
            <button onClick={() => setShowLang(!showLang)} style={{ display:'flex', alignItems:'center', gap:6, background:'#1e1e2e', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'6px 12px', cursor:'pointer', color:'#ddd', fontSize:13 }}>
              <span>{currentLang?.flag}</span><span style={{ fontSize:10, color:'#555' }}>▼</span>
            </button>
            {showLang && (
              <div style={{ position:'absolute', top:40, right:0, background:'#1e1e2e', borderRadius:12, border:'0.5px solid rgba(255,255,255,0.1)', zIndex:100, width:200, maxHeight:280, overflowY:'auto' }}>
                {languages.map(l => (
                  <div key={l.code} onClick={() => { setLang(l.code as any); setShowLang(false) }}
                    style={{ display:'flex', alignItems:'center', gap:10, padding:'8px 14px', cursor:'pointer', background: lang === l.code ? 'rgba(83,74,183,0.2)' : 'transparent', fontSize:13, color:'#ddd' }}>
                    <span>{l.flag}</span><span>{l.nativeName}</span>
                    {lang === l.code && <span style={{ marginLeft:'auto', color:'#534AB7' }}>✓</span>}
                  </div>
                ))}
              </div>
            )}
          </div>
          <button onClick={() => router.push('/chat')} style={{ background:'#534AB7', border:'none', borderRadius:10, padding:'7px 14px', color:'white', fontSize:13, cursor:'pointer' }}>→ Chat</button>
        </div>
      </div>

      <div style={{ padding:'28px 32px', maxWidth:1400, margin:'0 auto' }}>

        {/* KPIs */}
        <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)', gap:14, marginBottom:28 }}>
          {[
            { label:'Utilisateurs',      value:fmt(totalUsers), icon:'👥', color:'#534AB7', sub:'+127 aujourd\'hui', live:true },
            { label:'Messages',          value:fmt(totalMsgs),  icon:'💬', color:'#1D9E75', sub:'+1 240 aujourd\'hui', live:true },
            { label:'Actifs maintenant', value:fmt(activeNow),  icon:'🟢', color:'#22c55e', sub:'en ce moment', live:true },
            { label:'Position mondiale', value:'#3',            icon:'🏆', color:'#BA7517', sub:'messageries mobiles', live:false },
            { label:'Pays actifs',       value:worldData.length,icon:'🌍', color:'#D4537E', sub:'sur 40 langues', live:false },
          ].map(k => (
            <div key={k.label} style={{ background:'#13131f', borderRadius:14, padding:'18px', border:'0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:10 }}>
                <span style={{ fontSize:22 }}>{k.icon}</span>
                {k.live && <div style={{ width:7, height:7, borderRadius:'50%', background:'#1D9E75', animation:'pulse 2s infinite' }}></div>}
              </div>
              <div style={{ fontSize:22, fontWeight:500, color:k.color }}>{k.value}</div>
              <div style={{ fontSize:11, color:'#555', marginTop:4 }}>{k.label}</div>
              <div style={{ fontSize:10, color:'#444', marginTop:2 }}>{k.sub}</div>
            </div>
          ))}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 320px', gap:20, marginBottom:20 }}>
          {/* World map */}
          <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0' }}>🌍 Carte mondiale WeTalk</div>
              <div style={{ fontSize:12, color:'#1D9E75' }}>● Temps réel</div>
            </div>
            <div style={{ padding:'20px' }}>
              <svg viewBox="0 0 800 360" style={{ width:'100%', height:'auto', background:'#0d0d14', borderRadius:10, marginBottom:16 }}>
                <rect width="800" height="360" fill="#0d0d14"/>
                {[1,2,3,4,5,6,7].map(i => <line key={`v${i}`} x1={i*100} y1="0" x2={i*100} y2="360" stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>)}
                {[1,2,3].map(i => <line key={`h${i}`} x1="0" y1={i*90} x2="800" y2={i*90} stroke="rgba(255,255,255,0.03)" strokeWidth="1"/>)}
                <path d="M80,70 L200,65 L220,175 L160,215 L100,195 Z" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <path d="M150,230 L210,220 L220,330 L170,350 L140,310 Z" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <path d="M355,55 L445,50 L455,115 L400,125 L350,95 Z" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <path d="M365,130 L450,125 L460,265 L410,285 L355,250 Z" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <path d="M460,45 L700,55 L720,190 L620,210 L460,170 Z" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                <path d="M640,250 L720,245 L730,310 L660,315 Z" fill="#1a1a2e" stroke="rgba(255,255,255,0.08)" strokeWidth="1"/>
                {[
                  {x:395,y:145,d:worldData[0]},{x:395,y:75,d:worldData[1]},
                  {x:590,y:80,d:worldData[2]},{x:155,y:135,d:worldData[3]},
                  {x:180,y:270,d:worldData[4]},{x:570,y:155,d:worldData[5]},
                  {x:615,y:120,d:worldData[6]},{x:415,y:185,d:worldData[7]},
                  {x:415,y:75,d:worldData[8]},{x:660,y:120,d:worldData[9]},
                ].map((p,i) => {
                  const sz = Math.max(6, Math.min(18, p.d.users/400))
                  return (
                    <g key={p.d.country}>
                      <circle cx={p.x} cy={p.y} r={sz+5} fill={COLORS[i%COLORS.length]} opacity="0.12"/>
                      <circle cx={p.x} cy={p.y} r={sz} fill={COLORS[i%COLORS.length]} opacity="0.85"/>
                      <circle cx={p.x} cy={p.y} r={2.5} fill="white"/>
                      <text x={p.x} y={p.y-sz-4} textAnchor="middle" fill="rgba(255,255,255,0.8)" fontSize="10">{p.d.flag}</text>
                    </g>
                  )
                })}
                <text x="10" y="352" fill="rgba(255,255,255,0.25)" fontSize="9">WeTalk · {fmt(worldData.reduce((a,d)=>a+d.users,0))} users globaux</text>
              </svg>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2,1fr)', gap:8 }}>
                {worldData.map((d,i) => (
                  <div key={d.country} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 10px', background:'#0d0d14', borderRadius:8, border:'0.5px solid rgba(255,255,255,0.04)' }}>
                    <span style={{ fontSize:16 }}>{d.flag}</span>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:12, color:'#ddd', display:'flex', justifyContent:'space-between' }}>
                        <span>{d.country}</span>
                        <span style={{ color:COLORS[i%COLORS.length] }}>{d.growth}</span>
                      </div>
                      <div style={{ height:3, background:'rgba(255,255,255,0.06)', borderRadius:2, marginTop:4 }}>
                        <div style={{ height:'100%', width:`${(d.users/6780)*100}%`, background:COLORS[i%COLORS.length], borderRadius:2 }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Notifs */}
          <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0' }}>🤖 Notifications IA</div>
              {unread > 0 && <div style={{ background:'rgba(216,90,48,0.2)', color:'#D85A30', fontSize:11, padding:'2px 8px', borderRadius:20 }}>{unread} nouvelles</div>}
            </div>
            <div style={{ overflowY:'auto' }}>
              {notifs.map(n => (
                <div key={n.id} onClick={() => setNotifs(prev => prev.map(x => x.id === n.id ? {...x,read:true} : x))}
                  style={{ padding:'12px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.04)', cursor:'pointer', background: n.read ? 'transparent' : 'rgba(83,74,183,0.06)' }}>
                  <div style={{ display:'flex', gap:10 }}>
                    <div style={{ width:34, height:34, borderRadius:9, background:`${n.color}20`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:16, flexShrink:0 }}>{n.icon}</div>
                    <div style={{ flex:1 }}>
                      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                        <div style={{ fontSize:12, fontWeight:500, color: n.read ? '#888' : '#e8e8f0' }}>{n.title}</div>
                        {!n.read && <div style={{ width:7, height:7, borderRadius:'50%', background:n.color }}></div>}
                      </div>
                      <div style={{ fontSize:11, color:'#555', marginTop:2, lineHeight:1.4 }}>{n.msg}</div>
                      <div style={{ fontSize:10, color:'#444', marginTop:3 }}>il y a {n.time}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Feed + Chart */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20 }}>
          <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-between' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0' }}>⚡ Activité en direct</div>
              <div style={{ fontSize:11, color:'#1D9E75', display:'flex', alignItems:'center', gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:'50%', background:'#1D9E75', animation:'pulse 1.5s infinite' }}></div>Live
              </div>
            </div>
            {feed.map((item,i) => (
              <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'10px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.03)' }}>
                <div style={{ width:32, height:32, borderRadius:'50%', background:getColor(item.user), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13, fontWeight:500, flexShrink:0 }}>
                  {item.user[0].toUpperCase()}
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:12, color:'#ddd' }}>
                    <span style={{ color:'#9B8FE8', fontWeight:500 }}>{item.user}</span> {item.action} <span style={{ color:'#1D9E75' }}>{item.channel}</span>
                  </div>
                  <div style={{ fontSize:10, color:'#444', marginTop:2 }}>{item.flag} {item.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ background:'#13131f', borderRadius:14, border:'0.5px solid rgba(255,255,255,0.06)', overflow:'hidden' }}>
            <div style={{ padding:'16px 20px', borderBottom:'0.5px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0' }}>📈 Croissance 7 jours</div>
            </div>
            <div style={{ padding:'20px' }}>
              {weekData.map(d => (
                <div key={d.day} style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
                  <div style={{ width:32, fontSize:11, color:'#555', flexShrink:0 }}>{d.day}</div>
                  <div style={{ flex:1 }}>
                    <div style={{ height:7, borderRadius:2, background:'#534AB7', width:`${(d.users/460)*100}%`, marginBottom:4 }}></div>
                    <div style={{ height:7, borderRadius:2, background:'#1D9E75', width:`${(d.msgs/3200)*100}%` }}></div>
                  </div>
                  <div style={{ width:36, fontSize:10, color:'#555', textAlign:'right' }}>+{d.users}</div>
                </div>
              ))}
              <div style={{ display:'flex', gap:16, marginTop:8 }}>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, borderRadius:2, background:'#534AB7' }}></div><span style={{ fontSize:11, color:'#555' }}>Users</span></div>
                <div style={{ display:'flex', alignItems:'center', gap:6 }}><div style={{ width:10, height:10, borderRadius:2, background:'#1D9E75' }}></div><span style={{ fontSize:11, color:'#555' }}>Messages</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}} ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px}`}</style>
    </div>
  )
}
