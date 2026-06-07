'use client'
import { useEffect, useState, useRef } from 'react'
import { useAuthStore, useChatStore } from '@/lib/store'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { fr, enUS, ar, es, ru } from 'date-fns/locale'
import toast from 'react-hot-toast'
import { getSocket, disconnectSocket } from '@/lib/socket'
import { getT, languages, type Lang } from '@/lib/i18n'
import dynamic from 'next/dynamic'
import MessageWithEmoji from './components/MessageWithEmoji'


const CreateGroupModal  = dynamic(() => import('./components/CreateGroupModal'),  { ssr:false })
const VoiceRecorder     = dynamic(() => import('./components/VoiceRecorder'),     { ssr:false })
const SmartInput        = dynamic(() => import('./components/SmartInput'),        { ssr:false })

const API = 'http://localhost:9020/api/v1'
const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517']
const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]
const dateLocales: Record<string, any> = { fr, en:enUS, ar, es, ru }
const parseAudio = (c: string) => { const m = c?.match(/^AUDIO:(\d+)$/); return m ? parseInt(m[1]) : null }

export default function ChatPage() {
  const router = useRouter()
  const { user, token, logout } = useAuthStore()
  const { activeChannelId, setActiveChannel, lang, setLang } = useChatStore()
  const [channels, setChannels] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const [showGroupModal, setShowGroupModal] = useState(false)
  const [showLangMenu, setShowLangMenu] = useState(false)
  const [recording, setRecording] = useState(false)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const activeRef = useRef<string|null>(null)
  const typingTimeout = useRef<any>(null)
  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }
  const T = getT(lang)
  const isRTL = languages.find(l => l.code === lang)?.rtl
  const currentLang = languages.find(l => l.code === lang)

  useEffect(() => {
    if (!token || !user) { router.push('/login'); return }
    loadChannels()
    const socket = getSocket(user.id, token)
    socket.on('message:new', (msg: any) => {
      if (msg.channelId === activeRef.current)
        setMessages(prev => prev.find(m => m.id === msg.id) ? prev : [...prev, msg])
      setChannels(prev => prev.map(c => c.id === msg.channelId ? { ...c, messages:[msg] } : c))
    })
    socket.on('message:edited', (msg: any) => setMessages(prev => prev.map(m => m.id === msg.id ? {...m,...msg} : m)))
    socket.on('message:deleted', ({id}: any) => setMessages(prev => prev.map(m => m.id === id ? {...m, isDeleted:true, content:null} : m)))
    socket.on('typing:start', ({userId}: any) => setTypingUsers(prev => [...new Set([...prev, userId])]))
    socket.on('typing:stop', ({userId}: any) => setTypingUsers(prev => prev.filter(id => id !== userId)))
    return () => { ['message:new','message:edited','message:deleted','typing:start','typing:stop'].forEach(e => socket.off(e)) }
  }, [token, user])

  useEffect(() => {
    const socket = user && token ? getSocket(user.id, token) : null
    if (!socket) return
    if (activeRef.current) socket.emit('channel:leave', { channelId: activeRef.current })
    activeRef.current = activeChannelId
    if (activeChannelId) { socket.emit('channel:join', { channelId: activeChannelId }); loadMessages(activeChannelId) }
  }, [activeChannelId])

  useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior:'smooth' }) }, [messages])

  const loadChannels = async () => {
    try {
      const res = await fetch(`${API}/channels`, { headers })
      const data = await res.json()
      if (Array.isArray(data)) {
        setChannels(data)
        if (data.length > 0 && !activeRef.current) setActiveChannel(data[0].id)
      }
    } catch {}
  }

  const loadMessages = async (channelId: string) => {
    try {
      const res = await fetch(`${API}/messages/channel/${channelId}`, { headers })
      const data = await res.json()
      setMessages(data.messages || [])
    } catch {}
  }

  const sendMessage = async (content?: string) => {
    const text = content || input
    if (!text.trim() || !activeChannelId || sending) return
    if (!content) setInput('')
    stopTyping(); setSending(true)
    try {
      await fetch(`${API}/messages`, { method:'POST', headers, body: JSON.stringify({ content:text, channelId:activeChannelId }) })
    } catch { toast.error('Erreur'); if (!content) setInput(text) }
    finally { setSending(false) }
  }

  const sendReaction = async (msgId: string, emoji: string) => {
    try {
      await fetch(`${API}/messages/${msgId}/reactions`, { method:'POST', headers, body: JSON.stringify({ emoji }) })
      setMessages(prev => prev.map(m => {
        if (m.id !== msgId) return m
        const r = m.reactions || []
        const ex = r.find((x: any) => x.emoji === emoji && x.userId === user?.id)
        return { ...m, reactions: ex ? r.filter((x: any) => !(x.emoji === emoji && x.userId === user?.id)) : [...r, { emoji, userId: user?.id }] }
      }))
    } catch {}
  }

  const startTyping = () => {
    if (!user || !activeChannelId) return
    getSocket(user.id, token!).emit('typing:start', { channelId:activeChannelId, userId:user.id })
    clearTimeout(typingTimeout.current)
    typingTimeout.current = setTimeout(stopTyping, 2000)
  }
  const stopTyping = () => {
    if (!user || !activeChannelId) return
    getSocket(user.id, token!).emit('typing:stop', { channelId:activeChannelId, userId:user.id })
    clearTimeout(typingTimeout.current)
  }

  const getChannelName = (c: any) => c.name || c.members?.find((m: any) => m.userId !== user?.id)?.user?.username || 'Conv'
  const groupByDate = (msgs: any[]) => {
    const groups: { date:string; messages:any[] }[] = []
    msgs.forEach(msg => {
      const date = format(new Date(msg.createdAt), 'dd MMMM yyyy', { locale: dateLocales[lang] || fr })
      const last = groups[groups.length-1]
      if (last?.date === date) last.messages.push(msg)
      else groups.push({ date, messages:[msg] })
    })
    return groups
  }

  const activeChannel = channels.find(c => c.id === activeChannelId)
  const filtered = channels.filter(c => getChannelName(c).toLowerCase().includes(search.toLowerCase()))
  const typingNames = typingUsers.map(id => channels.flatMap(c => c.members||[]).find((m: any) => m.userId === id)?.user?.username).filter(Boolean)

  return (
    <div dir={isRTL?'rtl':'ltr'} style={{ display:'flex', height:'100vh', background:'#0d0d14', overflow:'hidden' }}>

      {showGroupModal && <CreateGroupModal token={token!} onClose={() => setShowGroupModal(false)} onCreated={(ch) => { setChannels(prev => [ch,...prev]); setActiveChannel(ch.id) }} />}

      <aside style={{ width:280, background:'#13131f', display:'flex', flexDirection:'column', borderRight:isRTL?'none':'0.5px solid rgba(255,255,255,0.06)', borderLeft:isRTL?'0.5px solid rgba(255,255,255,0.06)':'none', flexShrink:0 }}>
        <div style={{ padding:'16px 16px 12px' }}>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:14 }}>
            <div style={{ width:36, height:36, borderRadius:'50%', background:getColor(user?.username||''), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:500, fontSize:13, flexShrink:0 }}>{user?.username?.[0]?.toUpperCase()}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:13, fontWeight:500, color:'#e8e8f0' }}>{user?.username}</div>
              <div style={{ fontSize:11, color:'#22c55e', display:'flex', alignItems:'center', gap:4 }}><div style={{ width:6, height:6, borderRadius:'50%', background:'#22c55e' }}></div>{T.online}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>
              <div style={{ position:'relative' }}>
                <button onClick={() => setShowLangMenu(!showLangMenu)} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:16, width:28, height:28, borderRadius:8 }}>{currentLang?.flag}</button>
                {showLangMenu && (
                  <div style={{ position:'absolute', top:32, right:0, background:'#1e1e2e', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.1)', zIndex:200, width:180, maxHeight:260, overflowY:'auto' }}>
                    {languages.map(l => (
                      <div key={l.code} onClick={() => { setLang(l.code as Lang); setShowLangMenu(false) }} style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 12px', cursor:'pointer', background:lang===l.code?'rgba(83,74,183,0.2)':'transparent', fontSize:12, color:'#ddd' }}>
                        <span style={{ fontSize:16 }}>{l.flag}</span><span>{l.nativeName}</span>{lang===l.code&&<span style={{ marginLeft:'auto', color:'#534AB7' }}>✓</span>}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <button onClick={() => router.push('/dashboard')} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#555', fontSize:14, width:28, height:28, borderRadius:8 }}>📊</button>
              <button onClick={() => { disconnectSocket(); logout(); router.push('/login') }} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#555', fontSize:16, width:28, height:28, borderRadius:8 }}>⎋</button>
            </div>
          </div>
          <div style={{ display:'flex', alignItems:'center', gap:8, background:'#0d0d14', borderRadius:10, padding:'8px 12px' }}>
            <span style={{ color:'#444', fontSize:13 }}>🔍</span>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={T.search} style={{ background:'transparent', border:'none', outline:'none', fontSize:12, color:'#aaa', flex:1 }}/>
          </div>
        </div>

        <div style={{ padding:'8px 16px 6px', fontSize:10, fontWeight:500, color:'#444', textTransform:'uppercase', letterSpacing:'0.08em', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          {T.messages}
          <button onClick={() => setShowGroupModal(true)} style={{ width:20, height:20, borderRadius:6, background:'rgba(83,74,183,0.2)', border:'none', cursor:'pointer', fontSize:12, color:'#534AB7' }}>+</button>
        </div>

        <div style={{ flex:1, overflowY:'auto', padding:'0 8px' }}>
          {filtered.map(channel => {
            const lastMsg = channel.messages?.[0]; const isActive = channel.id === activeChannelId; const name = getChannelName(channel); const isGroup = channel.type === 'GROUP'
            return (
              <div key={channel.id} onClick={() => setActiveChannel(channel.id)} style={{ display:'flex', alignItems:'center', gap:10, padding:10, borderRadius:10, cursor:'pointer', marginBottom:2, background:isActive?'rgba(83,74,183,0.15)':'transparent', border:isActive?'0.5px solid rgba(83,74,183,0.25)':'0.5px solid transparent', transition:'all 0.15s' }}>
                <div style={{ position:'relative', flexShrink:0 }}>
                  <div style={{ width:38, height:38, borderRadius:isGroup?12:'50%', background:getColor(name), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:500, fontSize:isGroup?16:14 }}>{isGroup?'👥':name[0]?.toUpperCase()}</div>
                  {!isGroup&&<div style={{ position:'absolute', bottom:0, right:0, width:9, height:9, background:'#22c55e', borderRadius:'50%', border:'2px solid #13131f' }}></div>}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                    <div style={{ fontSize:13, fontWeight:500, color:isActive?'#fff':'#ddd', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{name}{isGroup&&<span style={{ fontSize:10, color:'#534AB7', background:'rgba(83,74,183,0.2)', borderRadius:4, padding:'1px 5px', marginLeft:4 }}>groupe</span>}</div>
                    {lastMsg&&<span style={{ fontSize:10, color:'#444', flexShrink:0, marginLeft:4 }}>{format(new Date(lastMsg.createdAt),'HH:mm')}</span>}
                  </div>
                  <div style={{ fontSize:11, color:'#555', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:2 }}>{lastMsg?`${lastMsg.sender?.username===user?.username?'Vous: ':''}${parseAudio(lastMsg.content)?'🎵 Audio':lastMsg.content}`:T.noMessages}</div>
                </div>
              </div>
            )
          })}
        </div>

        <div style={{ padding:'12px 16px', borderTop:'0.5px solid rgba(255,255,255,0.06)', display:'flex', justifyContent:'space-around' }}>
          {[['💬',T.chats,true],['👥',T.contacts,false],['🔔',T.alerts,false],['⚙️',T.settings,false]].map(([icon,label,active]) => (
            <div key={label as string} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:3, cursor:'pointer', color:active?'#534AB7':'#444', fontSize:10 }}>
              <span style={{ fontSize:18 }}>{icon as string}</span><span>{label as string}</span>
            </div>
          ))}
        </div>
      </aside>

      <main style={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {activeChannel ? <>
          <div style={{ height:58, background:'#13131f', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', padding:'0 20px', gap:12, flexShrink:0 }}>
            <div style={{ width:36, height:36, borderRadius:activeChannel.type==='GROUP'?10:'50%', background:getColor(getChannelName(activeChannel)), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:500, fontSize:activeChannel.type==='GROUP'?18:13 }}>{activeChannel.type==='GROUP'?'👥':getChannelName(activeChannel)[0]?.toUpperCase()}</div>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:14, fontWeight:500, color:'#e8e8f0', display:'flex', alignItems:'center', gap:6 }}>{getChannelName(activeChannel)}{activeChannel.type==='GROUP'&&<span style={{ fontSize:11, color:'#534AB7', background:'rgba(83,74,183,0.2)', borderRadius:4, padding:'1px 6px' }}>{activeChannel.members?.length} membres</span>}</div>
              <div style={{ fontSize:11, color:typingNames.length>0?'#534AB7':'#22c55e' }}>{typingNames.length>0?`${typingNames.join(', ')} ${T.typing}`:`● ${T.online}`}</div>
            </div>
            <div style={{ display:'flex', gap:4 }}>{['📞','🎥','🔍','⋯'].map(icon=><button key={icon} style={{ width:32, height:32, borderRadius:8, background:'transparent', border:'none', cursor:'pointer', color:'#555', fontSize:16 }}>{icon}</button>)}</div>
          </div>

          <div style={{ flex:1, overflowY:'auto', padding:'20px', background:'#0d0d14', display:'flex', flexDirection:'column' }}>
            {messages.length===0&&(
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', textAlign:'center' }}>
                <div style={{ width:72, height:72, borderRadius:activeChannel.type==='GROUP'?20:'50%', background:getColor(getChannelName(activeChannel)), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:28, fontWeight:500, marginBottom:16 }}>{activeChannel.type==='GROUP'?'👥':getChannelName(activeChannel)[0]?.toUpperCase()}</div>
                <div style={{ fontSize:16, fontWeight:500, color:'#e8e8f0' }}>{getChannelName(activeChannel)}</div>
                <div style={{ fontSize:13, color:'#444', marginTop:6 }}>{T.startConv} 👋</div>
              </div>
            )}

            {groupByDate(messages).map(group => (
              <div key={group.date}>
                <div style={{ display:'flex', alignItems:'center', gap:10, margin:'16px 0' }}>
                  <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.06)' }}></div>
                  <span style={{ fontSize:11, color:'#444', padding:'3px 10px', background:'rgba(255,255,255,0.04)', borderRadius:20 }}>{group.date}</span>
                  <div style={{ flex:1, height:'0.5px', background:'rgba(255,255,255,0.06)' }}></div>
                </div>
                {group.messages.map((msg, idx) => (
                  <MessageWithEmoji
                    key={msg.id}
                    msg={msg}
                    isMe={msg.senderId === user?.id}
                    same={group.messages[idx-1]?.senderId === msg.senderId}
                    userId={user?.id || ''}
                    deleted={T.deleted}
                    audioDur={parseAudio(msg.content)}
                    onReaction={sendReaction}
                  />
                ))}
              </div>
            ))}

            {typingNames.length>0&&(
              <div style={{ display:'flex', alignItems:'center', gap:8, marginTop:12 }}>
                <div style={{ width:24, height:24, borderRadius:'50%', background:getColor(typingNames[0]||''), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:10 }}>{typingNames[0]?.[0]?.toUpperCase()}</div>
                <div style={{ background:'#1e1e2e', borderRadius:16, borderBottomLeftRadius:4, padding:'10px 14px', display:'flex', gap:4 }}>{[0,1,2].map(i=><div key={i} style={{ width:5, height:5, borderRadius:'50%', background:'#555', animation:`bounce 1.2s ${i*0.2}s infinite` }}></div>)}</div>
              </div>
            )}
            <div ref={messagesEndRef}/>
          </div>

          <div style={{ margin:'0 16px 6px', padding:'7px 12px', borderRadius:10, background:'rgba(29,158,117,0.08)', borderLeft:isRTL?'none':'2px solid #1D9E75', borderRight:isRTL?'2px solid #1D9E75':'none', display:'flex', alignItems:'center', gap:8 }}>
            <span style={{ fontSize:13 }}>🤖</span>
            <span style={{ fontSize:11, color:'#1D9E75' }}>{T.aiActive} — {currentLang?.flag} {currentLang?.nativeName}</span>
            <button onClick={()=>router.push('/dashboard/analytics')} style={{ marginLeft:'auto', fontSize:11, color:'#444', background:'transparent', border:'none', cursor:'pointer' }}>📊 Analytics</button>
          </div>

          <div style={{ padding:'8px 16px 12px', background:'#13131f', borderTop:'0.5px solid rgba(255,255,255,0.06)', flexShrink:0 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:'#0d0d14', borderRadius:14, padding:'10px 14px', border:'0.5px solid rgba(255,255,255,0.06)', minHeight:52 }}>
              {recording?(
                <VoiceRecorder onCancel={()=>setRecording(false)} onSend={(duration)=>{ setRecording(false); sendMessage(`AUDIO:${duration}`) }}/>
              ):(
                <>
                  <button style={{ background:'transparent', border:'none', cursor:'pointer', color:'#444', fontSize:16 }}>📎</button>
                  <SmartInput value={input} onChange={setInput} onSend={sendMessage} onStartTyping={startTyping} onStopTyping={stopTyping} placeholder={`${T.messagePlaceholder} ${getChannelName(activeChannel)}...`} token={token!} isRTL={isRTL}/>
                  <button style={{ background:'transparent', border:'none', cursor:'pointer', color:'#444', fontSize:16 }}>😊</button>
                  <button onClick={()=>setRecording(true)} style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:18, color:'#444' }}>🎤</button>
                  <button onClick={()=>sendMessage()} disabled={!input.trim()||sending} style={{ width:32, height:32, borderRadius:10, background:input.trim()?'#534AB7':'#1e1e2e', border:'none', cursor:input.trim()?'pointer':'default', color:'white', display:'flex', alignItems:'center', justifyContent:'center', fontSize:15, transition:'all 0.15s' }}>➤</button>
                </>
              )}
            </div>
          </div>

        </>:(
          <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:'#0d0d14' }}>
            <div style={{ fontSize:56, marginBottom:16 }}>💬</div>
            <div style={{ fontSize:20, fontWeight:500, color:'#e8e8f0', marginBottom:8 }}>WeTalk</div>
            <div style={{ fontSize:13, color:'#444' }}>{T.startConv}</div>
          </div>
        )}
      </main>

      <style>{`
        @keyframes bounce { 0%,80%,100%{transform:scale(0.7);opacity:0.5} 40%{transform:scale(1);opacity:1} }
        ::-webkit-scrollbar{width:3px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:#2a2a3a;border-radius:3px}
        input::placeholder{color:#333 !important}
      `}</style>
    </div>
  )
}
