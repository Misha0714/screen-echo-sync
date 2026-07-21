
CREATE TABLE public.user_tv_season_rankings (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  tmdb_id integer NOT NULL,
  season_number integer NOT NULL,
  position integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tmdb_id, season_number)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_tv_season_rankings TO authenticated;
GRANT SELECT ON public.user_tv_season_rankings TO anon;
GRANT ALL ON public.user_tv_season_rankings TO service_role;

ALTER TABLE public.user_tv_season_rankings ENABLE ROW LEVEL SECURITY;

CREATE POLICY tv_season_rankings_read_all ON public.user_tv_season_rankings
  FOR SELECT USING (true);
CREATE POLICY tv_season_rankings_write_own ON public.user_tv_season_rankings
  FOR ALL TO authenticated
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

CREATE TRIGGER trg_tv_season_rankings_updated
  BEFORE UPDATE ON public.user_tv_season_rankings
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS season_ranking integer[] NOT NULL DEFAULT '{}';
