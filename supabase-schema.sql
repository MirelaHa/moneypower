-- =============================================
-- MoneyPower — Schema Supabase
-- Rulează acest SQL în Supabase > SQL Editor
-- =============================================

-- 1. PROFILES (date utilizator)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  display_name text not null,
  games_played int default 0,
  best_score int default 0,
  created_at timestamptz default now()
);

-- Activează Row Level Security
alter table public.profiles enable row level security;

-- Politici: fiecare user vede/modifică doar profilul său
create policy "Utilizatorii îşi văd propriul profil"
  on public.profiles for select using (auth.uid() = id);

create policy "Utilizatorii îşi actualizează propriul profil"
  on public.profiles for update using (auth.uid() = id);

create policy "Username-urile sunt publice (pentru verificare unicitate)"
  on public.profiles for select using (true);

-- 2. GAME_RESULTS (istoricul jocurilor)
create table public.game_results (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade,
  display_name text not null,
  score int not null,
  decisions jsonb,
  played_at timestamptz default now()
);

alter table public.game_results enable row level security;

create policy "Utilizatorii îşi văd propriile rezultate"
  on public.game_results for select using (auth.uid() = user_id);

create policy "Utilizatorii îşi inserează rezultatele"
  on public.game_results for insert with check (auth.uid() = user_id);

-- 3. LEADERBOARD (view public pentru clasament)
create or replace view public.leaderboard as
  select
    p.display_name,
    p.best_score,
    p.games_played,
    p.created_at
  from public.profiles p
  where p.best_score > 0
  order by p.best_score desc
  limit 20;

-- 4. USER_CHALLENGES (challengeuri bifate)
create table public.user_challenges (
  user_id uuid references public.profiles(id) on delete cascade,
  challenge_id int not null,
  completed_at timestamptz default now(),
  primary key (user_id, challenge_id)
);

alter table public.user_challenges enable row level security;

create policy "Utilizatorii îşi gestionează propriile challengeuri"
  on public.user_challenges for all using (auth.uid() = user_id);

-- 5. Trigger: creează profil automat la înregistrare
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 6. Trigger: actualizează best_score după fiecare joc
create or replace function public.update_best_score()
returns trigger as $$
begin
  update public.profiles
  set
    best_score = greatest(best_score, new.score),
    games_played = games_played + 1
  where id = new.user_id;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_game_result_inserted
  after insert on public.game_results
  for each row execute procedure public.update_best_score();
