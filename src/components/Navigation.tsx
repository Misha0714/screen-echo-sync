import { Film, Search, User, Users, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Navigation = () => {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-lg border-b border-border">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-2">
            <Film className="w-6 h-6 text-primary" />
            <span className="text-xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Rewind
            </span>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
              Feed
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
              Discover
            </Button>
            <Button variant="ghost" size="sm" className="text-foreground/80 hover:text-foreground">
              <Users className="w-4 h-4 mr-2" />
              Community
            </Button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
            <Search className="w-5 h-5" />
          </Button>
          <Button size="sm" className="bg-gradient-primary hover:opacity-90 transition-opacity">
            <PlusCircle className="w-4 h-4 mr-2" />
            Post
          </Button>
          <Link to="/profile">
            <Button variant="ghost" size="icon" className="text-foreground/80 hover:text-foreground">
              <User className="w-5 h-5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;