"use client";

import { Block } from "@/lib/store/editor-store";
import dynamic from "next/dynamic";

const TextBlock = dynamic(() => import("./blocks/text-block").then((mod) => mod.TextBlock), {
  loading: () => <div className="h-24 rounded-lg border bg-muted animate-pulse" />,
});


import { HeroBlock } from "./blocks/hero-block";
import { ButtonBlock } from "./blocks/button-block";
import { DividerBlock } from "./blocks/divider-block";
import { ImageBlock } from "./blocks/image-block";
import { TournamentCardBlock } from "./blocks/tournament-card-block";
import { ContactFormBlock } from "./blocks/contact-form-block";
import { ColumnsBlock } from "./blocks/columns-block";

interface BlockRendererProps {
  block: Block;
  mode: "editor" | "preview" | "live";
}

export function BlockRenderer({ block, mode }: BlockRendererProps) {
  switch (block.type) {
    case "text":
      return <TextBlock data={block.data} blockId={block.id} mode={mode} />;
    case "hero":
      return <HeroBlock data={block.data} blockId={block.id} mode={mode} />;
    case "button":
      return <ButtonBlock data={block.data} blockId={block.id} mode={mode} />;
    case "divider":
      return <DividerBlock data={block.data} blockId={block.id} mode={mode} />;
    case "image":
      return <ImageBlock data={block.data} blockId={block.id} mode={mode} />;
    case "tournamentCard":
      return <TournamentCardBlock data={block.data} blockId={block.id} mode={mode} />;
    case "contactForm":
      return <ContactFormBlock data={block.data} blockId={block.id} mode={mode} />;
    case "columns":
      return <ColumnsBlock data={block.data} blockId={block.id} mode={mode} />;
    default:
      return (
        <div className="p-4 border border-dashed rounded text-muted-foreground text-center">
          Block-Typ &quot;{block.type}&quot; noch nicht implementiert.
        </div>
      );
  }
}
