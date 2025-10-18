import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Star, Filter } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import BottomNav from "@/components/BottomNav";

interface MediaItem {
  id: number;
  title: string;
  year: string;
  poster: string;
  rating?: number;
  type: "movie" | "tv";
  genres: string[];
}

const Collection = () => {
  const { collectionType } = useParams<{ collectionType: string }>();
  const navigate = useNavigate();
  const [filterType, setFilterType] = useState<"all" | "movie" | "tv">("all");

  // Mock data - in production this would come from a database
  const collections: Record<string, MediaItem[]> = {
    watched: [
      {
        id: 1,
        title: "Past Lives",
        year: "2023",
        poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop",
        rating: 10.0,
        type: "movie",
        genres: ["Drama", "Romance"],
      },
      {
        id: 2,
        title: "The Last of Us",
        year: "2023",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop",
        rating: 9.8,
        type: "tv",
        genres: ["Drama", "Sci-Fi"],
      },
      {
        id: 4,
        title: "Succession",
        year: "2018-2023",
        poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop",
        rating: 9.5,
        type: "tv",
        genres: ["Drama"],
      },
      {
        id: 3,
        title: "The Lighthouse",
        year: "2019",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop",
        rating: 8.8,
        type: "movie",
        genres: ["Horror", "Drama"],
      },
      {
        id: 5,
        title: "Amélie",
        year: "2001",
        poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop",
        rating: 8.4,
        type: "movie",
        genres: ["Romance", "Comedy"],
      },
      {
        id: 6,
        title: "Breaking Bad",
        year: "2008-2013",
        poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=300&fit=crop",
        rating: 7.9,
        type: "tv",
        genres: ["Drama", "Thriller"],
      },
    ],
    watchlist: [
      {
        id: 7,
        title: "Spirited Away",
        year: "2001",
        poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=300&fit=crop",
        type: "movie",
        genres: ["Animation", "Fantasy"],
      },
      {
        id: 8,
        title: "The Bear",
        year: "2022-",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop",
        type: "tv",
        genres: ["Drama", "Comedy"],
      },
    ],
    favorites: [
      {
        id: 2,
        title: "The Last of Us",
        year: "2023",
        poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop",
        rating: 10.0,
        type: "tv",
        genres: ["Drama", "Sci-Fi"],
      },
      {
        id: 1,
        title: "Past Lives",
        year: "2023",
        poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop",
        rating: 9.7,
        type: "movie",
        genres: ["Drama", "Romance"],
      },
    ],
  };

  const items = collections[collectionType || "watched"] || [];
  
  // Sort by rating (highest first) and filter by type
  const sortedItems = [...items]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0));
  
  const filteredItems = sortedItems.filter((item) => {
    if (filterType === "all") return true;
    return item.type === filterType;
  });

  const getTitle = () => {
    switch (collectionType) {
      case "watched":
        return "Watched";
      case "watchlist":
        return "Want to Watch";
      case "favorites":
        return "Favorites";
      default:
        return "Collection";
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate(-1)}
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                {getTitle()}
              </h1>
            </div>
            <Badge variant="secondary" className="neon-badge">
              {filteredItems.length} titles
            </Badge>
          </div>

          {/* Filter Tabs */}
          <Tabs value={filterType} onValueChange={(v) => setFilterType(v as any)} className="w-full">
            <TabsList className="w-full bg-card/50">
              <TabsTrigger value="all" className="flex-1">All</TabsTrigger>
              <TabsTrigger value="movie" className="flex-1">Movies</TabsTrigger>
              <TabsTrigger value="tv" className="flex-1">TV Shows</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </header>

      {/* List View */}
      <div className="container mx-auto px-4 py-6">
        {filteredItems.length > 0 ? (
          <div className="space-y-4 animate-fade-in">
            {filteredItems.map((item, index) => (
              <Card
                key={item.id}
                className="overflow-hidden neon-card hover:neon-border-medium transition-all cursor-pointer"
                onClick={() => navigate(`/${item.type}/${item.id}`)}
              >
                <div className="flex items-center gap-4 p-4">
                  {/* Ranking Number */}
                  <div className="flex-shrink-0">
                    <div className="text-3xl font-bold text-foreground w-10 text-center">
                      {index + 1}
                    </div>
                  </div>

                  {/* Movie Poster */}
                  <div className="flex-shrink-0">
                    <img
                      src={item.poster}
                      alt={item.title}
                      className="w-16 h-24 object-cover rounded-lg poster-glow"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-foreground mb-1 line-clamp-2">
                          {item.title}
                        </h3>
                        
                        {/* Type and Genres */}
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <Badge variant="secondary" className="text-xs neon-badge">
                            {item.type === "tv" ? "TV Show" : "Movie"}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {item.genres.slice(0, 3).join(", ")}
                          </span>
                        </div>

                        {/* Year */}
                        <p className="text-sm text-muted-foreground">
                          {item.year}
                        </p>
                      </div>

                      {/* Rating Circle */}
                      {item.rating && (
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 rounded-full border-2 border-primary/30 flex items-center justify-center bg-background/50">
                            <span className="text-2xl font-bold text-primary">
                              {item.rating.toFixed(1)}
                            </span>
                          </div>
                        </div>
                      )}
                      
                      {/* Watchlist indicator (no rating) */}
                      {!item.rating && (
                        <div className="flex-shrink-0">
                          <Badge variant="outline" className="text-xs">
                            Not watched
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-muted-foreground text-lg mb-2">No {filterType === "all" ? "titles" : filterType === "tv" ? "TV shows" : "movies"} found</p>
            <p className="text-sm text-muted-foreground">Start adding to your collection!</p>
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  );
};

export default Collection;
