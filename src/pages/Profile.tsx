import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, CheckCircle2, Bookmark, Heart, Trophy, Flame, Settings } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";

const Profile = () => {
  const watchedMovies = [
    { title: "Past Lives", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop" },
    { title: "The Lighthouse", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop" },
    { title: "Amélie", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop" },
    { title: "Blade Runner 2049", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=300&fit=crop" },
  ];

  const watchlistMovies = [
    { title: "Spirited Away", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=300&fit=crop" },
    { title: "Movie 2", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop" },
  ];

  const recentReviews = [
    {
      userName: "Alex Chen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      movieTitle: "Past Lives",
      movieYear: "2023",
      rating: 5,
      review: "A quietly devastating exploration of paths not taken. The film captures the ache of 'what if' with such grace.",
      vibes: ["nostalgic", "existential"] as const,
      likes: 234,
      comments: 42,
      moviePoster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-bold">Profile</h1>
            <Button variant="ghost" size="icon">
              <Settings className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20">
            <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=Alex" alt="Alex Chen" />
            <AvatarFallback>AC</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold text-foreground mb-1">@alex_cinema</h1>
          <p className="text-sm text-muted-foreground mb-2">Member since February 2025</p>
          <p className="text-foreground/80 mb-6">all my movie picks finally have a purpose</p>
          
          <div className="flex gap-3 justify-center mb-6">
            <Button variant="outline" className="border-border">Edit profile</Button>
            <Button variant="outline" className="border-border gap-2">
              <Share2 className="w-4 h-4" />
              Share profile
            </Button>
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-12 mb-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">24</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">23</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">🔒</div>
              <div className="text-sm text-muted-foreground">Rank on Rewind</div>
            </div>
          </div>
        </div>

        {/* Collection Sections */}
        <div className="space-y-4 mb-8">
          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              <span className="font-semibold text-foreground">Watched</span>
            </div>
            <span className="text-2xl font-bold text-foreground">45</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Bookmark className="w-6 h-6 text-secondary" />
              <span className="font-semibold text-foreground">Want to Watch</span>
            </div>
            <span className="text-2xl font-bold text-foreground">8</span>
          </div>

          <div className="flex items-center justify-between p-4 bg-card border border-border rounded-lg hover:border-primary/30 transition-colors cursor-pointer">
            <div className="flex items-center gap-3">
              <Heart className="w-6 h-6 text-accent" />
              <span className="font-semibold text-foreground">Recs for You</span>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 mb-8">
          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <Trophy className="w-6 h-6 text-primary" />
              <span className="text-sm text-muted-foreground">Rank on Rewind</span>
            </div>
            <div className="text-sm text-muted-foreground">🔒</div>
          </Card>

          <Card className="p-6 bg-card border-border">
            <div className="flex items-center gap-3 mb-2">
              <Flame className="w-6 h-6 text-accent" />
              <span className="text-sm text-muted-foreground">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-foreground">4 weeks</div>
          </Card>
        </div>

        {/* Recent Activity Tab */}
        <Tabs defaultValue="activity" className="w-full">
          <TabsList className="w-full mb-6">
            <TabsTrigger value="activity" className="flex-1">Recent Activity</TabsTrigger>
            <TabsTrigger value="taste" className="flex-1">Taste Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="activity" className="space-y-6">
            {recentReviews.map((review) => (
              <ReviewCard key={review.movieTitle} {...review} />
            ))}
          </TabsContent>

          <TabsContent value="taste" className="space-y-4">
            <p className="text-center text-muted-foreground py-12">
              Your taste profile will appear here based on your viewing history and ratings.
            </p>
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default Profile;
