 
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { pageSchema } from "@/lib/validations/cms";
import { createPage } from "@/features/cms/actions";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

type PageFormValues = z.infer<typeof pageSchema>;

export function PageForm() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<PageFormValues>({
    resolver: zodResolver(pageSchema) as any,
    defaultValues: {
      title: "",
      slug: "",
      status: "draft",
      layout: "default",
    },
  });

  async function onSubmit(values: PageFormValues) {
    setIsPending(true);
    try {
      const page = await createPage(values);
      toast({
        title: "Seite erstellt",
        description: "Die Seite wurde erfolgreich angelegt.",
      });
      router.push(`/dashboard/pages/${page.id}/edit`);
    } catch (error) {
      toast({
        title: "Fehler",
        description: error instanceof Error ? error.message : "Unbekannter Fehler",
        variant: "destructive",
      });
    } finally {
      setIsPending(false);
    }
  }

  // Automatischer Slug aus dem Titel
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    form.setValue("title", title);
    
    // Nur wenn der Slug noch nicht manuell editiert wurde (vereinfacht)
    const currentSlug = form.getValues("slug");
    if (!currentSlug || currentSlug === title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")) {
      const newSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      form.setValue("slug", newSlug, { shouldValidate: true });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control as any}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Seitentitel</FormLabel>
              <FormControl>
                <Input placeholder="z.B. Über uns" {...field} onChange={handleTitleChange} />
              </FormControl>
              <FormDescription>
                Der Titel der Seite (wird als H1 angezeigt, falls kein Hero verwendet wird).
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control as any}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL-Slug</FormLabel>
              <FormControl>
                <div className="flex items-center space-x-2">
                  <span className="text-muted-foreground text-sm">/</span>
                  <Input placeholder="ueber-uns" {...field} />
                </div>
              </FormControl>
              <FormDescription>
                Die URL, unter der die Seite erreichbar sein wird.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isPending}
          >
            Abbrechen
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Seite erstellen & Editor öffnen
          </Button>
        </div>
      </form>
    </Form>
  );
}
