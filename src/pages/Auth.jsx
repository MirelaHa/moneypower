import { useState } from 'react'
import { signIn, signUp } from '../lib/supabase'
import { S, GlowBg, Field, Btn } from '../components/UI'

export default function Auth() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [displayName, setDisplayName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [successMsg, setSuccessMsg] = useState('')

  const validate = () => {
    const e = {}
    if (!email.includes('@')) e.email = 'Email invalid'
    if (mode === 'register') {
      if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) e.username = '3–20 caractere: litere, cifre sau _'
      if (displayName.trim().length < 2) e.displayName = 'Minim 2 caractere'
    }
    if (password.length < 6) e.password = 'Minim 6 caractere'
    if (mode === 'register' && password !== confirm) e.confirm = 'Parolele nu coincid'
    return e
  }

  const handleSubmit = async () => {
    const e = validate()
    if (Object.keys(e).length) { setErrors(e); return }
    setErrors({})
    setLoading(true)
    try {
      if (mode === 'login') {
        await signIn({ email, password })
      } else {
        await signUp({ email, password, username, displayName: displayName.trim() })
        setSuccessMsg('Cont creat! Verifică emailul pentru confirmare.')
      }
    } catch (err) {
      setErrors({ general: err.message })
    }
    setLoading(false)
  }

  const eyeBtn = (
    <button onClick={() => setShowPw(s => !s)}
      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 15, color: '#444', padding: 0 }}>
      {showPw ? '🙈' : '👁️'}
    </button>
  )

  return (
    <div style={{ ...S.app, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
      <GlowBg />
      <div style={{ ...S.wrap, width: '100%', paddingTop: 40, paddingBottom: 60 }}>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ fontSize: 52, marginBottom: 10, filter: 'drop-shadow(0 0 24px rgba(0,255,135,.5))' }}>💰</div>
          <h1 style={{ ...S.h1, fontSize: 28, marginBottom: 4 }}>
            Money<span style={{ color: '#00FF87' }}>Power</span>
          </h1>
          <p style={{ color: '#444', fontSize: 13, margin: 0, fontFamily: 'DM Mono, monospace' }}>
            Simulatorul de educație financiară
          </p>
        </div>

        {/* Toggle */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)', borderRadius: 14, padding: 4, maxWidth: 400, margin: '0 auto 24px' }}>
          {[['login', 'Autentificare'], ['register', 'Cont nou']].map(([m, lbl]) => (
            <button key={m} onClick={() => { setMode(m); setErrors({}); setSuccessMsg('') }}
              style={{ flex: 1, padding: '10px', borderRadius: 11, border: 'none', background: mode === m ? 'rgba(255,255,255,.1)' : 'transparent', color: mode === m ? '#fff' : '#555', fontWeight: mode === m ? 700 : 400, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', transition: 'all .2s' }}>
              {lbl}
            </button>
          ))}
        </div>

        {/* Form */}
        <div style={{ maxWidth: 400, margin: '0 auto' }}>
          {errors.general && (
            <div style={{ background: 'rgba(255,77,77,.1)', border: '1px solid rgba(255,77,77,.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#FF6B6B', fontSize: 14 }}>
              {errors.general}
            </div>
          )}
          {successMsg && (
            <div style={{ background: 'rgba(0,255,135,.08)', border: '1px solid rgba(0,255,135,.25)', borderRadius: 12, padding: '12px 16px', marginBottom: 16, color: '#00FF87', fontSize: 14 }}>
              {successMsg}
            </div>
          )}

          <Field label="Email" type="email" value={email} onChange={setEmail} placeholder="ex: ion@gmail.com" error={errors.email} autoFocus />

          {mode === 'register' && <>
            <Field label="Nume de utilizator" value={username} onChange={setUsername} placeholder="ex: ion_popescu" error={errors.username} />
            <Field label="Nume afișat în joc" value={displayName} onChange={setDisplayName} placeholder="ex: Ion Popescu" error={errors.displayName} />
          </>}

          <Field label="Parolă" type={showPw ? 'text' : 'password'} value={password} onChange={setPassword} placeholder="Minim 6 caractere" error={errors.password} right={eyeBtn}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()} />

          {mode === 'register' && (
            <Field label="Confirmă parola" type={showPw ? 'text' : 'password'} value={confirm} onChange={setConfirm} placeholder="Repetă parola" error={errors.confirm} />
          )}

          <Btn onClick={handleSubmit} disabled={loading} color="#00FF87" style={{ marginTop: 4 }}>
            {loading ? '⏳ Se procesează...' : mode === 'login' ? 'Intră în cont →' : 'Creează contul →'}
          </Btn>

          {mode === 'register' && (
            <p style={{ color: '#383850', fontSize: 11, textAlign: 'center', marginTop: 14, fontFamily: 'DM Mono, monospace', lineHeight: 1.6 }}>
              Numele afișat și scorul tău vor apărea în clasamentul global.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
