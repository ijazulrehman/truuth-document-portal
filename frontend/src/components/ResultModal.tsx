'use client';

import { useEffect, useState } from 'react';
import { Document, VerificationResult, CheckResult, CheckStatus } from '@/types';
import { documentsApi, getErrorMessage } from '@/lib/api';
import { X, Loader2, CheckCircle2, XCircle, AlertTriangle, MinusCircle, Copy, Download, ChevronDown, ChevronUp } from 'lucide-react';

interface ResultModalProps {
  document: Document;
  onClose: () => void;
}

export default function ResultModal({ document: initialDocument, onClose }: ResultModalProps) {
  const [document, setDocument] = useState(initialDocument);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRawJson, setShowRawJson] = useState(false);

  useEffect(() => {
    const fetchResult = async () => {
      if (!document.verificationResult && document.hasResult) {
        setIsLoading(true);
        try {
          const result = await documentsApi.getResult(document.id);
          setDocument(result);
        } catch (err) {
          setError(getErrorMessage(err));
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchResult();
  }, [document.id, document.hasResult, document.verificationResult]);

  const verificationResult = document.verificationResult as VerificationResult | undefined;
  const checkResults = verificationResult?.checkResults;
  const outcomes = verificationResult?.outcomes;
  const isVerified = document.status === 'DONE';

  // Convert checkResults object to array for easier iteration
  const checkResultsArray = checkResults ? Object.values(checkResults) : [];
  const passedChecks = checkResultsArray.filter((c) => c.result.status === 'PASS').length;
  const warningChecks = checkResultsArray.filter((c) => c.result.status === 'WARNING').length;
  const totalChecks = checkResultsArray.length;

  const getStatusIcon = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'WARNING':
        return <AlertTriangle className="w-4 h-4 text-amber-500" />;
      case 'NOT_APPLICABLE':
        return <MinusCircle className="w-4 h-4 text-gray-400" />;
      default:
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusColor = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return 'text-emerald-600';
      case 'WARNING':
        return 'text-amber-600';
      case 'NOT_APPLICABLE':
        return 'text-gray-400';
      default:
        return 'text-red-600';
    }
  };

  const getStatusLabel = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return 'Pass';
      case 'WARNING':
        return 'Warning';
      case 'NOT_APPLICABLE':
        return 'N/A';
      default:
        return 'Fail';
    }
  };

  const handleCopy = async () => {
    if (verificationResult) {
      await navigator.clipboard.writeText(JSON.stringify(verificationResult, null, 2));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownload = () => {
    if (verificationResult) {
      const blob = new Blob([JSON.stringify(verificationResult, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = window.document.createElement('a');
      a.href = url;
      a.download = `verification-${document.id}.json`;
      window.document.body.appendChild(a);
      a.click();
      window.document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const formatCheckName = (name: string) => {
    return name.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase());
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[85vh] overflow-hidden flex flex-col shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Verification Result</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-gray-300 mb-4" />
              <p className="text-sm text-gray-500">Loading result...</p>
            </div>
          ) : error ? (
            <div className="text-center py-16">
              <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
                <XCircle className="w-6 h-6 text-red-500" />
              </div>
              <p className="text-sm text-gray-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Status Card */}
              {(() => {
                const outcomeStatus = outcomes?.[0]?.status;
                const hasWarning = outcomeStatus === 'WARNING' || warningChecks > 0;
                const statusBg = !isVerified ? 'bg-red-50' : hasWarning ? 'bg-amber-50' : 'bg-emerald-50';
                const iconBg = !isVerified ? 'bg-red-100' : hasWarning ? 'bg-amber-100' : 'bg-emerald-100';
                const titleColor = !isVerified ? 'text-red-900' : hasWarning ? 'text-amber-900' : 'text-emerald-900';
                const subtitleColor = !isVerified ? 'text-red-700' : hasWarning ? 'text-amber-700' : 'text-emerald-700';
                const statusTitle = !isVerified ? 'Verification Failed' : hasWarning ? 'Verification Complete with Warnings' : 'Verification Successful';

                return (
                  <div className={`p-5 rounded-xl mb-5 ${statusBg}`}>
                    <div className="flex items-start gap-4">
                      <div className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 ${iconBg}`}>
                        {!isVerified ? (
                          <XCircle className="w-6 h-6 text-red-600" />
                        ) : hasWarning ? (
                          <AlertTriangle className="w-6 h-6 text-amber-600" />
                        ) : (
                          <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                        )}
                      </div>
                      <div>
                        <p className={`font-semibold ${titleColor}`}>
                          {statusTitle}
                        </p>
                        <p className={`text-sm mt-0.5 ${subtitleColor}`}>
                          {document.fileName}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {/* Overall Outcome */}
              {outcomes && outcomes.length > 0 && (
                <div className="mb-5">
                  <p className="text-sm font-medium text-gray-700 mb-3">
                    Overall Assessment
                  </p>
                  {outcomes.map((outcome, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-xl border ${
                        outcome.status === 'PASS' ? 'border-emerald-200 bg-emerald-50' :
                        outcome.status === 'WARNING' ? 'border-amber-200 bg-amber-50' :
                        'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900">{outcome.name}</span>
                        <div className="flex items-center gap-2">
                          <span className={`text-lg font-bold ${
                            outcome.score >= 80 ? 'text-emerald-600' :
                            outcome.score >= 50 ? 'text-amber-600' :
                            'text-red-600'
                          }`}>
                            {outcome.score}%
                          </span>
                          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                            outcome.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                            outcome.status === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {outcome.status}
                          </span>
                        </div>
                      </div>
                      <p className="text-xs text-gray-600 leading-relaxed">{outcome.message}</p>
                    </div>
                  ))}
                </div>
              )}

              {/* Checks */}
              {checkResultsArray.length > 0 && (
                <div className="mb-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-medium text-gray-700">
                      Verification Checks
                    </p>
                    <span className="text-xs text-gray-500">
                      {passedChecks} passed{warningChecks > 0 && `, ${warningChecks} warnings`} / {totalChecks} total
                    </span>
                  </div>
                  <div className="space-y-1.5 max-h-64 overflow-y-auto">
                    {checkResultsArray.map((check, index) => {
                      const checkStatus = check.result.status;
                      const checkName = check.name;

                      return (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                        >
                          <div className="flex items-center gap-2">
                            {getStatusIcon(checkStatus)}
                            <span className="text-sm text-gray-700">{formatCheckName(checkName)}</span>
                          </div>
                          <span className={`text-xs font-medium ${getStatusColor(checkStatus)}`}>
                            {getStatusLabel(checkStatus)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Raw JSON */}
              <div className="border-t border-gray-100 pt-4">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
                >
                  {showRawJson ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  {showRawJson ? 'Hide' : 'Show'} Raw Data
                </button>

                {showRawJson && verificationResult && (
                  <div className="mt-3">
                    <div className="flex items-center justify-end gap-1 mb-2">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                      >
                        <Download className="h-3.5 w-3.5" />
                        Download
                      </button>
                    </div>
                    <div className="bg-gray-900 rounded-xl p-4 max-h-52 overflow-auto">
                      <pre className="text-xs text-gray-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(verificationResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-5 border-t border-gray-100">
          <button
            onClick={onClose}
            className="w-full px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-black transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
