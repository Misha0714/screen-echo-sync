import ReviewCard from "@/components/ReviewCard";
import BottomNav from "@/components/BottomNav";
import MovieSearch from "@/components/MovieSearch";
import NotificationsDropdown from "@/components/NotificationsDropdown";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Search, Film, LogIn, LogOut, Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { haptic } from "@/lib/haptic";
import { supabase } from "@/integrations/supabase/client";
import { tmdb, tmdbImage, hasTmdbKey, type TMDBMovie } from "@/lib/tmdb";
import { useAuth } from "@/hooks/useAuth";

interface FeedItem {
  id: string;
  user_id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  reaction: "love" | "fine" | "dislike";
  comment: string | null;
  tags: string[];
  final_rank: number | null;
  created_at: string;
  profiles: { username: string; display_name: string | null; avatar_url: string | null } | null;
  movies: { title: string; poster_path: string | null; release_date: string | null } | null;
}

const Index = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [trending, setTrending] = useState<TMDBMovie[]>([]);
  const [trendingTv, setTrendingTv] = useState<TMDBMovie[]>([]);
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [loadingFeed, setLoadingFeed] = useState(true);

  useEffect(() => {
    if (hasTmdbKey()) {
      tmdb.trending("week").then((d) => setTrending(d.results.slice(0, 10))).catch(() => {});
      tmdb.trendingTv("week").then((d) => setTrendingTv(d.results.slice(0, 10))).catch(() => {});
    }
  }, []);

  useEffect(() => {
    setLoadingFeed(true);
    supabase
      .from("posts")
      .select("*, profiles(username, display_name, avatar_url), movies(title, poster_path, release_date)")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => {
        setFeed((data as any) || []);
        setLoadingFeed(false);
      });
  }, []);

  const reactionToRating = (r: string, score: number | null) => {
    if (score) return Math.max(1, Math.round(score / 2));
    return r === "love" ? 5 : r === "fine" ? 3 : 1;
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Film className="w-7 h-7 text-primary neon-glow-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Rewind
              </span>
            </div>
            <div className="flex items-center gap-2">
              <NotificationsDropdown />
              {user ? (
                <Button variant="ghost" size="icon" onClick={() => signOut()} title="Sign out">
                  <LogOut className="w-4 h-4" />
                </Button>
              ) : (
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")} className="gap-1">
                  <LogIn className="w-4 h-4" /> Sign in
                </Button>
              )}
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search movies, friends, etc."
              className="pl-10 bg-muted/50 cursor-pointer"
              onClick={() => {
                haptic.light();
                setIsSearchOpen(true);
              }}
              readOnly
            />
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
          </div>
          <Link to="/trending">
            <Button variant="ghost" size="sm" className="text-primary">See all</Button>
          </Link>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {trending.map((m) => (
              <Link key={m.id} to={`/movie/${m.id}`} onClick={() => haptic.light()}>
                <div className="w-[160px] flex-shrink-0">
                  {m.poster_path ? (
                    <img
                      src={tmdbImage(m.poster_path, "w300")}
                      alt={m.title || m.name}
                      className="w-full aspect-[2/3] object-cover rounded-lg border-2 border-primary/20 poster-glow"
                    />
                  ) : (
                    <div className="w-full aspect-[2/3] rounded-lg bg-muted" />
                  )}
                  <p className="text-sm font-semibold mt-2 truncate">{m.title || m.name}</p>
                </div>
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">Your Feed</h2>
        </div>
        {loadingFeed ? (
          <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-primary" /></div>
        ) : feed.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">
            No posts yet. {user ? "Search for a movie and add your first post!" : (
              <Link to="/auth" className="text-primary underline">Sign in</Link>
            )}
          </p>
        ) : (
          <div className="space-y-4 animate-fade-in">
            {feed.map((p) => (
              <Link key={p.id} to={`/${p.media_type}/${p.tmdb_id}`} className="block">
                <ReviewCard
                  userName={p.profiles?.display_name || p.profiles?.username || "User"}
                  userUsername={p.profiles?.username}
                  userAvatar={p.profiles?.avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${p.user_id}`}
                  movieTitle={p.movies?.title || "Untitled"}
                  movieYear={p.movies?.release_date?.slice(0, 4) || ""}
                  rating={reactionToRating(p.reaction, p.final_rank)}
                  review={p.comment || ""}
                  vibes={[]}
                  likes={0}
                  comments={0}
                  moviePoster={p.movies?.poster_path ? tmdbImage(p.movies.poster_path, "w300") : ""}
                />
              </Link>
            ))}
          </div>
        )}
      </section>

      <MovieSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />
      <BottomNav onPostClick={() => setIsSearchOpen(true)} />
    </div>
  );
};

export default Index;
