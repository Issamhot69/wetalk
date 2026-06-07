'use client'
import { useState, useRef, useEffect } from 'react'

interface Props {
  onSend: (blob: Blob, duration: number) => void
  onCancel: () => void
}

export default function AudioRecorder({ onSend, onCancel }: Props) {
  const [recording, setRecording] = useState(false)
  const [duration, setDuration] = useState(0)
  const [bars, setBars] = useState<number[]>(Array(40).fill(3))
  const mediaRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animRef = useRef<number>(0)
  const timerRef = useRef<any>(null)

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
      mr.ondataavailable = e => chunksRef.current.push(e.data)
      mr.start()
      mediaRef.current = mr
      setRecording(true)

      timerRef.current = setInterval(() => setDuration(d => d + 1), 1000)
      animateBars()
    } catch {
      onCancel()
    }
  }

  const animateBars = () => {
    const analyser = analyserRef.current
    if (!analyser) return
    const data = new Uint8Array(analyser.frequencyBinCount)
    analyser.getByteFrequencyData(data)
    const newBars = Array.from({ length: 40 }, (_, i) => {
      const idx = Math.floor(i * data.length / 40)
      return Math.max(3, (data[idx] / 255) * 48)
    })
    setBars(newBars)
    animRef.current = requestAnimationFrame(animateBars)
  }

  const stopAll = () => {
    cancelAnimationFrame(animRef.current)
    clearInterval(timerRef.current)
    mediaRef.current?.stream?.getTracks().forEach(t => t.stop())
  }

  const handleSend = () => {
    if (!mediaRef.current) return
    mediaRef.current.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
      onSend(blob, duration)
    }
    mediaRef.current.stop()
    stopAll()
  }

  const fmt = (s: number) => `${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`

  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, flex:1 }}>
      {/* Cancel */}
      <button onClick={() => { stopAll(); onCancel() }}
        style={{ width:32, height:32, borderRadius:'50%', background:'rgba(216,90,48,0.2)', border:'none', cursor:'pointer', color:'#D85A30', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</button>

      {/* Waveform circle */}
      <div style={{ position:'relative', width:48, height:48, flexShrink:0 }}>
        <svg width="48" height="48" style={{ position:'absolute', top:0, left:0 }}>
          <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(83,74,183,0.3)" strokeWidth="2"/>
          <circle cx="24" cy="24" r="20" fill="none" stroke="#534AB7" strokeWidth="2"
            strokeDasharray={`${(duration % 60) * 2.09} 125.6`}
            strokeLinecap="round" transform="rotate(-90 24 24)" style={{ transition:'stroke-dasharray 1s linear' }}/>
        </svg>
        <div style={{ position:'absolute', inset:0, display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, color:'#534AB7', fontWeight:500 }}>
          {fmt(duration)}
        </div>
      </div>

      {/* Bars visualizer */}
      <div style={{ flex:1, display:'flex', alignItems:'center', gap:1.5, height:48 }}>
        {bars.map((h, i) => (
          <div key={i} style={{ flex:1, height:`${h}px`, background:`hsl(${240 + i * 2}, 60%, ${50 + h}%)`, borderRadius:2, transition:'height 0.05s', minWidth:2 }}></div>
        ))}
      </div>

      {/* Send */}
      <button onClick={handleSend}
        style={{ width:36, height:36, borderRadius:'50%', background:'#534AB7', border:'none', cursor:'pointer', color:'white', fontSize:16, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>➤</button>
    </div>
  )
}
