import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, Star, Clock, Calendar, Users as UsersIcon, Heart, MessageCircle } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { haptic } from "@/lib/haptic";

interface Review {
  id: number;
  userName: string;
  userAvatar: string;
  rating: number;
  review: string;
  isFriend: boolean;
  isPublic: boolean;
  likes: number;
  comments: number;
  date: string;
}

const MovieDetails = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();

  // Mock movie data - in production this would come from an API
  const movie = {
    id: movieId,
    title: "Past Lives",
    year: "2023",
    director: "Celine Song",
    runtime: "105 min",
    genres: ["Drama", "Romance"],
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop",
    averageRating: 4.7,
    totalReviews: 234,
    description: "Nora and Hae Sung, two deeply connected childhood friends, are wrest apart after Nora's family emigrates from South Korea. Two decades later, they are reunited in New York for one fateful week as they confront notions of destiny, love, and the choices that make a life.",
  };

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      userName: "Sarah Johnson",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
      review: "A quietly devastating exploration of paths not taken. The film captures the ache of 'what if' with such grace. Every frame feels like a memory you can't quite hold onto.",
      isFriend: true,
      isPublic: true,
      likes: 45,
      comments: 12,
      date: "2 days ago",
    },
    {
      id: 2,
      userName: "Alex Chen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      rating: 5,
      review: "One of the best films about love and connection I've seen. The performances are subtle yet powerful. Left the theater in tears.",
      isFriend: true,
      isPublic: false,
      likes: 23,
      comments: 5,
      date: "1 week ago",
    },
    {
      id: 3,
      userName: "MovieBuff2023",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=MovieBuff",
      rating: 4,
      review: "Beautiful cinematography and a touching story. Some pacing issues but overall a great watch.",
      isFriend: false,
      isPublic: true,
      likes: 89,
      comments: 34,
      date: "3 weeks ago",
    },
  ]);

  // Sort reviews: friends first, then by likes
  const sortedReviews = [...reviews].sort((a, b) => {
    if (a.isFriend && !b.isFriend) return -1;
    if (!a.isFriend && b.isFriend) return 1;
    return b.likes - a.likes;
  });

  const handleLike = () => {
    haptic.light();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section */}
      <div className="relative h-64 overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-transparent" />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>
      </div>

      {/* Movie Info */}
      <div className="container mx-auto px-4 -mt-20 relative z-10">
        <div className="flex gap-6 mb-6">
          <img
            src={movie.poster}
            alt={movie.title}
            className="w-32 h-48 object-cover rounded-lg shadow-2xl poster-glow"
          />
          
          <div className="flex-1 pt-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">{movie.title}</h1>
            <div className="flex items-center gap-2 mb-4">
              <div className="flex items-center gap-1 bg-primary/20 px-3 py-1 rounded-full">
                <Star className="w-4 h-4 text-primary fill-primary" />
                <span className="font-bold text-primary">{movie.averageRating}</span>
              </div>
              <span className="text-sm text-muted-foreground">
                {movie.totalReviews} reviews
              </span>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {movie.genres.map((genre) => (
                <Badge key={genre} variant="secondary" className="neon-badge">
                  {genre}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        {/* Movie Metadata */}
        <Card className="mb-6 neon-card">
          <CardContent className="p-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <Calendar className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-semibold text-foreground">{movie.year}</div>
                <div className="text-xs text-muted-foreground">Year</div>
              </div>
              <div>
                <Clock className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-semibold text-foreground">{movie.runtime}</div>
                <div className="text-xs text-muted-foreground">Runtime</div>
              </div>
              <div>
                <UsersIcon className="w-5 h-5 mx-auto mb-1 text-muted-foreground" />
                <div className="text-sm font-semibold text-foreground">{movie.director}</div>
                <div className="text-xs text-muted-foreground">Director</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full mb-6 bg-card/50 neon-border-subtle">
            <TabsTrigger value="overview" className="flex-1">Overview</TabsTrigger>
            <TabsTrigger value="reviews" className="flex-1">
              Reviews ({movie.totalReviews})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4 animate-fade-in">
            <Card className="neon-card">
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-3">Synopsis</h3>
                <p className="text-foreground/90 leading-relaxed">{movie.description}</p>
              </CardContent>
            </Card>

            <Button className="w-full neon-glow-primary" size="lg">
              Add to Watchlist
            </Button>
          </TabsContent>

          <TabsContent value="reviews" className="space-y-4 animate-fade-in">
            {sortedReviews.map((review) => (
              <Card key={review.id} className="neon-card">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4 mb-4">
                    <Avatar className="w-12 h-12 border-2 border-primary/20 neon-border-subtle">
                      <AvatarImage src={review.userAvatar} alt={review.userName} />
                      <AvatarFallback>{review.userName[0]}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground">{review.userName}</p>
                            {review.isFriend && (
                              <Badge variant="secondary" className="text-xs neon-badge">
                                Friend
                              </Badge>
                            )}
                            {!review.isPublic && review.isFriend && (
                              <Badge variant="outline" className="text-xs">
                                Private
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{review.date}</p>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < review.rating
                                  ? "text-primary fill-primary"
                                  : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      {review.isFriend && (
                        <p className="text-sm text-primary/80 italic mb-2">
                          Your friend reviewed this
                        </p>
                      )}
                      
                      <p className="text-foreground/90 leading-relaxed mb-4">
                        {review.review}
                      </p>
                      
                      <div className="flex items-center gap-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={handleLike}
                          className="hover:text-accent hover:neon-glow-accent"
                        >
                          <Heart className="w-4 h-4 mr-1" />
                          {review.likes}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => haptic.light()}
                          className="hover:text-secondary hover:neon-glow-secondary"
                        >
                          <MessageCircle className="w-4 h-4 mr-1" />
                          {review.comments}
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {sortedReviews.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No reviews yet. Be the first to review!</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <BottomNav />
    </div>
  );
};

export default MovieDetails;
