"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClubAction } from "@/lib/clubs/actions";

interface CreateClubFormProps {
  onSuccess?: () => void;
  action?: (formData: FormData) => Promise<{ success: boolean }>;
}

export function CreateClubForm({ onSuccess, action }: CreateClubFormProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    contactEmail: "",
    website: "",
    street: "",
    zipCode: "",
    city: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const data = new FormData();
      data.append("name", formData.name);
      if (formData.contactEmail) data.append("contactEmail", formData.contactEmail);
      if (formData.website) data.append("website", formData.website);
      if (formData.street) data.append("street", formData.street);
      if (formData.zipCode) data.append("zipCode", formData.zipCode);
      if (formData.city) data.append("city", formData.city);

      await (action ?? createClubAction)(data);

      onSuccess?.();
      if (!action) {
        router.push("/dashboard");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verein konnte nicht erstellt werden");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" suppressHydrationWarning>
      {error && (
        <div className="p-3 text-sm text-red-600 bg-red-50 rounded-md">{error}</div>
      )}

      <div className="space-y-2">
        <Label htmlFor="name">Vereinsname *</Label>
        <div className="relative">
          <Building2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            id="name"
            className="pl-9"
            placeholder="Schachverein Springer e.V."
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <p className="text-sm text-muted-foreground">
          Der Name Ihres Vereins. Ein eindeutiger URL-Slug wird automatisch generiert.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="contactEmail">Kontakt-E-Mail</Label>
        <Input
          id="contactEmail"
          type="email"
          placeholder="vorstand@verein.de"
          value={formData.contactEmail}
          onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
        />
        <p className="text-sm text-muted-foreground">
          Öffentliche Kontakt-E-Mail für den Verein
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="website">Webseite</Label>
        <Input
          id="website"
          placeholder="https://www.verein.de"
          value={formData.website}
          onChange={(e) => setFormData({ ...formData, website: e.target.value })}
        />
      </div>

      <div className="space-y-4">
        <p className="text-sm font-medium">Vereinsadresse (optional)</p>
        
        <div className="space-y-2">
          <Input
            placeholder="Straße und Hausnummer"
            value={formData.street}
            onChange={(e) => setFormData({ ...formData, street: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input
            placeholder="PLZ"
            value={formData.zipCode}
            onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
          />
          <Input
            placeholder="Ort"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
          />
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Verein erstellen
        </Button>
      </div>
    </form>
  );
}
