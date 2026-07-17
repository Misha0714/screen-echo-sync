import { useMemo, useState } from "react";

export interface RankingForFilter {
  id: string;
  reaction: "love" | "fine" | "dislike";
  media_type: "movie" | "tv";
  watch_location?: string | null;
  watched_with?: string[] | null;
  movies: {
    title: string;
    release_date: string | null;
    poster_path?: string | null;
    genres?: { id: number; name: string }[] | null;
    cast_list?: { id: number; name: string }[] | null;
    directors?: { id: number; name: string }[] | null;
    providers?: { provider_id: number; provider_name: string }[] | null;
  } | null;
}

export interface FilterState {
  genres: Set<string>;
  actors: Set<string>;
  directors: Set<string>;
  providers: Set<string>;
  yearMin?: number;
  yearMax?: number;
  mediaType?: "movie" | "tv";
  watchedWith: Set<string>;
  watchLocation: Set<string>;
  favoritesOnly: boolean;
}

const empty = (): FilterState => ({
  genres: new Set(),
  actors: new Set(),
  directors: new Set(),
  providers: new Set(),
  watchedWith: new Set(),
  watchLocation: new Set(),
  favoritesOnly: false,
});

export function useProfileFilters<T extends RankingForFilter>(items: T[]) {
  const [state, setState] = useState<FilterState>(empty);

  const options = useMemo(() => {
    const g = new Set<string>();
    const a = new Set<string>();
    const d = new Set<string>();
    const p = new Set<string>();
    const w = new Set<string>();
    const l = new Set<string>();
    items.forEach((r) => {
      r.movies?.genres?.forEach((x) => g.add(x.name));
      r.movies?.cast_list?.slice(0, 8).forEach((x) => a.add(x.name));
      r.movies?.directors?.forEach((x) => d.add(x.name));
      r.movies?.providers?.forEach((x) => p.add(x.provider_name));
      r.watched_with?.forEach((x) => w.add(x));
      if (r.watch_location) l.add(r.watch_location);
    });
    return {
      genres: [...g].sort(),
      actors: [...a].sort(),
      directors: [...d].sort(),
      providers: [...p].sort(),
      watchedWith: [...w],
      locations: [...l].sort(),
    };
  }, [items]);

  const filtered = useMemo(() => {
    return items.filter((r) => {
      if (state.mediaType && r.media_type !== state.mediaType) return false;
      if (state.favoritesOnly && r.reaction !== "love") return false;

      const year = r.movies?.release_date ? Number(r.movies.release_date.slice(0, 4)) : undefined;
      if (state.yearMin && (!year || year < state.yearMin)) return false;
      if (state.yearMax && (!year || year > state.yearMax)) return false;

      if (state.genres.size > 0) {
        const names = new Set((r.movies?.genres || []).map((x) => x.name));
        for (const g of state.genres) if (!names.has(g)) return false;
      }
      if (state.actors.size > 0) {
        const names = new Set((r.movies?.cast_list || []).map((x) => x.name));
        for (const a of state.actors) if (!names.has(a)) return false;
      }
      if (state.directors.size > 0) {
        const names = new Set((r.movies?.directors || []).map((x) => x.name));
        for (const d of state.directors) if (!names.has(d)) return false;
      }
      if (state.providers.size > 0) {
        const names = new Set((r.movies?.providers || []).map((x) => x.provider_name));
        for (const p of state.providers) if (!names.has(p)) return false;
      }
      if (state.watchedWith.size > 0) {
        const ids = new Set(r.watched_with || []);
        for (const w of state.watchedWith) if (!ids.has(w)) return false;
      }
      if (state.watchLocation.size > 0 && !state.watchLocation.has(r.watch_location || "")) return false;
      return true;
    });
  }, [items, state]);

  const toggle = <K extends "genres" | "actors" | "directors" | "providers" | "watchedWith" | "watchLocation">(
    key: K, value: string
  ) => {
    setState((s) => {
      const next = new Set(s[key]);
      if (next.has(value)) next.delete(value); else next.add(value);
      return { ...s, [key]: next };
    });
  };

  const clear = () => setState(empty());
  const setMedia = (v?: "movie" | "tv") => setState((s) => ({ ...s, mediaType: v }));
  const setFavorites = (v: boolean) => setState((s) => ({ ...s, favoritesOnly: v }));
  const setYear = (min?: number, max?: number) =>
    setState((s) => ({ ...s, yearMin: min, yearMax: max }));

  const activeCount =
    state.genres.size + state.actors.size + state.directors.size + state.providers.size +
    state.watchedWith.size + state.watchLocation.size +
    (state.favoritesOnly ? 1 : 0) + (state.mediaType ? 1 : 0) +
    (state.yearMin ? 1 : 0) + (state.yearMax ? 1 : 0);

  return { state, options, filtered, toggle, clear, setMedia, setFavorites, setYear, activeCount };
}
