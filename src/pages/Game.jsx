import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts'
import { saveGameResult } from '../lib/supabase'
import { SCENARIOS } from '../lib/data'
import { S, GlowBg, ChartTip, grade } from '../components/UI'

const hoverOn = (e) => {
  e.currentTarget.style.background = 'rgba(0,255,135,0.06)'
  e.currentTarget.style.borderColor = 'rgba(0,255,135,0.25)'
  e.currentTarget.style.transform = 'translateX(3px)'
}
const hoverOff = (e) => {
  e.currentTarget.style.background = '#1A1D2A'
  e.currentTarget.style.borderColor = '#252838'
  e.currentTarget.style.transform = 'translateX(0)'
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

export default function Game({ session, profile }) {
  const navigate = useNavigate()
  const [scenarios] = useState(() => shuffle(SCENARIOS))
  const [sIdx, setSIdx] = useState(0)
  const [choiceIdx, setChoiceIdx] = useState(null)
  const [showResult, setShowResult] = useState(false)
  const [score, setScore] = useState(0)
  const [decisions, setDecisions] = useState([])
  const [anim, setAnim] = useState(true)

  const sc = scenarios[sIdx]
  const ch = choiceIdx !== null ? sc.choices[choiceIdx] : null
  const rating = ch ? getRating(ch.score) : null

  const pick = (i) => {
    const c = sc.choices[i]
    setChoiceIdx(i)
    setScore(s => s + c.score)
    setDecisions(d => [...d, { module: sc.module, choice: c.text, tag: c.tag, score: c.score, emoji: c.emoji, consequence: c.consequence }])
    setShowResult(true)
  }

  const next = async () => {
    setAnim(false)
    setTimeout(async () => {
      if (sIdx < scenarios.length - 1) {
        setSIdx(s => s + 1)
        setChoiceIdx(null)
        setShowResult(false)
        setAnim(true)
      } else {
        const all = [...decisions]
        const fs = all.reduce((s, d) => s + d.score, 0)
        await saveGameResult({ userId: session.user.id, displayName: profile?.display_name, score: fs, decisions: all })
        navigate('/feedback', { state: { score: fs, decisions: all } })
      }
    }, 200)
  }

  const BG = '#12151E'
  const CARD = '#1A1D2A'
  const BORDER = '#252838'
  const RED = '#FF4D6A'

  return (
    <div style={{ ...S.app, background: BG }}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 24, paddingBottom: 32 }}>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div style={{ flex: 1, marginRight: 12 }}>
            <div style={{ height: 8, background: 'rgba(255,255,255,0.08)', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 4, background: '#00FF87', width: Math.round((sIdx / scenarios.length) * 100) + '%', transition: 'width .4s' }} />
            </div>
            <div style={{ fontSize: 11, color: '#8890A8', marginTop: 5, fontWeight: 500 }}>
              {sIdx + 1} din {scenarios.length} scenarii
            </div>
          </div>
          <div style={{ background: 'rgba(0,255,135,0.12)', border: '1px solid rgba(0,255,135,0.35)', borderRadius: 20, padding: '5px 14px', fontSize: 13, color: '#00FF87', fontWeight: 700 }}>
            {score > 0 ? '+' : ''}{score} pct
          </div>
        </div>

        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(0,255,135,0.08)', border: '1px solid rgba(0,255,135,0.25)', borderRadius: 20, padding: '7px 16px', marginBottom: 14 }}>
          <span>{sc.moduleIcon}</span>
          <span style={{ fontSize: 12, color: '#00FF87', letterSpacing: 1, textTransform: 'uppercase', fontWeight: 600 }}>{sc.module}</span>
        </div>

        {sc.principle && (
          <div style={{ background: 'rgba(0,198,255,0.07)', border: '1px solid rgba(0,198,255,0.22)', borderRadius: 16, padding: '14px 16px', marginBottom: 14 }}>
            <div style={{ fontSize: 10, color: '#00C6FF', letterSpacing: 2.5, textTransform: 'uppercase', marginBottom: 7, fontWeight: 700 }}>Stiai ca?</div>
            <p style={{ color: '#C8D0E8', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{sc.principle}</p>
          </div>
        )}

        <div style={{ background: CARD, border: '1px solid ' + BORDER, borderRadius: 16, padding: 16, marginBottom: 16, opacity: anim ? 1 : 0, transition: 'opacity .2s' }}>
          <div style={{ fontSize: 11, color: RED, letterSpacing: 1.5, textTransform: 'uppercase', marginBottom: 8, fontWeight: 700, borderBottom: '1px solid ' + BORDER, paddingBottom: 8 }}>
            {'👤 ' + sc.character}
          </div>
          <p style={{ fontSize: 15, lineHeight: 1.7, margin: 0, color: '#E8EAF4', fontWeight: 500, paddingTop: 8 }}>{sc.situation}</p>
        </div>

        {showResult && ch && rating ? (
          <div style={{ opacity: anim ? 1 : 0, transition: 'opacity .2s' }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: rating.color + '22', border: '1px solid ' + rating.color + '44', borderRadius: 20, padding: '6px 14px', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: rating.color, fontWeight: 600 }}>{rating.label}</span>
              <span style={{ fontSize: 12, fontWeight: 700, color: rating.color, fontFamily: 'DM Mono,monospace' }}>{ch.score > 0 ? '+' : ''}{ch.score} pct</span>
            </div>

            <div style={{ background: ch.color + '10', border: '1px solid ' + ch.color + '28', borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                <span style={{ fontSize: 26 }}>{ch.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 11, color: ch.color, letterSpacing: 2, textTransform: 'uppercase', fontFamily: 'DM Mono,monospace', fontWeight: 700 }}>{'Ai ales: ' + ch.tag}</div>
                  <div style={{ fontSize: 13, color: '#C8D0E8', marginTop: 2 }}>{ch.text}</div>
                </div>
              </div>
              <div style={{ background: rating.color + '12', borderRadius: 10, padding: '10px 14px', marginBottom: 12 }}>
                <div style={{ fontSize: 10, color: rating.color, fontFamily: 'DM Mono,monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 6, fontWeight: 700 }}>
                  {ch.score >= 80 ? 'De ce ai primit scor maxim' : ch.score >= 40 ? 'De ce ai primit scor partial' : 'De ce aceasta alegere e riscanta'}
                </div>
                <p style={{ color: '#C8D0E8', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{ch.consequence}</p>
              </div>
              <Stars count={rating.stars} />
            </div>

            <div style={{ background: CARD, border: '1px solid ' + BORDER, borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: RED, fontFamily: 'DM Mono,monospace', letterSpacing: 2, textTransform: 'uppercase', marginBottom: 10, fontWeight: 700 }}>Celelalte variante ofereau:</div>
              {sc.choices.map((c, i) => {
                if (i === choiceIdx) return null
                const r = getRating(c.score)
                return (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span style={{ fontSize: 14 }}>{c.emoji}</span>
                      <span style={{ fontSize: 12, color: '#8890A8' }}>{c.tag}</span>
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: r.color, fontFamily: 'DM Mono,monospace' }}>{c.score > 0 ? '+' : ''}{c.score} pct</span>
                  </div>
                )
              })}
            </div>

            <div style={{ background: CARD, border: '1px solid ' + BORDER, borderRadius: 16, padding: '18px 12px 14px', marginBottom: 14 }}>
              <div style={{ fontSize: 11, color: RED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 12, paddingLeft: 4, fontWeight: 700 }}>Proiectie financiara</div>
              <ResponsiveContainer width="100%" height={120}>
                <LineChart data={ch.projection.map((v, i) => ({ m: 'L' + (i + 1), v }))}>
                  <XAxis dataKey="m" tick={{ fill: '#555', fontSize: 10, fontFamily: 'DM Mono' }} axisLine={false} tickLine={false} />
                  <YAxis hide />
                  <Tooltip content={<ChartTip />} />
                  <ReferenceLine y={0} stroke="rgba(255,255,255,.08)" />
                  <Line type="monotone" dataKey="v" stroke={ch.color} strokeWidth={2.5} dot={false} activeDot={{ r: 4, fill: ch.color }} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <button onClick={next} style={{ background: 'linear-gradient(135deg,' + ch.color + ',' + ch.color + 'bb)', color: '#000', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', width: '100%' }}>
              {sIdx < scenarios.length - 1 ? 'Scenariul ' + (sIdx + 2) + '/' + scenarios.length + ' →' : 'Analiza AI finala →'}
            </button>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 9, opacity: anim ? 1 : 0, transition: 'opacity .2s' }}>
            <div style={{ fontSize: 12, color: RED, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 4, fontWeight: 700 }}>Ce faci?</div>
            {sc.choices.map((c, i) => (
              <button key={i} onClick={() => pick(i)} onMouseEnter={hoverOn} onMouseLeave={hoverOff}
                style={{ display: 'flex', alignItems: 'center', gap: 12, background: CARD, border: '1px solid ' + BORDER, borderRadius: 14, padding: '14px 16px', color: '#D0D4E8', fontSize: 14, textAlign: 'left', cursor: 'pointer', fontFamily: 'inherit', lineHeight: 1.5, transition: 'all .15s', width: '100%' }}>
                <span style={{ fontSize: 22, flexShrink: 0 }}>{c.emoji}</span>
                <span>{c.text}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
