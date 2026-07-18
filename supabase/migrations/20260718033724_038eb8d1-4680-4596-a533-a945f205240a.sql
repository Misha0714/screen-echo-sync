
CREATE OR REPLACE FUNCTION public.recompute_user_scores(p_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  rec RECORD;
  anchor_score numeric;
  anchor_rank integer;
  new_score numeric;
BEGIN
  CREATE TEMP TABLE _r ON COMMIT DROP AS
  WITH ordered AS (
    SELECT id, position, tie_group, locked, score,
      ROW_NUMBER() OVER (ORDER BY position) - 1 AS row_idx
    FROM public.user_movie_rankings
    WHERE user_id = p_user_id
  )
  SELECT id, locked, score,
    CASE WHEN tie_group IS NULL THEN row_idx
         ELSE MIN(row_idx) OVER (PARTITION BY tie_group)
    END AS rank_idx
  FROM ordered;

  FOR rec IN SELECT * FROM _r WHERE NOT locked ORDER BY rank_idx LOOP
    -- Prefer nearest locked anchor ABOVE (better ranked, higher score)
    SELECT score, rank_idx INTO anchor_score, anchor_rank
    FROM _r
    WHERE locked AND rank_idx < rec.rank_idx
    ORDER BY rank_idx DESC
    LIMIT 1;

    IF FOUND THEN
      new_score := anchor_score - 0.1 * (rec.rank_idx - anchor_rank);
    ELSE
      -- Otherwise use nearest locked anchor BELOW (worse ranked, lower score)
      SELECT score, rank_idx INTO anchor_score, anchor_rank
      FROM _r
      WHERE locked AND rank_idx > rec.rank_idx
      ORDER BY rank_idx ASC
      LIMIT 1;

      IF FOUND THEN
        new_score := anchor_score + 0.1 * (anchor_rank - rec.rank_idx);
      ELSE
        new_score := 10.0 - rec.rank_idx * 0.1;
      END IF;
    END IF;

    UPDATE public.user_movie_rankings
       SET score = GREATEST(0, LEAST(10, ROUND(new_score::numeric, 2))),
           updated_at = now()
     WHERE id = rec.id;
  END LOOP;
END
$$;
