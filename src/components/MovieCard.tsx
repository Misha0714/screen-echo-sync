import { Star } from "lucide-react";
import { Card } from "@/components/ui/card";
import VibeTag from "./VibeTag";

interface MovieCardProps {
  title: string;
  year: string;
  rating: number;
  image: string;
  vibes: readonly ("cozy" | "chaotic" | "nostalgic" | "existential" | "uplifting" | "intense")[];
}

const MovieCard = ({ title, year, rating, image, vibes }: MovieCardProps) => {
  return (
    <Card className="group relative overflow-hidden bg-card border-border hover:border-primary/50 transition-all duration-300 hover:shadow-glow-primary">
      <div className="aspect-[2/3] relative overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        <div className="absolute top-3 right-3 bg-background/90 backdrop-blur-sm px-2 py-1 rounded-lg flex items-center gap-1">
          <Star className="w-4 h-4 text-primary fill-primary" />
          <span className="text-sm font-semibold text-foreground">{rating}</span>
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-lg font-bold text-foreground mb-1">{title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{year}</p>
          <div className="flex flex-wrap gap-2">
            {vibes.map((vibe) => (
              <VibeTag key={vibe} vibe={vibe} />
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default MovieCard;