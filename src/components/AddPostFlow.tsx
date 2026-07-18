import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Heart, ThumbsUp, ThumbsDown, Loader2, CalendarIcon, Sliders } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { syncMovie } from "@/lib/movieSync";
import { tmdbImage } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import FollowersPicker from "@/components/FollowersPicker";

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

const LOCATION_PRESETS = [
  "Movie Theater",
  "Home",
  "On a Plane",
  "Friend's House",
  "Hotel",
  "Other",
];

const AddPostFlow = ({ open, onOpenChange, tmdbId, mediaType, title, posterPath }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const [step, setStep] = useState<"reaction" | "compare" | "manual" | "details" | "saving">("reaction");
  const [reaction, setReaction] = useState<Reaction | null>(null);
  const [bucket, setBucket] = useState<BucketMovie[]>([]);
  const [allRankings, setAllRankings] = useState<BucketMovie[]>([]);
  const [low, setLow] = useState(0);
  const [high, setHigh] = useState(0);
  const [tieWithId, setTieWithId] = useState<string | null>(null);
  const [manualScore, setManualScore] = useState<number>(7);
  const [manualBucketPos, setManualBucketPos] = useState<number | null>(null);

  const [description, setDescription] = useState("");
  const [locationChoice, setLocationChoice] = useState<string>("");
  const [locationOther, setLocationOther] = useState("");
  const [watchedWith, setWatchedWith] = useState<string[]>([]);
  const [watchDate, setWatchDate] = useState<Date | undefined>(new Date());
  const [rewatch, setRewatch] = useState(false);

  useEffect(() => {
    if (!open) {
      setStep("reaction");
      setReaction(null);
      setBucket([]);
      setLow(0);
      setHigh(0);
      setTieWithId(null);
      setManualScore(7);
      setManualBucketPos(null);
      setAllRankings([]);
      setDescription("");
      setLocationChoice("");
      setLocationOther("");
      setWatchedWith([]);
      setWatchDate(new Date());
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
    const ids = filtered.map((r) => r.tmdb_id);
    const { data: movies } = await supabase
      .from("movies")
      .select("tmdb_id, media_type, title, poster_path")
      .in("tmdb_id", ids);
    const lookup = new Map(movies?.map((m) => [`${m.tmdb_id}-${m.media_type}`, m]) || []);
    const hydrated: BucketMovie[] = filtered.map((row) => ({
      ...row,
      movie: (lookup.get(`${row.tmdb_id}-${row.media_type}`) as any) || null,
    }));
    setBucket(hydrated);
    setLow(0);
    setHigh(hydrated.length - 1);
    setStep("compare");
  };

  const compareChoose = (choice: "new" | "existing" | "tie") => {
    const mid = Math.floor((low + high) / 2);
    if (choice === "tie") {
      setTieWithId(bucket[mid].id);
      setStep("details");
      return;
    }
    let nextLow = low;
    let nextHigh = high;
    if (choice === "new") nextHigh = mid - 1;
    else nextLow = mid + 1;
    if (nextLow > nextHigh) {
      setStep("details");
      setLow(nextLow);
      setHigh(nextHigh);
      return;
    }
    setLow(nextLow);
    setHigh(nextHigh);
  };

  const save = async () => {
    if (!user || !reaction) return;
    setStep("saving");
    try {
      await syncMovie(tmdbId, mediaType);
      const bucketPos = bucket.length === 0 ? 0 : low;
      const location =
        locationChoice === "Other" ? locationOther.trim() || null : locationChoice || null;

      const { data: ranking, error: rErr } = await supabase.rpc("insert_ranking_v2", {
        p_tmdb_id: tmdbId,
        p_media_type: mediaType,
        p_reaction: reaction,
        p_bucket_position: bucketPos,
        p_tie_with: tieWithId,
      });
      if (rErr) throw rErr;

      const finalScore = (ranking as any)?.score ?? null;

      const { error: pErr } = await supabase.from("posts").insert({
        user_id: user.id,
        tmdb_id: tmdbId,
        media_type: mediaType,
        reaction,
        comment: description || null,
        tags: [],
        rewatch,
        final_rank: finalScore,
        watch_date: watchDate ? format(watchDate, "yyyy-MM-dd") : null,
        watch_location: location,
        watched_with: watchedWith,
      });
      if (pErr) throw pErr;

      toast({ title: "Posted!", description: `${title} scored ${Number(finalScore).toFixed(1)}/10` });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Save failed", description: err.message, variant: "destructive" });
      setStep("details");
    }
  };

  const midMovie = bucket[Math.floor((low + high) / 2)];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">{title}</DialogTitle>
          <DialogDescription>
            {step === "reaction" && "How did you feel about it?"}
            {step === "compare" && "Which did you like more?"}
            {step === "manual" && "Give it a score out of 10"}
            {step === "details" && "Tell us a little more"}
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
          <div className="py-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={() => compareChoose("new")}
                className="flex flex-col items-center gap-2 p-4 border-2 border-border rounded-lg hover:border-primary transition-all"
              >
                {posterPath && (
                  <img src={tmdbImage(posterPath, "w300")} alt={title} className="w-full aspect-[2/3] object-cover rounded" />
                )}
                <div className="text-sm font-semibold text-center line-clamp-2">{title}</div>
                <Badge variant="secondary" className="text-xs">New</Badge>
              </button>
              <button
                onClick={() => compareChoose("existing")}
                className="flex flex-col items-center gap-2 p-4 border-2 border-border rounded-lg hover:border-primary transition-all"
              >
                {midMovie.movie?.poster_path && (
                  <img src={tmdbImage(midMovie.movie.poster_path, "w300")} alt="" className="w-full aspect-[2/3] object-cover rounded" />
                )}
                <div className="text-sm font-semibold text-center line-clamp-2">
                  {midMovie.movie?.title || "Untitled"}
                </div>
                <Badge variant="secondary" className="text-xs">{Number(midMovie.score).toFixed(1)}/10</Badge>
              </button>
            </div>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => compareChoose("tie")}
            >
              Too close to call
            </Button>
            <p className="text-xs text-muted-foreground text-center">
              Narrowing your ranking
            </p>
          </div>
        )}

        {step === "details" && (
          <div className="space-y-5 py-2">
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What did you think?"
                maxLength={1000}
                rows={4}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Where you watched it</Label>
                <Select value={locationChoice} onValueChange={setLocationChoice}>
                  <SelectTrigger><SelectValue placeholder="Pick a place" /></SelectTrigger>
                  <SelectContent>
                    {LOCATION_PRESETS.map((l) => (
                      <SelectItem key={l} value={l}>{l}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {locationChoice === "Other" && (
                  <Input
                    placeholder="Where?"
                    value={locationOther}
                    onChange={(e) => setLocationOther(e.target.value)}
                    maxLength={60}
                  />
                )}
              </div>

              <div className="space-y-2">
                <Label>Watch date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !watchDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {watchDate ? format(watchDate, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={watchDate}
                      onSelect={setWatchDate}
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Who you watched it with</Label>
              <FollowersPicker value={watchedWith} onChange={setWatchedWith} />
            </div>

            <div className="flex items-center justify-between rounded-lg border border-border p-3">
              <Label htmlFor="rewatch" className="cursor-pointer">Would you rewatch?</Label>
              <Switch id="rewatch" checked={rewatch} onCheckedChange={setRewatch} />
            </div>

            <Button onClick={save} className="w-full" size="lg">Save post</Button>
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
