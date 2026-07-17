import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Filter, X, Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { useProfileFilters } from "@/hooks/useProfileFilters";

type Ctrl = ReturnType<typeof useProfileFilters>;

const ChipGroup = ({
  title, values, selected, onToggle,
}: {
  title: string; values: string[]; selected: Set<string>; onToggle: (v: string) => void;
}) => {
  if (values.length === 0) return null;
  return (
    <div className="space-y-2">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{title}</Label>
      <div className="flex flex-wrap gap-1.5">
        {values.map((v) => (
          <button
            key={v}
            onClick={() => onToggle(v)}
            className={`px-2.5 py-1 rounded-full text-xs border transition-colors ${
              selected.has(v)
                ? "bg-primary text-primary-foreground border-primary"
                : "border-border hover:border-primary/40"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </div>
  );
};

const ProfileFilters = ({ ctrl, showMediaFilter = true }: { ctrl: Ctrl; showMediaFilter?: boolean }) => {
  const { state, options, toggle, clear, setMedia, setFavorites, setYear, activeCount } = ctrl;
  const [open, setOpen] = useState(false);
  const [yearMin, setYearMin] = useState<string>(state.yearMin?.toString() ?? "");
  const [yearMax, setYearMax] = useState<string>(state.yearMax?.toString() ?? "");
  const [watchedWithNames, setWatchedWithNames] = useState<Record<string, string>>({});

  useEffect(() => {
    const ids = options.watchedWith;
    if (ids.length === 0) return;
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name")
        .in("id", ids);
      const map: Record<string, string> = {};
      (data || []).forEach((p: any) => (map[p.id] = p.display_name || p.username));
      setWatchedWithNames(map);
    })();
  }, [options.watchedWith]);

  const applyYear = () => {
    setYear(
      yearMin ? Number(yearMin) : undefined,
      yearMax ? Number(yearMax) : undefined
    );
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Filter className="w-4 h-4" />
            Filters
            {activeCount > 0 && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5">{activeCount}</Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[min(92vw,26rem)] p-0" align="start">
          <ScrollArea className="max-h-[70vh]">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">Filter</h4>
                {activeCount > 0 && (
                  <Button variant="ghost" size="sm" onClick={clear}>Clear all</Button>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setFavorites(!state.favoritesOnly)}
                  className={`px-3 py-1.5 rounded-full text-xs border flex items-center gap-1 ${
                    state.favoritesOnly
                      ? "bg-primary text-primary-foreground border-primary"
                      : "border-border"
                  }`}
                >
                  <Star className="w-3 h-3" /> Favorites
                </button>
                {showMediaFilter && (
                  <>
                    <button
                      onClick={() => setMedia(state.mediaType === "movie" ? undefined : "movie")}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        state.mediaType === "movie" ? "bg-primary text-primary-foreground border-primary" : "border-border"
                      }`}
                    >Movies</button>
                    <button
                      onClick={() => setMedia(state.mediaType === "tv" ? undefined : "tv")}
                      className={`px-3 py-1.5 rounded-full text-xs border ${
                        state.mediaType === "tv" ? "bg-primary text-primary-foreground border-primary" : "border-border"
                      }`}
                    >TV Shows</button>
                  </>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider text-muted-foreground">Release Year</Label>
                <div className="flex items-center gap-2">
                  <Input type="number" placeholder="From" value={yearMin} onChange={(e) => setYearMin(e.target.value)} className="h-8" />
                  <span className="text-muted-foreground">–</span>
                  <Input type="number" placeholder="To" value={yearMax} onChange={(e) => setYearMax(e.target.value)} className="h-8" />
                  <Button size="sm" variant="secondary" onClick={applyYear}>Set</Button>
                </div>
              </div>

              <ChipGroup title="Genre" values={options.genres} selected={state.genres} onToggle={(v) => toggle("genres", v)} />
              <ChipGroup title="Streaming" values={options.providers} selected={state.providers} onToggle={(v) => toggle("providers", v)} />
              <ChipGroup title="Directors" values={options.directors} selected={state.directors} onToggle={(v) => toggle("directors", v)} />
              <ChipGroup title="Actors" values={options.actors} selected={state.actors} onToggle={(v) => toggle("actors", v)} />
              <ChipGroup title="Watch Location" values={options.locations} selected={state.watchLocation} onToggle={(v) => toggle("watchLocation", v)} />
              {options.watchedWith.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs uppercase tracking-wider text-muted-foreground">Watched With</Label>
                  <div className="flex flex-wrap gap-1.5">
                    {options.watchedWith.map((id) => (
                      <button
                        key={id}
                        onClick={() => toggle("watchedWith", id)}
                        className={`px-2.5 py-1 rounded-full text-xs border ${
                          state.watchedWith.has(id)
                            ? "bg-primary text-primary-foreground border-primary"
                            : "border-border hover:border-primary/40"
                        }`}
                      >
                        {watchedWithNames[id] || "…"}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        </PopoverContent>
      </Popover>

      {activeCount > 0 && (
        <Button variant="ghost" size="sm" className="gap-1 h-8" onClick={clear}>
          <X className="w-3 h-3" /> Clear
        </Button>
      )}
    </div>
  );
};

export default ProfileFilters;
