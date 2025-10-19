import { Heart, MessageCircle, Share2, Star, Smile } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useState } from "react";
import { Link } from "react-router-dom";
import VibeTag from "./VibeTag";
import { haptic } from "@/lib/haptic";

interface ReviewCardProps {
  userName: string;
  userAvatar: string;
  movieTitle: string;
  movieYear: string;
  rating: number;
  review: string;
  vibes: readonly ("cozy" | "chaotic" | "nostalgic" | "existential" | "uplifting" | "intense")[];
  likes: number;
  comments: number;
  moviePoster: string;
  taggedFriends?: { name: string; avatar: string }[];
  photos?: string[];
  userUsername?: string; // username for profile link
}

const ReviewCard = ({
  userName,
  userAvatar,
  movieTitle,
  movieYear,
  rating,
  review,
  vibes,
  likes,
  comments,
  moviePoster,
  taggedFriends = [],
  photos = [],
  userUsername,
}: ReviewCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [showReactions, setShowReactions] = useState(false);
  const [selectedReaction, setSelectedReaction] = useState<string | null>(null);
  const [likeCount, setLikeCount] = useState(likes);
  const [showComments, setShowComments] = useState(false);

  // Mock comments data
  const mockComments = [
    {
      id: 1,
      userName: "Emma Davis",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
      comment: "Great review! I felt the same way about this one.",
      timestamp: "2h ago"
    },
    {
      id: 2,
      userName: "Mike Chen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      comment: "This is now on my watchlist, thanks!",
      timestamp: "5h ago"
    }
  ];

  // Generate username from name if not provided
  const username = userUsername || userName.toLowerCase().replace(/\s+/g, '');

  const reactions = ["❤️", "😂", "😮", "😢", "😍", "🔥"];

  const handleLike = () => {
    haptic.light();
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleReaction = (reaction: string) => {
    haptic.selection();
    setSelectedReaction(reaction);
    setShowReactions(false);
    if (!isLiked) {
      setIsLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  return (
    <Card className="bg-card border-border p-6 hover:border-primary/30 transition-all duration-300 neon-card">
      <div className="flex items-start gap-4 mb-4">
        <Link to={`/profile/${username}`} onClick={() => haptic.light()}>
          <Avatar className="w-12 h-12 border-2 border-primary/20 cursor-pointer hover:border-primary/40 transition-all">
            <AvatarImage src={userAvatar} alt={userName} />
            <AvatarFallback>{userName[0]}</AvatarFallback>
          </Avatar>
        </Link>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <Link to={`/profile/${username}`} onClick={() => haptic.light()}>
                <p className="font-semibold text-foreground hover:text-primary transition-colors cursor-pointer">
                  {userName}
                </p>
              </Link>
              <p className="text-sm text-muted-foreground">reviewed</p>
            </div>
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < rating ? "text-primary fill-primary" : "text-muted"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mb-4">
        <img
          src={moviePoster}
          alt={movieTitle}
          className="w-20 h-30 object-cover rounded-lg border border-border poster-glow"
        />
        <div>
          <h3 className="font-bold text-lg text-foreground mb-1">{movieTitle}</h3>
          <p className="text-sm text-muted-foreground mb-3">{movieYear}</p>
          <div className="flex flex-wrap gap-2">
            {vibes.map((vibe) => (
              <VibeTag key={vibe} vibe={vibe} />
            ))}
          </div>
        </div>
      </div>

      <p className="text-foreground/90 mb-4 leading-relaxed">{review}</p>

      {/* Tagged Friends */}
      {taggedFriends.length > 0 && (
        <div className="flex items-center gap-2 mb-4">
          <span className="text-sm text-muted-foreground">Watched with:</span>
          {taggedFriends.map((friend, index) => (
            <div key={index} className="flex items-center gap-1">
              <Avatar className="w-6 h-6 border border-border">
                <AvatarImage src={friend.avatar} />
                <AvatarFallback>{friend.name[0]}</AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{friend.name}</span>
            </div>
          ))}
        </div>
      )}

      {/* Photos */}
      {photos.length > 0 && (
        <div className="flex gap-2 mb-4 overflow-x-auto">
          {photos.map((photo, index) => (
            <img
              key={index}
              src={photo}
              alt={`Photo ${index + 1}`}
              className="w-32 h-32 object-cover rounded-lg border border-border"
            />
          ))}
        </div>
      )}

      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <div className="relative">
          <Button
            variant="ghost"
            size="sm"
            className={`gap-2 ${isLiked ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
            onClick={handleLike}
          >
            <Heart className={`w-4 h-4 ${isLiked ? "fill-primary" : ""}`} />
            {likeCount}
            {selectedReaction && <span className="ml-1">{selectedReaction}</span>}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-primary absolute -top-2 left-12"
            onClick={() => {
              haptic.light();
              setShowReactions(!showReactions);
            }}
          >
            <Smile className="w-4 h-4" />
          </Button>
          {showReactions && (
            <div className="absolute bottom-full left-0 mb-2 bg-card border border-border rounded-full shadow-lg p-2 flex gap-1 neon-border-subtle animate-scale-in">
              {reactions.map((reaction) => (
                <button
                  key={reaction}
                  onClick={() => handleReaction(reaction)}
                  className="text-xl hover:scale-125 transition-transform"
                >
                  {reaction}
                </button>
              ))}
            </div>
          )}
        </div>
        <Collapsible open={showComments} onOpenChange={setShowComments}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${showComments ? "text-primary" : "text-muted-foreground hover:text-primary"}`}
              onClick={() => haptic.light()}
            >
              <MessageCircle className="w-4 h-4" />
              {comments}
            </Button>
          </CollapsibleTrigger>
        </Collapsible>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 ml-auto">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Comments Section */}
      <Collapsible open={showComments} onOpenChange={setShowComments}>
        <CollapsibleContent className="pt-4 border-t border-border mt-4 space-y-3 animate-fade-in">
          {mockComments.map((comment) => (
            <div key={comment.id} className="flex gap-3">
              <Avatar className="w-8 h-8 border border-border">
                <AvatarImage src={comment.userAvatar} alt={comment.userName} />
                <AvatarFallback>{comment.userName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-accent/30 rounded-lg p-3">
                  <p className="font-semibold text-sm text-foreground">{comment.userName}</p>
                  <p className="text-sm text-foreground/90">{comment.comment}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-3">{comment.timestamp}</p>
              </div>
            </div>
          ))}
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default ReviewCard;