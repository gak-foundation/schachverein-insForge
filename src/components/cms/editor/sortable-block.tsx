"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Block, useEditorStore } from "@/lib/store/editor-store";
import { cn } from "@/lib/utils";
import { GripVertical, Trash2, ChevronUp, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlockRenderer } from "./block-renderer";

interface SortableBlockProps {
  block: Block;
}

export function SortableBlock({ block }: SortableBlockProps) {
  const {
    activeBlockId,
    setActiveBlock,
    removeBlock,
    moveBlock
  } = useEditorStore();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: block.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 50 : "auto",
    opacity: isDragging ? 0.5 : 1,
  };

  const isActive = activeBlockId === block.id;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group relative border-2 border-transparent transition-all rounded-md",
        isActive ? "border-primary ring-2 ring-primary/20" : "hover:border-muted-foreground/20",
        isDragging && "shadow-2xl"
      )}
      onClick={(e) => {
        e.stopPropagation();
        setActiveBlock(block.id);
      }}
    >
      {/* Block Toolbar (Floating) */}
      <div className={cn(
        "absolute -left-12 top-0 flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100",
        isActive && "opacity-100"
      )}>
        <div 
          className="p-1 bg-background border rounded shadow-sm cursor-grab active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4 text-muted-foreground" />
        </div>
        <div className="flex flex-col border bg-background rounded shadow-sm overflow-hidden">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none border-b"
            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "up"); }}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-none"
            onClick={(e) => { e.stopPropagation(); moveBlock(block.id, "down"); }}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        <Button 
          variant="destructive" 
          size="icon" 
          className="h-8 w-8 shadow-sm"
          onClick={(e) => { e.stopPropagation(); removeBlock(block.id); }}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {/* The Actual Content */}
      <div className="p-4 bg-background">
        <BlockRenderer block={block} mode="editor" />
      </div>

      {/* Block Type Label (Bottom Right) */}
      <div className="absolute right-2 bottom-2 opacity-0 group-hover:opacity-100 transition-opacity">
        <span className="text-[10px] font-mono uppercase bg-muted px-1 rounded text-muted-foreground">
          {block.type}
        </span>
      </div>
    </div>
  );
}
