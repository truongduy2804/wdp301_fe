// filepath: src/components/Admin/Overview/AlertBox.tsx

import React, { useState } from 'react';
import { AlertCircle, Info, X } from 'lucide-react';
import type { OverviewKPI } from '@/api/types/admin.types';

// ============================================================================
// Types
// ============================================================================

interface AlertBoxProps {
  /** KPI data to check for alerts */
  kpi: OverviewKPI;
  /** Custom className */
  className?: string;
}

interface Alert {
  id: string;
  type: 'warning' | 'info';
  title: string;
  message: string;
}

// ============================================================================
// Component
// ============================================================================

/**
 * Alert Box component that shows system alerts based on KPI values
 * Displays warnings for high complaints or in-progress reports
 * Alerts are dismissible
 */
export const AlertBox: React.FC<AlertBoxProps> = ({ kpi, className = '' }) => {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  // Generate alerts based on KPI values
  const alerts: Alert[] = [];

  // Check for high number of complaints (threshold: 10)
  if (kpi.openComplaints > 10) {
    alerts.push({
      id: 'complaints-high',
      type: 'warning',
      title: 'Nhiều khiếu nại cần xử lý',
      message: `Có ${kpi.openComplaints} khiếu nại đang mở. Hãy xem xét và xử lý kịp thời.`,
    });
  }

  // Check for high number of in-progress reports (threshold: 100)
  if (kpi.inProgressReports > 100) {
    alerts.push({
      id: 'reports-high',
      type: 'info',
      title: 'Nhiều báo cáo đang xử lý',
      message: `Có ${kpi.inProgressReports} báo cáo đang được xử lý. Hệ thống hoạt động tốt.`,
    });
  }

  // Check completion rate
  const completionRate = kpi.totalReports > 0 
    ? (kpi.completedReports / kpi.totalReports) * 100 
    : 0;
  
  if (completionRate < 70) {
    alerts.push({
      id: 'completion-low',
      type: 'warning',
      title: 'Tỷ lệ hoàn thành thấp',
      message: `Chỉ ${completionRate.toFixed(1)}% báo cáo đã hoàn thành. Cần cải thiện hiệu suất.`,
    });
  }

  // Filter out dismissed alerts
  const visibleAlerts = alerts.filter(alert => !dismissedAlerts.has(alert.id));

  // Don't render if no alerts
  if (visibleAlerts.length === 0) {
    return null;
  }

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  };

  return (
    <div className={`space-y-3 ${className}`}>
      {visibleAlerts.map((alert) => {
        const isWarning = alert.type === 'warning';
        const bgColor = isWarning ? 'bg-gradient-to-r from-amber-50 to-orange-50' : 'bg-gradient-to-r from-blue-50 to-cyan-50';
        const borderColor = isWarning ? 'border-amber-200/60' : 'border-blue-200/60';
        const textColor = isWarning ? 'text-amber-900' : 'text-blue-900';
        const iconBg = isWarning ? 'bg-amber-100' : 'bg-blue-100';
        const iconColor = isWarning ? 'text-amber-600' : 'text-blue-600';
        const Icon = isWarning ? AlertCircle : Info;

        return (
          <div
            key={alert.id}
            className={`
              rounded-xl border ${borderColor} ${bgColor}
              p-4 flex items-start gap-4 shadow-sm
              animate-in slide-in-from-top-2 fade-in duration-300
            `}
            role="alert"
          >
            <div className="flex-shrink-0">
              <div className={`${iconBg} rounded-lg p-2`}>
                <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={2} />
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <h3 className={`text-sm font-bold ${textColor} mb-1`}>
                {alert.title}
              </h3>
              <p className={`text-sm ${textColor} opacity-80`}>
                {alert.message}
              </p>
            </div>

            <button
              onClick={() => handleDismiss(alert.id)}
              className={`
                flex-shrink-0 p-1.5 rounded-lg hover:bg-white/50
                transition-all duration-200 hover:scale-110
                focus:outline-none focus:ring-2 focus:ring-offset-1
                ${isWarning ? 'focus:ring-amber-400' : 'focus:ring-blue-400'}
              `}
              aria-label="Dismiss alert"
            >
              <X className={`h-4 w-4 ${iconColor}`} strokeWidth={2.5} />
            </button>
          </div>
        );
      })}
    </div>
  );
};

export default AlertBox;
