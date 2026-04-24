 
"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
export function ContactFormBlock({ data }: { data: any, blockId: string, mode: string }) {
  return (
    <div className="max-w-lg mx-auto p-6 border rounded-lg shadow-sm space-y-4 bg-muted/30">
      <h3 className="text-xl font-semibold mb-4">{data.title || "Kontakt aufnehmen"}</h3>
      <div className="space-y-2">
        <Label>Name</Label>
        <Input placeholder="Ihr Name" disabled />
      </div>
      <div className="space-y-2">
        <Label>E-Mail</Label>
        <Input placeholder="ihre@mail.de" disabled />
      </div>
      <div className="space-y-2">
        <Label>Nachricht</Label>
        <Textarea placeholder="Ihre Nachricht..." disabled />
      </div>
      <Button className="w-full" disabled>
        {data.submitButtonLabel || "Nachricht senden"}
      </Button>
    </div>
  );
}
