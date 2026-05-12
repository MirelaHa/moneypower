// ── STILURI GLOBALE ──────────────────────────
export const S = {
  app: {
    minHeight: '100vh',
    background: '#080810',
    color: '#fff',
    fontFamily: "'Syne', sans-serif",
    overflowX: 'hidden',
  },
  wrap: {
    position: 'relative',
    zIndex: 1,
    maxWidth: 680,
    margin: '0 auto',
    padding: '0 16px',
  },
  card: {
    background: 'rgba(255,255,255,.04)',
    border: '1px solid rgba(255,255,255,.08)',
    borderRadius: 20,
    padding: 20,
  },
  tag: {
    fontSize: 10,
    letterSpacing: 3,
    textTransform: 'uppercase',
    fontFamily: 'DM Mono, monospace',
    color: '#555',
  },
  h1: {
    fontSize: 'clamp(28px,5vw,44px)',
    fontWeight: 800,
    letterSpacing: -1,
    lineHeight: 1.1,
    margin: 0,
  },
  h2: {
    fontSize: 22,
    fontWeight: 700,
    margin: 0,
    letterSpacing: -0.5,
  },
  mono: { fontFamily: 'DM Mono, monospace' },
}

export const grade = (s) =>
  s >= 700 ? { l: 'Expert',    i: '🏆', c: '#00FF87' } :
  s >= 500 ? { l: 'Priceput',  i: '📈', c: '#00C6FF' } :
  s >= 300 ? { l: 'Conștient', i: '💡', c: '#FFB800' } :
             { l: 'Începător', i: '🌱', c: '#FF6B6B' }

// ── COMPONENTE ───────────────────────────────

export const GlowBg = () => (
  <>
    <link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet" />
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse at 15% 15%,rgba(0,198,255,.07) 0%,transparent 55%),radial-gradient(ellipse at 85% 85%,rgba(0,255,135,.06) 0%,transparent 55%)', pointerEvents: 'none', zIndex: 0 }} />
  </>
)

export const Field = ({ label, type = 'text', value, onChange, error, placeholder, autoFocus, right, onKeyDown }) => (
  <div style={{ marginBottom: 16 }}>
    <label style={{ display: 'block', fontSize: 10, color: '#555', letterSpacing: 3, textTransform: 'uppercase', fontFamily: 'DM Mono, monospace', marginBottom: 7 }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input
        type={type} value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder} autoFocus={autoFocus} onKeyDown={onKeyDown}
        style={{ width: '100%', background: error ? 'rgba(255,77,77,.07)' : 'rgba(255,255,255,.05)', border: `1px solid ${error ? 'rgba(255,77,77,.4)' : 'rgba(255,255,255,.1)'}`, borderRadius: 13, padding: right ? '13px 44px 13px 16px' : '13px 16px', color: '#fff', fontSize: 15, outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box', transition: 'border-color .2s' }}
      />
      {right && <span style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)' }}>{right}</span>}
    </div>
    {error && <p style={{ color: '#FF6B6B', fontSize: 12, margin: '5px 0 0 2px' }}>{error}</p>}
  </div>
)

export const Btn = ({ children, onClick, disabled, color = '#00FF87', style = {} }) => {
  const dark = color === '#00FF87' || color === '#FFB800'
  return (
    <button onClick={onClick} disabled={disabled}
      style={{ background: disabled ? 'rgba(255,255,255,.06)' : `linear-gradient(135deg,${color},${color}bb)`, color: disabled ? '#444' : dark ? '#000' : '#fff', border: 'none', borderRadius: 14, padding: '14px 20px', fontSize: 15, fontWeight: 700, cursor: disabled ? 'not-allowed' : 'pointer', fontFamily: 'inherit', width: '100%', transition: 'opacity .15s', ...style }}>
      {children}
    </button>
  )
}

export const NavBar = ({ active }) => {
  const tabs = [
    { path: '/',            icon: '📊', label: 'Profil'    },
    { path: '/game',        icon: '🎮', label: 'Joacă'     },
    { path: '/leaderboard', icon: '🏆', label: 'Top'       },
    { path: '/challenges',  icon: '⚡', label: 'Challenges' },
  ]
  return (
    <div style={{ position: 'fixed', bottom: 0, left: 0, right: 0, background: 'rgba(6,6,14,.97)', backdropFilter: 'blur(20px)', borderTop: '1px solid rgba(255,255,255,.06)', display: 'flex', justifyContent: 'space-around', padding: '8px 0 14px', zIndex: 100 }}>
      {tabs.map(t => {
        const isActive = active === t.path
        return (
          <a key={t.path} href={t.path}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, textDecoration: 'none', padding: '4px 12px', opacity: isActive ? 1 : 0.3, transition: 'opacity .15s' }}>
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span style={{ fontSize: 9, color: isActive ? '#00FF87' : '#666', fontFamily: 'DM Mono, monospace' }}>{t.label}</span>
          </a>
        )
      })}
    </div>
  )
}

export const ChartTip = ({ active, payload }) =>
  active && payload?.length
    ? <div style={{ background: '#12122a', border: '1px solid #2a2a4a', borderRadius: 8, padding: '6px 12px', fontFamily: 'DM Mono, monospace', fontSize: 12, color: '#fff' }}>{payload[0].value?.toLocaleString('ro-RO')} RON</div>
    : null
