
-- posts: new fields
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS watch_date date,
  ADD COLUMN IF NOT EXISTS watch_location text,
  ADD COLUMN IF NOT EXISTS watched_with uuid[] NOT NULL DEFAULT '{}';

-- rankings: ties
ALTER TABLE public.user_movie_rankings
  ADD COLUMN IF NOT EXISTS tie_group integer;

-- movies enrichment
ALTER TABLE public.movies
  ADD COLUMN IF NOT EXISTS cast_list jsonb,
  ADD COLUMN IF NOT EXISTS directors jsonb,
  ADD COLUMN IF NOT EXISTS providers jsonb;

-- follows table
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  followee_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (follower_id, followee_id),
  CHECK (follower_id <> followee_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT SELECT ON public.follows TO anon;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  CREATE POLICY follows_read_all ON public.follows FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY follows_insert_own ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  CREATE POLICY follows_delete_own ON public.follows FOR DELETE USING (auth.uid() = follower_id);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- Recompute scores helper: 10.0 - 0.1 * rank_index, ties share index.
CREATE OR REPLACE FUNCTION public.recompute_user_scores(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  WITH ordered AS (
    SELECT id, position, tie_group,
      ROW_NUMBER() OVER (ORDER BY position) - 1 AS row_idx
    FROM public.user_movie_rankings
    WHERE user_id = p_user_id
  ),
  ranks AS (
    -- rank_index: for tied rows, use the min row_idx of the tie group
    SELECT o.id,
      CASE WHEN o.tie_group IS NULL THEN o.row_idx
           ELSE MIN(o.row_idx) OVER (PARTITION BY o.tie_group)
      END AS rank_idx
    FROM ordered o
  )
  UPDATE public.user_movie_rankings r
     SET score = GREATEST(0, ROUND((10.0 - (ranks.rank_idx * 0.1))::numeric, 2)),
         updated_at = now()
    FROM ranks
   WHERE r.id = ranks.id;
END $$;

-- Insert v2: supports "too close to call" tying with an existing ranking id.
CREATE OR REPLACE FUNCTION public.insert_ranking_v2(
  p_tmdb_id integer,
  p_media_type media_type,
  p_reaction reaction_type,
  p_bucket_position integer,
  p_tie_with uuid DEFAULT NULL
)
RETURNS user_movie_rankings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  bucket_ids uuid[];
  insert_global_pos integer;
  target_tie integer;
  new_pos integer;
  result public.user_movie_rankings;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  DELETE FROM public.user_movie_rankings
   WHERE user_id = uid AND tmdb_id = p_tmdb_id AND media_type = p_media_type;

  IF p_tie_with IS NOT NULL THEN
    -- Insert tied with an existing entry: same position, same tie_group.
    SELECT position, COALESCE(tie_group, (SELECT COALESCE(MAX(tie_group),0)+1 FROM public.user_movie_rankings WHERE user_id = uid))
      INTO new_pos, target_tie
      FROM public.user_movie_rankings WHERE id = p_tie_with AND user_id = uid;
    IF new_pos IS NULL THEN RAISE EXCEPTION 'Tie target not found'; END IF;

    -- Ensure the target has the tie_group set
    UPDATE public.user_movie_rankings SET tie_group = target_tie WHERE id = p_tie_with;

    -- Shift positions >= new_pos by 1 to make room (place tied right after target => same rank_idx via tie group)
    UPDATE public.user_movie_rankings
       SET position = position + 1
     WHERE user_id = uid AND position > new_pos;

    INSERT INTO public.user_movie_rankings (user_id, tmdb_id, media_type, reaction, score, position, tie_group)
    VALUES (uid, p_tmdb_id, p_media_type, p_reaction, 0, new_pos + 1, target_tie)
    RETURNING * INTO result;
  ELSE
    SELECT array_agg(id ORDER BY position) INTO bucket_ids
      FROM public.user_movie_rankings
     WHERE user_id = uid AND reaction = p_reaction;
    IF bucket_ids IS NULL THEN bucket_ids := ARRAY[]::uuid[]; END IF;
    IF p_bucket_position < 0 THEN p_bucket_position := 0; END IF;
    IF p_bucket_position > COALESCE(array_length(bucket_ids,1),0) THEN
      p_bucket_position := COALESCE(array_length(bucket_ids,1),0);
    END IF;

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

    UPDATE public.user_movie_rankings
       SET position = position + 1
     WHERE user_id = uid AND position >= insert_global_pos;

    INSERT INTO public.user_movie_rankings (user_id, tmdb_id, media_type, reaction, score, position)
    VALUES (uid, p_tmdb_id, p_media_type, p_reaction, 0, insert_global_pos)
    RETURNING * INTO result;
  END IF;

  PERFORM public.recompute_user_scores(uid);

  SELECT * INTO result FROM public.user_movie_rankings WHERE id = result.id;
  RETURN result;
END $$;

-- Reorder from drag-and-drop. p_ordered_ids is the new order (top -> bottom).
-- p_ties: jsonb array of arrays of ids that should share a rank, e.g. [["id1","id2"], ["id5","id6","id7"]].
CREATE OR REPLACE FUNCTION public.reorder_rankings(
  p_ordered_ids uuid[],
  p_ties jsonb DEFAULT '[]'::jsonb
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  uid uuid := auth.uid();
  i integer;
  tie_arr jsonb;
  tie_id text;
  tie_counter integer := 0;
BEGIN
  IF uid IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;

  -- Clear tie groups
  UPDATE public.user_movie_rankings SET tie_group = NULL WHERE user_id = uid;

  -- Update positions
  FOR i IN 1..array_length(p_ordered_ids,1) LOOP
    UPDATE public.user_movie_rankings
       SET position = i - 1
     WHERE id = p_ordered_ids[i] AND user_id = uid;
  END LOOP;

  -- Apply tie groups
  FOR tie_arr IN SELECT * FROM jsonb_array_elements(p_ties) LOOP
    tie_counter := tie_counter + 1;
    FOR tie_id IN SELECT jsonb_array_elements_text(tie_arr) LOOP
      UPDATE public.user_movie_rankings
         SET tie_group = tie_counter
       WHERE id = tie_id::uuid AND user_id = uid;
    END LOOP;
  END LOOP;

  PERFORM public.recompute_user_scores(uid);
END $$;
