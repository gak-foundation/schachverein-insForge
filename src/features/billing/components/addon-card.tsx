"use client";

import { useState } from "react";
import { Check, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { PlanConfig, AddonConfig } from "@/lib/billing/addons";
import { formatPrice } from "@/lib/billing/addons";

interface PlanCardProps {
  plan: PlanConfig | AddonConfig;
  isActive: boolean;
  onSubscribe: () => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export function PlanCard({ plan, isActive, onSubscribe, onCancel, isLoading }: PlanCardProps) {
  const [hoveringCancel, setHoveringCancel] = useState(false);

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
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold">{formatPrice(plan.price)}</span>
          <span className="text-sm text-muted-foreground">
            /{plan.interval === "month" ? "Monat" : "Jahr"}
          </span>
        </div>
        <ul className="mt-4 space-y-2">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm text-muted-foreground">
              <Check className="h-4 w-4 text-primary shrink-0" />
              {feature}
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        {isActive ? (
          <Button
            variant="outline"
            className="w-full"
            onMouseEnter={() => setHoveringCancel(true)}
            onMouseLeave={() => setHoveringCancel(false)}
            onClick={onCancel}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : hoveringCancel ? (
              <>
                <X className="mr-2 h-4 w-4" />
                Kündigen
              </>
            ) : (
              "Aktiv"
            )}
          </Button>
        ) : (
          <Button
            className="w-full"
            onClick={onSubscribe}
            disabled={isLoading}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              "Upgrade"
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
