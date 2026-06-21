import { supabase } from "@/integrations/supabase/client";
import { tmdb, type TMDBMovieDetails } from "@/lib/tmdb";

export type MediaType = "movie" | "tv";

export async function syncMovie(tmdb_id: number, media_type: MediaType) {
  const { data: existing } = await supabase
    .from("movies")
    .select("tmdb_id")
    .eq("tmdb_id", tmdb_id)
    .eq("media_type", media_type)
    .maybeSingle();
  if (existing) return;

  const details: TMDBMovieDetails =
    media_type === "tv" ? await tmdb.tv(tmdb_id) : await tmdb.movie(tmdb_id);

  await supabase.from("movies").upsert({
    tmdb_id,
    media_type,
    title: details.title || details.name || "Untitled",
    release_date: details.release_date || details.first_air_date || null,
    poster_path: details.poster_path,
    backdrop_path: details.backdrop_path,
    overview: details.overview,
    genres: details.genres as any,
    runtime: details.runtime ?? details.episode_run_time?.[0] ?? null,
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
