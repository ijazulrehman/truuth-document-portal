'use client';

import { useEffect, useState } from 'react';
import { Document, VerificationResult, CheckStatus } from '@/types';
import { documentsApi, getErrorMessage } from '@/lib/api';
import { X, Loader2, CheckCircle2, XCircle, AlertTriangle, MinusCircle, Copy, Download, ChevronDown, ChevronUp, Shield } from 'lucide-react';

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
  const failedChecks = checkResultsArray.filter((c) => c.result.status === 'FAIL').length;
  const totalChecks = checkResultsArray.length;

  const getStatusIcon = (status: CheckStatus, size: string = 'w-3.5 h-3.5') => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className={`${size} text-emerald-600`} />;
      case 'WARNING':
        return <AlertTriangle className={`${size} text-amber-500`} />;
      case 'NOT_APPLICABLE':
        return <MinusCircle className={`${size} text-slate-400`} />;
      default:
        return <XCircle className={`${size} text-red-500`} />;
    }
  };

  const getStatusBg = (status: CheckStatus) => {
    switch (status) {
      case 'PASS':
        return 'bg-emerald-50';
      case 'WARNING':
        return 'bg-amber-50';
      case 'NOT_APPLICABLE':
        return 'bg-slate-50';
      default:
        return 'bg-red-50';
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

  const outcomeStatus = outcomes?.[0]?.status;
  const hasWarning = outcomeStatus === 'WARNING' || warningChecks > 0;
  const hasFailed = !isVerified || outcomeStatus === 'FAIL' || failedChecks > 0;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[85vh] overflow-hidden flex flex-col shadow-lg">
        {/* Blue Header */}
        <div className="bg-blue-600 px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-semibold text-white">Verification Result</h2>
                <p className="text-xs text-blue-100 truncate max-w-[200px]">{document.fileName}</p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/80 hover:text-white transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="p-4 overflow-y-auto flex-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-blue-600 mb-3" />
              <p className="text-xs text-slate-500">Loading result...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-2">
                <XCircle className="w-5 h-5 text-red-500" />
              </div>
              <p className="text-xs text-slate-600">{error}</p>
            </div>
          ) : (
            <>
              {/* Status Banner */}
              <div className={`flex items-center gap-3 p-3 rounded-lg mb-4 ${
                hasFailed ? 'bg-red-50' : hasWarning ? 'bg-amber-50' : 'bg-emerald-50'
              }`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                  hasFailed ? 'bg-red-100' : hasWarning ? 'bg-amber-100' : 'bg-emerald-100'
                }`}>
                  {hasFailed ? (
                    <XCircle className="w-4 h-4 text-red-600" />
                  ) : hasWarning ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  )}
                </div>
                <div>
                  <p className={`text-sm font-medium ${
                    hasFailed ? 'text-red-800' : hasWarning ? 'text-amber-800' : 'text-emerald-800'
                  }`}>
                    {hasFailed ? 'Verification Failed' : hasWarning ? 'Needs Review' : 'Verified'}
                  </p>
                  <p className={`text-xs ${
                    hasFailed ? 'text-red-600' : hasWarning ? 'text-amber-600' : 'text-emerald-600'
                  }`}>
                    {passedChecks}/{totalChecks} checks passed
                  </p>
                </div>
              </div>

              {/* Score Card */}
              {outcomes && outcomes.length > 0 && (
                <div className="mb-4">
                  {outcomes.map((outcome, index) => (
                    <div key={index} className="bg-white border border-slate-200 rounded-lg p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-slate-600">{outcome.name}</span>
                        <span className={`text-xs font-medium px-1.5 py-0.5 rounded ${
                          outcome.status === 'PASS' ? 'bg-emerald-100 text-emerald-700' :
                          outcome.status === 'WARNING' ? 'bg-amber-100 text-amber-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {outcome.status === 'PASS' ? 'Pass' : outcome.status === 'WARNING' ? 'Review' : 'Fail'}
                        </span>
                      </div>
                      <div className="flex items-baseline gap-1 mb-2">
                        <span className={`text-2xl font-bold ${
                          outcome.score >= 80 ? 'text-emerald-600' :
                          outcome.score >= 50 ? 'text-amber-600' :
                          'text-red-600'
                        }`}>{outcome.score}</span>
                        <span className="text-xs text-slate-400">/100</span>
                      </div>
                      <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${
                            outcome.score >= 80 ? 'bg-emerald-500' :
                            outcome.score >= 50 ? 'bg-amber-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${outcome.score}%` }}
                        />
                      </div>
                      {outcome.message && (
                        <p className="text-xs text-slate-500 mt-2 leading-relaxed">{outcome.message}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Checks List */}
              {checkResultsArray.length > 0 && (
                <div className="mb-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-xs font-medium text-slate-700">Verification Checks</p>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      {passedChecks > 0 && (
                        <span className="flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                          {passedChecks}
                        </span>
                      )}
                      {warningChecks > 0 && (
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-500" />
                          {warningChecks}
                        </span>
                      )}
                      {failedChecks > 0 && (
                        <span className="flex items-center gap-1">
                          <XCircle className="w-3 h-3 text-red-500" />
                          {failedChecks}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <div className="max-h-48 overflow-y-auto divide-y divide-slate-100">
                      {checkResultsArray.map((check, index) => {
                        const checkStatus = check.result.status;
                        const checkName = check.name;

                        return (
                          <div
                            key={index}
                            className={`flex items-center justify-between px-3 py-2 ${getStatusBg(checkStatus)}`}
                          >
                            <div className="flex items-center gap-2">
                              {getStatusIcon(checkStatus)}
                              <span className="text-xs text-slate-700">{formatCheckName(checkName)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Raw JSON Toggle */}
              <div className="border-t border-slate-100 pt-3">
                <button
                  onClick={() => setShowRawJson(!showRawJson)}
                  className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-blue-600 transition-colors"
                >
                  {showRawJson ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                  {showRawJson ? 'Hide' : 'Show'} Raw Data
                </button>

                {showRawJson && verificationResult && (
                  <div className="mt-2">
                    <div className="flex items-center justify-end gap-1 mb-1.5">
                      <button
                        onClick={handleCopy}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Copy className="h-3 w-3" />
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                      <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-1 px-2 py-1 text-xs text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
                      >
                        <Download className="h-3 w-3" />
                        Download
                      </button>
                    </div>
                    <div className="bg-slate-900 rounded-lg p-3 max-h-40 overflow-auto">
                      <pre className="text-xs text-slate-300 font-mono whitespace-pre-wrap">
                        {JSON.stringify(verificationResult, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        <div className="p-3 border-t border-slate-200 bg-slate-50">
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
