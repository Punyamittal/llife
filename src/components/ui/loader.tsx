import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}

const Loader = ({ className, size = "md" }: LoaderProps) => {
  const sizeClasses = {
    sm: "w-8 h-8",
    md: "w-16 h-16",
    lg: "w-24 h-24",
    xl: "w-32 h-32",
  };

  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="relative">
        {/* Enhanced glow effect - outer layer */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-red-500/30 blur-2xl",
            sizeClasses[size]
          )}
          style={{
            animation: "glowPulse 2s ease-in-out infinite",
          }}
        />
        {/* Enhanced glow effect - middle layer */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-red-500/25 blur-xl",
            sizeClasses[size]
          )}
          style={{
            animation: "glowPulse 2s ease-in-out infinite",
            animationDelay: "0.3s",
          }}
        />
        {/* Enhanced glow effect - inner layer */}
        <div
          className={cn(
            "absolute inset-0 rounded-full bg-red-500/20 blur-lg",
            sizeClasses[size]
          )}
          style={{
            animation: "glowPulse 2s ease-in-out infinite",
            animationDelay: "0.6s",
          }}
        />
        {/* Image with pulse and fade animation */}
        <img
          src="/favicon.jpg"
          alt="Loading..."
          className={cn(
            "relative rounded-full object-cover",
            sizeClasses[size],
            "ring-4 ring-red-500/50"
          )}
          style={{
            animation: "fadeInOut 1.5s ease-in-out infinite, loaderPulse 2s ease-in-out infinite",
          }}
        />
      </div>
    </div>
  );
};

export default Loader;

