
-- Tighten trigger function exposure
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- insert_ranking should only be callable by signed-in users
REVOKE EXECUTE ON FUNCTION public.insert_ranking(INTEGER, public.media_type, public.reaction_type, INTEGER) FROM PUBLIC, anon;

-- Replace permissive movies write policies
DROP POLICY IF EXISTS "movies_write_authed" ON public.movies;
DROP POLICY IF EXISTS "movies_update_authed" ON public.movies;
CREATE POLICY "movies_insert_authed" ON public.movies
  FOR INSERT TO authenticated WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "movies_update_authed" ON public.movies
  FOR UPDATE TO authenticated USING (auth.uid() IS NOT NULL) WITH CHECK (auth.uid() IS NOT NULL);
