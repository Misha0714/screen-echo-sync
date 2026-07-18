import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, LogOut, Loader2, Heart, ThumbsUp, ThumbsDown, Pencil, MoreVertical, Trash2 } from "lucide-react";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { tmdbImage } from "@/lib/tmdb";
import RankingEditor, { type EditableRanking } from "@/components/RankingEditor";
import ProfileFilters from "@/components/ProfileFilters";
import { useProfileFilters, type RankingForFilter } from "@/hooks/useProfileFilters";
import EditProfileDialog from "@/components/EditProfileDialog";

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface RankingRow extends RankingForFilter {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  reaction: "love" | "fine" | "dislike";
  score: number;
  position: number;
  tie_group: number | null;
}

interface WatchlistRow {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  movies: { title: string; poster_path: string | null } | null;
}

interface ReviewRow {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  comment: string | null;
  watch_date: string | null;
  created_at: string;
  rewatch: boolean;
  movies: { title: string; poster_path: string | null; release_date: string | null } | null;
}

const ReactionIcon = ({ r }: { r: string }) => {
  if (r === "love") return <Heart className="w-4 h-4 text-primary fill-primary" />;
  if (r === "fine") return <ThumbsUp className="w-4 h-4 text-secondary" />;
  return <ThumbsDown className="w-4 h-4 text-destructive" />;
};

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { user, loading: authLoading, signOut } = useAuth();

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [rankings, setRankings] = useState<RankingRow[]>([]);
  const [watchlist, setWatchlist] = useState<WatchlistRow[]>([]);
  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [deleteReview, setDeleteReview] = useState<ReviewRow | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const { toast } = useToast();

  const handleDeleteReview = async () => {
    if (!deleteReview || !user) return;
    const rev = deleteReview;
    setDeleteReview(null);
    const { error: pErr } = await supabase.from("posts").delete().eq("id", rev.id).eq("user_id", user.id);
    if (pErr) {
      toast({ title: "Delete failed", description: pErr.message, variant: "destructive" });
      return;
    }
    await supabase
      .from("user_movie_rankings")
      .delete()
      .eq("user_id", user.id)
      .eq("tmdb_id", rev.tmdb_id)
      .eq("media_type", rev.media_type);
    await supabase.rpc("recompute_user_scores", { p_user_id: user.id });
    setReviews((cur) => cur.filter((r) => r.id !== rev.id));
    setRankings((cur) => cur.filter((r) => !(r.tmdb_id === rev.tmdb_id && r.media_type === rev.media_type)));
    toast({ title: "Review deleted" });
  };
  const [postMeta, setPostMeta] = useState<
    Record<string, { watch_date: string | null; watch_location: string | null; watched_with: string[] }>
  >({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const isOwnProfile = !username || (profile && user?.id === profile.id);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    (async () => {
      let profileRow: ProfileRow | null = null;
      if (username) {
        const { data } = await supabase.from("profiles").select("*").eq("username", username).maybeSingle();
        profileRow = data as any;
      } else if (user) {
        const { data } = await supabase.from("profiles").select("*").eq("id", user.id).maybeSingle();
        profileRow = data as any;
      }
      setProfile(profileRow);

      if (profileRow) {
        const [r, w, posts] = await Promise.all([
          supabase
            .from("user_movie_rankings")
            .select("*, movies(title, poster_path, release_date, genres, cast_list, directors, providers)")
            .eq("user_id", profileRow.id)
            .order("position", { ascending: true }),
          supabase
            .from("watchlist")
            .select("*, movies(title, poster_path)")
            .eq("user_id", profileRow.id)
            .order("added_at", { ascending: false }),
          supabase
            .from("posts")
            .select("id, tmdb_id, media_type, comment, watch_date, watch_location, watched_with, rewatch, created_at, movies(title, poster_path, release_date)")
            .eq("user_id", profileRow.id)
            .order("created_at", { ascending: false }),
        ]);

        // Merge latest post meta (watch_date/location/with) into rankings by movie key.
        const metaMap: Record<string, any> = {};
        ((posts.data as any) || []).forEach((p: any) => {
          const key = `${p.tmdb_id}-${p.media_type}`;
          metaMap[key] = {
            watch_date: p.watch_date,
            watch_location: p.watch_location,
            watched_with: p.watched_with || [],
          };
        });
        setPostMeta(metaMap);

        const enriched = ((r.data as any) || []).map((row: any) => ({
          ...row,
          watch_location: metaMap[`${row.tmdb_id}-${row.media_type}`]?.watch_location ?? null,
          watched_with: metaMap[`${row.tmdb_id}-${row.media_type}`]?.watched_with ?? [],
        }));

        setRankings(enriched);
        setWatchlist((w.data as any) || []);
        setReviews(((posts.data as any) || []));
      }
      setLoading(false);
    })();
  }, [username, user, authLoading]);

  const ctrl = useProfileFilters<RankingRow>(rankings);
  const filtered = ctrl.filtered;

  // Lookup score by movie key for reviews.
  const scoreByKey = useMemo(() => {
    const m: Record<string, number> = {};
    rankings.forEach((r) => { m[`${r.tmdb_id}-${r.media_type}`] = Number(r.score); });
    return m;
  }, [rankings]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!username && !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <Card className="p-8 text-center max-w-sm">
          <h2 className="text-2xl font-bold mb-2">Sign in to view your profile</h2>
          <p className="text-muted-foreground mb-6">Track everything you watch and build your ranked list.</p>
          <Button onClick={() => navigate("/auth")} className="w-full">Sign in</Button>
        </Card>
        <BottomNav />
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Profile not found.</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const lovedCount = rankings.filter((r) => r.reaction === "love").length;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          {!isOwnProfile ? (
            <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
          ) : <div className="w-10" />}
          <h1 className="text-xl font-bold">@{profile.username}</h1>
          {isOwnProfile ? (
            <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out">
              <LogOut className="w-5 h-5" />
            </Button>
          ) : <div className="w-10" />}
        </div>
      </header>

      <div className="container mx-auto px-4 pt-6 pb-12 max-w-3xl">
        <div className="text-center mb-8">
          <Avatar className="w-28 h-28 mx-auto mb-4 border-4 border-primary/20 neon-border-subtle">
            <AvatarImage src={profile.avatar_url || ""} />
            <AvatarFallback>{(profile.display_name || profile.username).slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          <h2 className="text-2xl font-bold">{profile.display_name || profile.username}</h2>
          <p className="text-muted-foreground mt-1">{profile.bio || "Building my movie taste."}</p>
          {isOwnProfile && (
            <Button variant="outline" size="sm" className="mt-3 gap-2" onClick={() => setEditOpen(true)}>
              <Pencil className="w-3.5 h-3.5" />
              Edit profile
            </Button>
          )}

          <div className="flex justify-center gap-8 mt-6">
            <div className="text-center">
              <div className="text-2xl font-bold">{rankings.length}</div>
              <div className="text-xs text-muted-foreground">Ranked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{lovedCount}</div>
              <div className="text-xs text-muted-foreground">Loved</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{watchlist.length}</div>
              <div className="text-xs text-muted-foreground">Watchlist</div>
            </div>
          </div>
        </div>

        <Tabs defaultValue="reviews">
          <TabsList className="w-full">
            <TabsTrigger value="reviews" className="flex-1">Reviews</TabsTrigger>
            <TabsTrigger value="ranked" className="flex-1">Ranked</TabsTrigger>
            <TabsTrigger value="watchlist" className="flex-1">Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="reviews" className="mt-6 space-y-3">
            {reviews.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No reviews yet.</p>
            ) : (
              reviews.map((p) => {
                const score = scoreByKey[`${p.tmdb_id}-${p.media_type}`];
                return (
                  <Link
                    key={p.id}
                    to={`/${p.media_type}/${p.tmdb_id}`}
                    className="relative block p-4 bg-card border border-border rounded-lg hover:border-primary/40 transition-all"
                  >
                    <p className="text-xs text-muted-foreground mb-3">
                      You watched <span className="font-semibold text-foreground">{p.movies?.title || "Untitled"}</span>
                      {p.watch_date ? ` · ${p.watch_date}` : ""}
                    </p>
                    <div className="flex gap-3">
                      {p.movies?.poster_path ? (
                        <img
                          src={tmdbImage(p.movies.poster_path, "w200")}
                          alt=""
                          className="w-16 h-24 object-cover rounded flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-24 bg-muted rounded flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold truncate">{p.movies?.title || "Untitled"}</div>
                            <div className="text-xs text-muted-foreground">
                              {p.movies?.release_date?.slice(0, 4)}
                              {p.movies?.release_date ? " · " : ""}
                              {p.media_type === "tv" ? "TV" : "Movie"}
                            </div>
                          </div>
                          {typeof score === "number" && (
                            <div className="text-lg font-bold text-primary tabular-nums shrink-0">
                              {score.toFixed(1)}
                            </div>
                          )}
                        </div>
                        {p.comment && p.comment.trim().length > 0 && (
                          <p className="text-sm text-foreground/90 mt-2 whitespace-pre-wrap">{p.comment}</p>
                        )}
                        <div className="mt-3 flex items-center gap-2">
                          <span
                            className={`inline-flex items-center gap-1 text-xs px-2 py-1 rounded-full border ${
                              p.rewatch
                                ? "border-primary/40 text-primary bg-primary/10"
                                : "border-border text-muted-foreground"
                            }`}
                          >
                            {p.rewatch ? "Would rewatch" : "Wouldn't rewatch"}
                          </span>
                        </div>
                      </div>
                    </div>
                    {isOwnProfile && (
                      <div className="absolute bottom-2 right-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-muted-foreground hover:text-foreground"
                              onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            >
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
                            <DropdownMenuItem
                              className="text-destructive focus:text-destructive"
                              onSelect={(e) => {
                                e.preventDefault();
                                setDeleteReview(p);
                              }}
                            >
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete review
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    )}
                  </Link>

                );
              })
            )}
          </TabsContent>


          <TabsContent value="ranked" className="mt-6">
            {editing && isOwnProfile ? (
              <RankingEditor
                rankings={rankings as any as EditableRanking[]}
                onDone={(updated) => {
                  setRankings((cur) =>
                    cur
                      .map((r) => {
                        const u = updated.find((x) => x.id === r.id);
                        return u ? { ...r, score: u.score, position: u.position, tie_group: u.tie_group } : r;
                      })
                      .sort((a, b) => a.position - b.position)
                  );
                  setEditing(false);
                }}
                onCancel={() => setEditing(false)}
              />
            ) : rankings.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No ranked titles yet.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <ProfileFilters ctrl={ctrl} />
                  {isOwnProfile && (
                    <Button variant="outline" size="sm" onClick={() => setEditing(true)} className="gap-2">
                      <Pencil className="w-4 h-4" /> Edit rankings
                    </Button>
                  )}
                </div>
                {filtered.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">No matches. Try clearing filters.</p>
                ) : (
                  <div className="space-y-2">
                    {filtered.map((r, idx) => (
                      <Link
                        key={r.id}
                        to={`/${r.media_type}/${r.tmdb_id}`}
                        className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/40 transition-all"
                      >
                        <div className="w-8 text-center font-bold text-muted-foreground">{idx + 1}</div>
                        {r.movies?.poster_path ? (
                          <img src={tmdbImage(r.movies.poster_path, "w200")} alt="" className="w-12 h-16 object-cover rounded" />
                        ) : (
                          <div className="w-12 h-16 bg-muted rounded" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold truncate">{r.movies?.title || "Untitled"}</div>
                          <div className="text-xs text-muted-foreground flex items-center gap-2">
                            <ReactionIcon r={r.reaction} />
                            <span className="uppercase tracking-wide">{r.media_type === "tv" ? "TV" : "Movie"}</span>
                            {r.movies?.release_date?.slice(0, 4)}
                          </div>
                        </div>
                        <div className="text-lg font-bold text-primary tabular-nums">
                          {Number(r.score).toFixed(1)}
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </TabsContent>


          <TabsContent value="watchlist" className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {watchlist.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">Watchlist is empty.</p>
            )}
            {watchlist.map((w) => (
              <Link key={w.id} to={`/${w.media_type}/${w.tmdb_id}`} className="block">
                {w.movies?.poster_path ? (
                  <img src={tmdbImage(w.movies.poster_path, "w300")} alt="" className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-primary/20" />
                ) : (
                  <div className="w-full aspect-[2/3] bg-muted rounded-lg" />
                )}
                <p className="text-xs mt-1 truncate">{w.movies?.title}</p>
              </Link>
            ))}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />

      <AlertDialog open={!!deleteReview} onOpenChange={(v) => { if (!v) setDeleteReview(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will also remove{" "}
              <span className="font-semibold">{deleteReview?.movies?.title || "this movie"}</span>{" "}
              from your rankings.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {isOwnProfile && profile && (
        <EditProfileDialog
          open={editOpen}
          onOpenChange={setEditOpen}
          userId={profile.id}
          currentUsername={profile.username}
          currentBio={profile.bio || ""}
          currentAvatarUrl={profile.avatar_url}
          onSave={({ bio, avatar_url }) => {
            setProfile((p) => (p ? { ...p, bio, avatar_url } : p));
            toast({ title: "Profile updated" });
          }}
        />
      )}
    </div>

  );
};

export default Profile;
