"use client";

import Link from "next/link";

interface QuickAction {
  label: string;
  icon?: React.ElementType;
  href?: string;
  onClick?: () => void;
}

interface QuickActionsBarProps {
  actions: QuickAction[];
}

export function QuickActionsBar({ actions }: QuickActionsBarProps) {
  return (
    <div className="flex flex-wrap gap-x-8 gap-y-4 py-8">
      {actions.map((action, i) => {
        const Icon = action.icon;
        
        const content = (
          <>
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {action.label}
          </>
        );

        const className = "flex items-center text-xs font-semibold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors border-b border-transparent hover:border-foreground pb-1";

        if (action.href) {
          return (
            <Link key={i} href={action.href} className={className}>
              {content}
            </Link>
          );
        }
        return (
          <button key={i} onClick={action.onClick} className={className}>
            {content}
          </button>
        );
      })}
    </div>
  );
}
