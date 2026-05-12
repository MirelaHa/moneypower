import { useEffect, useState } from 'react'
import { getChallenges, toggleChallenge } from '../lib/supabase'
import { CHALLENGES } from '../lib/data'
import { S, GlowBg, Btn, NavBar } from '../components/UI'

export default function Challenges({ session }) {
  const [completed, setCompleted] = useState([])
  const weekChallenge = CHALLENGES[Math.floor(Date.now() / (7 * 24 * 3600 * 1000)) % CHALLENGES.length]

  useEffect(() => {
    if (session) getChallenges(session.user.id).then(setCompleted)
  }, [session])

  const toggle = async (id) => {
    const isDone = completed.includes(id)
    const updated = isDone ? completed.filter(c => c !== id) : [...completed, id]
    setCompleted(updated)
    await toggleChallenge(session.user.id, id, !isDone)
  }

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 32, paddingBottom: 100 }}>

        <div style={{ marginBottom: 24 }}>
          <div style={{ ...S.tag, marginBottom: 6 }}>Challenge-ul saptamanii</div>
          <h2 style={S.h2}>Challenges saptamanale</h2>
          <p style={{ color: '#555', fontSize: 14, margin: '6px 0 0', lineHeight: 1.6 }}>
            Aplica ce ai invatat in viata reala.
          </p>
        </div>

        <div style={{ background: 'linear-gradient(135deg,#00FF8715,#00C6FF10)', border: '1px solid #00FF8730', borderRadius: 20, padding: 20, marginBottom: 20 }}>
          <div style={{ ...S.tag, color: '#00FF87', marginBottom: 10 }}>Challenge-ul saptamanii</div>
          <div style={{ display: 'flex', gap: 14 }}>
            <span style={{ fontSize: 34 }}>{weekChallenge.icon}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{weekChallenge.title}</div>
              <p style={{ color: '#999', fontSize: 14, margin: '0 0 8px', lineHeight: 1.6 }}>{weekChallenge.desc}</p>
              <div style={{ background: '#00FF8715', display: 'inline-block', borderRadius: 8, padding: '4px 10px', fontSize: 12, color: '#00FF87' }}>
                {weekChallenge.saving}
              </div>
              <p style={{ color: '#444', fontSize: 12, margin: '10px 0 0', fontStyle: 'italic' }}>{weekChallenge.tip}</p>
            </div>
          </div>
          <Btn
            onClick={() => toggle(weekChallenge.id)}
            color={completed.includes(weekChallenge.id) ? '#555' : '#00FF87'}
            style={{ marginTop: 14, padding: '12px' }}>
            {completed.includes(weekChallenge.id) ? 'Finalizat!' : 'Marcheaza ca finalizat'}
          </Btn>
        </div>

        <div style={{ ...S.tag, marginBottom: 12 }}>
          {completed.length}/{CHALLENGES.length} completate
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {CHALLENGES.map(c => {
            const done = completed.includes(c.id)
            return (
              <div
                key={c.id}
                onClick={() => toggle(c.id)}
                style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer', opacity: done ? 0.55 : 1, background: done ? 'rgba(0,255,135,.04)' : 'rgba(255,255,255,.04)', border: done ? '1px solid rgba(0,255,135,.15)' : '1px solid rgba(255,255,255,.07)', transition: 'all .15s' }}>
                <span style={{ fontSize: 24, flexShrink: 0 }}>{c.icon}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: done ? '#00FF87' : '#ddd', textDecoration: done ? 'line-through' : 'none' }}>{c.title}</div>
                  <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Mono,monospace', marginTop: 2 }}>{c.saving}</div>
                </div>
                <div style={{ width: 22, height: 22, borderRadius: '50%', border: done ? '2px solid #00FF87' : '2px solid rgba(255,255,255,.12)', background: done ? '#00FF87' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {done && <span style={{ color: '#000', fontSize: 11, fontWeight: 700 }}>v</span>}
                </div>
              </div>
            )
          })}
