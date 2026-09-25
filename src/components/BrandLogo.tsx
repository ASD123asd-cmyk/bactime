import { cn } from "@/lib/utils";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export const BrandIcon = ({ className }: { className?: string }) => (
  <svg className={cn("shrink-0", className)} viewBox="0 0 64 64" role="img" aria-label="BacTime">
    <defs>
      <linearGradient id="brand-gradient" x1="8" y1="6" x2="55" y2="57" gradientUnits="userSpaceOnUse">
        <stop stopColor="hsl(var(--primary))" />
        <stop offset="1" stopColor="hsl(var(--accent))" />
      </linearGradient>
    </defs>
    <rect x="4" y="8" width="54" height="50" rx="12" fill="hsl(var(--card))" stroke="hsl(var(--border))" />
    <path d="M19 17h17c9 0 15 5 15 12 0 4-2 7-6 9 5 2 8 5 8 10 0 2-.4 4-1.2 5H35V42h6c3 0 5-1.6 5-4s-2-4-5-4h-6V23h-9v30h-7V17Z" fill="url(#brand-gradient)" />
    <circle cx="35" cy="38" r="11" fill="hsl(var(--background))" stroke="hsl(var(--accent))" strokeWidth="3" />
    <path d="M35 31v8l6 3" fill="none" stroke="hsl(var(--foreground))" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
    <path d="m11 14 17-9 17 9-17 9-17-9Z" fill="hsl(var(--primary))" />
    <path d="M43 15v8" stroke="hsl(var(--accent))" strokeWidth="2.5" strokeLinecap="round" />
    <circle cx="43" cy="25" r="2" fill="hsl(var(--accent))" />
  </svg>
);

const BrandLogo = ({ compact = false, className }: BrandLogoProps) => (
  <div className={cn("inline-flex items-center gap-2.5", className)}>
    <BrandIcon className="h-10 w-10" />
    {!compact && (
      <div className="leading-none text-start">
        <div className="font-display text-xl font-extrabold text-foreground">
          Bac<span className="text-primary">Time</span>
        </div>
        <div className="mt-1 whitespace-nowrap font-arabic text-[10px] font-medium text-muted-foreground">
          وقتك للدراسة والامتحان
        </div>
      </div>
    )}
  </div>
);

export default BrandLogo;
