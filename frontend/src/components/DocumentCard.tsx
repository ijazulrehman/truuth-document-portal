'use client';

import { Document, VerificationResult } from '@/types';
import StatusBadge from './StatusBadge';
import { Loader2, FileText, CreditCard } from 'lucide-react';

interface DocumentCardProps {
  document: Document;
  onViewResult: (document: Document) => void;
  onRefresh: (documentId: string) => void;
  isRefreshing: boolean;
}

const documentTypeConfig: Record<string, { label: string; icon: typeof FileText }> = {
  AUSTRALIAN_PASSPORT: { label: 'Australian Passport', icon: CreditCard },
  AUSTRALIAN_DRIVERS_LICENCE: { label: "Australian Driver's License", icon: CreditCard },
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
    <div className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-gray-400" />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <h3 className="font-medium text-gray-900 truncate">{config.label}</h3>
            <StatusBadge status={document.status} outcomeStatus={outcome?.status} />
          </div>
          <p className="text-sm text-gray-500 truncate">
            {document.fileName} · {formatDate(document.createdAt)}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {outcome && (
            <div className="text-right border-r border-gray-100 pr-3">
              <div className="flex items-center gap-2 justify-end mb-0.5">
                <p className="text-xs text-gray-400">Status:</p>
                <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                  outcome.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                  outcome.status === 'WARNING' ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'
                }`}>
                  {outcome.status === 'PASS' ? 'Pass' : outcome.status === 'WARNING' ? 'Review' : 'Fail'}
                </span>
              </div>
              <p className="text-xs text-gray-400">
                Authenticity Score: <span className={`font-semibold ${
                  outcome.status === 'PASS' ? 'text-emerald-600' :
                  outcome.status === 'WARNING' ? 'text-amber-600' : 'text-red-600'
                }`}>{outcome.score}/100</span>
              </p>
            </div>
          )}

          {isProcessing && (
            <button
              onClick={() => onRefresh(document.id)}
              disabled={isRefreshing}
              className="text-sm text-gray-500 hover:text-gray-900 disabled:opacity-50 px-3 py-1.5 rounded-lg hover:bg-gray-50 transition-colors"
            >
              {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Refresh'}
            </button>
          )}

          {canViewResult && (
            <button
              onClick={() => onViewResult(document)}
              className="text-sm font-medium text-gray-900 hover:bg-gray-100 px-3 py-1.5 rounded-lg transition-colors"
            >
              View Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
