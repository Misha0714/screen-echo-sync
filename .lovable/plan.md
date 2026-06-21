# Plan: Personal movie journal with taste-based ranking

This is a big chunk of work. Here's how I'll build it in one pass, grouped so you can sanity-check the shape before I start.

## 1. Backend (Lovable Cloud)

Enable Lovable Cloud and create the following schema (all with RLS + GRANTs):

- **profiles** — `id` (uuid, FK `auth.users`), `username` (unique), `display_name`, `avatar_url`, `bio`, `created_at`. Auto-created on signup via trigger.
- **movies** — TMDB cache: `tmdb_id` (PK or unique), `media_type` ('movie'|'tv'), `title`, `release_date`, `poster_path`, `backdrop_path`, `overview`, `genres` (jsonb), `runtime`, `synced_at`. Public read.
- **posts** — `id`, `user_id`, `tmdb_id`, `media_type`, `reaction` ('love'|'fine'|'dislike'), `comment`, `tags` (text[]), `rewatch` (bool), `final_rank` (numeric), `created_at`, `updated_at`. Public read, owner write.
- **watchlist** — `id`, `user_id`, `tmdb_id`, `media_type`, `added_at`. Unique (user, tmdb_id). Owner-only.
- **user_movie_rankings** — `id`, `user_id`, `tmdb_id`, `media_type`, `reaction`, `score` (numeric, 0-10), `position` (int), `updated_at`. Unique (user, tmdb_id). This is the ordered list driving the comparison flow.

RLS: profiles public-read / owner-write; posts public-read / owner-write; watchlist+rankings owner-only. Explicit GRANTs to `anon`/`authenticated`/`service_role` per Lovable conventions.

## 2. Auth & onboarding

- `/auth` page: email+password sign in/up, plus Google. After signup, profile row auto-created; redirect to `/onboarding`.
- `/onboarding`: choose username, display name, avatar (dicebear seed picker), short bio. Saves to `profiles`.
- `useAuth` hook with `onAuthStateChange` listener + `getUser()` validation. Protect post creation, watchlist, ranking, profile-edit routes. Public browsing of feed/movie pages stays open.

## 3. TMDB integration

Reuse existing `src/lib/tmdb.ts`. Add a small helper `syncMovieToDb(tmdb_id, media_type)` that upserts into `movies` after fetching from TMDB — called whenever a user adds a post, watchlist item, or ranking. Trending/search remain client-side TMDB calls (no caching needed).

## 4. Add Post flow (Beli-style comparison)

Replace current `AddPostDialog` with a multi-step modal opened from `MovieDetails` "Add Post":

1. **Reaction**: "Did you like it?" → I love it / It was fine / I disliked it. Maps to score bucket: love=[7,10], fine=[4,6.9], dislike=[0,3.9].
2. **Comparison (binary search)**: Pull user's existing rankings filtered to the same bucket, ordered by `position`. Repeatedly ask "Which did you like more: [new] or [existing midpoint]?" Narrow the range until insertion index is found. ~log2(n) questions. Skippable if bucket empty (first movie just lands in the middle of its bucket).
3. **Details**: optional comment, tags (chips), rewatch toggle.
4. **Save**: compute `final_rank` score by interpolating between neighbors' scores in the bucket; insert into `posts` and upsert into `user_movie_rankings` with new `position`; renumber affected positions in a single RPC (`insert_ranking`) to keep ordering consistent.

The RPC `insert_ranking(p_tmdb_id, p_media_type, p_reaction, p_position)` runs as `security definer`, shifts later positions in the user's list, inserts the new row, and recomputes `score` for the inserted row based on bucket bounds + neighbors.

## 5. Profile, feed, watchlist UI

- **Profile page**: replace mock stats with real counts (posts, watchlist, rankings). New "Ranked" tab renders `user_movie_rankings` ordered by `position` with poster, title, score badge. Watchlist tab pulls from `watchlist`. Activity tab pulls from `posts` joined with `movies`.
- **Home feed (`Index`)**: query latest `posts` (all users) with profile + movie joined, render via `ReviewCard`. Keep current visual style.
- **Movie detail page**: "Add Post" opens the new flow; "Save" toggles watchlist row. Both require auth — redirect to `/auth` if signed-out.

## 6. Technical notes

- Comparison uses binary search against rankings already in the chosen reaction bucket; O(log n) prompts.
- Score interpolation: `score = (low_neighbor.score + high_neighbor.score) / 2`, clamped to bucket bounds; if first in bucket, midpoint of bucket.
- Positions stored as dense integers; the insert RPC shifts `position = position + 1` for rows at/after the insertion index inside the user's full ordered list to keep one global ordering per user across buckets.
- Posts and rankings are separate: a user can post multiple times about the same movie (re-watch entries), but only one ranking row per (user, tmdb_id) — re-posting updates the existing ranking.
- All TMDB metadata stays fetched live; `movies` table is just a denormalized cache so feed/profile queries don't need TMDB roundtrips.
- Existing mock data in Discover, Community, Collection pages stays untouched in this pass — call them out as follow-ups.

## 7. Out of scope this pass

- Real follower/following graph (UI stays mock).
- Comments on posts (UI stays mock).
- Notifications.
- Email templates / password reset page (can add next).

Shall I proceed?