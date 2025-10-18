import Navigation from "@/components/Navigation";
import MovieCard from "@/components/MovieCard";
import ReviewCard from "@/components/ReviewCard";
import { Button } from "@/components/ui/button";
import { Sparkles, TrendingUp, Users } from "lucide-react";
import heroImage from "@/assets/hero-theater.jpg";

const Index = () => {
  const trendingMovies = [
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
  ];

  const recentReviews = [
    {
      userName: "Alex Chen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      movieTitle: "Past Lives",
      movieYear: "2023",
      rating: 5,
      review: "A quietly devastating exploration of paths not taken. The film captures the ache of 'what if' with such grace. Every frame feels like a memory you can't quite hold onto.",
      vibes: ["nostalgic", "existential"] as const,
      likes: 234,
      comments: 42,
      moviePoster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop",
    },
    {
      userName: "Sam Rivera",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sam",
      movieTitle: "Everything Everywhere All at Once",
      movieYear: "2022",
      rating: 5,
      review: "Pure chaotic brilliance. A multiverse of emotions packed into one wild ride. Laugh-cry-existential crisis speedrun. Michelle Yeoh deserves every award.",
      vibes: ["chaotic", "uplifting", "existential"] as const,
      likes: 512,
      comments: 89,
      moviePoster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      
      {/* Hero Section */}
      <section className="relative h-[80vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImage}
            alt="Cinema"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-hero" />
        </div>
        
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto animate-fade-in">
          <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight">
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Your Vibe.
            </span>
            <br />
            <span className="text-foreground">Your Cinema.</span>
          </h1>
          <p className="text-xl text-foreground/80 mb-8 max-w-2xl mx-auto">
            Discover, review, and share movies that match your mood. Join a community that gets the vibe.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" className="bg-gradient-primary hover:opacity-90 text-lg px-8">
              <Sparkles className="w-5 h-5 mr-2" />
              Get Started
            </Button>
            <Button size="lg" variant="outline" className="border-primary/50 hover:bg-primary/10 text-lg px-8">
              Explore Vibes
            </Button>
          </div>
        </div>
      </section>

      {/* Trending Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <TrendingUp className="w-6 h-6 text-primary" />
          <h2 className="text-3xl font-bold text-foreground">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.title} {...movie} />
          ))}
        </div>
      </section>

      {/* Recommended Section */}
      <section className="container mx-auto px-4 py-16 bg-card/30">
        <div className="flex items-center gap-3 mb-8">
          <Users className="w-6 h-6 text-accent" />
          <h2 className="text-3xl font-bold text-foreground">Recommended for You</h2>
        </div>
        <p className="text-muted-foreground mb-6">Based on what your friends watched and your preferences</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {trendingMovies.map((movie) => (
            <MovieCard key={movie.title} {...movie} />
          ))}
        </div>
      </section>

      {/* Reviews Feed */}
      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center gap-3 mb-8">
          <Sparkles className="w-6 h-6 text-secondary" />
          <h2 className="text-3xl font-bold text-foreground">Recent Reviews</h2>
        </div>
        <div className="max-w-3xl mx-auto space-y-6">
          {recentReviews.map((review) => (
            <ReviewCard key={review.movieTitle} {...review} />
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="bg-gradient-primary rounded-3xl p-12 text-center">
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to find your vibe?
          </h2>
          <p className="text-white/90 text-lg mb-8 max-w-2xl mx-auto">
            Join thousands of cinephiles sharing their movie moments, building rankings, and discovering what to watch next.
          </p>
          <Button size="lg" variant="secondary" className="text-lg px-8">
            Join Rewind
          </Button>
        </div>
      </section>
    </div>
  );
};

export default Index;