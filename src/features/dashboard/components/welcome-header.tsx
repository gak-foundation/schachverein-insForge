type WelcomeHeaderProps = {
  firstName: string;
  subtitle: string;
  roleLabel: string;
};

export function WelcomeHeader({ firstName, subtitle, roleLabel }: WelcomeHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-border">
      <div>
        <span className="uppercase tracking-widest text-[10px] text-muted-foreground font-semibold mb-2 block">{roleLabel}</span>
        <h1 className="text-5xl md:text-6xl font-heading tracking-tight text-foreground">
          Guten Tag, {firstName}.
        </h1>
        <p className="mt-4 text-muted-foreground text-lg font-light max-w-2xl">{subtitle}</p>
      </div>
    </div>
  );
}
