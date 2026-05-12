import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { S, GlowBg, Btn, NavBar, grade } from '../components/UI'

const getRating = (score) => {
  if (score >= 80) return { label: 'Excelent', color: '#00FF87', stars: 5 }
  if (score >= 40) return { label: 'Acceptabil', color: '#FFB800', stars: 3 }
  return { label: 'De evitat', color: '#FF4D4D', stars: 1 }
}

const Stars = ({ count }) => (
  <div style={{ display: 'flex', gap: 2 }}>
    {[1,2,3,4,5].map(i => (
      <span key={i} style={{ fontSize: 13, color: i <= count ? '#FFB800' : 'rgba(255,255,255,0.12)' }}>★</span>
    ))}
  </div>
)

export default function AIFeedback() {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [ai, setAi] = useState(null)
  const [loading, setLoading] = useState(true)

  const score = state?.score || 0
  const decisions = state?.decisions || []
  const g = grade(score)

  useEffect(() => {
    fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 800,
        messages: [{
          role: 'user',
          content: 'Expert financiar roman. Decizii: ' + decisions.map(d => d.module + ':' + d.score).join(',') + ' Scor:' + score + '/1000. JSON fara backtick-uri: {"profileTitle":"x","profileEmoji":"x","summary":"x","strengths":["x","x","x"],"improvements":["x","x"],"actionPlan":["x","x","x"],"motivationalMessage":"x"}'
        }]
      })
    }).then(r => r.json()).then(data => {
      const txt = (data.content || []).map(c => c.text || '').join('').replace(/```json|```/g, '').trim()
      setAi(JSON.parse(txt))
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 32, paddingBottom: 100 }}>

        <div style={{ textAlign: 'center', marginBottom: 24 }}>
          <div style={{ fontSize: 44, marginBottom: 8 }}>🧠</div>
          <div style={{ ...S.tag, color: g.c, marginBottom: 6 }}>Analiza AI Personalizata</div>
          <h1 style={{ fontSize: 26, fontWeight: 800, margin: '0 0 4px', letterSpacing: -0.5 }}>
            {'Scorul tau: '}<span style={{ color: g.c }}>{score}</span>
          </h1>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#444' }}>{g.i + ' ' + g.l}</div>
        </div>

        {loading && (
          <div style={{ ...S.card, textAlign: 'center', padding: 40, marginBottom: 16 }}>
            <p style={{ color: '#444', fontSize: 14, margin: 0 }}>Claude iti analizeaza profilul financiar...</p>
          </div>
        )}

        {ai && (
          <div>
            <div style={{ background: g.c + '12', border: '1px solid ' + g.c + '28', borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 34 }}>{ai.profileEmoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{ai.profileTitle}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: g.c, marginTop: 2 }}>Profilul tau financiar</div>
                </div>
              </div>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{ai.summary}</p>
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#00FF87', marginBottom: 12 }}>Puncte forte</div>
              {(ai.strengths || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#00FF87' }}>+</span>
                  <span style={{ color: '#ccc', fontSize: 14 }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#FFB800', marginBottom: 12 }}>Zone de imbunatatit</div>
              {(ai.improvements || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                  <span style={{ color: '#FFB800' }}>!</span>
                  <span style={{ color: '#ccc', fontSize: 14 }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#00C6FF', marginBottom: 12 }}>Plan de actiune</div>
              {(ai.actionPlan || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 8 }}>
                  <div style={{ background: '#00C6FF22', color: '#00C6FF', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontFamily: 'DM Mono,monospace', flexShrink: 0 }}>{'P' + (i + 1)}</div>
                  <span style={{ color: '#ccc', fontSize: 14 }}>{s}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ ...S.card, marginBottom: 16 }}>
          <div style={{ ...S.tag, marginBottom: 14 }}>Toate deciziile tale</div>
          {decisions.map((d, i) => {
            const r = getRating(d.score)
            return (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '12px 0', borderBottom: i < decisions.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span style={{ fontSize: 14 }}>{d.emoji}</span>
                    <div style={{ fontSize: 10, color: '#444', fontFamily: 'DM Mono,monospace' }}>{d.module}</div>
                  </div>
                  <div style={{ fontSize: 13, color: '#aaa', lineHeight: 1.4, marginBottom: 4 }}>{d.choice}</div>
                  <Stars count={r.stars} />
                </div>
                <div style={{ flexShrink: 0, textAlign: 'right' }}>
                  <div style={{ display: 'inline-block', background: r.color + '22', border: '1px solid ' + r.color + '44', borderRadius: 10, padding: '3px 10px', fontSize: 11, color: r.color, marginBottom: 4 }}>{r.label}</div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: d.score > 0 ? '#00FF87' : '#FF4D4D', fontFamily: 'DM Mono,monospace' }}>{d.score > 0 ? '+' : ''}{d.score}</div>
                </div>
              </div>
            )
          })}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 14, marginTop: 4, borderTop: '1px solid rgba(255,255,255,0.08)' }}>
            <span style={{ fontSize: 13, color: '#555', fontFamily: 'DM Mono,monospace' }}>Total</span>
            <span style={{ fontSize: 18, fontWeight: 800, color: g.c, fontFamily: 'DM Mono,monospace' }}>{score} / 1000</span>
          </div>
        </div>

        {ai && (
          <div style={{ background: '#00FF8708', border: '1px solid #00FF8718', borderRadius: 16, padding: 18, marginBottom: 20, textAlign: 'center' }}>
            <p style={{ color: '#ccc', fontSize: 15, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>{ai.motivationalMessage}</p>
          </div>
        )}

        <Btn onClick={() => navigate('/')} color={g.c}>{'Vezi profilul tau'}</Btn>
      </div>
      <NavBar active={'/feedback'} />
    </div>
  )
}
