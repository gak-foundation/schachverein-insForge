"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { saveNavigation } from "@/lib/actions/navigation";
import { useToast } from "@/components/ui/use-toast";
import { GripVertical, X, Loader2, ChevronUp, ChevronDown } from "lucide-react";

interface Page { id: string; title: string; slug: string; }

export function NavigationEditor({ pages }: { pages: Page[] }) {
  const { toast } = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  const togglePage = (pageId: string) => {
    setSelected((prev) =>
      prev.includes(pageId) ? prev.filter((id) => id !== pageId) : [...prev, pageId]
    );
  };

  const moveUp = (idx: number) => {
    if (idx === 0) return;
    const next = [...selected];
    [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
    setSelected(next);
  };

  const moveDown = (idx: number) => {
    if (idx === selected.length - 1) return;
    const next = [...selected];
    [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
    setSelected(next);
  };

  const available = pages.filter((p) => !selected.includes(p.id));
  const ordered = selected.map((id) => pages.find((p) => p.id === id)).filter(Boolean) as Page[];

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveNavigation(selected);
      toast({ title: "Navigation gespeichert" });
    } catch (err: any) {
      toast({ title: "Fehler", description: err.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Navigation bearbeiten</h3>
      <div className="flex flex-wrap gap-2">
        {available.map((p) => (
          <Button key={p.id} variant="outline" size="sm" onClick={() => togglePage(p.id)}>
            + {p.title}
          </Button>
        ))}
      </div>
      <div className="border rounded-lg divide-y">
        {ordered.map((p, i) => (
          <div key={p.id} className="flex items-center gap-3 p-3">
            <GripVertical className="h-4 w-4 text-gray-400" />
            <span className="flex-1 font-medium">{p.title}</span>
            <span className="text-xs text-gray-400">/{p.slug}</span>
            <Button variant="ghost" size="icon" onClick={() => moveUp(i)} disabled={i === 0}>
              <ChevronUp className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => moveDown(i)} disabled={i === ordered.length - 1}>
              <ChevronDown className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => togglePage(p.id)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        ))}
        {ordered.length === 0 && (
          <p className="p-4 text-sm text-gray-400">Keine Seiten im Menue</p>
        )}
      </div>
      <Button onClick={handleSave} disabled={saving || selected.length === 0}>
        {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
        Speichern
      </Button>
    </div>
  );
}
