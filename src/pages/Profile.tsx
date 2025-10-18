import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import BottomNav from "@/components/BottomNav";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Share2, CheckCircle2, Bookmark, Heart, Trophy, Flame, Settings, ArrowLeft } from "lucide-react";
import ReviewCard from "@/components/ReviewCard";
import { Link } from "react-router-dom";
import FollowersModal from "@/components/FollowersModal";
import EditProfileDialog from "@/components/EditProfileDialog";
import { haptic } from "@/lib/haptic";
import { useToast } from "@/hooks/use-toast";

const Profile = () => {
  const { username } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [followersModalOpen, setFollowersModalOpen] = useState(false);
  const [followingModalOpen, setFollowingModalOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);

  // Determine if viewing own profile or another user's
  const isOwnProfile = !username; // If no username param, it's the current user's profile
  const [isFollowing, setIsFollowing] = useState(false);
  const [isPrivate, setIsPrivate] = useState(false); // Mock - would come from API

  // Mock user data - in production this would come from an API based on username
  const [profileData, setProfileData] = useState(username ? {
    username: username,
    displayName: "Sarah Johnson",
    bio: "cinephile • love indie films and foreign cinema",
    memberSince: "January 2025",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    followers: 142,
    following: 89,
    watched: 234,
    watchlist: 45,
    favorites: 23,
    isPrivate: false,
  } : {
    username: "alex_cinema",
    displayName: "Alex Chen",
    bio: "movie connoisseur",
    memberSince: "February 2025",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    followers: 3,
    following: 2,
    watched: 6,
    watchlist: 2,
    favorites: 8,
    isPrivate: false,
  });

  const handleFollowToggle = () => {
    haptic.light();
    setIsFollowing(!isFollowing);
  };

  const handleEditProfile = (newUsername: string, newBio: string) => {
    haptic.light();
    setProfileData({
      ...profileData,
      username: newUsername,
      bio: newBio,
    });
    toast({
      title: "Profile updated",
      description: "Your changes have been saved successfully.",
    });
  };

  const handleShareProfile = () => {
    haptic.medium();
    const profileUrl = `${window.location.origin}/profile/${profileData.username}`;
    navigator.clipboard.writeText(profileUrl);
    toast({
      title: "Profile link copied!",
      description: "Share your profile with others.",
    });
  };

  // Mock data for followers/following
  const followers = [
    { id: "1", name: "Sarah Johnson", username: "sarahjmovies", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", isFollowing: true },
    { id: "2", name: "Mike Chen", username: "mikecinema", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Mike", isFollowing: false },
    { id: "3", name: "Emma Davis", username: "emmawatches", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", isFollowing: true },
  ];

  const following = [
    { id: "1", name: "Sarah Johnson", username: "sarahjmovies", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah", isFollowing: true, isMutual: true },
    { id: "3", name: "Emma Davis", username: "emmawatches", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma", isFollowing: true, isMutual: true },
    { id: "4", name: "Jordan Lee", username: "jordanfilms", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan", isFollowing: true, isMutual: false },
    { id: "5", name: "Taylor Kim", username: "taylorreviews", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Taylor", isFollowing: true, isMutual: false },
  ];

  const watchedMovies = [
    { title: "Past Lives", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop" },
    { title: "The Lighthouse", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop" },
    { title: "Amélie", poster: "https://images.unsplash.com/photo-1594908900066-3f47337549d8?w=200&h=300&fit=crop" },
    { title: "Blade Runner 2049", poster: "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?w=200&h=300&fit=crop" },
  ];

  const watchlistMovies = [
    { title: "Spirited Away", poster: "https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=200&h=300&fit=crop" },
    { title: "Movie 2", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop" },
  ];

  const recentReviews = [
    {
      userName: "Alex Chen",
      userAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
      movieTitle: "Past Lives",
      movieYear: "2023",
      rating: 5,
      review: "A quietly devastating exploration of paths not taken. The film captures the ache of 'what if' with such grace.",
      vibes: ["nostalgic", "existential"] as const,
      likes: 234,
      comments: 42,
      moviePoster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop",
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b neon-border-subtle">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            {!isOwnProfile && (
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="w-5 h-5" />
              </Button>
            )}
            <h1 className="text-xl font-bold">{isOwnProfile ? "Profile" : `@${profileData.username}`}</h1>
            {isOwnProfile ? (
              <Button variant="ghost" size="icon">
                <Settings className="w-5 h-5" />
              </Button>
            ) : (
              <div className="w-10" />
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-24 pb-12 max-w-4xl">
        {/* Profile Header */}
        <div className="text-center mb-8">
          <Avatar className="w-32 h-32 mx-auto mb-4 border-4 border-primary/20 neon-border-subtle">
            <AvatarImage src={profileData.avatar} alt={profileData.displayName} />
            <AvatarFallback>{profileData.displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
          </Avatar>
          
          <h1 className="text-2xl font-bold text-foreground mb-1">@{profileData.username}</h1>
          <p className="text-sm text-muted-foreground mb-1">Member since {profileData.memberSince}</p>
          <p className="text-foreground/80 mb-6">{profileData.bio}</p>
          
          <div className="flex gap-3 justify-center mb-6">
            {isOwnProfile ? (
              <>
                <Button 
                  variant="outline" 
                  className="border-border transition-all duration-200 hover:scale-105"
                  onClick={() => {
                    haptic.light();
                    setEditProfileOpen(true);
                  }}
                >
                  Edit profile
                </Button>
                <Button 
                  variant="outline" 
                  className="border-border gap-2 transition-all duration-200 hover:scale-105"
                  onClick={handleShareProfile}
                >
                  <Share2 className="w-4 h-4" />
                  Share profile
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant={isFollowing ? "outline" : "default"}
                  className="border-border"
                  onClick={handleFollowToggle}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </Button>
                <Button variant="outline" className="border-border gap-2">
                  <Share2 className="w-4 h-4" />
                  Share
                </Button>
              </>
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-center gap-8 mb-8">
            <button
              onClick={() => {
                haptic.light();
                setFollowersModalOpen(true);
              }}
              className="text-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <div className="text-2xl font-bold text-foreground">{profileData.followers}</div>
              <div className="text-sm text-muted-foreground">Followers</div>
            </button>
            <button
              onClick={() => {
                haptic.light();
                setFollowingModalOpen(true);
              }}
              className="text-center cursor-pointer hover:opacity-70 transition-opacity"
            >
              <div className="text-2xl font-bold text-foreground">{profileData.following}</div>
              <div className="text-sm text-muted-foreground">Following</div>
            </button>
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">#1096</div>
              <div className="text-sm text-muted-foreground">Ranking</div>
            </div>
          </div>
        </div>

        {profileData.isPrivate && !isOwnProfile ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold mb-2">This account is private</h2>
            <p className="text-muted-foreground">Follow this account to see their activity</p>
          </div>
        ) : (
          <>
            {/* Collection Sections */}
            <div className="mb-8">
              <Link to="/collection/watched">
                <div className="flex items-center justify-between p-4 bg-card border border-border rounded-t-lg hover:border-primary/30 transition-all cursor-pointer neon-card border-b-0">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="w-6 h-6 text-primary neon-glow-primary" />
                    <span className="font-semibold text-foreground">Watched</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{profileData.watched}</span>
                </div>
              </Link>

              <Link to="/collection/watchlist">
                <div className="flex items-center justify-between p-4 bg-card border border-border hover:border-primary/30 transition-all cursor-pointer neon-card border-b-0">
                  <div className="flex items-center gap-3">
                    <Bookmark className="w-6 h-6 text-secondary neon-glow-secondary" />
                    <span className="font-semibold text-foreground">Want to Watch</span>
                  </div>
                  <span className="text-2xl font-bold text-foreground">{profileData.watchlist}</span>
                </div>
              </Link>

              <div className="flex items-center justify-between p-4 bg-card border border-border rounded-b-lg neon-card">
                <div className="flex items-center gap-3">
                  <Flame className="w-6 h-6 text-accent neon-glow-accent" />
                  <span className="font-semibold text-foreground">Streak</span>
                </div>
                <span className="text-2xl font-bold text-foreground">4 weeks</span>
              </div>
            </div>


        {/* Watch Year Wrapped Section */}
        <Card className="p-6 mb-8 bg-gradient-primary/10 border-primary/30 neon-card">
          <div className="flex items-center gap-3 mb-6">
            <Trophy className="w-8 h-8 text-primary neon-glow-primary" />
            <div>
              <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                2024 Watch Year Wrapped
              </h2>
              <p className="text-sm text-muted-foreground">Your viewing journey this year</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-background/50 p-4 rounded-lg border border-primary/20">
              <div className="text-3xl font-bold text-primary mb-1">127 hours</div>
              <div className="text-sm text-muted-foreground">Total watch time</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-secondary/20">
              <div className="text-3xl font-bold text-secondary mb-1">58</div>
              <div className="text-sm text-muted-foreground">Titles watched</div>
            </div>
            <div className="bg-background/50 p-4 rounded-lg border border-accent/20">
              <div className="text-3xl font-bold text-accent mb-1">8.2</div>
              <div className="text-sm text-muted-foreground">Average rating</div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Top 3 Rated Titles of 2024</h3>
            <div className="space-y-3">
              {[
                { title: "The Last of Us", rating: 10, genre: "Drama, Sci-Fi", poster: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=200&h=300&fit=crop", type: "TV" },
                { title: "Past Lives", rating: 9.5, genre: "Romance, Drama", poster: "https://images.unsplash.com/photo-1485846234645-a62644f84728?w=200&h=300&fit=crop", type: "Movie" },
                { title: "The Bear", rating: 9.2, genre: "Drama, Comedy", poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=200&h=300&fit=crop", type: "TV" },
              ].map((item, index) => (
                <div key={item.title} className="flex items-center gap-4 p-3 bg-background/50 rounded-lg border border-primary/10 neon-border-subtle">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/20 text-primary font-bold">
                    {index + 1}
                  </div>
                  <img src={item.poster} alt={item.title} className="w-12 h-16 object-cover rounded neon-border-subtle" />
                  <div className="flex-1">
                    <div className="font-semibold text-foreground">{item.title}</div>
                    <div className="text-xs text-muted-foreground">{item.type} • {item.genre}</div>
                  </div>
                  <div className="text-xl font-bold text-primary">{item.rating}</div>
                </div>
              ))}
            </div>
          </div>
        </Card>

            {/* Recent Activity Tab */}
            <Tabs defaultValue="activity" className="w-full">
              <TabsList className="w-full mb-6">
                <TabsTrigger value="activity" className="flex-1">Recent Activity</TabsTrigger>
                <TabsTrigger value="taste" className="flex-1">
                  {isOwnProfile ? "Your Taste" : "Their Taste"}
                </TabsTrigger>
              </TabsList>

          <TabsContent value="activity" className="space-y-6">
            {recentReviews.map((review) => (
              <ReviewCard key={review.movieTitle} {...review} />
            ))}
          </TabsContent>

          <TabsContent value="taste" className="space-y-6">
            {/* Top Genres */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Top Genres</h3>
              <div className="space-y-3">
                {[
                  { genre: "Drama", count: 18, rating: "8.4" },
                  { genre: "Science Fiction", count: 12, rating: "8.1" },
                  { genre: "Romance", count: 8, rating: "7.8" },
                  { genre: "Thriller", count: 7, rating: "8.6" },
                ].map((item) => (
                  <div key={item.genre} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div>
                      <div className="font-semibold text-foreground">{item.genre}</div>
                      <div className="text-sm text-muted-foreground">{item.count} movies</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-12 h-12 rounded-full border-2 border-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{item.rating}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Favorite Actors */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Most Watched Actors</h3>
              <div className="space-y-3">
                {[
                  { name: "Timothée Chalamet", count: 6 },
                  { name: "Florence Pugh", count: 5 },
                  { name: "Oscar Isaac", count: 4 },
                ].map((actor) => (
                  <div key={actor.name} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div className="font-semibold text-foreground">{actor.name}</div>
                    <div className="text-sm text-muted-foreground">{actor.count} movies</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Movie Duration Preference */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Duration Preference</h3>
              <div className="space-y-3">
                {[
                  { duration: "90-120 min", count: 22, percentage: "49%" },
                  { duration: "120-150 min", count: 15, percentage: "33%" },
                  { duration: "150+ min", count: 8, percentage: "18%" },
                ].map((item) => (
                  <div key={item.duration} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div>
                      <div className="font-semibold text-foreground">{item.duration}</div>
                      <div className="text-sm text-muted-foreground">{item.count} movies</div>
                    </div>
                    <div className="text-lg font-bold text-primary">{item.percentage}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Countries */}
            <div>
              <h3 className="text-lg font-semibold text-foreground mb-4">Movies by Country</h3>
              <div className="space-y-3">
                {[
                  { country: "United States", count: 28, flag: "🇺🇸" },
                  { country: "France", count: 8, flag: "🇫🇷" },
                  { country: "South Korea", count: 5, flag: "🇰🇷" },
                  { country: "Japan", count: 4, flag: "🇯🇵" },
                ].map((item) => (
                  <div key={item.country} className="flex items-center justify-between p-4 bg-card border border-border rounded-lg">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{item.flag}</span>
                      <div className="font-semibold text-foreground">{item.country}</div>
                    </div>
                    <div className="text-sm text-muted-foreground">{item.count} movies</div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
            </Tabs>
          </>
        )}
      </div>

      <FollowersModal
        open={followersModalOpen}
        onOpenChange={setFollowersModalOpen}
        type="followers"
        users={followers}
      />

      <FollowersModal
        open={followingModalOpen}
        onOpenChange={setFollowingModalOpen}
        type="following"
        users={following}
      />

      <EditProfileDialog
        open={editProfileOpen}
        onOpenChange={setEditProfileOpen}
        currentUsername={profileData.username}
        currentBio={profileData.bio}
        onSave={handleEditProfile}
      />

      <BottomNav />
    </div>
  );
};

export default Profile;
