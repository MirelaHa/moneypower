import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { S, GlowBg, Btn, NavBar, grade } from '../components/UI'

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
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>{'🧠'}</div>
          <div style={{ ...S.tag, color: g.c, marginBottom: 6 }}>{'Analiza AI'}</div>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: '0 0 6px' }}>
            {'Scorul tau: '}
            <span style={{ color: g.c }}>{score}</span>
          </h1>
        </div>

        {loading && (
          <div style={{ ...S.card, textAlign: 'center', padding: 40 }}>
            <p style={{ color: '#444', margin: 0 }}>{'Se genereaza analiza...'}</p>
          </div>
        )}

        {ai && (
          <div>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{ai.profileEmoji + ' ' + ai.profileTitle}</div>
              <p style={{ color: '#ccc', fontSize: 14, margin: 0 }}>{ai.summary}</p>
            </div>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#00FF87', marginBottom: 10 }}>{'Puncte forte'}</div>
              {(ai.strengths || []).map((s, i) => (
                <p key={i} style={{ color: '#ccc', fontSize: 14, margin: '0 0 6px' }}>{'+ ' + s}</p>
              ))}
            </div>
            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#FFB800', marginBottom: 10 }}>{'De imbunatatit'}</div>
              {(ai.improvements || []).map((s, i) => (
                <p key={i} style={{ color: '#ccc', fontSize: 14, margin: '0 0 6px' }}>{'! ' + s}</p>
              ))}
            </div>
            <div style={{ ...S.card, marginBottom: 20 }}>
              <div style={{ ...S.tag, color: '#00C6FF', marginBottom: 10 }}>{'Plan de actiune'}</div>
              {(ai.actionPlan || []).map((s, i) => (
                <p key={i} style={{ color: '#ccc', fontSize: 14, margin: '0 0 6px' }}>{'P' + (i + 1) + ': ' + s}</p>
              ))}
            </div>
            <div style={{ background: '#00FF8708', border: '1px solid #00FF8718', borderRadius: 16, padding: 18, marginBottom: 20, textAlign: 'center' }}>
              <p style={{ color: '#ccc', fontSize: 14, margin: 0, fontStyle: 'italic' }}>{ai.motivationalMessage}</p>
            </div>
          </div>
        )}

        <Btn onClick={() => navigate('/')} color={g.c}>{'Vezi profilul tau'}</Btn>
      </div>
      <NavBar active={'/feedback'} />
    </div>
  )
}
