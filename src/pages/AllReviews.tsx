import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ArrowLeft, Star, Heart, MessageCircle, MoreVertical } from "lucide-react";
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
  hasLiked?: boolean;
}

type ReviewFilter = "everyone" | "friends" | "you" | "liked";

const AllReviews = () => {
  const { movieId } = useParams();
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<ReviewFilter>("everyone");

  // Mock data - in production this would come from an API
  const movieTitle = "Spider-Man";
  
  const allReviews: Review[] = [
    {
      id: 1,
      userName: "Erik",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Erik",
      rating: 3.5,
      review: "why does Willem Dafoe need to wear that giant green goblin mask when it's identical to his normal facial expression",
      isFriend: false,
      isPublic: true,
      likes: 1234,
      comments: 89,
      date: "2 weeks ago",
      hasLiked: false,
    },
    {
      id: 2,
      userName: "Jamelle Bouie",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jamelle",
      rating: 4,
      review: "i had to beat an old lady with a stick to get these cranberries.",
      isFriend: false,
      isPublic: true,
      likes: 892,
      comments: 45,
      date: "3 weeks ago",
      hasLiked: true,
    },
    {
      id: 3,
      userName: "Will Steele",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Will",
      rating: 4,
      review: "I both adore and detest how this now plays like a nonstop meme compilation",
      isFriend: true,
      isPublic: true,
      likes: 567,
      comments: 34,
      date: "1 month ago",
      hasLiked: false,
    },
    {
      id: 4,
      userName: "Matt",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Matt",
      rating: 4,
      review: "A film where a teenagers life changes when he realises that he can produce white sickly liquid from his body.",
      isFriend: false,
      isPublic: true,
      likes: 445,
      comments: 23,
      date: "1 month ago",
      hasLiked: false,
    },
    {
      id: 5,
      userName: "Sarah J",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      rating: 5,
      review: "The perfect superhero origin story. Tobey Maguire captures the awkwardness and heart of Peter Parker perfectly.",
      isFriend: true,
      isPublic: true,
      likes: 234,
      comments: 18,
      date: "2 months ago",
      hasLiked: true,
    },
  ];

  const getFilteredReviews = () => {
    switch (activeFilter) {
      case "friends":
        return allReviews.filter(r => r.isFriend);
      case "you":
        return []; // Would show user's own review
      case "liked":
        return allReviews.filter(r => r.hasLiked);
      default:
        return allReviews;
    }
  };

  const filteredReviews = getFilteredReviews();

  const [reviewStates, setReviewStates] = useState<Record<number, boolean>>(
    allReviews.reduce((acc, review) => ({ ...acc, [review.id]: review.hasLiked || false }), {})
  );

  const handleLike = (reviewId: number) => {
    haptic.light();
    setReviewStates(prev => ({
      ...prev,
      [reviewId]: !prev[reviewId]
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-lg font-bold">Reviews of {movieTitle}</h1>
                <p className="text-xs text-muted-foreground">Film</p>
              </div>
            </div>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6">
        {/* Filters */}
        <Tabs value={activeFilter} onValueChange={(v) => setActiveFilter(v as ReviewFilter)} className="w-full mb-6">
          <TabsList className="w-full bg-card/50">
            <TabsTrigger value="everyone" className="flex-1">Everyone</TabsTrigger>
            <TabsTrigger value="friends" className="flex-1">Friends</TabsTrigger>
            <TabsTrigger value="you" className="flex-1">You</TabsTrigger>
            <TabsTrigger value="liked" className="flex-1">Liked</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Reviews List */}
        <ScrollArea className="h-[calc(100vh-200px)]">
          <div className="space-y-4 pb-6">
            {filteredReviews.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">
                  {activeFilter === "you" && "You haven't reviewed this yet"}
                  {activeFilter === "friends" && "No reviews from friends yet"}
                  {activeFilter === "liked" && "No liked reviews yet"}
                  {activeFilter === "everyone" && "No reviews yet"}
                </p>
              </div>
            ) : (
              filteredReviews.map((review) => (
                <Card key={review.id} className="animate-fade-in">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={review.userAvatar} alt={review.userName} />
                        <AvatarFallback>{review.userName[0]}</AvatarFallback>
                      </Avatar>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-1">
                          <div className="flex items-center gap-2">
                            <p className="font-semibold text-foreground text-sm">{review.userName}</p>
                            {review.isFriend && (
                              <Badge variant="secondary" className="text-xs">Friend</Badge>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => {
                              const fullStars = Math.floor(review.rating);
                              const hasHalfStar = review.rating % 1 !== 0 && i === fullStars;
                              
                              return (
                                <Star
                                  key={i}
                                  className={`w-3 h-3 ${
                                    i < fullStars
                                      ? "text-primary fill-primary"
                                      : hasHalfStar
                                      ? "text-primary fill-primary opacity-50"
                                      : "text-muted"
                                  }`}
                                />
                              );
                            })}
                          </div>
                        </div>
                        
                        <p className="text-foreground/90 text-sm leading-relaxed mb-3">
                          {review.review}
                        </p>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleLike(review.id)}
                              className={`h-8 ${reviewStates[review.id] ? 'text-accent' : ''}`}
                            >
                              <Heart className={`w-3.5 h-3.5 mr-1 ${reviewStates[review.id] ? 'fill-accent' : ''}`} />
                              <span className="text-xs">{review.likes}</span>
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => haptic.light()}
                              className="h-8"
                            >
                              <MessageCircle className="w-3.5 h-3.5 mr-1" />
                              <span className="text-xs">{review.comments}</span>
                            </Button>
                          </div>
                          <span className="text-xs text-muted-foreground">{review.date}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </div>
    </div>
  );
};

export default AllReviews;
