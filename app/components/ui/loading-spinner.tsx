"use client";

import { cn } from "@/lib/utils";

interface PulsingDotsProps {
  color?: "white" | "coral" | "charcoal" | "sage-green" | "soft-rose";
  size?: "sm" | "md" | "lg";
  className?: string;
}

export function PulsingDots({
  color = "coral",
  size = "md",
  className,
}: PulsingDotsProps) {
  const colorClasses: Record<typeof color, string> = {
    white: "bg-white",
    coral: "bg-coral",
    charcoal: "bg-charcoal",
    "sage-green": "bg-sage-green",
    "soft-rose": "bg-soft-rose",
  };

  const sizeClasses: Record<typeof size, string> = {
    sm: "w-1.5 h-1.5",
    md: "w-2 h-2",
    lg: "w-2.5 h-2.5",
  };

  return (
    <div className={cn("flex space-x-1 items-center", className)}>
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className={cn(
            "rounded-full animate-pulse-dot",
            colorClasses[color],
            sizeClasses[size]
          )}
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
      <style jsx global>{`
        @keyframes pulse-dot {
          0%,
          80%,
          100% {
            transform: scale(0.5);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
        .animate-pulse-dot {
          animation: pulse-dot 1.2s infinite ease-in-out;
        }
      `}</style>
    </div>
  );
}

// New LoadingCard component
export function LoadingCard() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-warm-sand to-sage-green/20 p-4">
      <div className="w-full max-w-md p-8 bg-white/80 backdrop-blur-md rounded-2xl shadow-xl text-center">
        <PulsingDots color="coral" size="lg" />
        <p className="mt-4 text-charcoal/80 font-marcellus text-lg animate-pulse">
          Cargando...
        </p>
      </div>
    </div>
  );
}
