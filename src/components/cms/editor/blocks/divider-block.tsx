 
"use client";
import { cn } from "@/lib/utils";
export function DividerBlock({ data }: { data: any, blockId: string, mode: string }) {
  const spacingMap = { xs: "py-2", sm: "py-4", md: "py-8", lg: "py-12", xl: "py-16" };
  const padding = spacingMap[data.spacing as keyof typeof spacingMap] || spacingMap.md;
  return (
    <div className={cn("w-full", padding)}>
      {data.variant !== "space" && (
        <hr className={cn(
          "border-t",
          data.color === "primary" ? "border-primary" : "border-muted-foreground/20"
        )} />
      )}
    </div>
  );
}
