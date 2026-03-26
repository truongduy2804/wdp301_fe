// filepath: src/components/Admin/shared/ErrorMessage.tsx

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface ErrorMessageProps {
  /** Error message to display */
  message: string;
  /** Optional title (defaults to "Error") */
  title?: string;
  /** Optional retry callback */
  onRetry?: () => void;
  /** Custom className for wrapper */
  className?: string;
  /** Show as full page error (larger, centered) */
  fullPage?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Error message component with optional retry button
 * Can be used inline or as full-page error
 */
export const ErrorMessage: React.FC<ErrorMessageProps> = ({
  message,
  title = 'Error',
  onRetry,
  className = '',
  fullPage = false,
}) => {
  const content = (
    <div
      className={`
        rounded-lg border border-red-200 bg-red-50 p-6
        ${fullPage ? 'max-w-md mx-auto text-center' : ''}
        ${className}
      `}
      role="alert"
    >
      {/* Icon */}
      <div className={`flex items-center gap-3 ${fullPage ? 'justify-center' : ''}`}>
        <div className="flex-shrink-0">
          <AlertCircle className={`${fullPage ? 'h-8 w-8' : 'h-6 w-6'} text-red-600`} />
        </div>
        
        <div className="flex-1 min-w-0">
          {/* Title */}
          <h3 className={`${fullPage ? 'text-xl' : 'text-base'} font-semibold text-red-900`}>
            {title}
          </h3>
          
          {/* Message */}
          <p className={`${fullPage ? 'text-base mt-2' : 'text-sm mt-1'} text-red-700`}>
            {message}
          </p>
        </div>
      </div>

      {/* Retry button */}
      {onRetry && (
        <button
          onClick={onRetry}
          className="
            mt-4 inline-flex items-center gap-2 px-4 py-2
            bg-red-600 text-white rounded-lg
            hover:bg-red-700 active:bg-red-800
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2
          "
        >
          <RefreshCw className="h-4 w-4" />
          <span>Try Again</span>
        </button>
      )}
    </div>
  );

  // Full page mode with centered container
  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px] w-full p-6">
        {content}
      </div>
    );
  }

  // Inline mode
  return content;
};

/**
 * Inline error message for forms or small spaces
 */
export const InlineError: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex items-center gap-2 text-sm text-red-600">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
};

/**
 * Field-level error message (for form inputs)
 */
export const FieldError: React.FC<{ message?: string }> = ({ message }) => {
  if (!message) return null;
  
  return (
    <p className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
};

export default ErrorMessage;
