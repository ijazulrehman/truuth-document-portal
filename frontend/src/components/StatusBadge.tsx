'use client';

import { DocumentStatus, CheckStatus } from '@/types';
import { Loader2, CheckCircle2, XCircle, Clock, AlertTriangle } from 'lucide-react';

interface StatusBadgeProps {
  status: DocumentStatus;
  outcomeStatus?: CheckStatus;
}

const statusConfig: Record<DocumentStatus, { label: string; className: string; icon?: typeof CheckCircle2 }> = {
  PENDING: {
    label: 'Pending',
    className: 'bg-slate-100 text-slate-600',
    icon: Clock,
  },
  CLASSIFYING: {
    label: 'Classifying',
    className: 'bg-blue-50 text-blue-600',
  },
  CLASSIFICATION_FAILED: {
    label: 'Invalid',
    className: 'bg-red-50 text-red-600',
    icon: XCircle,
  },
  SUBMITTED: {
    label: 'Submitted',
    className: 'bg-slate-100 text-slate-600',
    icon: Clock,
  },
  PROCESSING: {
    label: 'Processing',
    className: 'bg-blue-50 text-blue-600',
  },
  DONE: {
    label: 'Completed',
    className: 'bg-emerald-50 text-emerald-600',
    icon: CheckCircle2,
  },
  FAILED: {
    label: 'Failed',
    className: 'bg-red-50 text-red-600',
    icon: XCircle,
  },
};

export default function StatusBadge({ status }: StatusBadgeProps) {
  const config = statusConfig[status];
  const isProcessing = status === 'PROCESSING' || status === 'CLASSIFYING';
  const Icon = config.icon;

  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full ${config.className}`}>
      {isProcessing ? (
        <Loader2 className="h-3 w-3 animate-spin" />
      ) : Icon ? (
        <Icon className="h-3 w-3" />
      ) : null}
      {config.label}
    </span>
  );
}
