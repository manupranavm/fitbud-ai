import React from 'react';
import { Camera } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CameraCircleProps {
  onClick?: () => void;
  className?: string;
  size?: 'md' | 'lg' | 'xl';
}

const CameraCircle: React.FC<CameraCircleProps> = ({ 
  onClick, 
  className,
  size = 'lg'
}) => {
  const sizeClasses = {
    md: 'h-32 w-32',
    lg: 'h-40 w-40 md:h-48 md:w-48',
    xl: 'h-48 w-48 md:h-56 md:w-56',
  };

  const iconSizes = {
    md: 32,
    lg: 40,
    xl: 48,
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        // Base styling - minimal flat circle
        "relative rounded-full bg-primary text-primary-foreground",
        "border-2 border-primary/20",
        "transition-all duration-300",
        "flex items-center justify-center",
        "hover:bg-primary/90",
        "focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-4",
        // Subtle glow animation
        "animate-glow",
        sizeClasses[size],
        className
      )}
      style={{
        animation: 'glow-minimal 3s ease-in-out infinite',
      }}
    >
      {/* Subtle inner glow effect */}
      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/10 to-transparent opacity-50" />
      
      {/* Camera icon */}
      <Camera 
        size={iconSizes[size]} 
        className="relative z-10 animate-minimal-scale" 
        strokeWidth={1.5}
      />
    </button>
  );
};

export { CameraCircle };