import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, X, Info, ArrowLeft, Search, Loader2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { haptic } from "@/lib/haptic";
import MovieSearch from "@/components/MovieSearch";
import { tmdb, tmdbImage, hasTmdbKey, type TMDBMovie } from "@/lib/tmdb";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { toggleWatchlist } from "@/lib/movieSync";

type Card = TMDBMovie & {
  media_type: "movie" | "tv";
  reason: string;
};

const Discover = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [mediaFilter, setMediaFilter] = useState<"movie" | "tv">("movie");
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!hasTmdbKey()) {
      setLoading(false);
      return;
    }
    (async () => {
      setLoading(true);
      try {
        const seen = new Set<string>();
        const exclude = new Set<string>();
        const out: Card[] = [];

        // Build seed list: user's top-ranked + watchlist items
        let seeds: { tmdb_id: number; media_type: "movie" | "tv"; title?: string }[] = [];
        if (user) {
          const [{ data: ranked }, { data: wl }] = await Promise.all([
            supabase
              .from("user_movie_rankings")
              .select("tmdb_id, media_type, score, movies(title)")
              .eq("user_id", user.id)
              .order("score", { ascending: false })
              .limit(5),
            supabase
              .from("watchlist")
              .select("tmdb_id, media_type, movies(title)")
              .eq("user_id", user.id)
              .limit(10),
          ]);
          (ranked || []).forEach((r: any) => {
            exclude.add(`${r.media_type}:${r.tmdb_id}`);
            seeds.push({ tmdb_id: r.tmdb_id, media_type: r.media_type, title: r.movies?.title });
          });
          (wl || []).forEach((w: any) => {
            exclude.add(`${w.media_type}:${w.tmdb_id}`);
            // Use top 3 watchlist items as additional seeds
            if (seeds.length < 8) seeds.push({ tmdb_id: w.tmdb_id, media_type: w.media_type, title: w.movies?.title });
          });
        }

        // Pull recommendations per seed
        for (const s of seeds.slice(0, 6)) {
          try {
            const res = s.media_type === "tv"
              ? await tmdb.tvRecommendations(s.tmdb_id)
              : await tmdb.movieRecommendations(s.tmdb_id);
            for (const m of res.results.slice(0, 6)) {
              const mt: "movie" | "tv" = s.media_type;
              const key = `${mt}:${m.id}`;
              if (seen.has(key) || exclude.has(key)) continue;
              seen.add(key);
              out.push({ ...m, media_type: mt, reason: `Because you like ${s.title || "a movie you ranked"}` });
            }
          } catch {}
        }

        // Fill with trending / popular
        const trending = await tmdb.trending("week");
        for (const m of trending.results) {
          const key = `movie:${m.id}`;
          if (seen.has(key) || exclude.has(key)) continue;
          seen.add(key);
          out.push({ ...m, media_type: "movie", reason: "Popular this week" });
        }

        // Shuffle slight: keep recs first, then trending
        setCards(out.slice(0, 30));
      } catch (e: any) {
        toast.error(e?.message || "Failed to load recommendations");
      } finally {
        setLoading(false);
      }
    })();
  }, [user]);

  const currentMovie = cards[currentIndex];

  const handleSwipe = async (direction: "left" | "right") => {
    if (!currentMovie) return;
    const title = currentMovie.title || currentMovie.name || "this";
    if (direction === "right") {
      haptic.success();
      if (!user) {
        toast("Sign in to save to your watchlist");
      } else {
        try {
          await toggleWatchlist(currentMovie.id, currentMovie.media_type, user.id);
          toast.success(`Added "${title}" to watchlist`);
        } catch (e: any) {
          toast.error(e?.message || "Failed to save");
        }
      }
    } else {
      haptic.medium();
    }
    setTimeout(() => {
      setCurrentIndex((p) => p + 1);
      setDragOffset({ x: 0, y: 0 });
    }, 250);
  };

  const handleDragStart = (x: number, y: number) => { setIsDragging(true); setDragStart({ x, y }); };
  const handleDragMove = (x: number, y: number) => {
    if (!isDragging || !dragStart) return;
    setDragOffset({ x: x - dragStart.x, y: y - dragStart.y });
  };
  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);
    if (Math.abs(dragOffset.x) > 100) handleSwipe(dragOffset.x > 0 ? "right" : "left");
    else setDragOffset({ x: 0, y: 0 });
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 500;

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to="/"><Button variant="ghost" size="icon"><ArrowLeft className="w-5 h-5" /></Button></Link>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">Discover</h1>
            <Button variant="ghost" size="icon"><Info className="w-5 h-5" /></Button>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search for movies & TV shows..."
              className="pl-10 bg-muted/50 cursor-pointer"
              onClick={() => { haptic.light(); setIsSearchOpen(true); }}
              readOnly
            />
          </div>
        </div>
      </header>

      <MovieSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        {loading ? (
          <div className="flex flex-col items-center gap-3 py-20">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Finding picks for you...</p>
          </div>
        ) : !hasTmdbKey() ? (
          <p className="text-muted-foreground text-center max-w-sm">
            Add a TMDB API key (VITE_TMDB_API_KEY) to your environment to load recommendations.
          </p>
        ) : currentIndex >= cards.length ? (
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">That's all for now!</h2>
            <p className="text-muted-foreground">Rank more movies to fine-tune your picks.</p>
            <Link to="/"><Button className="mt-4">Back to Feed</Button></Link>
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-md h-[600px]">
              {cards.slice(currentIndex + 1, currentIndex + 3).map((m, idx) => (
                <div
                  key={`${m.media_type}-${m.id}`}
                  className="absolute inset-0 rounded-2xl overflow-hidden"
                  style={{
                    transform: `scale(${1 - (idx + 1) * 0.05}) translateY(${(idx + 1) * -10}px)`,
                    zIndex: -(idx + 1),
                    opacity: 0.5 - idx * 0.2,
                  }}
                >
                  {m.poster_path && (
                    <img src={tmdbImage(m.poster_path, "w500")} alt="" className="w-full h-full object-cover" />
                  )}
                </div>
              ))}

              {currentMovie && (
                <div
                  ref={cardRef}
                  className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing poster-glow"
                  style={{
                    transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                    opacity,
                    transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
                  }}
                  onMouseDown={(e) => { haptic.light(); handleDragStart(e.clientX, e.clientY); }}
                  onMouseMove={(e) => isDragging && handleDragMove(e.clientX, e.clientY)}
                  onMouseUp={handleDragEnd}
                  onMouseLeave={handleDragEnd}
                  onTouchStart={(e) => { haptic.light(); handleDragStart(e.touches[0].clientX, e.touches[0].clientY); }}
                  onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
                  onTouchEnd={handleDragEnd}
                >
                  {currentMovie.poster_path ? (
                    <img
                      src={tmdbImage(currentMovie.poster_path, "w780")}
                      alt={currentMovie.title || currentMovie.name}
                      className="w-full h-full object-cover"
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-muted" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

                  {currentMovie.vote_average > 0 && (
                    <div className="absolute top-4 right-4">
                      <div className="bg-primary/90 backdrop-blur-sm rounded-full px-4 py-2">
                        <span className="text-lg font-bold text-primary-foreground">
                          {currentMovie.vote_average.toFixed(1)}/10
                        </span>
                      </div>
                    </div>
                  )}

                  {dragOffset.x > 50 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-scale-in">
                      <div className="bg-green-500/90 backdrop-blur-sm rounded-full p-6">
                        <Heart className="w-12 h-12 text-white fill-white" />
                      </div>
                    </div>
                  )}
                  {dragOffset.x < -50 && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-scale-in">
                      <div className="bg-red-500/90 backdrop-blur-sm rounded-full p-6">
                        <X className="w-12 h-12 text-white" />
                      </div>
                    </div>
                  )}

                  <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="neon-badge">
                        {currentMovie.media_type === "tv" ? "TV Show" : "Movie"}
                      </Badge>
                      <Badge variant="secondary" className="bg-secondary/20 text-secondary border-secondary/30">
                        {currentMovie.reason}
                      </Badge>
                    </div>
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/${currentMovie.media_type}/${currentMovie.id}`);
                      }}
                      className="cursor-pointer"
                    >
                      <h2 className="text-3xl font-bold text-foreground mb-1">
                        {currentMovie.title || currentMovie.name}
                      </h2>
                      <p className="text-muted-foreground">
                        {(currentMovie.release_date || currentMovie.first_air_date || "").slice(0, 4)}
                      </p>
                    </div>
                    {currentMovie.overview && (
                      <p className="text-sm text-foreground/90 line-clamp-2">{currentMovie.overview}</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-6 mt-8">
              <Button
                size="lg"
                variant="outline"
                className="h-16 w-16 rounded-full border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
                onClick={() => handleSwipe("left")}
              >
                <X className="w-8 h-8 text-destructive" />
              </Button>
              <Button
                size="lg"
                className="h-20 w-20 rounded-full bg-gradient-primary hover:opacity-90"
                onClick={() => handleSwipe("right")}
              >
                <Heart className="w-10 h-10" />
              </Button>
            </div>

            <p className="text-center text-muted-foreground mt-6">
              {currentIndex + 1} / {cards.length}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default Discover;
