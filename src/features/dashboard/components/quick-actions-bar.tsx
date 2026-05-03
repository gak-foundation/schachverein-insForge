"use client";

import { Button } from "@/components/ui/button";
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
    <div className="flex flex-wrap gap-2">
      {actions.map((action, i) => {
        const Icon = action.icon;
        if (action.href) {
          return (
            <Button key={i} variant="outline" size="sm" nativeButton={false} render={<Link href={action.href} />}>
              {Icon && <Icon className="h-4 w-4 mr-2" />}
              {action.label}
            </Button>
          );
        }
        return (
          <Button key={i} variant="outline" size="sm" onClick={action.onClick}>
            {Icon && <Icon className="h-4 w-4 mr-2" />}
            {action.label}
          </Button>
        );
      })}
    </div>
  );
}
