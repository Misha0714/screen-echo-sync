import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Heart, X, Info, ArrowLeft, Search } from "lucide-react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import { haptic } from "@/lib/haptic";
import MovieSearch from "@/components/MovieSearch";

interface Movie {
  id: number;
  title: string;
  year: string;
  poster: string;
  genres: string[];
  matchPercentage: number;
  description: string;
  type: "movie" | "tv";
}

const Discover = () => {
  const movies = [
    {
      id: 1,
      title: "The Lighthouse",
      year: "2019",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
      genres: ["Psychological", "Horror", "Drama"],
      matchPercentage: 94,
      description: "Two lighthouse keepers descend into madness on a remote island.",
      type: "movie",
    },
    {
      id: 2,
      title: "The Last of Us",
      year: "2023",
      poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
      genres: ["Drama", "Sci-Fi", "Adventure"],
      matchPercentage: 96,
      description: "A grizzled survivor and a young girl traverse a post-apocalyptic America.",
      type: "tv",
    },
    {
      id: 3,
      title: "Amélie",
      year: "2001",
      poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
      genres: ["Romance", "Comedy", "Drama"],
      matchPercentage: 89,
      description: "A shy waitress decides to change the lives of those around her.",
      type: "movie",
    },
    {
      id: 4,
      title: "Succession",
      year: "2018-2023",
      poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
      genres: ["Drama"],
      matchPercentage: 93,
      description: "The Roy family fights for control of their media conglomerate.",
      type: "tv",
    },
    {
      id: 5,
      title: "Blade Runner 2049",
      year: "2017",
      poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
      genres: ["Sci-Fi", "Thriller", "Mystery"],
      matchPercentage: 92,
      description: "A blade runner uncovers a secret that could plunge society into chaos.",
      type: "movie",
    },
    {
      id: 6,
      title: "The Bear",
      year: "2022-",
      poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
      genres: ["Drama", "Comedy"],
      matchPercentage: 91,
      description: "A young chef returns to Chicago to run his family's sandwich shop.",
      type: "tv",
    },
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const currentMovie = movies[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (!currentMovie) return;

    if (direction === "right") {
      haptic.success();
      toast.success(`Added "${currentMovie.title}" to watchlist! 💜`);
    } else {
      haptic.medium();
      toast(`Skipped "${currentMovie.title}"`);
    }

    setTimeout(() => {
      setCurrentIndex((prev) => prev + 1);
      setDragOffset({ x: 0, y: 0 });
    }, 300);
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStart({ x: clientX, y: clientY });
  };

  const handleDragMove = (clientX: number, clientY: number) => {
    if (!isDragging || !dragStart) return;

    const deltaX = clientX - dragStart.x;
    const deltaY = clientY - dragStart.y;
    setDragOffset({ x: deltaX, y: deltaY });
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDragStart(null);

    const threshold = 100;
    if (Math.abs(dragOffset.x) > threshold) {
      handleSwipe(dragOffset.x > 0 ? "right" : "left");
    } else {
      setDragOffset({ x: 0, y: 0 });
    }
  };

  const rotation = dragOffset.x * 0.1;
  const opacity = 1 - Math.abs(dragOffset.x) / 500;

  if (currentIndex >= movies.length) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            That's all for now!
          </h2>
          <p className="text-muted-foreground">Check back later for more recommendations</p>
            <Link to="/">
              <Button className="mt-4">Back to Feed</Button>
            </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <h1 className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Discover Movies & TV
            </h1>
            <Button variant="ghost" size="icon">
              <Info className="w-5 h-5" />
            </Button>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search for movies & TV shows..."
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

      <MovieSearch open={isSearchOpen} onOpenChange={setIsSearchOpen} />

      {/* Card Stack */}
      <div className="container mx-auto px-4 py-8 flex flex-col items-center justify-center min-h-[calc(100vh-200px)]">
        <div className="relative w-full max-w-md h-[600px]">
          {/* Next cards preview (stack effect) */}
          {movies.slice(currentIndex + 1, currentIndex + 3).map((movie, idx) => (
            <div
              key={movie.id}
              className="absolute inset-0 rounded-2xl overflow-hidden"
              style={{
                transform: `scale(${1 - (idx + 1) * 0.05}) translateY(${(idx + 1) * -10}px)`,
                zIndex: -(idx + 1),
                opacity: 0.5 - idx * 0.2,
              }}
            >
              <img
                src={movie.poster}
                alt={movie.title}
                className="w-full h-full object-cover"
              />
            </div>
          ))}

          {/* Current card */}
          {currentMovie && (
            <div
              ref={cardRef}
              className="absolute inset-0 rounded-2xl overflow-hidden shadow-2xl cursor-grab active:cursor-grabbing transition-all poster-glow"
              style={{
                transform: `translate(${dragOffset.x}px, ${dragOffset.y}px) rotate(${rotation}deg)`,
                opacity: opacity,
                transition: isDragging ? "none" : "transform 0.3s ease-out, opacity 0.3s ease-out",
              }}
              onMouseDown={(e) => {
                haptic.light();
                handleDragStart(e.clientX, e.clientY);
              }}
              onMouseMove={(e) => isDragging && handleDragMove(e.clientX, e.clientY)}
              onMouseUp={handleDragEnd}
              onMouseLeave={handleDragEnd}
              onTouchStart={(e) => {
                haptic.light();
                handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
              }}
              onTouchMove={(e) => handleDragMove(e.touches[0].clientX, e.touches[0].clientY)}
              onTouchEnd={handleDragEnd}
            >
              {/* Movie Poster */}
              <img
                src={currentMovie.poster}
                alt={currentMovie.title}
                className="w-full h-full object-cover"
                draggable={false}
              />

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

              {/* Match Badge */}
              <div className="absolute top-4 right-4">
                <div className="bg-primary/90 backdrop-blur-sm rounded-full px-4 py-2">
                  <span className="text-lg font-bold text-primary-foreground">
                    {currentMovie.matchPercentage}% Match
                  </span>
                </div>
              </div>

              {/* Swipe Indicators */}
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

              {/* Movie Info */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="secondary" className="neon-badge">
                    {currentMovie.type === "tv" ? "TV Show" : "Movie"}
                  </Badge>
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-foreground mb-1">
                    {currentMovie.title}
                  </h2>
                  <p className="text-muted-foreground">{currentMovie.year}</p>
                </div>

                <p className="text-sm text-foreground/90 line-clamp-2">
                  {currentMovie.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {currentMovie.genres.map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="bg-secondary/20 text-secondary border-secondary/30"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-center gap-6 mt-8">
          <Button
            size="lg"
            variant="outline"
            className="h-16 w-16 rounded-full border-destructive/50 hover:bg-destructive/10 hover:border-destructive"
            onClick={() => handleSwipe("left")}
            disabled={!currentMovie}
          >
            <X className="w-8 h-8 text-destructive" />
          </Button>

          <Button
            size="lg"
            className="h-20 w-20 rounded-full bg-gradient-primary hover:opacity-90"
            onClick={() => handleSwipe("right")}
            disabled={!currentMovie}
          >
            <Heart className="w-10 h-10" />
          </Button>
        </div>

        {/* Counter */}
        <p className="text-center text-muted-foreground mt-6">
          {currentIndex + 1} / {movies.length}
        </p>
      </div>
    </div>
  );
};

export default Discover;
