 
"use client";
import { cn } from "@/lib/utils";
export function ColumnsBlock({ data }: { data: any, blockId: string, mode: string }) {
  return (
    <div className={cn(
      "grid gap-6",
      data.columns?.length === 2 ? "grid-cols-1 md:grid-cols-2" : 
      data.columns?.length === 3 ? "grid-cols-1 md:grid-cols-3" : "grid-cols-1 md:grid-cols-4"
    )}>
      {data.columns?.map((col: any, idx: number) => (
        <div key={idx} className="border border-dashed p-4 rounded min-h-[100px] flex items-center justify-center text-muted-foreground text-xs">
          Spalte {idx + 1} ({col.width})
        </div>
      ))}
    </div>
  );
}
