CREATE OR REPLACE FUNCTION public.recompute_user_scores(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  rec RECORD;
  prev_score numeric := NULL;
  new_score numeric;
BEGIN
  -- Walk rankings top-to-bottom by tie-aware rank index.
  -- Rule:
  --  * Locked rows keep their manual score (never overwritten).
  --  * The top row, if unlocked, is 10.0.
  --  * Each subsequent unlocked row is previous row's score - 0.1.
  --  * Tied rows share the same score.
  FOR rec IN
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
    FROM ordered
    ORDER BY position
  LOOP
    IF rec.locked THEN
      -- Keep the locked score; it becomes the reference for the next unlocked row.
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
$function$;

-- Recompute for all existing users so scores follow the new rule immediately.
DO $$
DECLARE u uuid;
BEGIN
  FOR u IN SELECT DISTINCT user_id FROM public.user_movie_rankings LOOP
    PERFORM public.recompute_user_scores(u);
  END LOOP;
END $$;