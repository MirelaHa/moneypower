import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { saveGameResult } from '../lib/supabase'
import { SCENARIOS } from '../lib/data'
import { S, GlowBg, ChartTip, grade } from '../components/UI'

const hoverOn = (e) => {
  e.currentTarget.style.background = 'rgba(0,255,135,0.06)'
  e.currentTarget.style.borderColor = 'rgba(0,255,135,0.25)'
}
const hoverOff = (e) => {
  e.currentTarget.style.background = '#1A1D2A'
  e.currentTarget.style.borderColor = '#252838'
}

const getRating = (score) => {
  if (score >= 80) return { label: 'Alegere excelenta', color: '#00FF87', stars: 5 }
  if (score >= 40) return { label: 'Alegere acceptabila', color: '#FFB800', stars: 3 }
  return { label: 'Alegere de evitat', color: '#FF4D4D', stars: 1 }
}

const Stars = ({ count }) => (
  <div style={{ display: 'flex', gap: 3, marginTop: 8 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: 16, color: i <= count ? '#FFB800' : 'rgba(255,255,255,0.12)' }}>★</span>
    ))}
  </div>
)

const shuffle = (arr) => {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const BG = '#12151E'
const CARD = '#1A1D2A'
const BORDER = '#252838'
const RED = '#FF4D6A'

export default function Game({ session, profile }) {
  const navigate = useNavigate()
  const [scenarios] = useState(() => shuffle(SCENARIOS))
  const [sIdx, setSIdx] = useState(0)
  const [choiceIdx, setChoiceIdx] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [decisions, setDecisions] = useState([])
  const [showChart, setShowChart] = useState(false)
  const [showPrinciple, setShowPrinciple] = useState(false)

  const sc = scenarios[sIdx]
  const ch = choiceIdx !== null ? sc.choices[choiceIdx] : null
  const rating = ch ? getRating(ch.score) : null

  const pick = (i) => {
    const c = sc.choices[i]
    setChoiceIdx(i)
    setScore(s => s + c.score)
    setDecisions(d => [...d, { module: sc.module, choice: c.text, tag: c.tag, score: c.score, emoji: c.emoji, consequence: c.consequence }])
    setShowResult(true)
    setShowChart(false)
  }

  const next = async () => {
    setShowPrinciple(false)
    if (sIdx < scenarios.length - 1) {
      setSIdx(s => s + 1)
      setChoiceIdx(null)
      setShowResult(false)
    } else {
      const all = [...decisions]
      const fs = all.reduce((s, d) => s + d.score, 0)
      await saveGameResult({ userId: session.user.id, displayName: profile?.display_name, score: fs, decisions: all })
      navigate('/feedback', { state: { score: fs, decisions: all } })
    }
  }

  const pct = Math.round((sIdx / scenarios.length) * 100)

  return (
    <div style={{ ...S.app, background: BG, minHeight: '100vh' }}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 16, paddingBottom: 24 }}>

        {/* TOP BAR */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ height: 6, background: 'rgba(255,255,255,0.08)', borderRadius: 3, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 3, background: '#00FF87', width: pct + '%', transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#8890A8', marginTop: 4, fontWeight: 500 }}>
              {sIdx + 1} / {scenarios.length}
            </div>
          </div>
          <div style={{ background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.35)', borderRadius: 20, padding: '4px 12px', fontSize: 13, color: '#00FF87', fontWeight: 700 }}>
            {score > 0 ? '+' : ''}{score} pct
          </div>
        </div>

        {/* MODULE BADGE */}
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.25)', borderRadius: 20, padding: '5px 12px', marginBottom: 12 }}>
          <span style={{ fontSize: 14 }}>{sc.moduleIcon}</span>
          <span style={{ fontSize: 11, color: '#00FF87', letterSpacing: 0.5, textTransform: 'uppercase', fontWeight: 600 }}>
            {sc.module.length > 22 ? sc.module.slice(0, 22) + '...' : sc.module}
          </span>
        </div>

        {!showResult ? (
          <>
            {/* PRINCIPIU — colapsabil */}
            {sc.principle && (
              <div style={{ marginBottom: 12 }}>
                <button onClick={() => setShowPrinciple(p => !p)}
                  style={{ width: '100%', background: 'rgba(0,198,255,0.07)', border: '1px solid rgba(0,198,255,0.22)', borderRadius: showPrinciple ? '14px 14px 0 0' : 14, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
                  <span style={{ fontSize: 11, color: '#00C6FF', letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Stiai ca?</span>
                  <span style={{ fontSize: 16, color: '#00C6FF', transform: showPrinciple ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>▾</span>
                </button>
                {showPrinciple && (
                  <div style={{ background: 'rgba(0,198,255,0.05)', border: '1px solid rgba(0,198,255,0.22)', borderTop: 'none', borderRadius: '0 0 14px 14px', padding: '12px 14px' }}>
                    <p style={{ color: '#C8D0E8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{sc.principle}</p>
                  </div>
                )}
              </div>
            )}

            {/* SCENARIU */}
            <div style={{ background: CARD, border: '1px solid ' + BORDER, borderRadius: 16, padding: 16, marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: RED, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700, borderBottom: '1px solid ' + BORDER, paddingBottom: 8 }}>
                {'👤 ' + sc.character}
              </div>
              <p style={{ fontSize: 15, lineHeight: 1.65, margin: 0, color: '#E8EAF4', fontWeight: 500, paddingTop: 8 }}>{sc.situation}</p>
            </div>

            {/* VARIANTE */}
            <div style={{ fontSize: 12, color: RED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Ce faci?</div>
            {sc.choices.map((c, i) => (
              <button key={i} onClick={() => pick(i)} onMouseEnter={hoverOn} onMouseLeave={hoverOff}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: CARD, border: '1px solid ' + BORDER, borderRadius: 14, padding: '13px 14px', color: '#D0D4E8', fontSize: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5, transition: 'all .15s', width: '100%', marginBottom: 8 }}>
                <span style={{ fontSize: 20, flexShrink: 0 }}>{c.emoji}</span>
                <span>{c.text}</span>
              </button>
            ))}
          </>
        ) : ch && rating && (
          <>
            {/* RATING BADGE */}
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: rating.color + '22', border: '1px solid ' + rating.color + '44', borderRadius: 20, padding: '6px 14px', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: rating.color, fontWeight: 600 }}>{rating.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: rating.color, fontFamily: 'DM Mono,monospace' }}>{ch.score > 0 ? '+' : ''}{ch.score} pct</span>
            </div>

            {/* FEEDBACK CARD */}
            <div style={{ background: ch.color + '10', border: '1px solid ' + ch.color + '28', borderRadius: 16, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                <span style={{ fontSize: 24 }}>{ch.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 10, color: ch.color, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>{'Ai ales: ' + ch.tag}</div>
                  <div style={{ fontSize: 12, color: '#A0A8C0', marginTop: 2 }}>{ch.text}</div>
                </div>
              </div>
              <div style={{ background: rating.color + '12', borderRadius: 10, padding: '10px 12px', marginBottom: 10 }}>
                <div style={{ fontSize: 10, color: rating.color, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 5, fontWeight: 700 }}>
                  {ch.score >= 80 ? 'De ce ai primit scor maxim' : ch.score >= 40 ? 'De ce ai primit scor partial' : 'De ce aceasta alegere e riscanta'}
                </div>
                <p style={{ color: '#C8D0E8', fontSize: 13, lineHeight: 1.6, margin: 0 }}>{ch.consequence}</p>
              </div>
              <Stars count={rating.stars} />
            </div>

            {/* CELELALTE VARIANTE — compact */}
            <div style={{ background: CARD, border: '1px solid ' + BORDER, borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
              <div style={{ fontSize: 10, color: RED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700 }}>Celelalte variante:</div>
              {sc.choices.map((c, i) => {
                if (i === choiceIdx) return null
                const r = getRating(c.score)
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 5 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 13 }}>{c.emoji}</span>
                      <span style={{ fontSize: 12, color: '#8890A8' }}>{c.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: 'DM Mono,monospace' }}>{c.score > 0 ? '+' : ''}{c.score}</span>
                  </div>
                )
              })}
            </div>

            {/* GRAFIC — colapsabil */}
            <div style={{ marginBottom: 12 }}>
              <button onClick={() => setShowChart(p => !p)}
                style={{ width: '100%', background: CARD, border: '1px solid ' + BORDER, borderRadius: showChart ? '12px 12px 0 0' : 12, padding: '10px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}>
                <span style={{ fontSize: 10, color: RED, letterSpacing: 2, textTransform: 'uppercase', fontWeight: 700 }}>Proiectie financiara</span>
                <span style={{ fontSize: 16, color: RED, transform: showChart ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform .2s' }}>▾</span>
              </button>
              {showChart && (
                <div style={{ background: CARD, border: '1px solid ' + BORDER, borderTop: 'none', borderRadius: '0 0 12px 12px', padding: '12px 8px' }}>
                  <ResponsiveContainer width="100%" height={110}>
                    <LineChart data={ch.projection.map((v, i) => ({ m: 'L' + (i + 1), v }))}>
                      <XAxis dataKey="m" tick={{ fill: '#555', fontSize: 10 }} axisLine={false} tickLine={false} />
                      <YAxis hide />
                      <Tooltip content={<ChartTip />} />
                      <ReferenceLine y={0} stroke="rgba(255,255,255,.08)" />
                      <Line type="monotone" dataKey="v" stroke={ch.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: ch.color }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>

            {/* BUTON NEXT */}
            <button onClick={next} style={{ background: 'linear-gradient(135deg,' + ch.color + ',' + ch.color + 'bb)', color: '#000', border: 'none', borderRadius: 14, padding: '15px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
              {sIdx < scenarios.length - 1 ? 'Scenariul ' + (sIdx + 2) + '/' + scenarios.length + ' →' : 'Analiza AI finala →'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
