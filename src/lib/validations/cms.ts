import { z } from "zod";

// Gemeinsame Schemas
export const blockVisibilitySchema = z.object({
  public: z.boolean().optional(),
  members: z.boolean().optional(),
  roles: z.array(z.string()).optional(),
});

// 1. Text Block
export const textBlockSchema = z.object({
  content: z.any(), // ProseMirror JSON
  alignment: z.enum(["left", "center"]).default("left"),
  maxWidth: z.enum(["narrow", "normal", "wide"]).default("normal"),
});

// 2. Image Block
export const imageBlockSchema = z.object({
  mediaAssetId: z.string().uuid(),
  caption: z.string().optional(),
  ratio: z.enum(["16:9", "4:3", "1:1", "original"]).default("original"),
  alignment: z.enum(["left", "center", "right", "full"]).default("center"),
  lightbox: z.boolean().default(false),
});

// 3. Button Block
export const buttonBlockSchema = z.object({
  label: z.string().min(1).max(40),
  variant: z.enum(["primary", "secondary", "ghost", "link"]).default("primary"),
  size: z.enum(["sm", "md", "lg"]).default("md"),
  icon: z.string().optional(),
  iconPosition: z.enum(["left", "right"]).default("right"),
  href: z.string().min(1),
  target: z.enum(["_self", "_blank"]).default("_self"),
  alignment: z.enum(["left", "center", "right", "full"]).default("left"),
});

// 4. Hero Block
export const heroBlockSchema = z.object({
  variant: z.enum(["full", "split", "centered", "video"]).default("full"),
  title: z.string().min(1),
  subtitle: z.string().optional(),
  mediaAssetId: z.string().uuid().optional(),
  videoUrl: z.string().optional(),
  primaryButton: buttonBlockSchema.optional(),
  secondaryButton: buttonBlockSchema.optional(),
  overlayOpacity: z.number().min(0).max(100).default(50),
  height: z.enum(["auto", "50vh", "75vh", "100vh"]).default("75vh"),
});

// 5. Columns Block
export const columnsBlockSchema = z.object({
  columns: z.array(
    z.object({
      width: z.string(), // e.g. "1/2", "1/3"
      blocks: z.array(z.any()), // Rekursive Validierung ist mit Zod komplex, hier vereinfacht
    })
  ),
  gap: z.enum(["sm", "md", "lg"]).default("md"),
  alignItems: z.enum(["start", "center", "end"]).default("start"),
  stackOnMobile: z.boolean().default(true),
});

// 6. Divider Block
export const dividerBlockSchema = z.object({
  variant: z.enum(["line", "space", "decorative"]).default("line"),
  spacing: z.enum(["xs", "sm", "md", "lg", "xl"]).default("md"),
  color: z.enum(["muted", "primary", "secondary"]).default("muted"),
});

// 7. Contact Form Block
export const contactFormBlockSchema = z.object({
  title: z.string().optional(),
  recipientRole: z.enum(["admin", "vorstand", "jugendwart", "sportwart"]).default("vorstand"),
  showPhoneField: z.boolean().default(false),
  submitButtonLabel: z.string().default("Nachricht senden"),
  successMessage: z.string().default("Vielen Dank! Ihre Nachricht wurde gesendet."),
});

// 8. Tournament Card Block
export const tournamentCardBlockSchema = z.object({
  tournamentId: z.string().uuid(),
  variant: z.enum(["compact", "standard", "hero"]).default("standard"),
  showRegistration: z.boolean().default(true),
  showLiveStandings: z.boolean().default(false),
});

// Gesamt-Block-Schema
export const pageBlockContentSchema = z.discriminatedUnion("type", [
  z.object({ type: z.literal("text"), data: textBlockSchema }),
  z.object({ type: z.literal("image"), data: imageBlockSchema }),
  z.object({ type: z.literal("button"), data: buttonBlockSchema }),
  z.object({ type: z.literal("hero"), data: heroBlockSchema }),
  z.object({ type: z.literal("columns"), data: columnsBlockSchema }),
  z.object({ type: z.literal("divider"), data: dividerBlockSchema }),
  z.object({ type: z.literal("contactForm"), data: contactFormBlockSchema }),
  z.object({ type: z.literal("tournamentCard"), data: tournamentCardBlockSchema }),
]);

export const pageSchema = z.object({
  title: z.string().min(1).max(300),
  slug: z.string().min(1).max(255).regex(/^[a-z0-9-]+$/, "Ungültiger Slug"),
  status: z.enum(["draft", "published", "scheduled", "archived"]).default("draft"),
  publishAt: z.date().optional().nullable(),
  layout: z.enum(["default", "wide", "landing"]).default("default"),
  seo: z.object({
    metaTitle: z.string().optional(),
    metaDescription: z.string().optional(),
    ogImage: z.string().optional(),
    noIndex: z.boolean().optional(),
  }).optional(),
});
