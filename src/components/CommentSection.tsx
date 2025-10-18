import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send } from "lucide-react";
import { haptic } from "@/lib/haptic";

interface Comment {
  id: string;
  userName: string;
  userAvatar: string;
  text: string;
  timestamp: string;
}

interface CommentSectionProps {
  movieTitle: string;
  initialComments?: Comment[];
}

const CommentSection = ({ movieTitle, initialComments = [] }: CommentSectionProps) => {
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (newComment.trim()) {
      haptic.light();
      const comment: Comment = {
        id: Date.now().toString(),
        userName: "You",
        userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=You",
        text: newComment,
        timestamp: "Just now",
      };
      setComments([comment, ...comments]);
      setNewComment("");
    }
  };

  return (
    <div className="space-y-4 mt-4 pt-4 border-t border-border">
      {/* Comment Input */}
      <div className="flex gap-2">
        <Avatar className="w-8 h-8">
          <AvatarImage src="https://api.dicebear.com/7.x/avataaars/svg?seed=You" />
          <AvatarFallback>U</AvatarFallback>
        </Avatar>
        <div className="flex-1 flex gap-2">
          <Input
            placeholder={`Comment on ${movieTitle}...`}
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleAddComment();
              }
            }}
            className="flex-1"
          />
          <Button
            size="icon"
            onClick={handleAddComment}
            disabled={!newComment.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment.id} className="flex gap-2">
              <Avatar className="w-8 h-8">
                <AvatarImage src={comment.userAvatar} />
                <AvatarFallback>{comment.userName[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="bg-muted/50 rounded-lg p-3">
                  <p className="font-semibold text-sm text-foreground mb-1">
                    {comment.userName}
                  </p>
                  <p className="text-sm text-foreground/90">{comment.text}</p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 ml-2">
                  {comment.timestamp}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
