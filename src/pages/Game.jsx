import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { saveGameResult } from '../lib/supabase'
import { SCENARIOS } from '../lib/data'
import { S, GlowBg, ChartTip, grade } from '../components/UI'

export default function Game({ session, profile }) {
  const navigate = useNavigate()
  const [sIdx, setSIdx] = useState(0)
  const [choiceIdx, setChoiceIdx] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [decisions, setDecisions] = useState([])
  const [anim, setAnim] = useState(true)

  const sc = SCENARIOS[sIdx]
  const ch = choiceIdx !== null ? sc.choices[choiceIdx] : null

  const pick = (i) => {
    const c = sc.choices[i]
    setChoiceIdx(i)
    setScore(s => s + c.score)
    setDecisions(d => [...d, { module: sc.module, choice: c.text, tag: c.tag, score: c.score, emoji: c.emoji }])
    setShowResult(true)
  }

  const next = async () => {
    setAnim(false)
    setTimeout(async () => {
      if (sIdx < SCENARIOS.length - 1) {
        setSIdx(s => s + 1); setChoiceIdx(null); setShowResult(false); setAnim(true)
      } else {
        const all = [...decisions, { module: sc.module, choice: ch.text, tag: ch.tag, score: ch.score, emoji: ch.emoji }]
        const fs = all.reduce((s, d) => s + d.score, 0)
        await saveGameResult({ userId: session.user.id, displayName: profile?.display_name, score: fs, decisions: all })
        navigate('/feedback', { state: { score: fs, decisions: all } })
      }
    }, 200)
  }

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 24, paddingBottom: 32 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 5 }}>
            {SCENARIOS.map((_, i) => <div key={i} style={{ width: i === sIdx ? 24 : 7, height: 7, borderRadius: 4, background: i < sIdx ? '#00FF87' : i === sIdx ? '#00C6FF' : 'rgba(255,255,255,.1)', transition: 'all .3s' }} />)}
          </div>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#444' }}>
            {profile?.display_name} · <span style={{ color: grade(score).c }}>{score} pct</span>
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 20, padding: '5px 14px', marginBottom: 14 }}>
          <span>{sc.moduleIcon}</span>
          <span style={{ ...S.tag, color: '#888' }}>{sc.module} · {sIdx + 1}/{SCENARIOS.length}</span>
        </div>

        <div style={{ ...S.card, marginBottom: 16, opacity: anim ? 1 : 0, transition: 'opacity .2s' }}>
          <div style={{ ...S.tag, marginBottom: 8 }}>👤 {sc.character}</div>
          <p style={{ fontSize: 16, lineHeight: 1.7, margin: 0, color: '#e0e0e0' }}>{sc.situation}</p>
        </div>

        {showResult && ch ? (
          <div style={{ opacity: anim ? 1 : 0, transition: 'opacity .2s' }}>
            <div style={{ background: `${ch.color}10`, border: `1px solid ${ch.color}28`, borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 26 }}>{ch.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: ch.color, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'DM Mono,monospace' }}>Ai ales · {ch.tag}</div>
                  <div style={{ fontSize: 13, color: '#bbb', marginTop: 2 }}>{ch.text}</div>
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: ch.score > 0 ? '#00FF87' : '#FF4D4D', fontFamily: 'DM Mono,monospace' }}>{ch.score > 0 ? '+' : ''}{ch.score}</div>
              </div>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{ch.consequence}</p>
            </div>
            <div style={{ ...S.card, marginBottom: 14, padding: '18px 12px 14px' }}>
              <div style={{ ...S.tag, marginBottom: 12, paddingLeft: 4 }}>Proiecție financiară — 8 luni</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={ch.projection.map((v, i) => ({ m: `L${i + 1}`, v }))}>
                  <XAxis dataKey="m" tick={{ fill: '#444', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis hide /><Tooltip content={<ChartTip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.08)" />
                  <Line type="monotone" dataKey="v" stroke={ch.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: ch.color }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <button onClick={next} style={{ background: `linear-gradient(135deg,${ch.color},${ch.color}bb)`, color: '#
