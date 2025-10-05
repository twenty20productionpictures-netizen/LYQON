import { cn } from "@/lib/utils";

interface LiconLogoProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}

export const LiconLogo = ({ className, size = "md", showText = true }: LiconLogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl"
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-ai rounded-lg flex items-center justify-center shadow-glow-ai">
          <div className="w-4 h-4 bg-background rounded-sm"></div>
        </div>
      </div>
      {showText && (
        <span className={cn("font-bold tracking-tight text-foreground", sizeClasses[size])}>
          LYQON
        </span>
      )}
    </div>
  );
};