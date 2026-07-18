import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Loader2 } from "lucide-react";
import { haptic } from "@/lib/haptic";
import { useNavigate } from "react-router-dom";
import { z } from "zod";
import { tmdb, tmdbImage, hasTmdbKey, type TMDBMovie } from "@/lib/tmdb";

const searchSchema = z.string().trim().max(100, "Search query too long");

interface MovieSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect?: (movie: TMDBMovie) => void;
  title?: string;
}

const MovieSearch = ({ open, onOpenChange, onSelect, title }: MovieSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const [results, setResults] = useState<TMDBMovie[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (!searchQuery.trim()) {
      setResults([]);
      setApiError("");
      return;
    }
    if (!hasTmdbKey()) {
      setApiError("TMDB API key not configured. Add VITE_TMDB_API_KEY to your .env file.");
      return;
    }
    const handle = setTimeout(async () => {
      setLoading(true);
      setApiError("");
      try {
        const data = await tmdb.search(searchQuery);
        // Only movies & tv (no people)
        setResults(data.results.filter((r) => r.media_type === "movie" || r.media_type === "tv"));
      } catch (err) {
        setApiError(err instanceof Error ? err.message : "Search failed");
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);
    return () => clearTimeout(handle);
  }, [searchQuery]);

  const handleSearchChange = (value: string) => {
    try {
      searchSchema.parse(value);
      setSearchQuery(value);
      setSearchError("");
    } catch (error) {
      if (error instanceof z.ZodError) {
        setSearchError(error.errors[0].message);
      }
    }
  };

  const handleMovieClick = (movie: TMDBMovie) => {
    haptic.light();
    onOpenChange(false);
    setSearchQuery("");
    const type = movie.media_type === "tv" ? "tv" : "movie";
    navigate(`/${type}/${movie.id}`);
  };

  const handleClearSearch = () => {
    haptic.light();
    setSearchQuery("");
    setSearchError("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle>Search Movies & TV Shows</DialogTitle>
        </DialogHeader>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search for a movie or TV show..."
            className="pl-10 pr-10"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            autoFocus
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
              onClick={handleClearSearch}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {searchError && <p className="text-sm text-destructive">{searchError}</p>}
        {apiError && <p className="text-sm text-destructive">{apiError}</p>}

        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 pr-4">
            {searchQuery === "" ? (
              <div className="text-center py-12 text-muted-foreground">
                Start typing to search for movies and TV shows
              </div>
            ) : loading ? (
              <div className="flex items-center justify-center py-12 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Searching...
              </div>
            ) : results.length === 0 && !apiError ? (
              <div className="text-center py-12 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : (
              results.map((movie) => {
                const title = movie.title || movie.name || "Untitled";
                const date = movie.release_date || movie.first_air_date || "";
                const year = date ? date.slice(0, 4) : "";
                return (
                  <button
                    key={`${movie.media_type}-${movie.id}`}
                    onClick={() => handleMovieClick(movie)}
                    className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-all animate-fade-in text-left"
                  >
                    {movie.poster_path ? (
                      <img
                        src={tmdbImage(movie.poster_path, "w200")}
                        alt={title}
                        className="w-16 h-24 object-cover rounded border-2 border-primary/20"
                      />
                    ) : (
                      <div className="w-16 h-24 rounded bg-muted border-2 border-primary/20" />
                    )}

                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-foreground truncate">{title}</div>
                      <div className="text-sm text-muted-foreground">
                        {year} {movie.media_type === "tv" ? "• TV Show" : "• Movie"}
                      </div>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MovieSearch;
