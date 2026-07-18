import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Film, TrendingUp, Plus, Users, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import MovieSearch from "@/components/MovieSearch";
import AddPostFlow from "@/components/AddPostFlow";
import type { TMDBMovie } from "@/lib/tmdb";

interface BottomNavProps {
  onPostClick?: () => void;
}

const BottomNav = ({ onPostClick }: BottomNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  const [searchOpen, setSearchOpen] = useState(false);
  const [postTarget, setPostTarget] = useState<{
    tmdbId: number;
    mediaType: "movie" | "tv";
    title: string;
    posterPath: string | null;
  } | null>(null);

  const handlePostClick = () => {
    if (onPostClick) {
      onPostClick();
      return;
    }
    setSearchOpen(true);
  };

  const handleSearchSelect = (movie: TMDBMovie) => {
    setPostTarget({
      tmdbId: movie.id,
      mediaType: movie.media_type === "tv" ? "tv" : "movie",
      title: movie.title || movie.name || "Untitled",
      posterPath: movie.poster_path,
    });
  };

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50 neon-border-subtle">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-around py-3">
            <Link to="/">
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  currentPath === "/" ? "text-primary" : ""
                }`}
              >
                <Film className={`w-5 h-5 ${currentPath === "/" ? "text-primary neon-glow-primary" : ""}`} />
                <span className={`text-xs ${currentPath === "/" ? "text-primary font-medium" : ""}`}>
                  Feed
                </span>
              </Button>
            </Link>

            <Link to="/discover">
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  currentPath === "/discover" ? "text-primary" : ""
                }`}
              >
                <TrendingUp className={`w-5 h-5 ${currentPath === "/discover" ? "text-primary neon-glow-primary" : ""}`} />
                <span className={`text-xs ${currentPath === "/discover" ? "text-primary font-medium" : ""}`}>
                  Discover
                </span>
              </Button>
            </Link>

            <Button
              variant="ghost"
              className="flex flex-col items-center gap-1 h-auto py-2"
              onClick={handlePostClick}
            >
              <div className="bg-primary rounded-full p-2 neon-glow-primary">
                <Plus className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xs">Post</span>
            </Button>

            <Link to="/community">
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  currentPath === "/community" ? "text-primary" : ""
                }`}
              >
                <Users className={`w-5 h-5 ${currentPath === "/community" ? "text-primary neon-glow-primary" : ""}`} />
                <span className={`text-xs ${currentPath === "/community" ? "text-primary font-medium" : ""}`}>
                  Community
                </span>
              </Button>
            </Link>

            <Link to="/profile">
              <Button
                variant="ghost"
                className={`flex flex-col items-center gap-1 h-auto py-2 ${
                  currentPath === "/profile" ? "text-primary" : ""
                }`}
              >
                <Sparkles className={`w-5 h-5 ${currentPath === "/profile" ? "text-primary neon-glow-primary" : ""}`} />
                <span className={`text-xs ${currentPath === "/profile" ? "text-primary font-medium" : ""}`}>
                  Profile
                </span>
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <MovieSearch
        open={searchOpen}
        onOpenChange={setSearchOpen}
        onSelect={handleSearchSelect}
        title="Pick a movie or show to rank"
      />

      {postTarget && (
        <AddPostFlow
          open={!!postTarget}
          onOpenChange={(v) => { if (!v) setPostTarget(null); }}
          tmdbId={postTarget.tmdbId}
          mediaType={postTarget.mediaType}
          title={postTarget.title}
          posterPath={postTarget.posterPath}
        />
      )}
    </>
  );
};

export default BottomNav;
