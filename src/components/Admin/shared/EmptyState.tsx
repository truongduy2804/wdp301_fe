// filepath: src/components/Admin/shared/EmptyState.tsx

import React from 'react';
import { Package, Plus } from 'lucide-react';

// ============================================================================
// Types
// ============================================================================

interface EmptyStateProps {
  /** Icon to display (defaults to Package) */
  icon?: React.ReactNode;
  /** Title text */
  title: string;
  /** Optional description */
  description?: string;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
  };
  /** Custom className */
  className?: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Empty state component for lists with no data
 * Shows icon, title, description and optional action button
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  icon,
  title,
  description,
  action,
  className = '',
}) => {
  return (
    <div
      className={`
        flex flex-col items-center justify-center
        py-12 px-6 text-center
        ${className}
      `}
    >
      {/* Icon */}
      <div className="rounded-full bg-gray-100 p-4 mb-4">
        {icon || <Package className="h-10 w-10 text-gray-400" />}
      </div>

      {/* Title */}
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        {title}
      </h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-gray-600 max-w-md mb-6">
          {description}
        </p>
      )}

      {/* Action button */}
      {action && (
        <button
          onClick={action.onClick}
          className="
            inline-flex items-center gap-2 px-4 py-2
            bg-blue-600 text-white rounded-lg
            hover:bg-blue-700 active:bg-blue-800
            transition-colors duration-200
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
          "
        >
          {action.icon || <Plus className="h-4 w-4" />}
          <span>{action.label}</span>
        </button>
      )}
    </div>
  );
};

/**
 * Empty state for search results with no matches
 */
export const EmptySearchResult: React.FC<{ searchQuery?: string; onClear?: () => void }> = ({
  searchQuery,
  onClear,
}) => {
  return (
    <EmptyState
      title="No results found"
      description={
        searchQuery
          ? `No items match "${searchQuery}". Try adjusting your search.`
          : 'No items found. Try adjusting your filters.'
      }
      action={
        onClear
          ? {
              label: 'Clear filters',
              onClick: onClear,
            }
          : undefined
      }
    />
  );
};

/**
 * Empty state for error scenarios
 */
export const EmptyError: React.FC<{ title?: string; onRetry?: () => void }> = ({
  title = 'Something went wrong',
  onRetry,
}) => {
  return (
    <EmptyState
      title={title}
      description="Unable to load data. Please try again."
      action={
        onRetry
          ? {
              label: 'Retry',
              onClick: onRetry,
            }
          : undefined
      }
    />
  );
};

export default EmptyState;
