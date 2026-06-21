
-- Enums
CREATE TYPE public.reaction_type AS ENUM ('love', 'fine', 'dislike');
CREATE TYPE public.media_type AS ENUM ('movie', 'tv');

-- Updated-at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- PROFILES
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "profiles_read_all" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  base_username TEXT;
  final_username TEXT;
  i INT := 0;
BEGIN
  base_username := COALESCE(
    NEW.raw_user_meta_data->>'username',
    split_part(NEW.email, '@', 1),
    'user'
  );
  base_username := regexp_replace(lower(base_username), '[^a-z0-9_]', '', 'g');
  IF base_username = '' THEN base_username := 'user'; END IF;
  final_username := base_username;
  WHILE EXISTS (SELECT 1 FROM public.profiles WHERE username = final_username) LOOP
    i := i + 1;
    final_username := base_username || i::text;
  END LOOP;
  INSERT INTO public.profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    final_username,
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.raw_user_meta_data->>'full_name', final_username),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', 'https://api.dicebear.com/7.x/avataaars/svg?seed=' || final_username)
  );
  RETURN NEW;
END $$;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- MOVIES (TMDB cache)
CREATE TABLE public.movies (
  tmdb_id INTEGER NOT NULL,
  media_type public.media_type NOT NULL,
  title TEXT NOT NULL,
  release_date TEXT,
  poster_path TEXT,
  backdrop_path TEXT,
  overview TEXT,
  genres JSONB,
  runtime INTEGER,
  synced_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (tmdb_id, media_type)
);
GRANT SELECT ON public.movies TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.movies TO authenticated;
GRANT ALL ON public.movies TO service_role;
ALTER TABLE public.movies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "movies_read_all" ON public.movies FOR SELECT USING (true);
CREATE POLICY "movies_write_authed" ON public.movies FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "movies_update_authed" ON public.movies FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

-- POSTS
CREATE TABLE public.posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type public.media_type NOT NULL,
  reaction public.reaction_type NOT NULL,
  comment TEXT,
  tags TEXT[] NOT NULL DEFAULT '{}',
  rewatch BOOLEAN NOT NULL DEFAULT false,
  final_rank NUMERIC(4,2),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX posts_user_idx ON public.posts(user_id, created_at DESC);
