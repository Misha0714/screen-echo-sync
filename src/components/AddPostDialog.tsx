import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Star, UserPlus, X, Image as ImageIcon, CalendarIcon, ChevronRight, Lock } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { haptic } from "@/lib/haptic";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

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
  const [watchedDate, setWatchedDate] = useState<Date>(new Date());
  const [showReview, setShowReview] = useState(false);
  const [showPhotos, setShowPhotos] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

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
    
    onOpenChange(false);
    
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
    setWatchedDate(new Date());
    setShowReview(false);
    setShowPhotos(false);
    setShowDatePicker(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[450px] max-h-[85vh] p-0 gap-0">
        {step === "search" ? (
          <>
            <DialogHeader className="px-4 pt-4 pb-3">
              <DialogTitle>What did you watch?</DialogTitle>
            </DialogHeader>
            <div className="flex flex-col gap-3 px-4 pb-4">
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
                      className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-accent transition-colors"
                    >
                      <img
                        src={movie.poster}
                        alt={movie.title}
                        className="w-10 h-15 object-cover rounded"
                      />
                      <div className="text-left flex-1">
                        <div className="flex items-center gap-2 mb-0.5">
                          <p className="font-semibold text-sm">{movie.title}</p>
                          <Badge variant="outline" className="text-xs">
                            {movie.type === "tv" ? "TV" : "Movie"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{movie.year}</p>
                      </div>
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </>
        ) : (
          <div className="flex flex-col h-full">
            {/* Movie Header */}
            <div className="p-4 border-b">
              <div className="flex items-center gap-3">
                <img
                  src={selectedMovie?.poster}
                  alt={selectedMovie?.title}
                  className="w-12 h-18 object-cover rounded"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="text-base font-bold truncate">{selectedMovie?.title}</h3>
                  <p className="text-xs text-muted-foreground truncate">{selectedMovie?.year}</p>
                </div>
              </div>
            </div>

            <ScrollArea className="flex-1">
              <div className="p-4 space-y-3">
                {/* Rating */}
                <div>
                  <h4 className="text-sm font-semibold mb-2 text-center">How was it?</h4>
                  <div className="flex gap-2 justify-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        onClick={() => {
                          haptic.light();
                          setRating(star);
                        }}
                        className="transition-transform hover:scale-110"
                      >
                        <Star
                          className={`w-9 h-9 ${
                            star <= rating ? "text-primary fill-primary" : "text-muted"
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Review */}
                <div>
                  <label className="text-sm font-semibold mb-2 block">Review</label>
                  <Textarea
                    placeholder="Share your thoughts..."
                    value={review}
                    onChange={(e) => setReview(e.target.value)}
                    className="min-h-[80px] resize-none text-sm"
                  />
                </div>

                {/* Who did you watch with */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Who did you watch with?</h4>
                  <ScrollArea className="w-full">
                    <div className="flex gap-2 pb-2">
                      {mockFriends.map((friend) => {
                        const isTagged = taggedFriends.find(f => f.id === friend.id);
                        return (
                          <button
                            key={friend.id}
                            onClick={() => {
                              haptic.light();
                              if (isTagged) {
                                handleRemoveTag(friend.id);
                              } else {
                                handleTagFriend(friend);
                              }
                            }}
                            className={cn(
                              "px-4 py-2 rounded-full border text-sm font-medium transition-colors shrink-0",
                              isTagged ? "bg-primary/10 border-primary text-primary" : "bg-card border-border hover:bg-accent"
                            )}
                          >
                            {friend.name.split(' ')[0]}
                          </button>
                        );
                      })}
                    </div>
                  </ScrollArea>
                </div>

                {/* Add Photos */}
                <div>
                  <h4 className="text-sm font-semibold mb-2">Photos</h4>
                  <div className="flex flex-wrap gap-2">
                    {photos.map((photo, index) => (
                      <div key={index} className="relative">
                        <img
                          src={photo}
                          alt={`Upload ${index + 1}`}
                          className="w-20 h-20 object-cover rounded-lg"
                        />
                        <button
                          onClick={() => handleRemovePhoto(index)}
                          className="absolute -top-1 -right-1 bg-destructive text-destructive-foreground rounded-full p-0.5"
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
                      <svg className="w-6 h-6 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                      </svg>
                    </label>
                  </div>
                </div>

                {/* Date Watched */}
                <div className="bg-card rounded-lg border">
                  <Popover open={showDatePicker} onOpenChange={setShowDatePicker}>
                    <PopoverTrigger asChild>
                      <button className="w-full flex items-center gap-3 p-3 hover:bg-accent/50 transition-colors">
                        <CalendarIcon className="w-4 h-4" />
                        <span className="flex-1 text-left text-sm font-medium">
                          {format(watchedDate, "MMM d, yyyy")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-muted-foreground" />
                      </button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={watchedDate}
                        onSelect={(date) => {
                          if (date) {
                            setWatchedDate(date);
                            setShowDatePicker(false);
                          }
                        }}
                        disabled={(date) => date > new Date()}
                        initialFocus
                        className={cn("p-3 pointer-events-auto")}
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </ScrollArea>

            {/* Post Button with Privacy Toggle */}
            <div className="p-4 border-t bg-background">
              <div className="flex items-center gap-3 mb-3">
                <div className="flex items-center gap-2 flex-1">
                  <Lock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">Friends only</span>
                  <Switch
                    checked={!isPublic}
                    onCheckedChange={(checked) => {
                      haptic.light();
                      setIsPublic(!checked);
                    }}
                    className="scale-75"
                  />
                </div>
              </div>
              <Button
                onClick={handlePost}
                className="w-full"
                disabled={!rating}
              >
                Post
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPostDialog;