'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSend: (duration: number) => void
  onCancel: () => void
}

export default function VoiceRecorder({ onSend, onCancel }: Props) {
  const [duration, setDuration] = useState(0)
  const [bars, setBars] = useState<number[]>(Array(40).fill(4))
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number>(0)
  const timerRef = useRef<any>(null)
  const mediaRef = useRef<MediaRecorder | null>(null)
  const circumference = 2 * Math.PI * 22

  useEffect(() => {
    startRecording()
    return () => stopAll()
  }, [])

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const ctx = new AudioContext()
      const source = ctx.createMediaStreamSource(stream)
      const analyser = ctx.createAnalyser()
      analyser.fftSize = 128
      source.connect(analyser)
      analyserRef.current = analyser

      const mr = new MediaRecorder(stream)
      mr.start()
      mediaRef.current = mr

      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
      animate()
    } catch { onCancel() }
  }

  const animate = () => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    setBars(Array.from({ length: 40 }, (_, i) => {
      const v = data[Math.floor(i * data.length / 40)]
      return Math.max(4, (v / 255) * 52)
    }))
    animRef.current = requestAnimationFrame(animate)
  }

  const stopAll = () => {
    cancelAnimationFrame(animRef.current)
    clearInterval(timerRef.current)
    mediaRef.current?.stream?.getTracks().forEach(t => t.stop())
    mediaRef.current?.stop()
  }

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`
  const progress = Math.min((duration / 120) * 100, 100)

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1, padding:'0 4px' }}>

      {/* Cancel */}
      <button onClick={() => { stopAll(); onCancel() }}
        style={{ width:34, height:34, borderRadius:'50%', background:'rgba(216,90,48,0.15)', border:'0.5px solid rgba(216,90,48,0.3)', cursor:'pointer', color:'#D85A30', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        ✕
      </button>

      {/* Circle timer */}
      <div style={{ position:'relative', width:48, height:48, flexShrink:0 }}>
        <svg width="48" height="48" style={{ position:'absolute', top:0, left:0, transform:'rotate(-90deg)' }}>
          <circle cx="24" cy="24" r="22" fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="2.5"/>
          <circle cx="24" cy="24" r="22" fill="none"
            stroke="#D85A30"
            strokeWidth="2.5"
            strokeDasharray={`${(progress/100)*circumference} ${circumference}`}
            strokeLinecap="round"
            style={{ transition:'stroke-dasharray 1s linear' }}
          />
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center' }}>
          <div style={{ width:8, height:8, borderRadius:'50%', background:'#D85A30', animation:'recPulse 1s ease-in-out infinite' }}></div>
          <div style={{ fontSize:9, color:'#D85A30', marginTop:2, fontWeight:500 }}>{fmt(duration)}</div>
        </div>
      </div>

      {/* Live waveform */}
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:1.5, height:44, overflow:'hidden' }}>
        {bars.map((h, i) => (
          <div key={i} style={{
            flex:1,
            height:`${h}px`,
            borderRadius:2,
            background:`hsl(${200 + i*3}, 70%, ${45 + h/3}%)`,
            minWidth:2,
            transition:'height 0.05s ease',
          }}/>
        ))}
      </div>

      {/* Send */}
      <button onClick={() => { stopAll(); onSend(duration) }}
        style={{ width:38, height:38, borderRadius:'50%', background:'#534AB7', border:'none', cursor:'pointer', color:'white', fontSize:17, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, boxShadow:'0 0 12px rgba(83,74,183,0.4)' }}>
        ➤
      </button>

      <style>{`
        @keyframes recPulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(0.7)} }
      `}</style>
    </div>
  )
}
