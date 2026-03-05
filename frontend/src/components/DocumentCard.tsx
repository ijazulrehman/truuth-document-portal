'use client';

import { Document, VerificationResult } from '@/types';
import StatusBadge from './StatusBadge';
import { Loader2, FileText, CreditCard, RefreshCw } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onViewResult: (document: Document) => void;
  onRefresh: (documentId: string) => void;
  isRefreshing: boolean;
}

const documentTypeConfig: Record<string, { label: string; icon: typeof FileText }> = {
  AUSTRALIAN_PASSPORT: { label: 'Australian Passport', icon: CreditCard },
  AUSTRALIAN_DRIVERS_LICENCE: { label: "Driver's License", icon: CreditCard },
  RESUME: { label: 'Resume', icon: FileText },
};

export default function DocumentCard({
  document,
  onViewResult,
  onRefresh,
  isRefreshing,
}: DocumentCardProps) {
  const isProcessing = document.status === 'PROCESSING' || document.status === 'CLASSIFYING';
  const canViewResult = document.hasResult && (document.status === 'DONE' || document.status === 'FAILED');

  const config = documentTypeConfig[document.documentType] || { label: document.documentType, icon: FileText };
  const Icon = config.icon;

  const verificationResult = document.verificationResult as VerificationResult | undefined;
  const outcome = verificationResult?.outcomes?.[0];

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-AU', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 overflow-hidden">
      {/* Header */}
      <div className="bg-blue-600 px-4 py-3 flex items-center justify-between">
        <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
          <Icon className="w-4 h-4 text-white" />
        </div>
        <StatusBadge status={document.status} outcomeStatus={outcome?.status} />
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="font-medium text-slate-800 text-sm">{config.label}</h3>
        <p className="text-xs text-slate-500 truncate mt-0.5">
          {document.fileName} · {formatDate(document.createdAt)}
        </p>

        {/* Score Section */}
        {outcome && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-slate-500">Authenticity Score</span>
              <span className={`text-xs font-medium px-2 py-0.5 rounded ${
                outcome.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                outcome.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
              }`}>
                {outcome.status === 'PASS' ? 'Pass' : outcome.status === 'WARNING' ? 'Review' : 'Fail'}
              </span>
            </div>
            <div className="flex items-baseline gap-1">
              <span className={`text-xl font-semibold ${
                outcome.status === 'PASS' ? 'text-emerald-600' :
                outcome.status === 'WARNING' ? 'text-amber-600' : 'text-red-600'
              }`}>{outcome.score}</span>
              <span className="text-slate-400 text-xs">/100</span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  outcome.status === 'PASS' ? 'bg-emerald-500' :
                  outcome.status === 'WARNING' ? 'bg-amber-500' : 'bg-red-500'
                }`}
                style={{ width: `${outcome.score}%` }}
              />
            </div>
          </div>
        )}

        {/* Actions */}
        {(isProcessing || canViewResult) && (
          <div className="mt-3 pt-3 border-t border-slate-100">
            {isProcessing && (
              <button
                onClick={() => onRefresh(document.id)}
                disabled={isRefreshing}
                className="w-full text-xs text-slate-600 hover:text-slate-800 disabled:opacity-50 py-2 px-3 rounded hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5 border border-slate-200"
              >
                {isRefreshing ? (
                  <Loader2 className="h-3 w-3 animate-spin" />
                ) : (
                  <RefreshCw className="h-3 w-3" />
                )}
                Refresh Status
              </button>
            )}

            {canViewResult && (
              <button
                onClick={() => onViewResult(document)}
                className="w-full text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 py-2 px-3 rounded transition-colors"
              >
                View Result
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
