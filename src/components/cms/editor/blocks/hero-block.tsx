"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface HeroBlockProps {
  data: any;
  blockId: string;
  mode: "editor" | "preview" | "live";
}

export function HeroBlock({ data }: HeroBlockProps) {
  const { 
    title = "Überschrift eingeben", 
    subtitle = "Unterüberschrift (optional)",
    overlayOpacity = 50,
    height = "75vh"
  } = data;

  const heightMap = {
    "auto": "min-h-[400px]",
    "50vh": "min-h-[50vh]",
    "75vh": "min-h-[75vh]",
    "100vh": "min-h-[100vh]"
  };

  return (
    <div className={cn(
      "relative flex items-center justify-center overflow-hidden rounded-lg bg-muted",
      heightMap[height as keyof typeof heightMap] || heightMap["75vh"]
    )}>
      {/* Background Image Placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800 to-slate-900" />
      
      {/* Overlay */}
      <div 
        className="absolute inset-0 bg-black" 
        style={{ opacity: overlayOpacity / 100 }}
      />

      {/* Content */}
      <div className="relative z-10 text-center px-6 max-w-3xl">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-lg md:text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}
        <div className="flex flex-wrap justify-center gap-4">
          <Button size="lg">Aktion starten</Button>
          <Button size="lg" variant="outline" className="text-white border-white hover:bg-white/10">
            Mehr erfahren
          </Button>
        </div>
      </div>
    </div>
  );
}
