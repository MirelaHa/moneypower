import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { supabase, getProfile } from './lib/supabase'
import Auth from './pages/Auth'
import Dashboard from './pages/Dashboard'
import Game from './pages/Game'
import AIFeedback from './pages/AIFeedback'
import Leaderboard from './pages/Leaderboard'
import Challenges from './pages/Challenges'

export default function App() {
  const [session, setSession] = useState(undefined) // undefined = loading
  const [profile, setProfile] = useState(null)

  useEffect(() => {
    // Sesiune curentă
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
    })

    // Listener pentru schimbări auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) loadProfile(session.user.id)
      else setProfile(null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const loadProfile = async (userId) => {
    const p = await getProfile(userId)
    setProfile(p)
  }

  // Loading
  if (session === undefined) return (
    <div style={{ minHeight: '100vh', background: '#080810', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <span style={{ color: '#00FF87', fontFamily: 'monospace', fontSize: 14 }}>Se încarcă...</span>
    </div>
  )

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={!session ? <Auth /> : <Navigate to="/" />} />
        <Route path="/" element={session ? <Dashboard session={session} profile={profile} onProfileUpdate={setProfile} /> : <Navigate to="/auth" />} />
        <Route path="/game" element={session ? <Game session={session} profile={profile} /> : <Navigate to="/auth" />} />
        <Route path="/feedback" element={session ? <AIFeedback session={session} /> : <Navigate to="/auth" />} />
        <Route path="/leaderboard" element={session ? <Leaderboard session={session} profile={profile} /> : <Navigate to="/auth" />} />
        <Route path="/challenges" element={session ? <Challenges session={session} /> : <Navigate to="/auth" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  )
}
