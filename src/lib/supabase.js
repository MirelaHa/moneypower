import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// ── AUTH ──────────────────────────────────────

export const signUp = async ({ email, password, username, displayName }) => {
  // 1. Check username uniqueness
  const { data: existing } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', username.toLowerCase())
    .single()

  if (existing) throw new Error('Acest username este deja folosit')

  // 2. Create auth user
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username: username.toLowerCase(), display_name: displayName }
    }
  })
  if (error) throw new Error(error.message)
  return data
}

export const signIn = async ({ email, password }) => {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw new Error('Email sau parolă incorectă')
  return data
}

export const signOut = async () => {
  await supabase.auth.signOut()
}

export const getSession = async () => {
  const { data } = await supabase.auth.getSession()
  return data.session
}

// ── PROFILE ──────────────────────────────────

export const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single()
  if (error) return null
  return data
}

export const upsertProfile = async (profile) => {
  const { error } = await supabase
    .from('profiles')
    .upsert(profile, { onConflict: 'id' })
  if (error) throw new Error(error.message)
}

// ── GAME HISTORY ─────────────────────────────

export const saveGameResult = async ({ userId, displayName, score, decisions }) => {
  const { error } = await supabase
    .from('game_results')
    .insert({
      user_id: userId,
      display_name: displayName,
      score,
      decisions,
      played_at: new Date().toISOString()
    })
  if (error) throw new Error(error.message)
}

export const getGameHistory = async (userId) => {
  const { data, error } = await supabase
    .from('game_results')
    .select('*')
    .eq('user_id', userId)
    .order('played_at', { ascending: false })
    .limit(8)
  if (error) return []
  return data
}

// ── LEADERBOARD ──────────────────────────────

export const getLeaderboard = async () => {
  const { data, error } = await supabase
    .from('leaderboard')
    .select('*')
    .order('best_score', { ascending: false })
    .limit(20)
  if (error) return []
  return data
}

// ── CHALLENGES ───────────────────────────────

export const getChallenges = async (userId) => {
  const { data } = await supabase
    .from('user_challenges')
    .select('challenge_id')
    .eq('user_id', userId)
  return data ? data.map(d => d.challenge_id) : []
}

export const toggleChallenge = async (userId, challengeId, completed) => {
  if (completed) {
    await supabase.from('user_challenges').insert({ user_id: userId, challenge_id: challengeId })
  } else {
    await supabase.from('user_challenges').delete()
      .eq('user_id', userId).eq('challenge_id', challengeId)
  }
}
