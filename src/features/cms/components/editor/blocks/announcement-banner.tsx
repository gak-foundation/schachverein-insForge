"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function AnnouncementBannerBlock({ blockId }: { blockId: string }) {
  const block = useEditorStore((s) => s.blocks.find((b) => b.id === blockId));
  const updateBlock = useEditorStore((s) => s.updateBlock);

  if (!block) return null;
  const data = block.data || {};

  return (
    <div className="space-y-3 p-4 border rounded-lg">
      <Label>Ankündigungstitel</Label>
      <Input
        value={data.title || ""}
        onChange={(e) => updateBlock(blockId, { ...data, title: e.target.value })}
        placeholder="Trainingsausfall..."
      />
      <Label>Text (optional)</Label>
      <Input
        value={data.content || ""}
        onChange={(e) => updateBlock(blockId, { ...data, content: e.target.value })}
        placeholder="Grund..."
      />
    </div>
  );
}
