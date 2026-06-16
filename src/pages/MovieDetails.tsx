import { useEffect, useState } from "react";
import { useParams, useNavigate, Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Play, ChevronDown, Bookmark, Plus, Loader2 } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { haptic } from "@/lib/haptic";
import AddPostDialog from "@/components/AddPostDialog";
import { useToast } from "@/hooks/use-toast";
import { tmdb, tmdbImage, hasTmdbKey, type TMDBMovieDetails } from "@/lib/tmdb";

interface Review {
  id: number;
  userName: string;
  userUsername: string;
  userAvatar: string;
  rating: number;
  review: string;
  isFriend: boolean;
  isPublic: boolean;
  likes: number;
  comments: number;
  date: string;
}

const MovieDetails = () => {
  const params = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const mediaType: "movie" | "tv" = location.pathname.startsWith("/tv/") ? "tv" : "movie";
  const id = params.movieId || params.showId;

  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [movie, setMovie] = useState<TMDBMovieDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    if (!hasTmdbKey()) {
      setError("TMDB API key not configured. Add VITE_TMDB_API_KEY to your .env file.");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    (mediaType === "tv" ? tmdb.tv(id) : tmdb.movie(id))
      .then((data) => setMovie(data))
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load"))
      .finally(() => setLoading(false));
  }, [id, mediaType]);

  const handleSave = () => {
    haptic.light();
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from watchlist" : "Added to watchlist",
      description: isSaved ? "Removed from your Want to Watch list" : "Added to your Want to Watch list",
    });
  };

  // Mock reviews (TMDB has reviews endpoint but keeping app's social reviews)
  const reviews: Review[] = [
    {
      id: 1,
      userName: "Sarah Johnson",
      userUsername: "sarahjmovies",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
      review: "A quietly devastating exploration. Every frame feels like a memory you can't quite hold onto.",
      isFriend: true,
      isPublic: true,
      likes: 45,
      comments: 12,
      date: "2 days ago",
    },
    {
      id: 2,
      userName: "Alex Chen",
      userUsername: "alexchen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      rating: 5,
      review: "One of the best films about love and connection I've seen. Performances are subtle yet powerful.",
      isFriend: true,
      isPublic: false,
      likes: 23,
      comments: 5,
      date: "1 week ago",
    },
    {
      id: 3,
      userName: "MovieBuff2023",
      userUsername: "moviebuff2023",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MovieBuff",
      rating: 4,
      review: "Beautiful cinematography and a touching story. Some pacing issues but overall a great watch.",
      isFriend: false,
      isPublic: true,
      likes: 89,
      comments: 34,
      date: "3 weeks ago",
    },
  ];

  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.isFriend && !b.isFriend) return -1;
    if (!a.isFriend && b.isFriend) return 1;
    return b.likes - a.likes;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-6">
        <div className="text-center space-y-4">
          <p className="text-destructive">{error || "Movie not found"}</p>
          <Button onClick={() => navigate(-1)}>Go back</Button>
        </div>
      </div>
    );
  }

  const title = movie.title || movie.name || "Untitled";
  const releaseDate = movie.release_date || movie.first_air_date || "";
  const year = releaseDate ? releaseDate.slice(0, 4) : "";
  const runtime = movie.runtime
    ? `${movie.runtime} mins`
    : movie.episode_run_time && movie.episode_run_time.length > 0
    ? `${movie.episode_run_time[0]} mins / ep`
    : "";
  const director = movie.credits?.crew.find((c) => c.job === "Director")?.name || "—";
  const cast = movie.credits?.cast.slice(0, 12) || [];
  const trailer = movie.videos?.results.find(
    (v) => v.site === "YouTube" && v.type === "Trailer"
  );
  const similar = (movie.similar?.results || movie.recommendations?.results || []).slice(0, 10);
  const averageRating = Math.round((movie.vote_average / 2) * 10) / 10;

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero */}
      <div className="relative h-[60vh] overflow-hidden">
        {movie.backdrop_path && (
          <img
            src={tmdbImage(movie.backdrop_path, "original")}
            alt={title}
            className="w-full h-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />

        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto flex items-end gap-6">
            {movie.poster_path && (
              <img
                src={tmdbImage(movie.poster_path, "w500")}
                alt={title}
                className="w-32 h-48 object-cover rounded-lg shadow-2xl poster-glow"
              />
            )}

            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-bold text-foreground mb-2">{title}</h1>
              <p className="text-muted-foreground mb-3">
                {year} • DIRECTED BY <span className="font-semibold">{director}</span>
              </p>

              <div className="flex items-center gap-3 flex-wrap">
                {trailer && (
                  <a
                    href={`https://www.youtube.com/watch?v=${trailer.key}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => haptic.light()}
                  >
                    <Button className="gap-2">
                      <Play className="w-4 h-4" />
                      TRAILER
                    </Button>
                  </a>
                )}
                <Button variant="outline" className="gap-2" onClick={handleSave}>
                  <Bookmark className={`w-4 h-4 ${isSaved ? "fill-current" : ""}`} />
                  {isSaved ? "Saved" : "Save"}
                </Button>
                <Button
                  variant="secondary"
                  className="gap-2"
                  onClick={() => {
                    haptic.light();
                    setIsAddPostOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Post
                </Button>
                {runtime && <span className="text-muted-foreground">{runtime}</span>}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">
        {movie.tagline && (
          <p className="text-lg font-semibold text-muted-foreground mb-4">{movie.tagline}</p>
        )}

        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-foreground/90 leading-relaxed">{movie.overview}</p>
          </CardContent>
        </Card>

        {/* Rating */}
        <Card className="mb-6">
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Star className="w-6 h-6 text-primary fill-primary" />
              <span className="text-3xl font-bold">{averageRating}</span>
              <span className="text-sm text-muted-foreground ml-2">
                ({movie.vote_count.toLocaleString()} votes)
              </span>
            </div>
            <div className="flex flex-wrap gap-2 justify-end">
              {movie.genres.map((g) => (
                <span
                  key={g.id}
                  className="text-xs px-2 py-1 rounded-full bg-secondary/20 text-secondary border border-secondary/30"
                >
                  {g.name}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cast */}
        {cast.length > 0 && (
          <>
            {showAllCast && (
              <Card className="mb-6">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold mb-4">Cast</h3>
                  <div className="space-y-3">
                    {cast.map((actor) => (
                      <div key={actor.id} className="flex justify-between items-center">
                        <span className="font-medium">{actor.name}</span>
                        <span className="text-sm text-muted-foreground">{actor.character}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            <div
              className="flex items-center justify-between mb-4 cursor-pointer"
              onClick={() => setShowAllCast(!showAllCast)}
            >
              <h3 className="text-lg font-semibold">
                {showAllCast ? "Hide cast" : `Show ${cast.length} cast members`}
              </h3>
              <ChevronDown
                className={`w-5 h-5 transition-transform ${showAllCast ? "rotate-180" : ""}`}
              />
            </div>
          </>
        )}

        {/* Popular Reviews (mock social data) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">POPULAR REVIEWS</h3>
          <div className="space-y-4">
            {sortedReviews.slice(0, 3).map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Link to={`/profile/${review.userUsername}`} onClick={() => haptic.light()}>
                      <Avatar className="w-10 h-10 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-all">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback>{review.userName[0]}</AvatarFallback>
                      </Avatar>
                    </Link>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/profile/${review.userUsername}`} onClick={() => haptic.light()}>
                          <p className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer">
                            {review.userName}
                          </p>
                        </Link>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? "text-primary fill-primary" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      <p className="text-foreground/90 text-sm leading-relaxed">{review.review}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link to={`/${mediaType}/${id}/reviews`}>
            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground hover:text-foreground"
              onClick={() => haptic.light()}
            >
              All reviews
              <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
          </Link>
        </div>

        {/* Related */}
        {similar.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold mb-4">RELATED FILMS</h3>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-3 pb-4">
                {similar.map((film) => {
                  const ftitle = film.title || film.name || "Untitled";
                  return (
                    <Link
                      key={film.id}
                      to={`/${mediaType}/${film.id}`}
                      onClick={() => haptic.light()}
                    >
                      <div className="flex flex-col gap-2">
                        {film.poster_path ? (
                          <img
                            src={tmdbImage(film.poster_path, "w300")}
                            alt={ftitle}
                            className="w-32 h-48 object-cover rounded border-2 border-primary/20 cursor-pointer hover:border-primary/50 transition-all poster-glow"
                          />
                        ) : (
                          <div className="w-32 h-48 rounded bg-muted border-2 border-primary/20" />
                        )}
                        <p className="text-sm text-foreground font-medium w-32 truncate">{ftitle}</p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        )}
      </div>

      <AddPostDialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen} />
      <BottomNav />
    </div>
  );
};

export default MovieDetails;
