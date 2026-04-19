"use client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
export function ButtonBlock({ data }: { data: any, blockId: string, mode: string }) {
  return (
    <div className={cn(
      "flex",
      data.alignment === "center" && "justify-center",
      data.alignment === "right" && "justify-end"
    )}>
      <Button 
        variant={data.variant || "primary"} 
        size={data.size || "md"}
        className={cn(data.alignment === "full" && "w-full")}
      >
        {data.label || "Button"}
      </Button>
    </div>
  );
}
