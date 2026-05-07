"use client";

import { Check, Heart } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanConfig, AddonConfig } from "@/lib/billing/addons";

interface PlanCardProps {
  plan: PlanConfig | AddonConfig;
  isActive: boolean;
  onToggle: () => void;
}

export function PlanCard({ plan, isActive, onToggle }: PlanCardProps) {
  return (
    <Card className={cn("flex flex-col", isActive && "border-primary")}>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{plan.name}</CardTitle>
            <CardDescription className="mt-1.5">{plan.description}</CardDescription>
          </div>
          {isActive && (
            <Badge variant="default" className="ml-2 shrink-0">
              <Check className="mr-1 h-3 w-3" />
              Aktiv
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="flex-1">
        <div className="flex items-baseline gap-1 mb-4">
          <span className="text-sm font-medium text-primary">Kostenlos enthalten</span>
        </div>
        <ul className="space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <div className="p-4 pt-0 mt-auto">
        <button
          onClick={onToggle}
          className={cn(
            "w-full py-2 px-4 rounded-md text-sm font-medium transition-colors",
            isActive
              ? "bg-primary text-primary-foreground hover:bg-primary/90"
              : "bg-muted hover:bg-muted/80 text-muted-foreground"
          )}
        >
          {isActive ? "Aktiviert" : "Aktivieren"}
        </button>
      </div>
    </Card>
  );
}
