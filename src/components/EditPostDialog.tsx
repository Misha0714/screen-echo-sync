import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Loader2 } from "lucide-react";
import { format, parseISO } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import FollowersPicker from "@/components/FollowersPicker";
import SeasonRankingEditor from "@/components/SeasonRankingEditor";

export interface EditablePost {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  comment: string | null;
  watch_date: string | null;
  watch_location: string | null;
  watched_with: string[] | null;
  rewatch: boolean;
  season_ranking: number[] | null;
  movies?: { title: string | null } | null;
}

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  post: EditablePost | null;
  onSaved: (updated: EditablePost) => void;
}

const LOCATION_PRESETS = ["Movie Theater", "Home", "On a Plane", "Friend's House", "Hotel", "Other"];

const EditPostDialog = ({ open, onOpenChange, post, onSaved }: Props) => {
  const { user } = useAuth();
  const { toast } = useToast();

  const [description, setDescription] = useState("");
  const [locationChoice, setLocationChoice] = useState<string>("");
  const [locationOther, setLocationOther] = useState("");
  const [watchedWith, setWatchedWith] = useState<string[]>([]);
  const [watchDate, setWatchDate] = useState<Date | undefined>(undefined);
  const [rewatch, setRewatch] = useState(false);
  const [seasonOrder, setSeasonOrder] = useState<number[]>([]);
  const [includeSeasonRanking, setIncludeSeasonRanking] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open || !post) return;
    setDescription(post.comment || "");
    const loc = post.watch_location || "";
    if (loc && LOCATION_PRESETS.includes(loc)) {
      setLocationChoice(loc);
      setLocationOther("");
    } else if (loc) {
      setLocationChoice("Other");
      setLocationOther(loc);
    } else {
      setLocationChoice("");
      setLocationOther("");
    }
    setWatchedWith(post.watched_with || []);
    setWatchDate(post.watch_date ? parseISO(post.watch_date) : undefined);
    setRewatch(!!post.rewatch);
    setSeasonOrder(post.season_ranking || []);
    setIncludeSeasonRanking((post.season_ranking?.length || 0) > 0 || post.media_type === "tv");
  }, [open, post]);

  if (!post) return null;

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const location =
        locationChoice === "Other" ? locationOther.trim() || null : locationChoice || null;
      const savedSeasonOrder =
        post.media_type === "tv" && includeSeasonRanking ? seasonOrder : [];

      const patch = {
        comment: description || null,
        watch_date: watchDate ? format(watchDate, "yyyy-MM-dd") : null,
        watch_location: location,
        watched_with: watchedWith,
        rewatch,
        season_ranking: savedSeasonOrder,
      };

      const { error } = await supabase
        .from("posts")
        .update(patch)
        .eq("id", post.id)
        .eq("user_id", user.id);
      if (error) throw error;

      if (post.media_type === "tv" && includeSeasonRanking && seasonOrder.length > 0) {
        await supabase
          .from("user_tv_season_rankings")
          .delete()
          .eq("user_id", user.id)
          .eq("tmdb_id", post.tmdb_id);
        await supabase.from("user_tv_season_rankings").insert(
          seasonOrder.map((season_number, idx) => ({
            user_id: user.id,
            tmdb_id: post.tmdb_id,
            season_number,
            position: idx,
          }))
        );
      }

      toast({ title: "Post updated" });
      onSaved({ ...post, ...patch });
      onOpenChange(false);
    } catch (err: any) {
      toast({ title: "Update failed", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Edit post</DialogTitle>
          <DialogDescription>{post.movies?.title || "Update your review"}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          <div className="space-y-2">
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
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
                    className={cn("w-full justify-start text-left font-normal", !watchDate && "text-muted-foreground")}
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

          {post.media_type === "tv" && user && (
            <div className="space-y-3 rounded-lg border border-border p-3">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="cursor-pointer">Include season ranking</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Drag to order best to worst. Shown alongside your post.
                  </p>
                </div>
                <Switch checked={includeSeasonRanking} onCheckedChange={setIncludeSeasonRanking} />
              </div>
              {includeSeasonRanking && (
                <SeasonRankingEditor
                  userId={user.id}
                  tmdbId={post.tmdb_id}
                  value={seasonOrder}
                  onChange={setSeasonOrder}
                />
              )}
            </div>
          )}

          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="edit-rewatch" className="cursor-pointer">Would you rewatch?</Label>
            <Switch id="edit-rewatch" checked={rewatch} onCheckedChange={setRewatch} />
          </div>

          <Button onClick={save} className="w-full" size="lg" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save changes"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EditPostDialog;
