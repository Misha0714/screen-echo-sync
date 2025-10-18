import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Users, TrendingUp, Plus, MessageCircle, Heart, Image } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { toast } from "sonner";
import { haptic } from "@/lib/haptic";

interface Community {
  id: number;
  name: string;
  category: string;
  members: number;
  description: string;
  icon: string;
  isJoined: boolean;
  color: string;
}

interface Post {
  id: number;
  communityName: string;
  communityIcon: string;
  userName: string;
  userAvatar: string;
  content: string;
  type: "review" | "meme" | "discussion";
  likes: number;
  comments: number;
  image?: string;
}

const Community = () => {
  const [communities, setCommunities] = useState<Community[]>([
    {
      id: 1,
      name: "Marvel Cinematic Universe",
      category: "Franchise",
      members: 45200,
      description: "Everything MCU - theories, reviews, and discussions",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=mcu",
      isJoined: true,
      color: "hsl(0 85% 60%)",
    },
    {
      id: 2,
      name: "A24 Films",
      category: "Studio",
      members: 32100,
      description: "For lovers of independent and artistic cinema",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=a24",
      isJoined: true,
      color: "hsl(280 80% 65%)",
    },
    {
      id: 3,
      name: "Wicked Fans",
      category: "Fandom",
      members: 28900,
      description: "Defying gravity, one post at a time",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=wicked",
      isJoined: false,
      color: "hsl(150 70% 55%)",
    },
    {
      id: 4,
      name: "Horror Movie Club",
      category: "Genre",
      members: 56700,
      description: "Scary movies, thrilling discussions",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=horror",
      isJoined: false,
      color: "hsl(340 80% 55%)",
    },
    {
      id: 5,
      name: "Studio Ghibli",
      category: "Studio",
      members: 89300,
      description: "Celebrating the magic of Miyazaki and friends",
      icon: "https://api.dicebear.com/7.x/shapes/svg?seed=ghibli",
      isJoined: true,
      color: "hsl(190 80% 55%)",
    },
  ]);

  const [posts] = useState<Post[]>([
    {
      id: 1,
      communityName: "Marvel Cinematic Universe",
      communityIcon: "https://api.dicebear.com/7.x/shapes/svg?seed=mcu",
      userName: "TonyStarkFan",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=tony",
      content: "Just rewatched Endgame and I'm still not over that final battle. The way they brought everyone back... pure cinema magic! 🎬",
      type: "discussion",
      likes: 234,
      comments: 56,
    },
    {
      id: 2,
      communityName: "A24 Films",
      communityIcon: "https://api.dicebear.com/7.x/shapes/svg?seed=a24",
      userName: "IndieFilmLover",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=indie",
      content: "Everything Everywhere All at Once deserved every award it got. A masterpiece of storytelling and visual creativity.",
      type: "review",
      likes: 512,
      comments: 89,
      image: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=400&h=300&fit=crop",
    },
    {
      id: 3,
      communityName: "Studio Ghibli",
      communityIcon: "https://api.dicebear.com/7.x/shapes/svg?seed=ghibli",
      userName: "SpiritedAway99",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=spirited",
      content: "My cat watching Totoro with me had the same confused look that Mei has in the movie 😂",
      type: "meme",
      likes: 892,
      comments: 43,
      image: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=400&h=300&fit=crop",
    },
  ]);

  const handleJoinCommunity = (communityId: number) => {
    haptic.success();
    setCommunities(
      communities.map((c) =>
        c.id === communityId ? { ...c, isJoined: !c.isJoined } : c
      )
    );
    const community = communities.find((c) => c.id === communityId);
    toast.success(
      community?.isJoined
        ? `Left ${community.name}`
        : `Joined ${community?.name}! 🎉`
    );
  };

  const handleLike = () => {
    haptic.light();
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="neon-glow-primary">
              <Users className="w-6 h-6 text-primary" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Communities
            </h1>
          </div>
        </div>
      </header>

      <Tabs defaultValue="feed" className="container mx-auto px-4 pt-4">
        <TabsList className="w-full justify-start mb-6 bg-card/50 neon-border-subtle">
          <TabsTrigger value="feed" className="flex-1">
            <TrendingUp className="w-4 h-4 mr-2" />
            Feed
          </TabsTrigger>
          <TabsTrigger value="discover" className="flex-1">
            <Plus className="w-4 h-4 mr-2" />
            Discover
          </TabsTrigger>
        </TabsList>

        <TabsContent value="feed" className="space-y-4 animate-fade-in">
          {/* Joined Communities Pills */}
          <ScrollArea className="w-full whitespace-nowrap">
            <div className="flex gap-3 pb-4">
              {communities
                .filter((c) => c.isJoined)
                .map((community) => (
                  <Button
                    key={community.id}
                    variant="outline"
                    className="flex-shrink-0 rounded-full neon-border-subtle hover:neon-glow-primary"
                    onClick={() => haptic.light()}
                  >
                    <Avatar className="w-5 h-5 mr-2">
                      <AvatarImage src={community.icon} />
                      <AvatarFallback>{community.name[0]}</AvatarFallback>
                    </Avatar>
                    {community.name}
                  </Button>
                ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>

          {/* Posts Feed */}
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="overflow-hidden neon-card">
                <CardHeader className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Avatar className="w-8 h-8 neon-border-subtle">
                        <AvatarImage src={post.communityIcon} />
                        <AvatarFallback>{post.communityName[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {post.communityName}
                        </p>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <span>{post.userName}</span>
                          <span>•</span>
                          <span>2h ago</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="secondary" className="neon-badge">
                      {post.type}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-foreground">{post.content}</p>

                  {post.image && (
                    <div className="rounded-lg overflow-hidden neon-border-subtle">
                      <img
                        src={post.image}
                        alt="Post content"
                        className="w-full h-auto"
                      />
                    </div>
                  )}

                  <div className="flex items-center gap-4 pt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={handleLike}
                      className="hover:text-accent hover:neon-glow-accent"
                    >
                      <Heart className="w-4 h-4 mr-1" />
                      {post.likes}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => haptic.light()}
                      className="hover:text-secondary hover:neon-glow-secondary"
                    >
                      <MessageCircle className="w-4 h-4 mr-1" />
                      {post.comments}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="discover" className="space-y-4 animate-fade-in">
          <div className="space-y-4">
            {communities.map((community) => (
              <Card key={community.id} className="neon-card">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4">
                      <Avatar className="w-12 h-12 neon-border-subtle">
                        <AvatarImage src={community.icon} />
                        <AvatarFallback>{community.name[0]}</AvatarFallback>
                      </Avatar>
                      <div className="space-y-1">
                        <CardTitle className="text-lg">{community.name}</CardTitle>
                        <CardDescription>
                          <Badge variant="outline" className="mb-2">
                            {community.category}
                          </Badge>
                          <p className="text-sm">{community.description}</p>
                          <p className="text-xs text-muted-foreground mt-2">
                            {community.members.toLocaleString()} members
                          </p>
                        </CardDescription>
                      </div>
                    </div>
                    <Button
                      onClick={() => handleJoinCommunity(community.id)}
                      variant={community.isJoined ? "outline" : "default"}
                      size="sm"
                      className={
                        community.isJoined
                          ? "neon-border-subtle"
                          : "neon-glow-primary"
                      }
                    >
                      {community.isJoined ? "Joined" : "Join"}
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      <BottomNav />
    </div>
  );
};

export default Community;
