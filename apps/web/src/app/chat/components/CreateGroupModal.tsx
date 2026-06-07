'use client'
import { useState } from 'react'
import toast from 'react-hot-toast'

const API = 'http://localhost:9020/api/v1'

interface Props {
  token: string
  onClose: () => void
  onCreated: (channel: any) => void
}

export default function CreateGroupModal({ token, onClose, onCreated }: Props) {
  const [step, setStep] = useState<'info' | 'members'>('info')
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [searchUser, setSearchUser] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [selected, setSelected] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }

  const searchUsers = async (q: string) => {
    setSearchUser(q)
    if (q.length < 2) { setResults([]); return }
    try {
      const res = await fetch(`${API}/users/search?q=${q}`, { headers })
      const data = await res.json()
      setResults(data)
    } catch {}
  }

  const toggleUser = (u: any) => {
    setSelected(prev =>
      prev.find(x => x.id === u.id) ? prev.filter(x => x.id !== u.id) : [...prev, u]
    )
  }

  const createGroup = async () => {
    if (!name.trim() || selected.length === 0) return
    setLoading(true)
    try {
      const res = await fetch(`${API}/channels/group`, {
        method: 'POST', headers,
        body: JSON.stringify({ name, description, memberIds: selected.map(u => u.id) }),
      })
      const channel = await res.json()
      toast.success(`Groupe "${name}" créé ! 🎉`)
      onCreated(channel)
      onClose()
    } catch {
      toast.error('Erreur création groupe')
    } finally {
      setLoading(false)
    }
  }

  const COLORS = ['#534AB7','#1D9E75','#D85A30','#378ADD','#D4537E']
  const getColor = (n: string) => COLORS[(n?.charCodeAt(0)||0) % COLORS.length]

  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000 }}>
      <div style={{ background:'#13131f', borderRadius:16, width:420, border:'0.5px solid rgba(255,255,255,0.1)', overflow:'hidden' }}>

        {/* Header */}
        <div style={{ padding:'20px 24px 16px', borderBottom:'0.5px solid rgba(255,255,255,0.06)', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <div>
            <div style={{ fontSize:16, fontWeight:500, color:'#e8e8f0' }}>Créer un groupe</div>
            <div style={{ fontSize:12, color:'#555', marginTop:2 }}>
              {step === 'info' ? 'Étape 1 — Informations' : 'Étape 2 — Membres'}
            </div>
          </div>
          <button onClick={onClose} style={{ background:'transparent', border:'none', cursor:'pointer', color:'#555', fontSize:20 }}>✕</button>
        </div>

        {/* Steps indicator */}
        <div style={{ display:'flex', padding:'12px 24px', gap:8 }}>
          {['info','members'].map((s, i) => (
            <div key={s} style={{ flex:1, height:3, borderRadius:3, background: step === s || (s === 'info') ? '#534AB7' : 'rgba(255,255,255,0.1)', opacity: s === 'members' && step === 'info' ? 0.3 : 1, transition:'all 0.3s' }}></div>
          ))}
        </div>

        <div style={{ padding:'0 24px 24px' }}>
          {step === 'info' ? (
            <>
              {/* Group avatar preview */}
              <div style={{ display:'flex', justifyContent:'center', marginBottom:20 }}>
                <div style={{ width:72, height:72, borderRadius:'50%', background: name ? getColor(name) : '#1e1e2e', display:'flex', alignItems:'center', justifyContent:'center', fontSize:28, color:'white', fontWeight:500, border:'2px dashed rgba(255,255,255,0.1)', transition:'all 0.3s' }}>
                  {name ? name[0].toUpperCase() : '👥'}
                </div>
              </div>

              <div style={{ marginBottom:14 }}>
                <label style={{ fontSize:12, color:'#666', display:'block', marginBottom:6 }}>Nom du groupe *</label>
                <input value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Team WeTalk"
                  style={{ width:'100%', background:'#0d0d14', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#ddd', fontSize:13, outline:'none', boxSizing:'border-box' }} />
              </div>

              <div style={{ marginBottom:20 }}>
                <label style={{ fontSize:12, color:'#666', display:'block', marginBottom:6 }}>Description</label>
                <textarea value={description} onChange={e => setDescription(e.target.value)} placeholder="À propos de ce groupe..."
                  style={{ width:'100%', background:'#0d0d14', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#ddd', fontSize:13, outline:'none', resize:'none', height:80, boxSizing:'border-box' }} />
              </div>

              <button onClick={() => name.trim() && setStep('members')} disabled={!name.trim()}
                style={{ width:'100%', padding:'11px', borderRadius:10, background: name.trim() ? '#534AB7' : '#1e1e2e', border:'none', color:'white', fontSize:13, fontWeight:500, cursor: name.trim() ? 'pointer' : 'default' }}>
                Suivant — Ajouter des membres →
              </button>
            </>
          ) : (
            <>
              {/* Selected members */}
              {selected.length > 0 && (
                <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:14 }}>
                  {selected.map(u => (
                    <div key={u.id} onClick={() => toggleUser(u)}
                      style={{ display:'flex', alignItems:'center', gap:6, background:'rgba(83,74,183,0.2)', border:'0.5px solid rgba(83,74,183,0.4)', borderRadius:20, padding:'4px 10px 4px 6px', cursor:'pointer' }}>
                      <div style={{ width:20, height:20, borderRadius:'50%', background:getColor(u.username), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:10 }}>
                        {u.username[0].toUpperCase()}
                      </div>
                      <span style={{ fontSize:12, color:'#9B8FE8' }}>{u.username}</span>
                      <span style={{ fontSize:10, color:'#534AB7' }}>✕</span>
                    </div>
                  ))}
                </div>
              )}

              <div style={{ position:'relative', marginBottom:12 }}>
                <input value={searchUser} onChange={e => searchUsers(e.target.value)} placeholder="🔍 Rechercher un utilisateur..."
                  style={{ width:'100%', background:'#0d0d14', border:'0.5px solid rgba(255,255,255,0.1)', borderRadius:10, padding:'10px 14px', color:'#ddd', fontSize:13, outline:'none', boxSizing:'border-box' }} />
              </div>

              {results.length > 0 && (
                <div style={{ background:'#0d0d14', borderRadius:10, border:'0.5px solid rgba(255,255,255,0.06)', marginBottom:14, maxHeight:180, overflowY:'auto' }}>
                  {results.map(u => {
                    const isSelected = selected.find(x => x.id === u.id)
                    return (
                      <div key={u.id} onClick={() => toggleUser(u)}
                        style={{ display:'flex', alignItems:'center', gap:10, padding:'10px 14px', cursor:'pointer', background: isSelected ? 'rgba(83,74,183,0.15)' : 'transparent', transition:'background 0.15s' }}>
                        <div style={{ width:32, height:32, borderRadius:'50%', background:getColor(u.username), display:'flex', alignItems:'center', justifyContent:'center', color:'white', fontSize:13 }}>
                          {u.username[0].toUpperCase()}
                        </div>
                        <div style={{ flex:1 }}>
                          <div style={{ fontSize:13, color:'#ddd' }}>{u.username}</div>
                          <div style={{ fontSize:11, color:'#555' }}>{u.isOnline ? '🟢 En ligne' : '⚫ Hors ligne'}</div>
                        </div>
                        {isSelected && <span style={{ color:'#534AB7', fontSize:16 }}>✓</span>}
                      </div>
                    )
                  })}
                </div>
              )}

              <div style={{ display:'flex', gap:8, marginTop:8 }}>
                <button onClick={() => setStep('info')}
                  style={{ flex:1, padding:'11px', borderRadius:10, background:'#1e1e2e', border:'none', color:'#aaa', fontSize:13, cursor:'pointer' }}>
                  ← Retour
                </button>
                <button onClick={createGroup} disabled={loading || selected.length === 0}
                  style={{ flex:2, padding:'11px', borderRadius:10, background: selected.length > 0 ? '#534AB7' : '#1e1e2e', border:'none', color:'white', fontSize:13, fontWeight:500, cursor: selected.length > 0 ? 'pointer' : 'default' }}>
                  {loading ? 'Création...' : `Créer le groupe (${selected.length} membre${selected.length > 1 ? 's' : ''})`}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
