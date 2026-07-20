
CREATE OR REPLACE FUNCTION public.recompute_user_scores(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  prev_score numeric := NULL;
  new_score numeric;
BEGIN
  -- Normalize positions so they are contiguous 0..N-1 (no gaps after deletes),
  -- preserving current order and tie groupings.
  WITH ordered AS (
    SELECT id, ROW_NUMBER() OVER (ORDER BY position, id) - 1 AS new_pos
    FROM public.user_movie_rankings
    WHERE user_id = p_user_id
  )
  UPDATE public.user_movie_rankings r
     SET position = o.new_pos
    FROM ordered o
   WHERE r.id = o.id AND r.position <> o.new_pos;

  -- Walk rankings top-to-bottom by tie-aware rank index.
  -- Rules:
  --  * Locked rows keep their manual score (never overwritten).
  --  * The top row, if unlocked, is 10.0.
  --  * Each subsequent unlocked row is previous row's score - 0.1.
  --  * Tied rows share the same score as the first member of their tie group.
  FOR rec IN
    WITH ordered AS (
      SELECT id, position, tie_group, locked, score,
        ROW_NUMBER() OVER (ORDER BY position) - 1 AS row_idx
      FROM public.user_movie_rankings
      WHERE user_id = p_user_id
    )
    SELECT id, locked, score, tie_group,
      CASE WHEN tie_group IS NULL THEN row_idx
           ELSE MIN(row_idx) OVER (PARTITION BY tie_group)
      END AS rank_idx
    FROM ordered
    ORDER BY position
  LOOP
    IF rec.locked THEN
      prev_score := rec.score;
    ELSE
      IF prev_score IS NULL THEN
        new_score := 10.0;
      ELSE
        new_score := prev_score - 0.1;
      END IF;
      new_score := GREATEST(0, LEAST(10, ROUND(new_score::numeric, 2)));
      UPDATE public.user_movie_rankings
         SET score = new_score,
             updated_at = now()
       WHERE id = rec.id;
      prev_score := new_score;
    END IF;
  END LOOP;
END
$$;
