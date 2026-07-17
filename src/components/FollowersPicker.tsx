import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { X } from "lucide-react";

export interface FollowerOption {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
}

interface Props {
  value: string[];
  onChange: (ids: string[]) => void;
}

const FollowersPicker = ({ value, onChange }: Props) => {
  const { user } = useAuth();
  const [followers, setFollowers] = useState<FollowerOption[]>([]);
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!user) return;
    (async () => {
      // People this user follows.
      const { data: follows } = await supabase
        .from("follows")
        .select("followee_id")
        .eq("follower_id", user.id);
      const ids = (follows || []).map((f: any) => f.followee_id);
      if (ids.length === 0) {
        setFollowers([]);
        return;
      }
      const { data: profiles } = await supabase
        .from("profiles")
        .select("id, username, display_name, avatar_url")
        .in("id", ids);
      setFollowers((profiles as any) || []);
    })();
  }, [user]);

  const selected = useMemo(
    () => followers.filter((f) => value.includes(f.id)),
    [followers, value]
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return followers
      .filter((f) => !value.includes(f.id))
      .filter((f) =>
        !q ||
        f.username.toLowerCase().includes(q) ||
        (f.display_name || "").toLowerCase().includes(q)
      )
      .slice(0, 6);
  }, [followers, value, query]);

  const add = (id: string) => {
    onChange([...value, id]);
    setQuery("");
  };
  const remove = (id: string) => onChange(value.filter((v) => v !== id));

  return (
    <div className="space-y-2">
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((f) => (
            <Badge key={f.id} variant="secondary" className="gap-1 pl-1">
              <Avatar className="w-4 h-4">
                <AvatarImage src={f.avatar_url || ""} />
                <AvatarFallback className="text-[8px]">{f.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              @{f.username}
              <button onClick={() => remove(f.id)} className="ml-1">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      )}
      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={followers.length ? "Search people you follow" : "You aren't following anyone yet"}
        disabled={followers.length === 0}
      />
      {query && filtered.length > 0 && (
        <div className="border border-border rounded-md divide-y divide-border bg-popover">
          {filtered.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => add(f.id)}
              className="w-full flex items-center gap-2 p-2 text-left hover:bg-accent transition-colors"
            >
              <Avatar className="w-6 h-6">
                <AvatarImage src={f.avatar_url || ""} />
                <AvatarFallback className="text-[10px]">{f.username.slice(0, 2)}</AvatarFallback>
              </Avatar>
              <span className="text-sm">{f.display_name || f.username}</span>
              <span className="text-xs text-muted-foreground">@{f.username}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default FollowersPicker;
