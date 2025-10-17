import { cn } from "@/lib/utils";

interface VibeTagProps {
  vibe: "cozy" | "chaotic" | "nostalgic" | "existential" | "uplifting" | "intense";
  className?: string;
}

const vibeConfig = {
  cozy: { label: "Cozy", color: "bg-vibe-cozy" },
  chaotic: { label: "Chaotic", color: "bg-vibe-chaotic" },
  nostalgic: { label: "Nostalgic", color: "bg-vibe-nostalgic" },
  existential: { label: "Existential", color: "bg-vibe-existential" },
  uplifting: { label: "Uplifting", color: "bg-vibe-uplifting" },
  intense: { label: "Intense", color: "bg-vibe-intense" },
};

const VibeTag = ({ vibe, className }: VibeTagProps) => {
  const config = vibeConfig[vibe];
  
  return (
    <span
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-medium text-white",
        config.color,
        "transition-transform hover:scale-105",
        className
      )}
    >
      {config.label}
    </span>
  );
};

export default VibeTag;