import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings, ArrowLeft, LogOut, Loader2, Heart, ThumbsUp, ThumbsDown, Bookmark } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { tmdbImage } from "@/lib/tmdb";

interface ProfileRow {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface RankingRow {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  reaction: "love" | "fine" | "dislike";
  score: number;
  position: number;
  movies: { title: string; poster_path: string | null; release_date: string | null } | null;
}

interface WatchlistRow {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  movies: { title: string; poster_path: string | null } | null;
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
  const [loading, setLoading] = useState(true);

  const isOwnProfile = !username || (profile && user?.id === profile.id);

  useEffect(() => {
    if (authLoading) return;
    setLoading(true);
    (async () => {
      let profileRow: ProfileRow | null = null;
      if (username) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("username", username)
          .maybeSingle();
        profileRow = data as any;
      } else if (user) {
        const { data } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", user.id)
          .maybeSingle();
        profileRow = data as any;
      }
      setProfile(profileRow);

      if (profileRow) {
        const [r, w] = await Promise.all([
          supabase
            .from("user_movie_rankings")
            .select("*, movies(title, poster_path, release_date)")
            .eq("user_id", profileRow.id)
            .order("position", { ascending: true }),
          supabase
            .from("watchlist")
            .select("*, movies(title, poster_path)")
            .eq("user_id", profileRow.id)
            .order("added_at", { ascending: false }),
        ]);
        setRankings((r.data as any) || []);
        setWatchlist((w.data as any) || []);
      }
      setLoading(false);
    })();
  }, [username, user, authLoading]);

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

        <Tabs defaultValue="ranked">
          <TabsList className="w-full">
            <TabsTrigger value="ranked" className="flex-1">Ranked</TabsTrigger>
            <TabsTrigger value="watchlist" className="flex-1">Watchlist</TabsTrigger>
          </TabsList>

          <TabsContent value="ranked" className="mt-6 space-y-2">
            {rankings.length === 0 && (
              <p className="text-center text-muted-foreground py-8">No ranked movies yet.</p>
            )}
            {rankings.map((r, idx) => (
              <Link
                key={r.id}
                to={`/${r.media_type}/${r.tmdb_id}`}
                className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg hover:border-primary/40 transition-all"
              >
                <div className="w-8 text-center font-bold text-muted-foreground">{idx + 1}</div>
                {r.movies?.poster_path ? (
                  <img
                    src={tmdbImage(r.movies.poster_path, "w200")}
                    alt=""
                    className="w-12 h-16 object-cover rounded"
                  />
                ) : (
                  <div className="w-12 h-16 bg-muted rounded" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold truncate">{r.movies?.title || "Untitled"}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <ReactionIcon r={r.reaction} />
                    {r.movies?.release_date?.slice(0, 4)}
                  </div>
                </div>
                <div className="text-lg font-bold text-primary">{Number(r.score).toFixed(1)}</div>
              </Link>
            ))}
          </TabsContent>

          <TabsContent value="watchlist" className="mt-6 grid grid-cols-3 sm:grid-cols-4 gap-3">
            {watchlist.length === 0 && (
              <p className="col-span-full text-center text-muted-foreground py-8">Watchlist is empty.</p>
            )}
            {watchlist.map((w) => (
              <Link key={w.id} to={`/${w.media_type}/${w.tmdb_id}`} className="block">
                {w.movies?.poster_path ? (
                  <img
                    src={tmdbImage(w.movies.poster_path, "w300")}
                    alt=""
                    className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-primary/20"
                  />
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
    </div>
  );
};

export default Profile;
