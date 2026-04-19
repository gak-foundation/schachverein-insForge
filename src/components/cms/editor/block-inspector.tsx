"use client";

import { useEditorStore } from "@/lib/store/editor-store";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export function BlockInspector() {
  const { activeBlockId, blocks, updateBlock } = useEditorStore();
  const activeBlock = blocks.find((b) => b.id === activeBlockId);

  if (!activeBlock) {
    return (
      <div className="p-8 text-center text-muted-foreground">
        <p className="text-sm">Wählen Sie einen Block aus, um ihn zu bearbeiten.</p>
      </div>
    );
  }

  const handleUpdate = (data: any) => {
    updateBlock(activeBlock.id, data);
  };

  return (
    <div className="p-4 space-y-6">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-4">
          Block-Einstellungen
        </h3>
        <p className="text-xs font-mono text-muted-foreground bg-muted p-1 rounded">
          Typ: {activeBlock.type}
        </p>
      </div>

      <Separator />

      {/* Dynamic Inspector Fields based on Block Type */}
      <div className="space-y-4">
        {activeBlock.type === "text" && (
          <>
            <div className="space-y-2">
              <Label>Ausrichtung</Label>
              <Select 
                value={activeBlock.data.alignment} 
                onValueChange={(val) => handleUpdate({ alignment: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="left">Links</SelectItem>
                  <SelectItem value="center">Zentriert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Maximale Breite</Label>
              <Select 
                value={activeBlock.data.maxWidth} 
                onValueChange={(val) => handleUpdate({ maxWidth: val })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="narrow">Schmal (Prose)</SelectItem>
                  <SelectItem value="normal">Standard</SelectItem>
                  <SelectItem value="wide">Vollbreite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </>
        )}

        {activeBlock.type === "hero" && (
          <>
            <div className="space-y-2">
              <Label>Haupt-Überschrift</Label>
              <Input 
                value={activeBlock.data.title} 
                onChange={(e) => handleUpdate({ title: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Unter-Überschrift</Label>
              <Input 
                value={activeBlock.data.subtitle || ""} 
                onChange={(e) => handleUpdate({ subtitle: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Hintergrund-Deckkraft ({activeBlock.data.overlayOpacity}%)</Label>
              <Slider 
                value={[activeBlock.data.overlayOpacity]} 
                max={100} 
                step={1}
                onValueChange={(vals) => handleUpdate({ overlayOpacity: Array.isArray(vals) ? vals[0] : vals })}
              />
            </div>
          </>
        )}

        {activeBlock.type === "button" && (
          <>
            <div className="space-y-2">
              <Label>Beschriftung</Label>
              <Input 
                value={activeBlock.data.label} 
                onChange={(e) => handleUpdate({ label: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Link (URL)</Label>
              <Input 
                value={activeBlock.data.href} 
                onChange={(e) => handleUpdate({ href: e.target.value })}
              />
            </div>
          </>
        )}
      </div>

      <Separator />

      <div className="pt-4">
        <h4 className="text-xs font-semibold mb-2">Sichtbarkeit</h4>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="v-public" checked readOnly />
          <Label htmlFor="v-public" className="text-xs">Öffentlich sichtbar</Label>
        </div>
      </div>
    </div>
  );
}
