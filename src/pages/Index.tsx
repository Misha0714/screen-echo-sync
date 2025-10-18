import MovieCard from "@/components/MovieCard";
import ReviewCard from "@/components/ReviewCard";
import BottomNav from "@/components/BottomNav";
import AddPostDialog from "@/components/AddPostDialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Sparkles, TrendingUp, Users, Search, Film, Calendar, Bell, Plus } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { useState } from "react";

const Index = () => {
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);

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
      taggedFriends: [
        { name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
      ],
      photos: [
        "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=300&h=300&fit=crop",
      ],
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

  const vibes = ["Cozy", "Intense", "Nostalgic", "Uplifting", "Chaotic", "Existential"];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Mobile-First Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Film className="w-7 h-7 text-primary" />
              <span className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                Rewind
              </span>
            </div>
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Calendar className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" className="hover:bg-primary/10">
                <Bell className="w-5 h-5" />
              </Button>
            </div>
          </div>
          
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Search movies, friends, etc."
              className="pl-10 bg-muted/50"
            />
          </div>
        </div>
      </header>

      {/* Quick Action Pills */}
      <div className="container mx-auto px-4 py-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-3">
            <Button className="rounded-full bg-primary hover:bg-primary/90 flex-shrink-0">
              <Sparkles className="w-4 h-4 mr-2" />
              For You
            </Button>
            <Button variant="outline" className="rounded-full flex-shrink-0">
              <TrendingUp className="w-4 h-4 mr-2" />
              Trending
            </Button>
            <Button variant="outline" className="rounded-full flex-shrink-0">
              <Users className="w-4 h-4 mr-2" />
              Friends
            </Button>
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Vibes Filter */}
      <div className="container mx-auto px-4 pb-4">
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-2">
            {vibes.map((vibe) => (
              <Button 
                key={vibe} 
                variant="secondary" 
                size="sm" 
                className="rounded-full flex-shrink-0"
              >
                {vibe}
              </Button>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Trending Section */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Trending Now</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            See all
          </Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {trendingMovies.map((movie) => (
              <div key={movie.title} className="w-[160px] flex-shrink-0">
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Recommended Section */}
      <section className="container mx-auto px-4 py-6 bg-card/30">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-accent" />
            <h2 className="text-xl font-bold text-foreground">Recommended for You</h2>
          </div>
          <Button variant="ghost" size="sm" className="text-primary">
            See all
          </Button>
        </div>
        <p className="text-sm text-muted-foreground mb-4">Based on what your friends watched</p>
        <ScrollArea className="w-full whitespace-nowrap">
          <div className="flex gap-4 pb-4">
            {trendingMovies.map((movie) => (
              <div key={movie.title} className="w-[160px] flex-shrink-0">
                <MovieCard {...movie} />
              </div>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </section>

      {/* Reviews Feed */}
      <section className="container mx-auto px-4 py-6">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-secondary" />
          <h2 className="text-xl font-bold text-foreground">Your Feed</h2>
        </div>
        <div className="space-y-4">
          {recentReviews.map((review) => (
            <ReviewCard key={review.movieTitle} {...review} />
          ))}
        </div>
      </section>

      {/* Floating Add Post Button */}
      <Button
        onClick={() => setIsAddPostOpen(true)}
        className="fixed bottom-24 right-6 h-14 w-14 rounded-full shadow-lg hover:shadow-xl transition-shadow z-40"
        size="icon"
      >
        <Plus className="w-6 h-6" />
      </Button>

      <AddPostDialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen} />

      <BottomNav />

    </div>
  );
};

export default Index;