CREATE INDEX posts_movie_idx ON public.posts(tmdb_id, media_type);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts_read_all" ON public.posts FOR SELECT USING (true);
CREATE POLICY "posts_insert_own" ON public.posts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_update_own" ON public.posts FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "posts_delete_own" ON public.posts FOR DELETE TO authenticated USING (auth.uid() = user_id);
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- WATCHLIST
CREATE TABLE public.watchlist (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type public.media_type NOT NULL,
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, media_type)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.watchlist TO authenticated;
GRANT ALL ON public.watchlist TO service_role;
ALTER TABLE public.watchlist ENABLE ROW LEVEL SECURITY;
CREATE POLICY "watchlist_own" ON public.watchlist FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- RANKINGS
CREATE TABLE public.user_movie_rankings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tmdb_id INTEGER NOT NULL,
  media_type public.media_type NOT NULL,
  reaction public.reaction_type NOT NULL,
  score NUMERIC(4,2) NOT NULL,
  position INTEGER NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, media_type)
);
CREATE INDEX rankings_user_pos_idx ON public.user_movie_rankings(user_id, position);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_movie_rankings TO authenticated;
GRANT ALL ON public.user_movie_rankings TO service_role;
ALTER TABLE public.user_movie_rankings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "rankings_own" ON public.user_movie_rankings FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER rankings_updated_at BEFORE UPDATE ON public.user_movie_rankings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Insert/reposition a movie in the user's ranking list (within a reaction bucket)
-- bucket_position is the 0-based index within the user's rankings filtered to the same reaction.
CREATE OR REPLACE FUNCTION public.insert_ranking(
  p_tmdb_id INTEGER,
  p_media_type public.media_type,
  p_reaction public.reaction_type,
  p_bucket_position INTEGER
) RETURNS public.user_movie_rankings
LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE
  uid UUID := auth.uid();
  bucket_low NUMERIC;
  bucket_high NUMERIC;
  bucket_ids UUID[];
  insert_global_pos INTEGER;
  neighbor_low NUMERIC;
  neighbor_high NUMERIC;
  new_score NUMERIC;
  result public.user_movie_rankings;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Score bounds per bucket
  IF p_reaction = 'love' THEN bucket_low := 7.0; bucket_high := 10.0;
  ELSIF p_reaction = 'fine' THEN bucket_low := 4.0; bucket_high := 6.99;
  ELSE bucket_low := 0.0; bucket_high := 3.99; END IF;

  -- Remove any existing ranking for this movie so we can reinsert cleanly
  DELETE FROM public.user_movie_rankings
   WHERE user_id = uid AND tmdb_id = p_tmdb_id AND media_type = p_media_type;

  -- Gather existing rankings in this bucket, ordered
  SELECT array_agg(id ORDER BY position) INTO bucket_ids
    FROM public.user_movie_rankings
   WHERE user_id = uid AND reaction = p_reaction;

  IF bucket_ids IS NULL THEN bucket_ids := ARRAY[]::UUID[]; END IF;
  IF p_bucket_position < 0 THEN p_bucket_position := 0; END IF;
  IF p_bucket_position > array_length(bucket_ids,1) OR array_length(bucket_ids,1) IS NULL THEN
    p_bucket_position := COALESCE(array_length(bucket_ids,1),0);
  END IF;

  -- Neighbor scores (position 0 = top of bucket = highest score)
  IF p_bucket_position = 0 THEN
    neighbor_high := bucket_high;
  ELSE
    SELECT score INTO neighbor_high FROM public.user_movie_rankings WHERE id = bucket_ids[p_bucket_position];
  END IF;
  IF p_bucket_position = COALESCE(array_length(bucket_ids,1),0) THEN
    neighbor_low := bucket_low;
  ELSE
    SELECT score INTO neighbor_low FROM public.user_movie_rankings WHERE id = bucket_ids[p_bucket_position + 1];
  END IF;
  new_score := round(((neighbor_high + neighbor_low) / 2.0)::numeric, 2);

  -- Compute global insertion position so list stays love->fine->dislike, top->bottom
  -- Bucket ordering: love(0), fine(1), dislike(2)
  WITH ranked AS (
    SELECT id, position, reaction,
      CASE reaction WHEN 'love' THEN 0 WHEN 'fine' THEN 1 ELSE 2 END AS bucket_order
    FROM public.user_movie_rankings WHERE user_id = uid
  ),
  bucket_rows AS (
    SELECT * FROM ranked WHERE reaction = p_reaction ORDER BY position
  )
  SELECT COALESCE(
    (SELECT position FROM (SELECT position FROM bucket_rows OFFSET p_bucket_position LIMIT 1) s),
    (SELECT COALESCE(MAX(position),-1)+1 FROM ranked WHERE bucket_order <= CASE p_reaction WHEN 'love' THEN 0 WHEN 'fine' THEN 1 ELSE 2 END)
  ) INTO insert_global_pos;

  -- Shift later positions
  UPDATE public.user_movie_rankings
     SET position = position + 1
   WHERE user_id = uid AND position >= insert_global_pos;

  INSERT INTO public.user_movie_rankings (user_id, tmdb_id, media_type, reaction, score, position)
  VALUES (uid, p_tmdb_id, p_media_type, p_reaction, new_score, insert_global_pos)
  RETURNING * INTO result;

  RETURN result;
END $$;

GRANT EXECUTE ON FUNCTION public.insert_ranking(INTEGER, public.media_type, public.reaction_type, INTEGER) TO authenticated;
