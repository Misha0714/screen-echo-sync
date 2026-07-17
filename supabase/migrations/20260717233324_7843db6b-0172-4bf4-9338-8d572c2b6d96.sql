
-- 1. Create a SECURITY DEFINER upsert function for movies (auth-gated, controlled columns)
CREATE OR REPLACE FUNCTION public.upsert_movie(
  p_tmdb_id integer,
  p_media_type public.media_type,
  p_title text,
  p_release_date text,
  p_poster_path text,
  p_backdrop_path text,
  p_overview text,
  p_genres jsonb,
  p_runtime integer,
  p_cast_list jsonb,
  p_directors jsonb,
  p_providers jsonb
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  INSERT INTO public.movies (
    tmdb_id, media_type, title, release_date, poster_path, backdrop_path,
    overview, genres, runtime, cast_list, directors, providers, synced_at
  ) VALUES (
    p_tmdb_id, p_media_type, COALESCE(p_title,'Untitled'), p_release_date, p_poster_path, p_backdrop_path,
    p_overview, p_genres, p_runtime, p_cast_list, p_directors, p_providers, now()
  )
  ON CONFLICT (tmdb_id, media_type) DO UPDATE
    SET title = EXCLUDED.title,
        release_date = EXCLUDED.release_date,
        poster_path = EXCLUDED.poster_path,
        backdrop_path = EXCLUDED.backdrop_path,
        overview = EXCLUDED.overview,
        genres = EXCLUDED.genres,
        runtime = EXCLUDED.runtime,
        cast_list = EXCLUDED.cast_list,
        directors = EXCLUDED.directors,
        providers = EXCLUDED.providers,
        synced_at = now();
END;
$$;

REVOKE EXECUTE ON FUNCTION public.upsert_movie(integer, public.media_type, text, text, text, text, text, jsonb, integer, jsonb, jsonb, jsonb) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.upsert_movie(integer, public.media_type, text, text, text, text, text, jsonb, integer, jsonb, jsonb, jsonb) TO authenticated;

-- 2. Tighten movies table policies: no direct client writes; explicit no-delete
DROP POLICY IF EXISTS movies_insert_authed ON public.movies;
DROP POLICY IF EXISTS movies_update_authed ON public.movies;

CREATE POLICY movies_no_delete ON public.movies FOR DELETE TO authenticated, anon USING (false);

-- 3. Restrict internal / legacy SECURITY DEFINER helpers from being called by end users
REVOKE EXECUTE ON FUNCTION public.recompute_user_scores(uuid) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.insert_ranking(integer, public.media_type, public.reaction_type, integer) FROM PUBLIC, anon, authenticated;
