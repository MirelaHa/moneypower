import { useState, useEffect } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { S, GlowBg, Btn, NavBar, grade } from '../components/UI'

export default function AIFeedback({ session }) {
  const { state } = useLocation()
  const navigate = useNavigate()
  const [ai, setAi] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const score = state?.score || 0
  const decisions = state?.decisions || []
  const g = grade(score)

  useEffect(() => { generateAI() }, [])

  const generateAI = async () => {
    setLoading(true)
    setError(null)
    try {
      const lines = decisions.map(d => d.module + ': "' + d.choice + '" [' + d.tag + '] ' + (d.score > 0 ? '+' : '') + d.score + ' pct').join('\n')
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: 'Esti expert in educatie financiara pentru tineri din Romania. Analizeaza deciziile utilizatorului si ofera feedback personalizat si motivant in romana.\n\nDecizii:\n' + lines + '\n\nScor: ' + score + '/1000\n\nRaspunde EXCLUSIV JSON valid (fara backtick-uri):\n{"profileTitle":"titlu 2-4 cuvinte","profileEmoji":"emoji","summary":"2-3 propozitii","strengths":["s1","s2","s3"],"improvements":["i1","i2"],"actionPlan":["pas1","pas2","pas3"],"motivationalMessage":"mesaj"}'
          }]
        })
      })
      const data = await res.json()
      const txt = (data.content || []).map(c => c.text || '').join('').replace(/```json|```/g, '').trim()
      setAi(JSON.parse(txt))
    } catch (e) {
      setError('Nu am putut genera analiza. Incearca din nou.')
    }
    setLoading(false)
  }

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 32, paddingBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <div style={{ ...S.tag, color: g.c, marginBottom: 6 }}>Analiza AI Personalizata</div>
          <h1 style={{ ...S.h1, fontSize: 28, marginBottom: 6 }}>
            Scorul tau: <span style={{ color: g.c }}>{score}</span>
          </h1>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#444' }}>
            {g.i} {g.l}
          </div>
        </div>

        {loading && (
          <div style={{ ...S.card, textAlign: 'center', padding: 40, marginBottom: 16 }}>
            <p style={{ color: '#444', fontSize: 14, margin: 0 }}>Claude iti analizeaza profilul...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FF4D4D11', border: '1px solid #FF4D4D30', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ color: '#FF6B6B', margin: '0 0 10px', fontSize: 14 }}>{error}</p>
            <Btn onClick={generateAI} color="#FF6B6B" style={{ padding: '10px', fontSize: 13 }}>
              Incearca din nou
            </Btn>
          </div>
        )}

        {ai && (
          <div>
            <div style={{ background: g.c + '12', border: '1px solid ' + g.c + '28', borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 34 }}>{ai.profileEmoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{ai.profileTitle}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: g.c, marginTop: 2 }}>
                    Profilul tau financiar
                  </div>
                </div>
              </div>
              <p style={{ color: '#ccc', fontSize: 14, lineHeight: 1.7, margin: 0 }}>{ai.summary}</p>
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#00FF87', marginBottom: 12 }}>Puncte forte</div>
              {(ai.strengths || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 2 ? 10 : 0 }}>
                  <span style={{ color: '#00FF87', flexShrink: 0 }}>+</span>
                  <span style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#FFB800', marginBottom: 12 }}>Zone de imbunatatit</div>
              {(ai.improvements || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 10, marginBottom: i < 1 ? 10 : 0 }}>
                  <span style={{ color: '#FFB800', flexShrink: 0 }}>!</span>
                  <span style={{ color: '#ccc', fontSize: 14, lineHeight: 1.6 }}>{s}</span>
                </div>
              ))}
            </div>

            <div style={{ ...S.card, marginBottom: 14 }}>
              <div style={{ ...S.tag, color: '#00C6FF', marginBottom: 12 }}>Plan de actiune</div>
              {(ai.actionPlan || []).map((s, i) => (
                <div key={i} style={{ display: 'flex', gap: 12, marginBottom: i < 2 ? 12 : 0 }}>
                  <div style={{ background: '#00C6FF22', color: '#00C6FF', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontFamily: 'D
