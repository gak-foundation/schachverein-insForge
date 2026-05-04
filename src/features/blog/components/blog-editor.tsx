"use client";

import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { createClient } from "@/lib/insforge";
import { ImageIcon, Loader2 } from "lucide-react";

interface BlogEditorProps {
  value: string;
  onChange: (value: string) => void;
}

export function BlogEditor({ value, onChange }: BlogEditorProps) {
  const [preview, setPreview] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);

  async function handleImageUpload(file: File) {
    if (!file.type.startsWith("image/")) return;
    if (file.size > 10 * 1024 * 1024) return;

    setUploading(true);
    try {
      const client = createClient();
      const ext = file.name.split(".").pop();
      const key = `blog/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

      const { data, error } = await client.storage
        .from("blog-images")
        .upload(key, file);

      if (error || !data) throw new Error(error?.message ?? "Upload fehlgeschlagen");

      const markdownImage = `![${file.name}](${data.url})`;
      onChange(value + (value ? "\n\n" : "") + markdownImage);
    } catch {
      // silent fail – user can retry
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
            !preview ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
          }`}
        >
          Bearbeiten
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`text-xs font-medium px-3 py-1 rounded transition-colors ${
            preview ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-accent"
          }`}
        >
          Vorschau
        </button>
        <div className="ml-auto flex gap-1">
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={uploading}
            className="inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1.5 rounded bg-muted hover:bg-accent transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <ImageIcon className="h-3.5 w-3.5" />
            )}
            Bild einfügen
          </button>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleImageUpload(file);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {preview ? (
        <div className="min-h-[300px] rounded-lg border bg-card p-4 prose prose-sm dark:prose-invert max-w-none overflow-auto">
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            rehypePlugins={[rehypeSanitize]}
          >
            {value || "*Vorschau wird hier angezeigt*"}
          </ReactMarkdown>
        </div>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full min-h-[300px] rounded-lg border bg-background p-4 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary resize-y"
          placeholder="Schreibe deinen Blogartikel in Markdown..."
        />
      )}
    </div>
  );
}
