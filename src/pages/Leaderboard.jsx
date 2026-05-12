import { useEffect, useState } from 'react'
import { getLeaderboard } from '../lib/supabase'
import { S, GlowBg, NavBar, grade } from '../components/UI'

export default function Leaderboard({ session, profile }) {
  const [lb, setLb] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getLeaderboard().then(data => { setLb(data); setLoading(false) })
  }, [])

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 32, paddingBottom: 100 }}>
        <div style={{ marginBottom: 24 }}>
          <div style={{ ...S.tag, marginBottom: 6 }}>🏆 Clasament global</div>
          <h2 style={S.h2}>Top jucători</h2>
          <p style={{ color: '#383850', fontSize: 11, margin: '6px 0 0', fontFamily: 'DM Mono,monospace' }}>
            Scorurile și numele sunt vizibile tuturor utilizatorilor.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: '#444', fontFamily: 'DM Mono,monospace', fontSize: 13 }}>
            Se încarcă...
          </div>
        ) : lb.length === 0 ? (
          <div style={{ ...S.card, textAlign: 'center', padding: 40 }}>
            <div style={{ fontSize: 36, marginBottom: 10 }}>🏜️</div>
            <p style={{ color: '#444', margin: 0, fontSize: 14 }}>Nimeni nu e pe clasament încă. Fii primul!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {lb.map((entry, i) => {
              const g = grade(entry.best_score)
              const isMe = entry.display_name === profile?.display_name
              return (
                <div key={i} style={{ ...S.card, display: 'flex', alignItems: 'center', gap: 14, background: isMe ? `${g.c}0d` : 'rgba(255,255,255,.03)', border: isMe ? `1px solid ${g.c}30` : '1px solid rgba(255,255,255,.07)' }}>
                  <div style={{ fontSize: i < 3 ? 22 : 13, fontFamily: 'DM Mono,monospace', color: i === 0 ? '#FFD700' : i === 1 ? '#C0C0C0' : i === 2 ? '#CD7F32' : '#333', width: 28, textAlign: 'center' }}>
                    {i < 3 ? ['🥇', '🥈', '🥉'][i] : `#${i + 1}`}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: isMe ? g.c : '#ddd' }}>
                      {entry.display_name}
                      {isMe && <span style={{ fontSize: 10, fontFamily: 'DM Mono,monospace', color: '#444', marginLeft: 6 }}>(tu)</span>}
                    </div>
                    <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Mono,monospace', marginTop: 2 }}>
                      {g.i} {g.l} · {entry.games_played} jocuri
                    </div>
                  </div>
                  <div style={{ fontSize: 17, fontWeight: 800, color: g.c, fontFamily: 'DM Mono,monospace' }}>
                    {entry.best_score}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
      <NavBar active="/leaderboard" />
    </div>
  )
}
