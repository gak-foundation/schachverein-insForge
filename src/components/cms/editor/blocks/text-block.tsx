"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import { useEditorStore } from "@/lib/store/editor-store";
import { useEffect } from "react";
import { cn } from "@/lib/utils";

interface TextBlockProps {
  data: any;
  blockId: string;
  mode: "editor" | "preview" | "live";
}

export function TextBlock({ data, blockId, mode }: TextBlockProps) {
  const updateBlock = useEditorStore((state) => state.updateBlock);

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [2, 3, 4], // H1 is reserved for page title
        },
      }),
      Link.configure({
        openOnClick: false,
      }),
      Placeholder.configure({
        placeholder: "Schreiben Sie hier etwas...",
      }),
    ],
    content: data.content,
    editable: mode === "editor",
    onUpdate: ({ editor }) => {
      if (mode === "editor") {
        updateBlock(blockId, { content: editor.getJSON() });
      }
    },
  });

  // Sync content when data changes externally (e.g. undo/redo)
  useEffect(() => {
    if (editor && data.content && JSON.stringify(data.content) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(data.content);
    }
  }, [data.content, editor]);

  if (!editor && mode === "editor") return null;

  const alignmentClass = data.alignment === "center" ? "text-center" : "text-left";
  const maxWidthClass = 
    data.maxWidth === "narrow" ? "max-w-prose mx-auto" : 
    data.maxWidth === "wide" ? "max-w-none" : "max-w-3xl mx-auto";

  return (
    <div className={cn("prose prose-sm md:prose-base dark:prose-invert max-w-none", alignmentClass, maxWidthClass)}>
      {mode === "editor" ? (
        <EditorContent editor={editor} />
      ) : (
        <div dangerouslySetInnerHTML={{ __html: data.contentHtml || "" }} />
      )}
    </div>
  );
}
