
## Scope

Four connected changes: (1) redesigned Create Post modal, (2) new ranking scale + "Too Close to Call" ties, (3) drag-and-drop Edit Rankings mode on Profile, (4) combinable filters on Profile lists. Feed sorts by watch date.

---

## 1. Create Post modal (`AddPostFlow.tsx`)

Widen dialog to `max-w-2xl`, remove all Tags UI/state. New Details step fields:

- **Title** — read-only, shown as header (already there).
- **Description** — existing textarea, relabeled.
- **Where you watched it** — Select with presets (Movie Theater, Home, On a Plane, Friend's House, Other) + optional free-text when "Other".
- **Who you watched it with** — multi-select tag input populated from the user's followers (see DB note). Type to filter, click to add chips.
- **Watch Date** — shadcn DatePicker, defaults to today.
- Keep "Would you rewatch?" toggle.

Cleaner spacing: `space-y-5`, section labels, grid layout for date + location on desktop.

---

## 2. Ranking system

### Comparison flow
Add a third button on the compare step: **Love it / Fine / Dislike** already exist for reaction; the compare step gets **"[New] wins" / "[Existing] wins" / "Too close to call"**. "Too close" collapses the binary search and pins the new movie to the same score as that neighbor.

### Score scale
Scores become deterministic by rank: `score = max(0, 10.0 - (rank_index * 0.1))`. Ties share the same rank index. Recomputed after every insert/reorder in a single RPC.

### Feed order
`posts` list on home + profile activity sorts by `watch_date` desc (fallback `created_at`).

---

## 3. Edit Rankings (Profile)

- Toggle button "Edit Rankings" on the Ranked tab.
- Use `@dnd-kit/core` + `@dnd-kit/sortable` for drag-and-drop of the ranked list.
- On drop: call new RPC `reorder_rankings(p_ordered_ids uuid[], p_ties jsonb)` that rewrites `position` and recomputes `score` using the 10.0 − 0.1·rank formula, respecting tie groups.
- Long-press to mark two adjacent items as tied (or an inline "tie with above" button in edit mode).
- Optimistic UI with framer-motion layout animations.

---

## 4. Profile filters

Filter bar above the ranked/watchlist list with combinable chips:

- Media type (Movie / TV) — already exists as tabs; keep.
- Genre — from `movies.genres` jsonb.
- Release Year — range or single year from `movies.release_date`.
- Actors / Directors — needs new cache columns (see DB).
- Streaming Service — from TMDB `/watch/providers`, cached.
- Watched With — from `posts.watched_with`.
- Watch Location — from `posts.watch_location`.
- Favorites — reactions = "love".

Filters are AND-combined. State kept in a `useFilters` hook; UI is a collapsible panel with active-chip summary.

---

## Database changes (one migration)

```sql
-- posts: new fields
ALTER TABLE public.posts
  ADD COLUMN watch_date date,
  ADD COLUMN watch_location text,
  ADD COLUMN watched_with uuid[] not null default '{}';
-- drop tags column usage (keep column for back-compat, unused in UI)

-- rankings: ties
ALTER TABLE public.user_movie_rankings
  ADD COLUMN tie_group integer; -- same integer = tied

-- movies cache: enrich for filters
ALTER TABLE public.movies
  ADD COLUMN cast jsonb,        -- [{id,name,character}]
  ADD COLUMN directors jsonb,   -- [{id,name}]
  ADD COLUMN providers jsonb;   -- [{provider_id,provider_name}]

-- follows (needed for "watched with" picker) — create only if missing
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id uuid not null references auth.users(id) on delete cascade,
  followee_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (follower_id, followee_id)
);
GRANT SELECT, INSERT, DELETE ON public.follows TO authenticated;
GRANT ALL ON public.follows TO service_role;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY follows_read_all ON public.follows FOR SELECT USING (true);
CREATE POLICY follows_write_own ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY follows_delete_own ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- new RPCs:
-- insert_ranking_v2(tmdb_id, media_type, reaction, bucket_position, tie_with_id null)
-- reorder_rankings(ordered_ids uuid[], tie_groups jsonb)
-- both recompute score = greatest(0, 10.0 - (rank_index * 0.1))
```

`movieSync.ts` extended to also upsert cast/directors/providers from TMDB `/credits` and `/watch/providers`.

---

## File touch list

- `src/components/AddPostFlow.tsx` — modal redesign, followers picker, date, location, tie option in compare step.
- `src/components/FollowersPicker.tsx` (new) — multi-select of followers.
- `src/components/RankingEditor.tsx` (new) — dnd-kit sortable list + tie toggle.
- `src/components/ProfileFilters.tsx` (new) — filter panel + chip bar.
- `src/hooks/useProfileFilters.ts` (new).
- `src/pages/Profile.tsx` — mount editor + filters, apply filter predicate, sort activity by watch_date.
- `src/pages/Index.tsx` — feed sort by watch_date.
- `src/lib/movieSync.ts` — enrich with cast/directors/providers.
- `src/lib/tmdb.ts` — add credits + watch providers helpers.
- DB migration as above.

---

## Non-goals for this pass

- No changes to auth, discover swipe deck, notifications, or movie details page beyond what's implied.
- Legacy `tags` column stays in DB (unused in UI) to avoid breaking existing rows.

Confirm and I'll ship the migration first, then the code.
