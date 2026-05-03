"use client";
import { cn } from "@/lib/utils";
import { AlertTriangle, ImageIcon } from "lucide-react";

export function ImageBlock({ data }: { data: any; blockId: string; mode: string }) {
  const hasAltText = data.alt || data.caption;
  const isDecorative = data.decorative === true;
  const needsAltWarning = !hasAltText && !isDecorative && data.mediaAssetId;

  return (
    <div
      className={cn(
        "flex flex-col gap-2",
        data.alignment === "center" && "items-center",
        data.alignment === "right" && "items-end"
      )}
    >
      <div
        className={cn(
          "bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-dashed",
          data.ratio === "16:9"
            ? "aspect-video"
            : data.ratio === "4:3"
              ? "aspect-4/3"
              : data.ratio === "1:1"
                ? "aspect-square"
                : "aspect-auto min-h-[200px]",
          data.alignment === "full" ? "w-full" : "max-w-xl"
        )}
      >
        {data.mediaAssetId ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="h-8 w-8 opacity-50" />
            <span className="text-sm">Bild ({data.ratio || "original"})</span>
            {data.caption && (
              <span className="text-xs italic">{data.caption}</span>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground italic text-sm">Bild-Platzhalter</span>
        )}
      </div>

      {needsAltWarning && mode === "editor" && (
        <div className="flex items-center gap-2 rounded-md bg-amber-50 dark:bg-amber-950 px-3 py-2 text-xs text-amber-800 dark:text-amber-200">
          <AlertTriangle className="h-3 w-3 shrink-0" />
          <span>Alt-Text fehlt — für barrierefreie Veröffentlichung erforderlich (BFSG 2025).</span>
        </div>
      )}

      {data.caption && (
        <p className="text-sm text-muted-foreground italic">{data.caption}</p>
      )}
    </div>
  );
}
