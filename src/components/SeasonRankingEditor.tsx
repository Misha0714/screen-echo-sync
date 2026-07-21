import { useEffect, useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Loader2 } from "lucide-react";
import { tmdb, tmdbImage, hasTmdbKey, type TMDBSeason } from "@/lib/tmdb";
import { supabase } from "@/integrations/supabase/client";

export interface SeasonItem {
  season_number: number;
  name: string;
  poster_path: string | null;
}

interface Props {
  userId: string;
  tmdbId: number;
  value: number[]; // ordered season_numbers best->worst
  onChange: (order: number[]) => void;
}

const Row = ({ s, index }: { s: SeasonItem; index: number }) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: s.season_number });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-2 bg-card border border-border rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-4 h-4" />
      </button>
      <div className="w-6 text-center font-bold text-muted-foreground text-sm">{index + 1}</div>
      {s.poster_path ? (
        <img src={tmdbImage(s.poster_path, "w200")} alt="" className="w-8 h-12 object-cover rounded" />
      ) : (
        <div className="w-8 h-12 bg-muted rounded" />
      )}
      <div className="flex-1 min-w-0 text-sm font-medium truncate">{s.name}</div>
    </div>
  );
};

const SeasonRankingEditor = ({ userId, tmdbId, value, onChange }: Props) => {
  const [seasons, setSeasons] = useState<SeasonItem[]>([]);
  const [loading, setLoading] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      try {
        // Fetch TMDB seasons
        let tmdbSeasons: TMDBSeason[] = [];
        if (hasTmdbKey()) {
          const details = await tmdb.tv(tmdbId);
          tmdbSeasons = (details.seasons || []).filter((s) => s.season_number > 0);
        }
        const items: SeasonItem[] = tmdbSeasons.map((s) => ({
          season_number: s.season_number,
          name: s.name || `Season ${s.season_number}`,
          poster_path: s.poster_path,
        }));

        // Fetch existing user ordering
        const { data: existing } = await supabase
          .from("user_tv_season_rankings")
          .select("season_number, position")
          .eq("user_id", userId)
          .eq("tmdb_id", tmdbId)
          .order("position", { ascending: true });

        let order: number[];
        if (existing && existing.length > 0) {
          const known = new Set(items.map((i) => i.season_number));
          const savedOrder = existing
            .map((r: any) => r.season_number)
            .filter((n: number) => known.has(n));
          const remaining = items
            .map((i) => i.season_number)
            .filter((n) => !savedOrder.includes(n));
          order = [...savedOrder, ...remaining];
        } else {
          order = items.map((i) => i.season_number);
        }

        if (cancelled) return;
        setSeasons(items);
        onChange(order);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tmdbId, userId]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const oldIdx = value.findIndex((n) => n === active.id);
    const newIdx = value.findIndex((n) => n === over.id);
    if (oldIdx < 0 || newIdx < 0) return;
    onChange(arrayMove(value, oldIdx, newIdx));
  };

  if (loading) {
    return (
      <div className="flex justify-center py-4">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (seasons.length === 0) {
    return <p className="text-sm text-muted-foreground">No seasons available for this show.</p>;
  }

  const ordered = value
    .map((n) => seasons.find((s) => s.season_number === n))
    .filter((s): s is SeasonItem => Boolean(s));

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={ordered.map((s) => s.season_number)} strategy={verticalListSortingStrategy}>
        <div className="space-y-2">
          {ordered.map((s, idx) => (
            <Row key={s.season_number} s={s} index={idx} />
          ))}
        </div>
      </SortableContext>
    </DndContext>
  );
};

export default SeasonRankingEditor;
