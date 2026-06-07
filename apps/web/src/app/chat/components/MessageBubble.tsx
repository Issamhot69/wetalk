'use client'
import { useState, useCallback } from 'react'
import { format } from 'date-fns'

const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517']
const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]
const parseAudio = (c: string) => c?.match(/^AUDIO:(\d+)$/)?.[1] ? parseInt(c.match(/^AUDIO:(\d+)$/)![1]) : null
const EMOJIS = ['❤️','😂','😮','😢','👍','🔥']
const API = 'http://localhost:9020/api/v1'

interface Props { msg:any; isMe:boolean; same:boolean; user:any; token:string; onReaction:(id:string,emoji:string)=>void; deleted:string }

function AudioPlayer({ isMe, username, duration }: { isMe:boolean; username:string; duration:number }) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const color = getColor(username)
  const pct = done ? 1 : current/duration
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  const bars = useState(() => Array.from({length:26}, () => +(Math.random()*0.65+0.35).toFixed(2)))[0]
  const ivRef = useState<any>(null)

  const toggle = () => {
    if (done) { setCurrent(0); setDone(false); startPlay(); return }
    if (playing) { clearInterval(ivRef[0]); setPlaying(false) }
    else startPlay()
  }

  const startPlay = () => {
    setPlaying(true)
    const iv = setInterval(() => {
      setCurrent(p => {
        if (p+1 >= duration) { clearInterval(iv); setPlaying(false); setDone(true); return duration }
        return p+1
      })
    }, 1000)
    ivRef[1](iv)
  }

  return (
    <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:200 }}>
      <div onClick={toggle} style={{ width:44, height:44, borderRadius:'50%', background:color, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', flexShrink:0, boxShadow: playing?`0 0 0 4px ${color}40`:'none', transition:'box-shadow 0.3s' }}>
        <span style={{ color:'white', fontWeight:700, fontSize: playing||done?14:18 }}>
          {playing ? '⏸' : done ? '↺' : username[0]?.toUpperCase()}
        </span>
      </div>
      <div style={{ flex:1, display:'flex', flexDirection:'column', gap:4 }}>
        <div style={{ display:'flex', alignItems:'center', gap:2, height:26 }}>
          {bars.map((h,i) => (
            <div key={i} style={{ flex:1, minWidth:2, height:`${h*22}px`, borderRadius:2, background: i/bars.length<=pct ? color : color+'35', transition:'background 0.1s' }}/>
          ))}
        </div>
        <div style={{ display:'flex', justifyContent:'space-between' }}>
          <span style={{ fontSize:10, color:isMe?'rgba(255,255,255,0.6)':'#666' }}>{fmt(current>0?current:duration)}</span>
          <span style={{ fontSize:10, color:isMe?'rgba(255,255,255,0.3)':'#444' }}>{playing?'🎵':'🎤'}</span>
        </div>
      </div>
    </div>
  )
}

export default function MessageBubble({ msg, isMe, same, user, token, onReaction, deleted }: Props) {
  const [open, setOpen] = useState(false)
  const audioDur = parseAudio(msg.content)

  const react = useCallback(async (emoji: string) => {
    setOpen(false)
    try {
      await fetch(`${API}/messages/${msg.id}/reactions`, {
        method:'POST',
        headers:{ 'Content-Type':'application/json', Authorization:`Bearer ${token}` },
        body: JSON.stringify({ emoji }),
      })
      onReaction(msg.id, emoji)
    } catch {}
  }, [msg.id, token, onReaction])

  const groups: Record<string,number> = {}
  msg.reactions?.forEach((r: any) => { groups[r.emoji] = (groups[r.emoji]||0)+1 })

  return (
    <div style={{ display:'flex', gap:8, flexDirection:isMe?'row-reverse':'row', marginTop:same?2:12 }}>
      <div style={{ width:28, flexShrink:0, display:'flex', alignItems:'flex-end' }}>
        {!isMe && !same && (
          <div style={{ width:28, height:28, borderRadius:'50%', background:getColor(msg.sender?.username||''), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:500 }}>
            {msg.sender?.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ display:'flex', flexDirection:'column', maxWidth:'60%', alignItems:isMe?'flex-end':'flex-start' }}>
        {!same && !isMe && <span style={{ fontSize:11, color:'#555', marginBottom:3, padding:'0 4px' }}>{msg.sender?.username}</span>}

        <div style={{ display:'flex', alignItems:'center', gap:6, flexDirection:isMe?'row-reverse':'row' }}>
          {/* Bubble */}
          <div style={{ padding:audioDur?'10px 14px':'9px 13px', borderRadius:16, fontSize:13, lineHeight:1.5, background:isMe?'#534AB7':'#1e1e2e', color:isMe?'white':'#ccc', borderBottomRightRadius:isMe?4:16, borderBottomLeftRadius:isMe?16:4, minWidth:audioDur?210:'auto' }}>
            {msg.isDeleted
              ? <em style={{ color:'#666' }}>{deleted}</em>
              : audioDur
                ? <AudioPlayer isMe={isMe} username={msg.sender?.username||user?.username||'?'} duration={audioDur}/>
                : msg.content
            }
          </div>

          {/* Emoji button */}
          {!msg.isDeleted && (
            <div style={{ position:'relative', flexShrink:0 }}>
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(o => !o) }}
                style={{ background:'rgba(255,255,255,0.07)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:'50%', width:26, height:26, cursor:'pointer', fontSize:13, display:'flex', alignItems:'center', justifyContent:'center' }}>
                😊
              </button>

              {open && (
                <div
                  onClick={e => e.stopPropagation()}
                  style={{ position:'absolute', bottom:'120%', left:isMe?'auto':0, right:isMe?0:'auto', background:'#1a1a2e', borderRadius:24, padding:'8px 10px', display:'flex', gap:6, border:'0.5px solid rgba(255,255,255,0.15)', boxShadow:'0 8px 32px rgba(0,0,0,0.6)', zIndex:100 }}>
                  {EMOJIS.map(e => (
                    <button key={e}
                      onClick={() => react(e)}
                      style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, padding:'2px 3px', borderRadius:8, lineHeight:1 }}>
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Reactions */}
        {Object.keys(groups).length > 0 && (
          <div style={{ display:'flex', gap:4, marginTop:4, flexWrap:'wrap' }}>
            {Object.entries(groups).map(([emoji, count]) => (
              <button key={emoji} onClick={() => react(emoji)}
                style={{ background:'rgba(255,255,255,0.08)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'2px 8px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:3, color:'#ddd' }}>
                {emoji} <span style={{ fontSize:11, color:'#888' }}>{count}</span>
              </button>
            ))}
          </div>
        )}

        {/* Time */}
        <div style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 4px', flexDirection:isMe?'row-reverse':'row', marginTop:2 }}>
          <span style={{ fontSize:10, color:'#444' }}>{format(new Date(msg.createdAt),'HH:mm')}</span>
          {isMe && <span style={{ fontSize:11, color:'#534AB7' }}>✓✓</span>}
        </div>
      </div>
    </div>
  )
}
