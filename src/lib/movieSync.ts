import { supabase } from "@/integrations/supabase/client";
import { tmdb, type TMDBMovieDetails } from "@/lib/tmdb";

export type MediaType = "movie" | "tv";

export async function syncMovie(tmdb_id: number, media_type: MediaType) {
  const { data: existing } = await supabase
    .from("movies")
    .select("tmdb_id, cast_list, directors, providers")
    .eq("tmdb_id", tmdb_id)
    .eq("media_type", media_type)
    .maybeSingle();

  // Skip only if we already have the enriched data.
  if (existing && (existing as any).cast_list && (existing as any).directors) return;

  const details: TMDBMovieDetails =
    media_type === "tv" ? await tmdb.tv(tmdb_id) : await tmdb.movie(tmdb_id);

  const castList =
    details.credits?.cast?.slice(0, 15).map((c) => ({ id: c.id, name: c.name, character: c.character })) ?? [];
  const directors =
    details.credits?.crew
      ?.filter((c) => c.job === "Director" || c.department === "Directing")
      .slice(0, 5)
      .map((c) => ({ id: c.id, name: c.name })) ?? [];
  const providersUS = (details as any)["watch/providers"]?.results?.US?.flatrate ?? [];
  const providers = providersUS.map((p: any) => ({ provider_id: p.provider_id, provider_name: p.provider_name }));

  await supabase.rpc("upsert_movie", {
    p_tmdb_id: tmdb_id,
    p_media_type: media_type,
    p_title: details.title || details.name || "Untitled",
    p_release_date: details.release_date || details.first_air_date || null,
    p_poster_path: details.poster_path ?? null,
    p_backdrop_path: details.backdrop_path ?? null,
    p_overview: details.overview ?? null,
    p_genres: (details.genres ?? null) as any,
    p_runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
    p_cast_list: castList as any,
    p_directors: directors as any,
    p_providers: providers as any,
  });
}

export async function isInWatchlist(tmdb_id: number, media_type: MediaType, user_id: string) {
  const { data } = await supabase
    .from("watchlist")
    .select("id")
    .eq("user_id", user_id)
    .eq("tmdb_id", tmdb_id)
    .eq("media_type", media_type)
    .maybeSingle();
  return !!data;
}

export async function toggleWatchlist(tmdb_id: number, media_type: MediaType, user_id: string) {
  const exists = await isInWatchlist(tmdb_id, media_type, user_id);
  if (exists) {
    await supabase
      .from("watchlist")
      .delete()
      .eq("user_id", user_id)
      .eq("tmdb_id", tmdb_id)
      .eq("media_type", media_type);
    return false;
  }
  await syncMovie(tmdb_id, media_type);
  await supabase.from("watchlist").insert({ user_id, tmdb_id, media_type });
  return true;
}
