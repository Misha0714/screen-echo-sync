import { Button } from "@/components/ui/button";
import { Film, TrendingUp, Plus, Users, Sparkles } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

interface BottomNavProps {
  onPostClick?: () => void;
}

const BottomNav = ({ onPostClick }: BottomNavProps) => {
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-background border-t z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-around py-3">
          <Link to="/">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                currentPath === "/" ? "text-primary" : ""
              }`}
            >
              <Film className={`w-5 h-5 ${currentPath === "/" ? "text-primary" : ""}`} />
              <span className={`text-xs ${currentPath === "/" ? "text-primary font-medium" : ""}`}>
                Feed
              </span>
            </Button>
          </Link>
          
          <Link to="/discover">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                currentPath === "/discover" ? "text-primary" : ""
              }`}
            >
              <TrendingUp className={`w-5 h-5 ${currentPath === "/discover" ? "text-primary" : ""}`} />
              <span className={`text-xs ${currentPath === "/discover" ? "text-primary font-medium" : ""}`}>
                Discover
              </span>
            </Button>
          </Link>
          
          <Button 
            variant="ghost" 
            className="flex flex-col items-center gap-1 h-auto py-2"
            onClick={onPostClick}
          >
            <div className="bg-primary rounded-full p-2">
              <Plus className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="text-xs">Post</span>
          </Button>
          
          <Button variant="ghost" className="flex flex-col items-center gap-1 h-auto py-2">
            <Users className="w-5 h-5" />
            <span className="text-xs">Friends</span>
          </Button>
          
          <Link to="/profile">
            <Button 
              variant="ghost" 
              className={`flex flex-col items-center gap-1 h-auto py-2 ${
                currentPath === "/profile" ? "text-primary" : ""
              }`}
            >
              <Sparkles className={`w-5 h-5 ${currentPath === "/profile" ? "text-primary" : ""}`} />
              <span className={`text-xs ${currentPath === "/profile" ? "text-primary font-medium" : ""}`}>
                Profile
              </span>
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default BottomNav;
