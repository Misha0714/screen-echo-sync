import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Search, Star, Upload, UserPlus, X, Image as ImageIcon } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

interface AddPostDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const mockMovies = [
  { id: 1, title: "Past Lives", year: "2023", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop" },
  { id: 2, title: "Everything Everywhere All at Once", year: "2022", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop" },
  { id: 3, title: "The Lighthouse", year: "2019", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop" },
  { id: 4, title: "Amélie", year: "2001", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop" },
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

  const filteredMovies = mockMovies.filter(movie =>
    movie.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectMovie = (movie: any) => {
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
    toast({
      title: "Post shared!",
      description: "Your movie review has been posted to your feed.",
    });
    // Reset form
    setStep("search");
    setSearchQuery("");
    setSelectedMovie(null);
    setRating(0);
    setReview("");
    setTaggedFriends([]);
    setPhotos([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-hidden flex flex-col">
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
                placeholder="Search for a movie..."
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
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-accent transition-colors"
                  >
                    <img
                      src={movie.poster}
                      alt={movie.title}
                      className="w-12 h-18 object-cover rounded"
                    />
                    <div className="text-left">
                      <p className="font-semibold">{movie.title}</p>
                      <p className="text-sm text-muted-foreground">{movie.year}</p>
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <ScrollArea className="flex-1">
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

              {/* Post Button */}
              <Button
                onClick={handlePost}
                className="w-full"
                disabled={!rating || !review}
              >
                Post to Feed
              </Button>
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPostDialog;
