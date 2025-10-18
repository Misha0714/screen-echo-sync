import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Star, UserPlus, X, Image as ImageIcon, Lock, Globe } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptic";

interface AddPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockMovies = [
  { 
    id: 1, 
    title: "Past Lives", 
    year: "2023", 
    poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop",
    genres: ["Drama", "Romance"],
    director: "Celine Song",
    reviewCount: 234,
    avgRating: 4.7,
    type: "movie" as const,
  },
  { 
    id: 2, 
    title: "The Last of Us", 
    year: "2023", 
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop",
    genres: ["Drama", "Sci-Fi"],
    director: "Craig Mazin, Neil Druckmann",
    reviewCount: 1823,
    avgRating: 4.9,
    type: "tv" as const,
  },
  { 
    id: 3, 
    title: "Everything Everywhere All at Once", 
    year: "2022", 
    poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop",
    genres: ["Action", "Sci-Fi", "Comedy"],
    director: "Daniel Kwan, Daniel Scheinert",
    reviewCount: 1823,
    avgRating: 4.9,
    type: "movie" as const,
  },
  { 
    id: 4, 
    title: "The Bear", 
    year: "2022-", 
    poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop",
    genres: ["Drama", "Comedy"],
    director: "Christopher Storer",
    reviewCount: 892,
    avgRating: 4.8,
    type: "tv" as const,
  },
  { 
    id: 5, 
    title: "The Lighthouse", 
    year: "2019", 
    poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop",
    genres: ["Horror", "Drama"],
    director: "Robert Eggers",
    reviewCount: 1243,
    avgRating: 4.3,
    type: "movie" as const,
  },
  { 
    id: 6, 
    title: "Succession", 
    year: "2018-2023", 
    poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=300&fit=crop",
    genres: ["Drama"],
    director: "Jesse Armstrong",
    reviewCount: 2156,
    avgRating: 4.9,
    type: "tv" as const,
  },
  { 
    id: 7, 
    title: "Amélie", 
    year: "2001", 
    poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop",
    genres: ["Romance", "Comedy"],
    director: "Jean-Pierre Jeunet",
    reviewCount: 2341,
    avgRating: 4.8,
    type: "movie" as const,
  },
];

