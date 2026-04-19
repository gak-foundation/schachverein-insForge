"use client";
import { cn } from "@/lib/utils";
export function ImageBlock({ data }: { data: any, blockId: string, mode: string }) {
  return (
    <div className={cn(
      "flex flex-col gap-2",
      data.alignment === "center" && "items-center",
      data.alignment === "right" && "items-end"
    )}>
      <div className={cn(
        "bg-muted rounded-lg flex items-center justify-center overflow-hidden border border-dashed",
        data.ratio === "16:9" ? "aspect-video" : data.ratio === "1:1" ? "aspect-square" : "aspect-auto min-h-[200px]",
        data.alignment === "full" ? "w-full" : "max-w-xl"
      )}>
        <span className="text-muted-foreground italic text-sm">Bild-Platzhalter</span>
      </div>
      {data.caption && (
        <p className="text-sm text-muted-foreground italic">{data.caption}</p>
      )}
    </div>
  );
}
