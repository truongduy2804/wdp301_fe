// filepath: src/components/Admin/shared/LoadingSpinner.tsx

import React from 'react';
import { Loader2 } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface LoadingSpinnerProps {
  /** Optional text to display below spinner */
  text?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Custom className for wrapper */
  className?: string;
  /** Full screen overlay mode */
  fullScreen?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Loading spinner component with optional text
 * Can be used inline or as full-screen overlay
 */
export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  text = 'Loading...',
  size = 'md',
  className = '',
  fullScreen = false,
}) => {
  // Size classes for spinner
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  // Text size classes
  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  const spinnerContent = (
    <div className={`flex flex-col items-center justify-center gap-3 ${className}`}>
      <Loader2 
        className={`${sizeClasses[size]} animate-spin text-blue-600`}
        aria-label="Loading"
      />
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-600 animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  // Full screen overlay mode
  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/80 backdrop-blur-sm">
        {spinnerContent}
      </div>
    );
  }

  // Inline mode
  return spinnerContent;
};

/**
 * Centered loading spinner for page-level loading
 */
export const PageLoader: React.FC<{ text?: string }> = ({ text }) => {
  return (
    <div className="flex items-center justify-center min-h-[400px] w-full">
      <LoadingSpinner text={text} size="lg" />
    </div>
  );
};

/**
 * Button loading spinner (small, inline)
 */
export const ButtonLoader: React.FC = () => {
  return <Loader2 className="h-4 w-4 animate-spin" />;
};

export default LoadingSpinner;
