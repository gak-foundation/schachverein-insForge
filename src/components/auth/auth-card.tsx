import { ReactNode } from "react";

interface AuthCardProps {
  children: ReactNode;
}

export function AuthCard({ children }: AuthCardProps) {
  return (
    <div className="rounded-2xl border bg-card p-8 shadow-2xl shadow-black/5 backdrop-blur-sm relative overflow-hidden group">
      <div className="absolute top-0 left-0 w-full h-1 bg-primary/20 group-hover:bg-primary transition-colors" />
      {children}
    </div>
  );
}
