'use client'
import { format } from 'date-fns'

const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517']
const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]
const EMOJIS = ['❤️','😂','😮','😢','👍','🔥','🎉','👏','😘','💕']

interface Props {
  msg: any
  isMe: boolean
  same: boolean
  userId: string
  deleted: string
  audioDur: number | null
  onReaction: (msgId: string, emoji: string) => void
}

export default function MessageWithEmoji({ msg, isMe, same, userId, deleted, audioDur, onReaction }: Props) {
  const pickerId = `picker-${msg.id}`

  const togglePicker = () => {
    const el = document.getElementById(pickerId)
    if (el) el.style.display = el.style.display === 'flex' ? 'none' : 'flex'
  }

  const react = (emoji: string) => {
    onReaction(msg.id, emoji)
    const el = document.getElementById(pickerId)
    if (el) el.style.display = 'none'
  }

  const reactionGroups: Record<string,number> = {}
  msg.reactions?.forEach((r: any) => { reactionGroups[r.emoji] = (reactionGroups[r.emoji]||0)+1 })

  return (
    <div style={{ display:'flex', gap:8, flexDirection:isMe?'row-reverse':'row', marginTop:same?2:12 }}>
      <div style={{ width:28, flexShrink:0, display:'flex', alignItems:'flex-end' }}>
        {!isMe&&!same&&(
          <div style={{ width:28, height:28, borderRadius:'50%', background:getColor(msg.sender?.username||''), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:11, fontWeight:500 }}>
            {msg.sender?.username?.[0]?.toUpperCase()}
          </div>
        )}
      </div>

      <div style={{ display:'flex', flexDirection:'column', maxWidth:'60%', alignItems:isMe?'flex-end':'flex-start' }}>
        {!same&&!isMe&&<span style={{ fontSize:11, color:'#555', marginBottom:3, padding:'0 4px' }}>{msg.sender?.username}</span>}

        <div style={{ display:'flex', alignItems:'center', gap:6, flexDirection:isMe?'row-reverse':'row' }}>
          <div style={{ padding:audioDur?'10px 14px':'9px 13px', borderRadius:16, fontSize:13, lineHeight:1.5, background:isMe?'#534AB7':'#1e1e2e', color:isMe?'white':'#ccc', borderBottomRightRadius:isMe?4:16, borderBottomLeftRadius:isMe?16:4, minWidth:audioDur?210:'auto' }}>
            {msg.isDeleted ? <em style={{ color:'#666' }}>{deleted}</em>
              : audioDur ? (
                <div style={{ display:'flex', alignItems:'center', gap:10, minWidth:195 }}>
                  <div style={{ width:42, height:42, borderRadius:'50%', background:getColor(msg.sender?.username||'?'), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontWeight:700, fontSize:17, flexShrink:0 }}>
                    {(msg.sender?.username||'?')[0]?.toUpperCase()}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:1.5, height:22, marginBottom:3 }}>
                      {Array.from({length:22},(_,i)=><div key={i} style={{ flex:1, height:`${Math.sin(i*0.7)*8+10}px`, borderRadius:2, background:isMe?'rgba(255,255,255,0.7)':'#534AB760', minWidth:2 }}/>)}
                    </div>
                    <span style={{ fontSize:10, color:isMe?'rgba(255,255,255,0.6)':'#666' }}>🎤 {Math.floor(audioDur/60)}:{String(audioDur%60).padStart(2,'0')}</span>
                  </div>
                </div>
              ) : msg.content}
          </div>

          {!msg.isDeleted && (
            <div style={{ position:'relative', flexShrink:0 }}>
              <button
                onClick={togglePicker}
                style={{ background:'rgba(255,255,255,0.08)', border:'0.5px solid rgba(255,255,255,0.15)', borderRadius:'50%', width:28, height:28, cursor:'pointer', fontSize:14, display:'flex', alignItems:'center', justifyContent:'center' }}>
                😊
              </button>
              <div
                id={pickerId}
                style={{ display:'none', position:'absolute', bottom:'130%', left:isMe?'auto':'-8px', right:isMe?'-8px':'auto', background:'#1a1a2e', borderRadius:28, padding:'8px 12px', gap:6, border:'0.5px solid rgba(255,255,255,0.2)', boxShadow:'0 8px 32px rgba(0,0,0,0.8)', zIndex:99999, whiteSpace:'nowrap' }}>
                {EMOJIS.map(e => (
                  <button key={e} onClick={() => react(e)}
                    style={{ background:'transparent', border:'none', cursor:'pointer', fontSize:22, padding:'0 2px', lineHeight:1 }}>
                    {e}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {Object.keys(reactionGroups).length > 0 && (
          <div style={{ display:'flex', gap:4, marginTop:4, flexWrap:'wrap' }}>
            {Object.entries(reactionGroups).map(([emoji,count]) => (
              <button key={emoji} onClick={() => react(emoji)}
                style={{ background:'rgba(255,255,255,0.08)', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:20, padding:'2px 8px', fontSize:12, cursor:'pointer', display:'flex', alignItems:'center', gap:3, color:'#ddd' }}>
                {emoji}<span style={{ fontSize:11, color:'#888' }}>{count}</span>
              </button>
            ))}
          </div>
        )}

        <div style={{ display:'flex', alignItems:'center', gap:4, padding:'2px 4px', flexDirection:isMe?'row-reverse':'row', marginTop:2 }}>
          <span style={{ fontSize:10, color:'#444' }}>{format(new Date(msg.createdAt),'HH:mm')}</span>
          {isMe&&<span style={{ fontSize:11, color:'#534AB7' }}>✓✓</span>}
        </div>
      </div>
    </div>
  )
}
