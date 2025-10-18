import { Link } from "react-router-dom";
import { ArrowLeft, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import MovieCard from "@/components/MovieCard";

const RecommendedMovies = () => {
  const recommendedMovies = [
    {
      title: "The Lighthouse",
      year: "2019",
      rating: 4.5,
      image: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&h=600&fit=crop",
      vibes: ["existential", "intense", "chaotic"] as const,
    },
    {
      title: "Amélie",
      year: "2001",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
      vibes: ["cozy", "nostalgic", "uplifting"] as const,
    },
    {
      title: "Blade Runner 2049",
      year: "2017",
      rating: 4.6,
      image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
      vibes: ["existential", "intense", "nostalgic"] as const,
    },
    {
      title: "Spirited Away",
      year: "2001",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
      vibes: ["nostalgic", "cozy", "uplifting"] as const,
    },
    {
      title: "Her",
      year: "2013",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
      vibes: ["existential", "nostalgic"] as const,
    },
    {
      title: "Whiplash",
      year: "2014",
      rating: 4.8,
      image: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=400&h=600&fit=crop",
      vibes: ["intense", "uplifting"] as const,
    },
    {
      title: "Your Name",
      year: "2016",
      rating: 4.9,
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=600&fit=crop",
      vibes: ["nostalgic", "uplifting"] as const,
    },
    {
      title: "The Handmaiden",
      year: "2016",
      rating: 4.7,
      image: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=400&h=600&fit=crop",
      vibes: ["intense", "nostalgic"] as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Users className="w-6 h-6 text-accent" />
              <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Recommended for You
              </h1>
            </div>
          </div>
        </div>
      </header>

      {/* Subtitle */}
      <div className="container mx-auto px-4 pt-4 pb-2">
        <p className="text-muted-foreground">Based on what your friends watched</p>
      </div>

      {/* Movies Grid */}
      <section className="container mx-auto px-4 py-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {recommendedMovies.map((movie) => (
            <Link 
              key={movie.title} 
              to={`/movie/${movie.title.toLowerCase().replace(/\s+/g, '-')}`}
              className="animate-fade-in"
            >
              <MovieCard {...movie} />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default RecommendedMovies;
