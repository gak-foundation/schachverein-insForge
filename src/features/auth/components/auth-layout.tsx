import { ReactNode } from "react";

const domain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "schach.studio";

interface AuthLayoutProps {
  children: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute inset-0 z-0 opacity-40 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px]" />
      </div>

      <div className="w-full max-w-md px-6 py-12 relative z-10">
        <div className="flex justify-center mb-8">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-2xl">
            <span className="text-3xl font-serif">♔</span>
          </div>
        </div>
        {children}
      </div>
      
      <div className="mt-8 text-center text-xs text-muted-foreground relative z-10">
        © {new Date().getFullYear()} {domain}. Alle Rechte vorbehalten.
      </div>
    </div>
  );
}
