interface AuthHeaderProps {
  title: string;
  subtitle?: string;
}

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  return (
    <div className="flex flex-col space-y-2 text-center mb-6">
      <h1 className="text-3xl font-bold tracking-tight">
        {title}
      </h1>
      {subtitle && (
        <p className="text-muted-foreground text-sm font-medium">{subtitle}</p>
      )}
    </div>
  );
}
