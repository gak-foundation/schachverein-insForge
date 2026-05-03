"use client";

import { useEditorStore, type Block } from "@/lib/store/editor-store";
import { BlockRenderer } from "./block-renderer";
import { Button } from "@/components/ui/button";
import { RefreshCw, Monitor, Smartphone } from "lucide-react";
import { useState } from "react";

export function PreviewPanel() {
  const blocks = useEditorStore((s) => s.blocks);
  const [viewMode, setViewMode] = useState<"desktop" | "mobile">("desktop");
  const [renderKey, setRenderKey] = useState(0);

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between p-2 border-b">
        <span className="text-xs font-medium text-muted-foreground">Vorschau</span>
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("desktop")}
            data-active={viewMode === "desktop"}
          >
            <Monitor className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setViewMode("mobile")}
            data-active={viewMode === "mobile"}
          >
            <Smartphone className="h-3.5 w-3.5" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setRenderKey((k) => k + 1)}
            title="Vorschau aktualisieren"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </Button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div
          className={viewMode === "mobile" ? "max-w-[375px] mx-auto" : "max-w-4xl mx-auto"}
          key={renderKey}
        >
          {blocks.map((block: Block) => (
            <BlockRenderer key={block.id} block={block} mode="preview" />
          ))}
        </div>
      </div>
    </div>
  );
}
