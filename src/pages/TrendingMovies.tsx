import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, TrendingUp, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/MovieCard";
import { tmdb, tmdbImage, hasTmdbKey, type TMDBMovie } from "@/lib/tmdb";

const TrendingMovies = () => {
  const [movies, setMovies] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!hasTmdbKey()) {
      setError("TMDB API key not configured. Add VITE_TMDB_API_KEY to your .env file.");
      setLoading(false);
      return;
    }
    (async () => {
      try {
        const data = await tmdb.trending("week");
        setMovies(data.results);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load trending movies");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-primary neon-glow-primary" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Trending Now
              </h1>
            </div>
          </div>
        </div>
      </header>

      <section className="container mx-auto px-4 py-6">
        {loading && (
          <div className="flex items-center justify-center py-20 text-muted-foreground">
            <Loader2 className="w-6 h-6 animate-spin mr-2" /> Loading trending movies...
          </div>
        )}
        {error && (
          <div className="text-center py-12 text-destructive">{error}</div>
        )}
        {!loading && !error && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {movies.map((movie) => {
              const year = (movie.release_date || "").slice(0, 4);
              return (
                <Link
                  key={movie.id}
                  to={`/movie/${movie.id}`}
                  className="animate-fade-in"
                >
                  <MovieCard
                    title={movie.title || movie.name || "Untitled"}
                    year={year}
                    rating={Math.round((movie.vote_average / 2) * 10) / 10}
                    image={tmdbImage(movie.poster_path, "w500") || "/placeholder.svg"}
                    vibes={[]}
                  />
                </Link>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

export default TrendingMovies;
