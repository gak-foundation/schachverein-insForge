 
"use client";

import { useEffect, useState } from "react";
import { useEditorStore, Block } from "@/lib/store/editor-store";
import { BlockList } from "./block-list";
import { BlockInspector } from "./block-inspector";
import { PreviewPanel } from "./preview-panel";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Save, Eye, Send, ChevronLeft, Loader2, Plus, Settings } from "lucide-react";
import Link from "next/link";
import { savePageBlocks } from "@/features/cms/actions";
import { useToast } from "@/components/ui/use-toast";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface EditorShellProps {
  page: any;
  initialBlocks: Block[];
}

export function EditorShell({ page, initialBlocks }: EditorShellProps) {
  const { 
    blocks, 
    setBlocks, 
    setPageId, 
    isDirty, 
    setDirty,
    addBlock 
  } = useEditorStore();
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    setPageId(page.id);
    setBlocks(initialBlocks);
  }, [page.id, initialBlocks, setPageId, setBlocks]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await savePageBlocks(page.id, blocks);
      setDirty(false);
      toast({
        title: "Gespeichert",
        description: "Alle Änderungen wurden erfolgreich gespeichert.",
      });
    } catch (error) {
      toast({
        title: "Fehler beim Speichern",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] -m-6">
      {/* Top Bar */}
      <div className="h-14 border-b bg-background flex items-center justify-between px-4 shrink-0">
        <div className="flex items-center gap-4">
          <Link
            href="/dashboard/pages"
            className="inline-flex items-center justify-center rounded-lg hover:bg-muted transition-colors h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Link>
          <div className="flex flex-col">
            <span className="text-sm font-medium leading-none">{page.title}</span>
            <span className="text-xs text-muted-foreground">/{page.slug}</span>
          </div>
          {isDirty && (
            <span className="text-[10px] bg-yellow-100 text-yellow-800 px-1.5 py-0.5 rounded font-medium">
              Ungespeicherte Änderungen
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Eye className="mr-2 h-4 w-4" />
            Vorschau
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleSave}
            disabled={isSaving || !isDirty}
          >
            {isSaving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            Speichern
          </Button>
          <Button size="sm">
            <Send className="mr-2 h-4 w-4" />
            Veröffentlichen
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar: Block Library / Outline could go here */}
        <div className="w-64 border-r bg-muted/30 overflow-y-auto p-4 hidden lg:block">
          <h3 className="text-sm font-semibold mb-4">Blöcke</h3>
          <div className="grid grid-cols-1 gap-2">
            <BlockLibraryButton type="text" label="Text" icon="abc" />
            <BlockLibraryButton type="image" label="Bild" icon="image" />
            <BlockLibraryButton type="hero" label="Hero" icon="layout" />
            <BlockLibraryButton type="button" label="Button" icon="mouse-pointer" />
            <BlockLibraryButton type="tournamentCard" label="Turnier" icon="trophy" />
            <BlockLibraryButton type="columns" label="Spalten" icon="columns" />
            <BlockLibraryButton type="divider" label="Trenner" icon="minus" />
            <BlockLibraryButton type="contactForm" label="Kontakt" icon="mail" />
          </div>
        </div>

        {/* Canvas (Center) */}
        <div className="flex-1 overflow-y-auto bg-muted/10 p-8 flex justify-center">
          <div className="w-full max-w-4xl min-h-full bg-background shadow-sm border rounded-sm p-8 pb-32 relative">
            <BlockList />
            
            <div className="mt-8 flex justify-center border-t pt-8">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" className="rounded-full">
                    <Plus className="mr-2 h-4 w-4" />
                    Block hinzufügen
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="center" className="w-56">
                  <DropdownMenuItem onClick={() => addBlock("text")}>Text</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("image")}>Bild</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("hero")}>Hero</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("button")}>Button</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("tournamentCard")}>Turnier-Karte</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("columns")}>Spalten</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("divider")}>Trenner</DropdownMenuItem>
                  <DropdownMenuItem onClick={() => addBlock("contactForm")}>Kontaktformular</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* Right: Preview Panel */}
        <div className="flex-1 border-l bg-background overflow-hidden shrink-0 hidden xl:block">
          <PreviewPanel />
        </div>
        {/* Inspector as slide-over on smaller screens */}
        <Sheet>
          <SheetTrigger render={<Button variant="ghost" size="sm" className="xl:hidden fixed right-4 top-20 z-50" />}>
            <Settings className="h-4 w-4" />
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <BlockInspector />
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );
}

function BlockLibraryButton({ type, label }: { type: any, label: string, icon: string }) {
  const addBlock = useEditorStore((state) => state.addBlock);
  return (
    <Button 
      variant="outline" 
      className="justify-start h-10 px-3 w-full"
      onClick={() => addBlock(type)}
    >
      <span className="capitalize">{label}</span>
    </Button>
  );
}
