'use client'
import { useState, useRef } from 'react'

const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E','#BA7517']
const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]

interface Props { isMe: boolean; username?: string; duration?: number }

export default function AudioMessage({ isMe, username = '?', duration = 10 }: Props) {
  const [playing, setPlaying] = useState(false)
  const [current, setCurrent] = useState(0)
  const [done, setDone] = useState(false)
  const iv = useRef<any>(null)
  const bars = useRef(Array.from({length:26}, () => +(Math.random()*0.65+0.35).toFixed(2)))
  const color = getColor(username)
  const pct = done ? 1 : current / duration
  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  const play = () => {
    setPlaying(true)
    iv.current = setInterval(() => {
      setCurrent(p => {
        if (p + 1 >= duration) { clearInterval(iv.current); setPlaying(false); setDone(true); return duration }
        return p + 1
      })
    }, 1000)
  }
  const pause = () => { clearInterval(iv.current); setPlaying(false) }
  const toggle = () => {
    if (done) { setCurrent(0); setDone(false); play(); return }
    playing ? pause() : play()
  }

  return (
    <div style={{display:'flex', alignItems:'center', gap:12, minWidth:220}}>
      <div onClick={toggle} style={{
        width:48, height:48, borderRadius:'50%',
        background: color, cursor:'pointer', flexShrink:0,
        display:'flex', alignItems:'center', justifyContent:'center',
        boxShadow: playing ? `0 0 0 5px ${color}40` : 'none',
        transition:'box-shadow 0.3s',
      }}>
        <span style={{color:'white', fontWeight:700, fontSize: playing||done ? 16 : 20}}>
          {playing ? '⏸' : done ? '↺' : username[0]?.toUpperCase()}
        </span>
      </div>
      <div style={{flex:1, display:'flex', flexDirection:'column', gap:5}}>
        <div style={{display:'flex', alignItems:'center', gap:2, height:28}}>
          {bars.current.map((h,i) => (
            <div key={i} style={{
              flex:1, minWidth:2,
              height:`${h*26}px`,
              borderRadius:2,
              background: i/bars.current.length <= pct ? color : color+'35',
              transition:'background 0.1s',
            }}/>
          ))}
        </div>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <span style={{fontSize:10, color: isMe?'rgba(255,255,255,0.6)':'#666'}}>
            {current > 0 ? fmt(current) : fmt(duration)}
          </span>
          <span style={{fontSize:10, color: isMe?'rgba(255,255,255,0.3)':'#444'}}>
            {playing ? '🎵' : '🎤'}
          </span>
        </div>
      </div>
    </div>
  )
}
