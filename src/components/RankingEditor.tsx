import { useEffect, useState } from "react";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors, DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, useSortable, verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Link2, Link2Off, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { tmdbImage } from "@/lib/tmdb";
import { useToast } from "@/hooks/use-toast";

export interface EditableRanking {
  id: string;
  tmdb_id: number;
  media_type: "movie" | "tv";
  score: number;
  position: number;
  tie_group: number | null;
  movies: { title: string; poster_path: string | null } | null;
}

interface Props {
  rankings: EditableRanking[];
  onDone: (updated: EditableRanking[]) => void;
  onCancel: () => void;
}

// Compute preview scores after reorder: 10.0 - 0.1 * rank_idx, ties share rank_idx.
function computeScores(list: EditableRanking[]): EditableRanking[] {
  const withIdx = list.map((r, i) => ({ ...r, _row: i }));
  const groupMin = new Map<number, number>();
  withIdx.forEach((r) => {
    if (r.tie_group != null) {
      const cur = groupMin.get(r.tie_group);
      if (cur === undefined || r._row < cur) groupMin.set(r.tie_group, r._row);
    }
  });
  return withIdx.map((r) => {
    const idx = r.tie_group != null ? (groupMin.get(r.tie_group) ?? r._row) : r._row;
    const score = Math.max(0, Math.round((10.0 - idx * 0.1) * 100) / 100);
    return { ...r, score, position: r._row };
  });
}

const Row = ({
  r, index, onToggleTie,
}: {
  r: EditableRanking; index: number; onToggleTie: () => void;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: r.id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };
  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 p-3 bg-card border border-border rounded-lg"
    >
      <button
        {...attributes}
        {...listeners}
        className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground"
        aria-label="Drag to reorder"
      >
        <GripVertical className="w-5 h-5" />
      </button>
      <div className="w-8 text-center font-bold text-muted-foreground">{index + 1}</div>
      {r.movies?.poster_path ? (
        <img src={tmdbImage(r.movies.poster_path, "w200")} alt="" className="w-10 h-14 object-cover rounded" />
      ) : (
        <div className="w-10 h-14 bg-muted rounded" />
      )}
      <div className="flex-1 min-w-0">
        <div className="font-semibold truncate">{r.movies?.title || "Untitled"}</div>
        <div className="text-xs text-muted-foreground uppercase tracking-wide">
          {r.media_type === "tv" ? "TV" : "Movie"}
        </div>
      </div>
      <div className="text-lg font-bold text-primary tabular-nums">{r.score.toFixed(1)}</div>
      {index > 0 && (
        <Button
          size="icon"
          variant="ghost"
          onClick={onToggleTie}
          title={r.tie_group != null ? "Break tie with above" : "Tie with above"}
        >
          {r.tie_group != null ? <Link2 className="w-4 h-4 text-primary" /> : <Link2Off className="w-4 h-4" />}
        </Button>
      )}
    </div>
  );
};

const RankingEditor = ({ rankings, onDone, onCancel }: Props) => {
  const { toast } = useToast();
  const [items, setItems] = useState<EditableRanking[]>(() => computeScores(rankings));
  const [saving, setSaving] = useState(false);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  useEffect(() => {
    setItems(computeScores(rankings));
  }, [rankings]);

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((cur) => {
      const oldIdx = cur.findIndex((r) => r.id === active.id);
      const newIdx = cur.findIndex((r) => r.id === over.id);
      return computeScores(arrayMove(cur, oldIdx, newIdx));
    });
  };

  const toggleTieAt = (index: number) => {
    setItems((cur) => {
      const next = [...cur];
      const above = next[index - 1];
      const here = next[index];
      if (!above || !here) return cur;
      if (here.tie_group != null && here.tie_group === above.tie_group) {
        // Break: remove this one from group; if group empties to 1, clear that too later
        next[index] = { ...here, tie_group: null };
      } else {
        // Merge: use above's group or create new one
        let g = above.tie_group;
        if (g == null) {
          const usedGroups = new Set(next.map((n) => n.tie_group).filter((x): x is number => x != null));
          g = 1;
          while (usedGroups.has(g)) g++;
          next[index - 1] = { ...above, tie_group: g };
        }
        next[index] = { ...here, tie_group: g };
      }
      // Clean orphan groups (groups with only 1 member)
      const counts = new Map<number, number>();
      next.forEach((n) => {
        if (n.tie_group != null) counts.set(n.tie_group, (counts.get(n.tie_group) || 0) + 1);
      });
      for (let i = 0; i < next.length; i++) {
        if (next[i].tie_group != null && counts.get(next[i].tie_group as number) === 1) {
          next[i] = { ...next[i], tie_group: null };
        }
      }
      return computeScores(next);
    });
  };

  const save = async () => {
    setSaving(true);
    const orderedIds = items.map((i) => i.id);
    // Build tie groups
    const groups = new Map<number, string[]>();
    items.forEach((i) => {
      if (i.tie_group != null) {
        const arr = groups.get(i.tie_group) || [];
        arr.push(i.id);
        groups.set(i.tie_group, arr);
      }
    });
    const ties = Array.from(groups.values()).filter((g) => g.length > 1);

    const { error } = await supabase.rpc("reorder_rankings", {
      p_ordered_ids: orderedIds,
      p_ties: ties as any,
    });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
      return;
    }
    toast({ title: "Rankings updated" });
    onDone(items);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Drag to reorder. Use the link icon to tie a movie with the one above it.
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onCancel} disabled={saving}>Cancel</Button>
          <Button size="sm" onClick={save} disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save"}
          </Button>
        </div>
      </div>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {items.map((r, idx) => (
              <Row key={r.id} r={r} index={idx} onToggleTie={() => toggleTieAt(idx)} />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default RankingEditor;
