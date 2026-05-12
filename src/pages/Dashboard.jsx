import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { signOut, getGameHistory } from '../lib/supabase'
import { S, GlowBg, Btn, NavBar, ChartTip, grade } from '../components/UI'

export default function Dashboard({ session, profile, onProfileUpdate }) {
  const navigate = useNavigate()
  const [history, setHistory] = useState([])

  useEffect(() => {
    if (session) getGameHistory(session.user.id).then(setHistory)
  }, [session])

  const handleLogout = async () => { await signOut(); navigate('/auth') }
  const g = grade(profile?.best_score || 0)

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 32, paddingBottom: 100 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: `linear-gradient(135deg,${g.c},${g.c}44)`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24, flexShrink: 0 }}>{g.i}</div>
          <div style={{ flex: 1 }}>
            <h2 style={{ ...S.h2, fontSize: 20, marginBottom: 2 }}>{profile?.display_name || '...'}</h2>
            <div style={{ ...S.mono, fontSize: 11, color: '#444' }}>@{profile?.username} · {g.l}</div>
          </div>
          <button onClick={handleLogout} style={{ background: 'rgba(255,60,60,.08)', border: '1px solid rgba(255,60,60,.18)', borderRadius: 10, padding: '8px 14px', color: '#FF6B6B', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }}>Ieși →</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 20 }}>
          {[['🎮', 'Jocuri', profile?.games_played || 0], ['🏆', 'Scor max', profile?.best_score || 0], ['📅', 'Ultimul', history[0]?.score || '-']].map(([ic, lb, v]) => (
            <div key={lb} style={{ ...S.card, textAlign: 'center', padding: '16px 8px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{ic}</div>
              <div style={{ fontSize: 18, fontWeight: 700, fontFamily: 'DM Mono,monospace' }}>{v}</div>
              <div style={{ ...S.tag, letterSpacing: 1, marginTop: 2 }}>{lb}</div>
            </div>
          ))}
        </div>

        {history.length > 1 && (
          <div style={{ ...S.card, marginBottom: 16, padding: '18px 12px 14px' }}>
            <div style={{ ...S.tag, marginBottom: 12, paddingLeft: 4 }}>Evoluție scor</div>
            <ResponsiveContainer width="100%" height={110}>
              <LineChart data={[...history].reverse().map((h, i) => ({ g: `J${i + 1}`, s: h.score }))}>
                <XAxis dataKey="g" tick={{ fill: '#444', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                <YAxis hide /><Tooltip content={<ChartTip />} />
                <Line type="monotone" dataKey="s" stroke="#00FF87" strokeWidth={2} dot={{ r: 3, fill: '#00FF87' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {history.length > 0 && (
          <div style={{ ...S.card, marginBottom: 16 }}>
            <div style={{ ...S.tag, marginBottom: 12 }}>Ultimele jocuri</div>
            {history.slice(0, 5).map((h, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: i < 4 ? '1px solid rgba(255,255,255,.05)' : 'none' }}>
                <div>
                  <div style={{ fontSize: 13, color: '#ccc' }}>{new Date(h.played_at).toLocaleDateString('ro-RO')}</div>
                  <div style={{ fontSize: 11, color: '#444', fontFamily: 'DM Mono,monospace', marginTop: 2 }}>{h.decisions?.length || 0} decizii</div>
                </div>
                <div style={{ fontSize: 16, fontWeight: 700, color: grade(h.score).c, fontFamily: 'DM Mono,monospace' }}>{h.score}</div>
              </div>
            ))}
          </div>
        )}

        <Btn onClick={() => navigate('/game')} color={history.length === 0 ? '#00FF87' : '#00C6FF'}>
          {history.length === 0 ? '🎮 Joacă primul joc →' : '🔄 Joacă din nou'}
        </Btn>
      </div>
      <NavBar active="/" />
    </div>
  )
}
