import { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Star, Clock, Calendar, Users as UsersIcon, Heart, MessageCircle, Play, ChevronDown, Bookmark, Plus } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { haptic } from "@/lib/haptic";
import AddPostDialog from "@/components/AddPostDialog";
import { useToast } from "@/hooks/use-toast";

interface Review {
  id: number;
  userName: string;
  userUsername: string;
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
  const { toast } = useToast();
  const [isAddPostOpen, setIsAddPostOpen] = useState(false);
  const [showAllCast, setShowAllCast] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = () => {
    haptic.light();
    setIsSaved(!isSaved);
    toast({
      title: isSaved ? "Removed from watchlist" : "Added to watchlist",
      description: isSaved ? "Removed from your Want to Watch list" : "Added to your Want to Watch list",
    });
  };

  // Mock movie data - in production this would come from an API
  const movie = {
    id: movieId,
    title: "Past Lives",
    year: "2023",
    director: "Celine Song",
    runtime: "121 mins",
    genres: ["Drama", "Romance"],
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=400&h=600&fit=crop",
    backdrop: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=1200&h=600&fit=crop",
    averageRating: 3.8,
    totalReviews: 83,
    tagline: "Two childhood friends are reunited after decades apart.",
    description: "Nora and Hae Sung, two deeply connected childhood friends, are wrenched apart after Nora's family emigrates from South Korea. Twenty years later, they are reunited for one fateful week as they confront destiny, love and the choices that make a life.",
    cast: [
      { name: "Greta Lee", role: "Nora" },
      { name: "Teo Yoo", role: "Hae Sung" },
      { name: "John Magaro", role: "Arthur" },
      { name: "Moon Seung-ah", role: "Young Nora" },
    ],
    ratingDistribution: [
      { stars: 5, count: 45 },
      { stars: 4, count: 38 },
      { stars: 3, count: 12 },
      { stars: 2, count: 3 },
      { stars: 1, count: 2 },
    ]
  };

