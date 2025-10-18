import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { haptic } from "@/lib/haptic";
import { Link } from "react-router-dom";

interface User {
  id: string;
  name: string;
  username: string;
  avatar: string;
  isFollowing: boolean;
  isMutual?: boolean;
}

interface FollowersModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: "followers" | "following";
  users: User[];
}

const FollowersModal = ({ open, onOpenChange, type, users }: FollowersModalProps) => {
  const [followStates, setFollowStates] = useState<Record<string, boolean>>(
    users.reduce((acc, user) => ({ ...acc, [user.id]: user.isFollowing }), {})
  );

  const handleFollowToggle = (userId: string) => {
    haptic.light();
    setFollowStates(prev => ({
      ...prev,
      [userId]: !prev[userId]
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">
            {type === "followers" ? "Followers" : "Following"}
          </DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-3">
            {users.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No {type} yet
              </div>
            ) : (
              users.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between gap-3 p-3 rounded-lg hover:bg-accent/50 transition-all animate-fade-in"
                >
                  <Link
                    to={`/profile/${user.username}`}
                    className="flex items-center gap-3 flex-1 min-w-0"
                    onClick={() => haptic.light()}
                  >
                    <Avatar className="w-12 h-12 border-2 border-primary/20">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback>{user.name.slice(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-semibold text-foreground truncate">
                          {user.name}
                        </div>
                        {user.isMutual && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary font-medium">
                            friends
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground truncate">
                        @{user.username}
                      </div>
                    </div>
                  </Link>
                  
                  <Button
                    variant={followStates[user.id] ? "outline" : "default"}
                    size="sm"
                    onClick={() => handleFollowToggle(user.id)}
                    className="shrink-0"
                  >
                    {followStates[user.id] ? "Unfollow" : "Follow"}
                  </Button>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default FollowersModal;
