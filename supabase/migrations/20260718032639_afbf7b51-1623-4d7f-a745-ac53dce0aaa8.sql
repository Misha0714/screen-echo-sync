
ALTER TABLE public.user_movie_rankings
  ADD COLUMN IF NOT EXISTS locked boolean NOT NULL DEFAULT false;

CREATE OR REPLACE FUNCTION public.recompute_user_scores(p_user_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  WITH ordered AS (
    SELECT id, position, tie_group,
      ROW_NUMBER() OVER (ORDER BY position) - 1 AS row_idx
    FROM public.user_movie_rankings
    WHERE user_id = p_user_id
  ),
  ranks AS (
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
   WHERE r.id = ranks.id
     AND r.locked = false;
END $function$;
