import { cn } from "@/lib/utils";
import logoAsset from "@/assets/bactime-logo.png.asset.json";
import iconAsset from "@/assets/bactime-icon.png.asset.json";

interface BrandLogoProps {
  compact?: boolean;
  className?: string;
}

export const BrandIcon = ({ className }: { className?: string }) => (
  <img src={iconAsset.url} alt="BacTime" className={cn("shrink-0 object-contain", className)} />
);

const BrandLogo = ({ compact = false, className }: BrandLogoProps) =>
  compact ? (
    <BrandIcon className={cn("h-10 w-10", className)} />
  ) : (
    <img src={logoAsset.url} alt="BacTime" width={1920} height={640} className={cn("h-11 w-auto object-contain", className)} />
  );

export default BrandLogo;
