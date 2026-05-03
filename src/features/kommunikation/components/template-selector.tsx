"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface Template {
  id: string;
  label: string;
  subject: string;
  body: string;
}

interface TemplateSelectorProps {
  value: string | null;
  onChange: (subject: string, body: string) => void;
  templates: Template[];
}

export function TemplateSelector({
  value,
  onChange,
  templates,
}: TemplateSelectorProps) {
  const handleChange = (templateId: string | null) => {
    if (!templateId) return;
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      onChange(template.subject, template.body);
    }
  };

  return (
    <div className="space-y-2">
      <Label>Vorlage (optional)</Label>
      <Select value={value ?? ""} onValueChange={handleChange}>
        <SelectTrigger>
          <SelectValue placeholder="Keine Vorlage" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Keine Vorlage</SelectItem>
          {templates.map((t) => (
            <SelectItem key={t.id} value={t.id}>
              {t.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <p className="text-xs text-muted-foreground">
        Du kannst Platzhalter wie {"{{Vorname}}"}, {"{{Nachname}}"}, {"{{DWZ}}"} verwenden.
      </p>
    </div>
  );
}