  const [reviews] = useState<Review[]>([
    {
      id: 1,
      userName: "Sarah Johnson",
      userUsername: "sarahjmovies",
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
      userUsername: "alexchen",
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
      userUsername: "moviebuff2023",
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

  const maxRatingCount = Math.max(...movie.ratingDistribution.map(r => r.count));

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Hero Section with Backdrop */}
      <div className="relative h-[60vh] overflow-hidden">
        <img
          src={movie.backdrop}
          alt={movie.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-background/60 to-background" />
        
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 left-4 bg-background/80 backdrop-blur-sm hover:bg-background"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        {/* Movie Title and Info Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="container mx-auto flex items-end gap-6">
            <img
              src={movie.poster}
              alt={movie.title}
              className="w-32 h-48 object-cover rounded-lg shadow-2xl poster-glow"
            />
            
            <div className="flex-1 pb-2">
              <h1 className="text-4xl font-bold text-foreground mb-2">{movie.title}</h1>
              <p className="text-muted-foreground mb-3">
                {movie.year} • DIRECTED BY <span className="font-semibold">{movie.director}</span>
              </p>
              
              <div className="flex items-center gap-3">
                <Button className="gap-2" onClick={() => haptic.light()}>
                  <Play className="w-4 h-4" />
                  TRAILER
                </Button>
                <Button 
                  variant="outline" 
                  className="gap-2"
                  onClick={handleSave}
                >
                  <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                  {isSaved ? 'Saved' : 'Save'}
                </Button>
                <Button 
                  variant="secondary" 
                  className="gap-2"
                  onClick={() => {
                    haptic.light();
                    setIsAddPostOpen(true);
                  }}
                >
                  <Plus className="w-4 h-4" />
                  Add Post
                </Button>
                <span className="text-muted-foreground">{movie.runtime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 space-y-6">

        {/* Tagline */}
        {movie.tagline && (
          <p className="text-lg font-semibold text-muted-foreground mb-4">
            {movie.tagline}
          </p>
        )}

        {/* Description */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <p className="text-foreground/90 leading-relaxed">{movie.description}</p>
          </CardContent>
        </Card>

        {/* Ratings Section */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold mb-4">RATINGS</h3>
            
            <div className="flex items-end gap-2 mb-6">
              {movie.ratingDistribution.map((rating) => {
                const barHeight = (rating.count / maxRatingCount) * 100;
                return (
                  <div key={rating.stars} className="flex-1 flex flex-col items-center gap-1">
                    <div
                      className="w-full bg-primary/30 rounded-t"
                      style={{ height: `${Math.max(barHeight, 10)}px` }}
                    />
                    <div className="flex items-center gap-0.5">
                      {[...Array(rating.stars)].map((_, i) => (
                        <Star key={i} className="w-2.5 h-2.5 text-primary fill-primary" />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="w-6 h-6 text-primary fill-primary" />
                <span className="text-3xl font-bold">{movie.averageRating}</span>
              </div>
              <div className="flex items-center gap-2">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-5 h-5 text-primary fill-primary" />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Cast Section */}
        {showAllCast && (
          <Card className="mb-6">
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-4">Cast</h3>
              <div className="space-y-3">
                {movie.cast.map((actor) => (
                  <div key={actor.name} className="flex justify-between items-center">
                    <span className="font-medium">{actor.name}</span>
                    <span className="text-sm text-muted-foreground">{actor.role}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Reviews Section */}
        <div className="mb-6">
          <div
            className="flex items-center justify-between mb-4 cursor-pointer"
            onClick={() => setShowAllCast(!showAllCast)}
          >
            <h3 className="text-lg font-semibold">
              Show {movie.cast.length} more
            </h3>
            <ChevronDown className={`w-5 h-5 transition-transform ${showAllCast ? 'rotate-180' : ''}`} />
          </div>
        </div>

        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">POPULAR REVIEWS</h3>
          
          <div className="space-y-4">
            {sortedReviews.slice(0, 3).map((review) => (
              <Card key={review.id}>
                <CardContent className="p-4">
                  <div className="flex items-start gap-3 mb-3">
                    <Link to={`/profile/${review.userUsername}`} onClick={() => haptic.light()}>
                      <Avatar className="w-10 h-10 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-all">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback>{review.userName[0]}</AvatarFallback>
                      </Avatar>
                    </Link>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <Link to={`/profile/${review.userUsername}`} onClick={() => haptic.light()}>
                          <p className="font-semibold text-sm hover:text-primary transition-colors cursor-pointer">
                            {review.userName}
                          </p>
                        </Link>
                        <div className="flex items-center gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-3 h-3 ${
                                i < review.rating ? "text-primary fill-primary" : "text-muted"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                      
                      <p className="text-foreground/90 text-sm leading-relaxed">
                        {review.review}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Link to={`/movie/${movieId}/reviews`}>
            <Button
              variant="ghost"
              className="w-full mt-4 text-muted-foreground hover:text-foreground"
              onClick={() => haptic.light()}
            >
              All reviews
              <ChevronDown className="w-4 h-4 ml-2 -rotate-90" />
            </Button>
          </Link>
        </div>

        {/* Related Films */}
        <div>
          <h3 className="text-lg font-semibold mb-4">RELATED FILMS</h3>
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://images.unsplash.com/photo-${1485846234645 + i * 1000}-a62644f84728?w=200&h=300&fit=crop`}
                  alt={`Related movie ${i}`}
                  className="w-32 h-48 object-cover rounded border-2 border-primary/20 cursor-pointer hover:border-primary/50 transition-all"
                  onClick={() => haptic.light()}
                />
              ))}
            </div>
          </ScrollArea>
        </div>
      </div>

      <AddPostDialog open={isAddPostOpen} onOpenChange={setIsAddPostOpen} />
      <BottomNav />
    </div>
  );
};

export default MovieDetails;
