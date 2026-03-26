// filepath: src/components/Admin/shared/Card.tsx

import React from 'react';

// ============================================================================
// Types
// ============================================================================

interface CardProps {
  /** Optional card title */
  title?: string;
  /** Optional card description/subtitle */
  description?: string;
  /** Card content */
  children: React.ReactNode;
  /** Optional action buttons or elements in header */
  actions?: React.ReactNode;
  /** Custom className for card wrapper */
  className?: string;
  /** Padding size */
  padding?: 'none' | 'sm' | 'md' | 'lg';
  /** Show border */
  bordered?: boolean;
  /** Show shadow */
  shadow?: boolean;
  /** Hoverable effect */
  hoverable?: boolean;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Reusable card component with consistent styling
 * Used for wrapping content sections in admin dashboard
 */
export const Card: React.FC<CardProps> = ({
  title,
  description,
  children,
  actions,
  className = '',
  padding = 'md',
  bordered = true,
  shadow = true,
  hoverable = false,
}) => {
  // Padding classes
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        rounded-2xl bg-white border border-gray-100
        ${shadow ? 'shadow-sm' : ''}
        ${hoverable ? 'hover:shadow-lg hover:shadow-gray-200/50 transition-all duration-300' : ''}
        ${className}
      `}
    >
      {/* Card Header (if title or actions provided) */}
      {(title || actions) && (
        <div
          className={`
            flex items-start justify-between gap-4
            ${padding !== 'none' ? 'px-6 pt-6' : ''}
            ${children ? 'pb-4' : padding !== 'none' ? 'pb-6' : ''}
            ${bordered && children ? 'border-b border-gray-100' : ''}
          `}
        >
          {/* Title section */}
          {title && (
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-bold text-gray-900 tracking-tight">
                {title}
              </h3>
              {description && (
                <p className="mt-1 text-sm text-gray-500 font-medium">
                  {description}
                </p>
              )}
            </div>
          )}

          {/* Actions section */}
          {actions && (
            <div className="flex items-center gap-2 flex-shrink-0">
              {actions}
            </div>
          )}
        </div>
      )}

      {/* Card Body */}
      <div className={paddingClasses[padding]}>
        {children}
      </div>
    </div>
  );
};

/**
 * Simple card without header (just content wrapper)
 */
export const SimpleCard: React.FC<{
  children: React.ReactNode;
  className?: string;
}> = ({ children, className = '' }) => {
  return (
    <div
      className={`
        rounded-lg bg-white border border-gray-200 shadow-sm p-6
        ${className}
      `}
    >
      {children}
    </div>
  );
};

/**
 * Clickable card (for navigation or selection)
 */
export const ClickableCard: React.FC<{
  children: React.ReactNode;
  onClick: () => void;
  className?: string;
  selected?: boolean;
}> = ({ children, onClick, className = '', selected = false }) => {
  return (
    <button
      onClick={onClick}
      className={`
        w-full text-left
        rounded-lg bg-white border-2 shadow-sm p-6
        hover:shadow-md hover:border-blue-300
        active:scale-[0.98]
        transition-all duration-200
        focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
        ${selected ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}
        ${className}
      `}
    >
      {children}
    </button>
  );
};

export default Card;
