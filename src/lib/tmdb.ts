// TMDB API client
// Add your API key to a .env file as: VITE_TMDB_API_KEY=your_key_here
// Get a key at: https://www.themoviedb.org/settings/api

const API_KEY = import.meta.env.VITE_TMDB_API_KEY as string | undefined;
const BASE_URL = "https://api.themoviedb.org/3";
export const IMAGE_BASE = "https://image.tmdb.org/t/p";

export const tmdbImage = (path: string | null | undefined, size: "w200" | "w300" | "w500" | "w780" | "original" = "w500") =>
  path ? `${IMAGE_BASE}/${size}${path}` : "";

export interface TMDBMovie {
  id: number;
  title: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  vote_average: number;
  vote_count: number;
  genre_ids?: number[];
  media_type?: "movie" | "tv" | "person";
}

export interface TMDBMovieDetails extends TMDBMovie {
  runtime?: number;
  episode_run_time?: number[];
  genres: { id: number; name: string }[];
  tagline: string;
  credits?: {
    cast: { id: number; name: string; character: string; profile_path: string | null }[];
    crew: { id: number; name: string; job: string; department: string }[];
  };
  videos?: {
    results: { id: string; key: string; site: string; type: string; name: string }[];
  };
  similar?: { results: TMDBMovie[] };
  recommendations?: { results: TMDBMovie[] };
}

async function tmdbFetch<T>(path: string, params: Record<string, string | number | boolean> = {}): Promise<T> {
  if (!API_KEY) {
    throw new Error("TMDB API key missing. Add VITE_TMDB_API_KEY to your .env file.");
  }
  const url = new URL(`${BASE_URL}${path}`);
  url.searchParams.set("api_key", API_KEY);
  for (const [k, v] of Object.entries(params)) url.searchParams.set(k, String(v));
  const res = await fetch(url.toString());
  if (!res.ok) {
    throw new Error(`TMDB ${res.status}: ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

export const hasTmdbKey = () => Boolean(API_KEY);

export const tmdb = {
  trending: (window: "day" | "week" = "week") =>
    tmdbFetch<{ results: TMDBMovie[] }>(`/trending/movie/${window}`),

  popularMovies: (page = 1) =>
    tmdbFetch<{ results: TMDBMovie[] }>(`/movie/popular`, { page }),

  popularTV: (page = 1) =>
    tmdbFetch<{ results: TMDBMovie[] }>(`/tv/popular`, { page }),

  search: (query: string) =>
    tmdbFetch<{ results: TMDBMovie[] }>(`/search/multi`, { query, include_adult: false }),

  movie: (id: string | number) =>
    tmdbFetch<TMDBMovieDetails>(`/movie/${id}`, {
      append_to_response: "credits,videos,similar,recommendations",
    }),

  tv: (id: string | number) =>
    tmdbFetch<TMDBMovieDetails>(`/tv/${id}`, {
      append_to_response: "credits,videos,similar,recommendations",
    }),

  movieRecommendations: (id: string | number, page = 1) =>
    tmdbFetch<{ results: TMDBMovie[] }>(`/movie/${id}/recommendations`, { page }),

  tvRecommendations: (id: string | number, page = 1) =>
    tmdbFetch<{ results: TMDBMovie[] }>(`/tv/${id}/recommendations`, { page }),
};
