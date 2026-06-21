import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Heart, ThumbsUp, ThumbsDown, Loader2, X } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { syncMovie } from "@/lib/movieSync";
import { tmdbImage } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

type Reaction = "love" | "fine" | "dislike";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  tmdbId: number;
  mediaType: "movie" | "tv";
  title: string;
  posterPath: string | null;
}

interface RankingRow {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  score: number;
  position: number;
}

interface BucketMovie extends RankingRow {
  movie: { title: string; poster_path: string | null } | null;
}

const AddPostFlow = ({ open, onOpenChange, tmdbId, mediaType, title, posterPath }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"reaction" | "compare" | "details" | "saving">("reaction");
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [bucket, setBucket] = useState<BucketMovie[]>([]);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [comment, setComment] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [rewatch, setRewatch] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("reaction");
      setReaction(null);
      setBucket([]);
      setLow(0);
      setHigh(0);
      setComment("");
      setTagInput("");
      setTags([]);
      setRewatch(false);
    }
  }, [open]);

  const pickReaction = async (r: Reaction) => {
    if (!user) {
      onOpenChange(false);
      navigate("/auth");
      return;
    }
    setReaction(r);
    const { data, error } = await supabase
      .from("user_movie_rankings")
      .select("id, tmdb_id, media_type, score, position")
      .eq("user_id", user.id)
      .eq("reaction", r)
      .order("position", { ascending: true });
    if (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
      return;
    }
    // Filter out current movie if re-posting
    const filtered = (data || []).filter(
      (row) => !(row.tmdb_id === tmdbId && row.media_type === mediaType)
    );

    if (filtered.length === 0) {
      setBucket([]);
      setLow(0);
      setHigh(0);
      setStep("details");
      return;
    }
    // Hydrate with movie details
    const ids = filtered.map((r) => r.tmdb_id);
    const { data: movies } = await supabase
      .from("movies")
      .select("tmdb_id, media_type, title, poster_path")
      .in("tmdb_id", ids);
    const lookup = new Map(movies?.map((m) => [`${m.tmdb_id}-${m.media_type}`, m]) || []);
    const hydrated: BucketMovie[] = filtered.map((row) => ({
      ...row,
      movie: lookup.get(`${row.tmdb_id}-${row.media_type}`) as any || null,
    }));
    setBucket(hydrated);
    setLow(0);
    setHigh(hydrated.length - 1);
    setStep("compare");
  };

  const compareChoose = (chooseNew: boolean) => {
    const mid = Math.floor((low + high) / 2);
    let nextLow = low;
    let nextHigh = high;
    if (chooseNew) {
      // new movie is better than bucket[mid] → search upper half (smaller indexes = higher rank)
      nextHigh = mid - 1;
    } else {
      // existing is better → search lower half
      nextLow = mid + 1;
    }
    if (nextLow > nextHigh) {
      // insertion point found
      setStep("details");
      setLow(nextLow);
      setHigh(nextHigh);
      return;
    }
    setLow(nextLow);
    setHigh(nextHigh);
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !tags.includes(t) && tags.length < 10) {
      setTags([...tags, t]);
    }
    setTagInput("");
  };

  const save = async () => {
    if (!user || !reaction) return;
    setStep("saving");
    try {
      await syncMovie(tmdbId, mediaType);

      // bucket position = `low` after binary search
      const bucketPos = bucket.length === 0 ? 0 : low;

      const { data: ranking, error: rErr } = await supabase.rpc("insert_ranking", {
        p_tmdb_id: tmdbId,
        p_media_type: mediaType,
        p_reaction: reaction,
        p_bucket_position: bucketPos,
      });
      if (rErr) throw rErr;

      const finalScore = (ranking as any)?.score ?? null;

      const { error: pErr } = await supabase.from("posts").insert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        reaction,
        comment: comment || null,
        tags,
        rewatch,
        final_rank: finalScore,
      });
      if (pErr) throw pErr;

      toast({ title: "Posted!", description: `${title} scored ${finalScore}/10` });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
      setStep("details");
    }
  };

  const midMovie = bucket[Math.floor((low + high) / 2)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {step === "reaction" && "How did you feel about it?"}
            {step === "compare" && "Which did you like more?"}
            {step === "details" && "Add a few details (optional)"}
            {step === "saving" && "Saving..."}
          </DialogDescription>
        </DialogHeader>

        {step === "reaction" && (
          <div className="grid gap-3 py-4">
            <Button onClick={() => pickReaction("love")} className="h-16 justify-start gap-3" variant="outline">
              <Heart className="w-6 h-6 text-primary fill-primary" />
              <div className="text-left">
                <div className="font-semibold">I loved it</div>
                <div className="text-xs text-muted-foreground">Top tier</div>
              </div>
            </Button>
            <Button onClick={() => pickReaction("fine")} className="h-16 justify-start gap-3" variant="outline">
              <ThumbsUp className="w-6 h-6 text-secondary" />
              <div className="text-left">
                <div className="font-semibold">It was fine</div>
                <div className="text-xs text-muted-foreground">Middle of the pack</div>
              </div>
            </Button>
            <Button onClick={() => pickReaction("dislike")} className="h-16 justify-start gap-3" variant="outline">
              <ThumbsDown className="w-6 h-6 text-destructive" />
              <div className="text-left">
                <div className="font-semibold">I disliked it</div>
                <div className="text-xs text-muted-foreground">Not for me</div>
              </div>
            </Button>
          </div>
        )}

        {step === "compare" && midMovie && (
          <div className="py-2">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => compareChoose(true)}
                className="flex flex-col items-center gap-2 p-3 border-2 border-border rounded-lg hover:border-primary transition-all"
              >
                {posterPath && (
                  <img src={tmdbImage(posterPath, "w300")} alt={title} className="w-full aspect-[2/3] object-cover rounded" />
                )}
                <div className="text-sm font-semibold text-center line-clamp-2">{title}</div>
                <Badge variant="secondary" className="text-xs">New</Badge>
              </button>
              <button
                onClick={() => compareChoose(false)}
                className="flex flex-col items-center gap-2 p-3 border-2 border-border rounded-lg hover:border-primary transition-all"
              >
                {midMovie.movie?.poster_path && (
                  <img src={tmdbImage(midMovie.movie.poster_path, "w300")} alt="" className="w-full aspect-[2/3] object-cover rounded" />
                )}
                <div className="text-sm font-semibold text-center line-clamp-2">
                  {midMovie.movie?.title || "Untitled"}
                </div>
                <Badge variant="secondary" className="text-xs">{midMovie.score}/10</Badge>
              </button>
            </div>
            <p className="text-xs text-muted-foreground text-center mt-3">
              Comparing — narrowing your ranking
            </p>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="comment">Your thoughts</Label>
              <Textarea
                id="comment"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="What did you think?"
                maxLength={1000}
                rows={4}
              />
            </div>
            <div>
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addTag();
                    }
                  }}
                  placeholder="e.g. cozy, intense"
                  maxLength={20}
                />
                <Button type="button" onClick={addTag} variant="outline">Add</Button>
              </div>
              {tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((t) => (
                    <Badge key={t} variant="secondary" className="gap-1">
                      {t}
                      <button onClick={() => setTags(tags.filter((x) => x !== t))}>
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="rewatch">Would you rewatch?</Label>
              <Switch id="rewatch" checked={rewatch} onCheckedChange={setRewatch} />
            </div>
            <Button onClick={save} className="w-full">Save post</Button>
          </div>
        )}

        {step === "saving" && (
          <div className="py-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddPostFlow;
