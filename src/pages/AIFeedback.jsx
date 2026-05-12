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
      const lines = decisions.map(d => d.module + ': ' + d.choice + ' ' + d.score).join(', ')
      const prompt = 'Esti expert financiar roman. Analizeaza: ' + lines + ' Scor: ' + score + '/1000. Raspunde JSON: {"profileTitle":"titlu","profileEmoji":"emoji","summary":"rezumat","strengths":["s1","s2","s3"],"improvements":["i1","i2"],"actionPlan":["p1","p2","p3"],"motivationalMessage":"mesaj"}'
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{ role: 'user', content: prompt }]
        })
      })
      const data = await res.json()
      const txt = (data.content || []).map(c => c.text || '').join('').replace(/```json|```/g, '').trim()
      setAi(JSON.parse(txt))
    } catch (e) {
      setError('Eroare la generarea analizei.')
    }
    setLoading(false)
  }

  return (
    <div style={S.app}>
      <GlowBg />
      <div style={{ ...S.wrap, paddingTop: 32, paddingBottom: 100 }}>
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🧠</div>
          <div style={{ ...S.tag, color: g.c, marginBottom: 6 }}>Analiza AI</div>
          <h1 style={{ ...S.h1, fontSize: 28, marginBottom: 6 }}>
            {'Scorul tau: '}<span style={{ color: g.c }}>{score}</span>
          </h1>
          <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 12, color: '#444' }}>
            {g.i + ' ' + g.l}
          </div>
        </div>

        {loading && (
          <div style={{ ...S.card, textAlign: 'center', padding: 40, marginBottom: 16 }}>
            <p style={{ color: '#444', fontSize: 14, margin: 0 }}>Se genereaza analiza...</p>
          </div>
        )}

        {error && (
          <div style={{ background: '#FF4D4D11', border: '1px solid #FF4D4D30', borderRadius: 16, padding: 16, marginBottom: 16 }}>
            <p style={{ color: '#FF6B6B', margin: '0 0 10px', fontSize: 14 }}>{error}</p>
            <Btn onClick={generateAI} color="#FF6B6B">Incearca din nou</Btn>
          </div>
        )}

        {ai && (
          <div>
            <div style={{ background: g.c + '12', border: '1px solid ' + g.c + '28', borderRadius: 20, padding: 20, marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontSize: 34 }}>{ai.profileEmoji}</span>
                <div>
                  <div style={{ fontSize: 17, fontWeight: 700 }}>{ai.profileTitle}</div>
                  <div style={{ fontFamily: 'DM Mono,monospace', fontSize: 11, color: g.c, marginTop: 2 }}>Profilul tau</div>
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
                  <div style={{ background: '#00C6FF22', color: '#00C6FF', borderRadius: 8, padding: '2px 8px', fontSize: 11, fontFamily: 'DM Mono,monospace', flexShrink: 0 }}>
                    {'P' + (i + 1)}
                  </div>
                  <span style={{ color: '#ccc', fontSize: 14