const mockFriends = [
  { id: 1, name: "Sarah Johnson", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah" },
  { id: 2, name: "Mike Chen", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike" },
  { id: 3, name: "Emma Davis", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma" },
];

const AddPostDialog = ({ open, onOpenChange }: AddPostDialogProps) => {
  const { toast } = useToast();
  const [step, setStep] = useState<"search" | "compose">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [taggedFriends, setTaggedFriends] = useState<any[]>([]);
  const [showFriendSearch, setShowFriendSearch] = useState(false);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(true);

  const filteredMovies = mockMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMovie = (movie: any) => {
    haptic.light();
    setSelectedMovie(movie);
    setStep("compose");
  };

  const handleTagFriend = (friend: any) => {
    if (!taggedFriends.find(f => f.id === friend.id)) {
      setTaggedFriends([...taggedFriends, friend]);
    }
    setShowFriendSearch(false);
  };

  const handleRemoveTag = (friendId: number) => {
    setTaggedFriends(taggedFriends.filter(f => f.id !== friendId));
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      const newPhotos = Array.from(files).map(file => URL.createObjectURL(file));
      setPhotos([...photos, ...newPhotos]);
    }
  };

  const handleRemovePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handlePost = () => {
    haptic.success();
    
    // Close dialog first
    onOpenChange(false);
    
    // Show toast at bottom left after a short delay
    setTimeout(() => {
      toast({
        title: "Post added!",
        description: `Your review has been shared with ${isPublic ? "everyone" : "friends only"}.`,
      });
    }, 300);
    
    // Reset form
    setStep("search");
    setSearchQuery("");
    setSelectedMovie(null);
    setRating(0);
    setReview("");
    setTaggedFriends([]);
    setPhotos([]);
    setIsPublic(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>
            {step === "search" ? "What did you watch?" : "Share your thoughts"}
          </DialogTitle>
        </DialogHeader>

        {step === "search" ? (
          <div className="flex flex-col gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search for a movie or TV show..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            <ScrollArea className="h-[400px]">
              <div className="space-y-2">
                {filteredMovies.map((movie) => (
                  <button
                    key={movie.id}
                    onClick={() => handleSelectMovie(movie)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors neon-border-subtle"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-12 h-18 object-cover rounded poster-glow"
                    />
                    <div className="text-left flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold">{movie.title}</p>
                        <Badge variant="outline" className="text-xs">
                          {movie.type === "tv" ? "TV" : "Movie"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-1">{movie.year} • {movie.director}</p>
                      <div className="flex flex-wrap gap-1 mb-2">
                        {movie.genres.slice(0, 2).map((genre) => (
                          <Badge key={genre} variant="secondary" className="text-xs">
                            {genre}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-primary fill-primary" />
                          {movie.avgRating}
                        </span>
                        <span>{movie.reviewCount} reviews</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex flex-col h-full">
            <ScrollArea className="flex-1 max-h-[550px]">
              <div className="space-y-6 pr-4">
                {/* Selected Movie */}
                <div className="flex items-center gap-3 p-3 bg-accent/50 rounded-lg">
                <img
                  src={selectedMovie?.poster}
                  alt={selectedMovie?.title}
                  className="w-16 h-24 object-cover rounded"
                />
                <div>
                  <p className="font-semibold">{selectedMovie?.title}</p>
                  <p className="text-sm text-muted-foreground">{selectedMovie?.year}</p>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="ml-auto"
                  onClick={() => setStep("search")}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Rating */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Your Rating</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      onClick={() => setRating(star)}
                      className="transition-transform hover:scale-110"
                    >
                      <Star
                        className={`w-8 h-8 ${
                          star <= rating ? "text-primary fill-primary" : "text-muted"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {/* Review */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Your Review</label>
                <Textarea
                  placeholder="Share your thoughts about this movie..."
                  value={review}
                  onChange={(e) => setReview(e.target.value)}
                  className="min-h-[100px]"
                />
              </div>

              {/* Privacy Setting */}
              <div>
                <label className="text-sm font-semibold mb-3 block">Privacy</label>
                <div className="flex items-center justify-between p-4 bg-card/50 rounded-lg border border-border neon-border-subtle">
                  <div className="flex items-center gap-3">
                    {isPublic ? (
                      <>
                        <Globe className="w-5 h-5 text-primary" />
                        <div>
                          <p className="font-medium text-foreground">Public</p>
                          <p className="text-xs text-muted-foreground">Anyone can see this review</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <Lock className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="font-medium text-foreground">Friends Only</p>
                          <p className="text-xs text-muted-foreground">Only your friends can see this</p>
                        </div>
                      </>
                    )}
                  </div>
                  <Switch
                    checked={isPublic}
                    onCheckedChange={(checked) => {
                      haptic.light();
                      setIsPublic(checked);
                    }}
                  />
                </div>
              </div>

              {/* Tagged Friends */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Watched With</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {taggedFriends.map((friend) => (
                    <div
                      key={friend.id}
                      className="flex items-center gap-2 bg-accent px-3 py-1 rounded-full"
                    >
                      <Avatar className="w-5 h-5">
                        <AvatarImage src={friend.avatar} />
                        <AvatarFallback>{friend.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{friend.name}</span>
                      <button onClick={() => handleRemoveTag(friend.id)}>
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <Button
                    variant="outline"
                    size="sm"
                    className="rounded-full"
                    onClick={() => setShowFriendSearch(!showFriendSearch)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Tag friend
                  </Button>
                </div>

                {showFriendSearch && (
                  <div className="border border-border rounded-lg p-2 space-y-1">
                    {mockFriends.map((friend) => (
                      <button
                        key={friend.id}
                        onClick={() => handleTagFriend(friend)}
                        className="w-full flex items-center gap-2 p-2 rounded hover:bg-accent transition-colors"
                      >
                        <Avatar className="w-8 h-8">
                          <AvatarImage src={friend.avatar} />
                          <AvatarFallback>{friend.name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm">{friend.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Photos */}
              <div>
                <label className="text-sm font-semibold mb-2 block">Photos</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="relative">
                      <img
                        src={photo}
                        alt={`Upload ${index + 1}`}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                      <button
                        onClick={() => handleRemovePhoto(index)}
                        className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                  <label className="w-20 h-20 border-2 border-dashed border-border rounded-lg flex items-center justify-center cursor-pointer hover:bg-accent transition-colors">
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      className="hidden"
                      onChange={handlePhotoUpload}
                    />
                    <ImageIcon className="w-6 h-6 text-muted-foreground" />
                  </label>
                </div>
              </div>
              </div>
            </ScrollArea>

            {/* Post Button - Fixed at Bottom */}
            <div className="border-t border-border pt-4 mt-4">
              <Button
                onClick={handlePost}
                className="w-full h-12 text-lg neon-glow-primary"
                disabled={!rating || !review}
              >
                Post to Feed
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPostDialog;
