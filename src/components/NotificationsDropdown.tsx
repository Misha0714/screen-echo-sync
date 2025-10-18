import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bell, UserPlus, Flame, Tag } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import { haptic } from "@/lib/haptic";

interface Notification {
  id: string;
  type: "tag" | "streak" | "follow" | "join";
  message: string;
  username?: string;
  avatar?: string;
  timestamp: string;
  isNew: boolean;
  postTitle?: string;
}

const NotificationsDropdown = () => {
  const [notifications] = useState<Notification[]>([
    {
      id: "1",
      type: "tag",
      message: "tagged you in their post.",
      username: "sarah_j",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
      timestamp: "2m ago",
      isNew: true,
      postTitle: "Past Lives",
    },
    {
      id: "2",
      type: "streak",
      message: "You just hit a 4-day streak!",
      timestamp: "1h ago",
      isNew: true,
    },
    {
      id: "3",
      type: "join",
      message: "just joined Rewind — follow them!",
      username: "mike_cinema",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike",
      timestamp: "3h ago",
      isNew: false,
    },
    {
      id: "4",
      type: "follow",
      message: "started following you.",
      username: "alex_movies",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      timestamp: "5h ago",
      isNew: false,
    },
    {
      id: "5",
      type: "tag",
      message: "mentioned you in a review.",
      username: "jordan_lee",
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan",
      timestamp: "1d ago",
      isNew: false,
      postTitle: "The Grand Budapest Hotel",
    },
  ]);

  const [followingUsers, setFollowingUsers] = useState<string[]>([]);

  const handleFollow = (username: string) => {
    haptic.light();
    setFollowingUsers((prev) =>
      prev.includes(username)
        ? prev.filter((u) => u !== username)
        : [...prev, username]
    );
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "tag":
        return <Tag className="w-4 h-4 text-secondary" />;
      case "streak":
        return <Flame className="w-4 h-4 text-accent" />;
      case "join":
      case "follow":
        return <UserPlus className="w-4 h-4 text-primary" />;
      default:
        return <Bell className="w-4 h-4" />;
    }
  };

  const unreadCount = notifications.filter((n) => n.isNew).length;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="hover:bg-primary/10 relative"
          onClick={() => haptic.light()}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-accent animate-pulse"
              variant="default"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-96 p-0 bg-background border-border z-[100] animate-in fade-in-0 zoom-in-95 duration-200"
      >
        <div className="p-4 border-b border-border">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {unreadCount > 0 && (
            <p className="text-sm text-muted-foreground">
              {unreadCount} new notification{unreadCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
        
        <ScrollArea className="h-[400px]">
          <div className="p-2">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg hover:bg-muted/50 transition-colors mb-1 ${
                    notification.isNew ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex gap-3">
                    <div className="flex-shrink-0">
                      {notification.avatar ? (
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={notification.avatar} />
                          <AvatarFallback>
                            {notification.username?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                          {getIcon(notification.type)}
                        </div>
                      )}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm">
                          {notification.username && (
                            <Link
                              to={`/profile/${notification.username}`}
                              className="font-semibold hover:underline"
                              onClick={() => haptic.light()}
                            >
                              {notification.username}
                            </Link>
                          )}{" "}
                          <span className="text-foreground/80">
                            {notification.message}
                          </span>
                          {notification.postTitle && (
                            <span className="text-primary font-medium">
                              {" "}"{notification.postTitle}"
                            </span>
                          )}
                        </p>
                        {notification.isNew && (
                          <div className="w-2 h-2 rounded-full bg-accent flex-shrink-0 mt-1" />
                        )}
                      </div>

                      <p className="text-xs text-muted-foreground mt-1">
                        {notification.timestamp}
                      </p>

                      {(notification.type === "join" || notification.type === "follow") &&
                        notification.username && (
                          <Button
                            size="sm"
                            variant={
                              followingUsers.includes(notification.username)
                                ? "outline"
                                : "default"
                            }
                            className="mt-2 h-7 text-xs transition-all duration-200 hover:scale-105"
                            onClick={() => handleFollow(notification.username!)}
                          >
                            {followingUsers.includes(notification.username)
                              ? "Following"
                              : "Follow"}
                          </Button>
                        )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Bell className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No notifications yet</p>
              </div>
            )}
          </div>
        </ScrollArea>

        <div className="p-3 border-t border-border">
          <Button
            variant="ghost"
            className="w-full text-primary hover:bg-primary/10 transition-all duration-200"
            onClick={() => haptic.light()}
          >
            See All Notifications
          </Button>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;
