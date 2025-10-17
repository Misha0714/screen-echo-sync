import { Heart, MessageCircle, Share2, Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import VibeTag from "./VibeTag";

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
}: ReviewCardProps) => {
  return (
    <Card className="bg-card border-border p-6 hover:border-primary/30 transition-all duration-300">
      <div className="flex items-start gap-4 mb-4">
        <Avatar className="w-12 h-12 border-2 border-primary/20">
          <AvatarImage src={userAvatar} alt={userName} />
          <AvatarFallback>{userName[0]}</AvatarFallback>
        </Avatar>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-2">
            <div>
              <p className="font-semibold text-foreground">{userName}</p>
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
          className="w-20 h-30 object-cover rounded-lg border border-border"
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

      <div className="flex items-center gap-6 pt-4 border-t border-border">
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2">
          <Heart className="w-4 h-4" />
          {likes}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2">
          <MessageCircle className="w-4 h-4" />
          {comments}
        </Button>
        <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-primary gap-2 ml-auto">
          <Share2 className="w-4 h-4" />
        </Button>
      </div>
    </Card>
  );
};

export default ReviewCard;