"use client";

import { useState } from "react";
import { X } from "lucide-react";

const TYPE_STYLES: Record<string, string> = {
  info: "bg-blue-50 border-blue-200 text-blue-800",
  warning: "bg-yellow-50 border-yellow-200 text-yellow-800",
  success: "bg-green-50 border-green-200 text-green-800",
};

interface AnnouncementBarProps {
  announcement: {
    id: string;
    title: string;
    content?: string;
    type?: string;
  };
  onDismiss?: (id: string) => void;
}

export function AnnouncementBar({ announcement, onDismiss }: AnnouncementBarProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <div
      className={`flex items-center justify-between gap-4 rounded-lg border px-4 py-3 mb-6 ${
        TYPE_STYLES[announcement.type || "info"] || TYPE_STYLES.info
      }`}
    >
      <div>
        <span className="font-semibold">{announcement.title}</span>
        {announcement.content && (
          <span className="ml-2 text-sm opacity-80">{announcement.content}</span>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={() => {
            setDismissed(true);
            onDismiss(announcement.id);
          }}
          className="shrink-0 p-1 rounded hover:bg-black/10"
          aria-label="Schließen"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
