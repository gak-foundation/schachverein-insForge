 
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
  const isEditor = mode === "editor";

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
    content: isEditor ? data.content : (data.contentHtml || ""),
    editable: isEditor,
    onUpdate: ({ editor }) => {
      if (isEditor) {
        updateBlock(blockId, { content: editor.getJSON() });
      }
    },
  });

  // Sync content when data changes externally (e.g. undo/redo)
  useEffect(() => {
    if (editor && data.content && isEditor && JSON.stringify(data.content) !== JSON.stringify(editor.getJSON())) {
      editor.commands.setContent(data.content);
    }
  }, [data.content, editor, isEditor]);

  if (!editor && isEditor) return null;

  const alignmentClass = data.alignment === "center" ? "text-center" : "text-left";
  const maxWidthClass = 
    data.maxWidth === "narrow" ? "max-w-prose mx-auto" : 
    data.maxWidth === "wide" ? "max-w-none" : "max-w-3xl mx-auto";

  return (
    <div className={cn("prose prose-sm md:prose-base dark:prose-invert max-w-none", alignmentClass, maxWidthClass)}>
      <EditorContent editor={editor} />
    </div>
  );
}
