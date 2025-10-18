import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X } from "lucide-react";
import { haptic } from "@/lib/haptic";
import { useNavigate } from "react-router-dom";
import { z } from "zod";

const searchSchema = z.string().trim().max(100, "Search query too long");

interface Movie {
  id: string;
  title: string;
  year: string;
  director: string;
  poster: string;
  type: "movie" | "tv";
}

interface MovieSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MovieSearch = ({ open, onOpenChange }: MovieSearchProps) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchError, setSearchError] = useState("");
  const navigate = useNavigate();

  // Mock movie data - in production this would be from an API
  const allMovies: Movie[] = [
    { id: "spider-man", title: "Spider-Man", year: "2002", director: "Sam Raimi", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop", type: "movie" },
    { id: "spider-man-2", title: "Spider-Man 2", year: "2004", director: "Sam Raimi", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop", type: "movie" },
    { id: "spider-man-3", title: "Spider-Man 3", year: "2007", director: "Sam Raimi", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop", type: "movie" },
    { id: "the-lighthouse", title: "The Lighthouse", year: "2019", director: "Robert Eggers", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop", type: "movie" },
    { id: "past-lives", title: "Past Lives", year: "2023", director: "Celine Song", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop", type: "movie" },
    { id: "amelie", title: "Amélie", year: "2001", director: "Jean-Pierre Jeunet", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop", type: "movie" },
    { id: "blade-runner-2049", title: "Blade Runner 2049", year: "2017", director: "Denis Villeneuve", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=300&fit=crop", type: "movie" },
    { id: "the-last-of-us", title: "The Last of Us", year: "2023", director: "Craig Mazin", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop", type: "tv" },
    { id: "succession", title: "Succession", year: "2018", director: "Jesse Armstrong", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=300&fit=crop", type: "tv" },
    { id: "the-bear", title: "The Bear", year: "2022", director: "Christopher Storer", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop", type: "tv" },
  ];

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

  const filteredMovies = allMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    movie.director.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleMovieClick = (movie: Movie) => {
    haptic.light();
    onOpenChange(false);
    setSearchQuery("");
    if (movie.type === "movie") {
      navigate(`/movie/${movie.id}`);
    } else {
      navigate(`/tv/${movie.id}`);
    }
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

        {searchError && (
          <p className="text-sm text-destructive">{searchError}</p>
        )}
        
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-2 pr-4">
            {searchQuery === "" ? (
              <div className="text-center py-12 text-muted-foreground">
                Start typing to search for movies and TV shows
              </div>
            ) : filteredMovies.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                No results found for "{searchQuery}"
              </div>
            ) : (
              filteredMovies.map((movie) => (
                <button
                  key={movie.id}
                  onClick={() => handleMovieClick(movie)}
                  className="w-full flex items-center gap-4 p-3 rounded-lg hover:bg-accent/50 transition-all animate-fade-in text-left"
                >
                  <img
                    src={movie.poster}
                    alt={movie.title}
                    className="w-16 h-24 object-cover rounded border-2 border-primary/20"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-foreground truncate">
                      {movie.title}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {movie.year} • directed by {movie.director}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default MovieSearch;
