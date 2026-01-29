'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { Document, DocumentSummary } from '@/types';
import { documentsApi, getErrorMessage } from '@/lib/api';
import Header from '@/components/Header';
import DocumentCard from '@/components/DocumentCard';
import DocumentUpload from '@/components/DocumentUpload';
import ResultModal from '@/components/ResultModal';
import { Loader2, FileText, CheckCircle2, Clock, XCircle } from 'lucide-react';

export default function DashboardPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const router = useRouter();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [summary, setSummary] = useState<DocumentSummary>({
    total: 3,
    uploaded: 0,
    processing: 0,
    completed: 0,
    failed: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(null);
  const [refreshingIds, setRefreshingIds] = useState<Set<string>>(new Set());

  const fetchDocuments = useCallback(async () => {
    try {
      const response = await documentsApi.getAll();

      // Fetch verification results for completed documents
      const docsWithResults = await Promise.all(
        response.documents.map(async (doc) => {
          if (doc.hasResult && (doc.status === 'DONE' || doc.status === 'FAILED') && !doc.verificationResult) {
            try {
              const result = await documentsApi.getResult(doc.id);
              return result;
            } catch {
              return doc;
            }
          }
          return doc;
        })
      );

      setDocuments(docsWithResults);
      setSummary(response.summary);
      setError('');
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  }, []);

  const pollForUpdates = useCallback(async () => {
    try {
      const response = await documentsApi.poll();
      if (response.updates.length > 0) {
        setDocuments((prev) =>
          prev.map((doc) => {
            const update = response.updates.find((u) => u.id === doc.id);
            if (update) {
              return { ...doc, status: update.status, hasResult: update.hasResult };
            }
            return doc;
          })
        );
        fetchDocuments();
      }
    } catch (err) {
      console.error('Poll error:', err);
    }
  }, [fetchDocuments]);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    if (isAuthenticated) {
      fetchDocuments();
    }
  }, [isAuthenticated, fetchDocuments]);

  useEffect(() => {
    if (!isAuthenticated) return;

    const hasProcessingDocs = documents.some(
      (doc) => doc.status === 'PROCESSING' || doc.status === 'CLASSIFYING'
    );

    if (!hasProcessingDocs) return;

    const interval = setInterval(() => {
      pollForUpdates();
    }, 5000);

    return () => clearInterval(interval);
  }, [documents, isAuthenticated, pollForUpdates]);

  const handleRefresh = async (documentId: string) => {
    setRefreshingIds((prev) => new Set(prev).add(documentId));
    try {
      await pollForUpdates();
    } catch (err) {
      console.error('Failed to refresh status:', err);
    } finally {
      setRefreshingIds((prev) => {
        const next = new Set(prev);
        next.delete(documentId);
        return next;
      });
    }
  };

  const handleViewResult = (document: Document) => {
    setSelectedDocument(document);
  };

  if (authLoading || (!isAuthenticated && !authLoading)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  const isAllUploaded = summary.uploaded >= summary.total;
  const isAllCompleted = summary.completed >= summary.total;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        {/* Progress Card */}
        <div className="bg-white rounded-2xl border border-gray-100 p-6 mb-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Document Verification</h1>
              <p className="text-sm text-gray-500 mt-0.5">
                {isAllCompleted
                  ? 'All documents verified successfully!'
                  : `${summary.uploaded} of ${summary.total} documents uploaded`
                }
              </p>
            </div>
            {isAllCompleted && (
              <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-white" />
              </div>
            )}
          </div>

          {/* Progress Bar */}
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gray-900 rounded-full transition-all duration-500"
              style={{ width: `${(summary.uploaded / summary.total) * 100}%` }}
            />
          </div>

          {/* Status Pills */}
          {(summary.processing > 0 || summary.completed > 0 || summary.failed > 0) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {summary.completed > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-900 text-white text-xs font-medium rounded-full">
                  <CheckCircle2 className="w-3 h-3" />
                  {summary.completed} verified
                </span>
              )}
              {summary.processing > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  <Clock className="w-3 h-3" />
                  {summary.processing} processing
                </span>
              )}
              {summary.failed > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-gray-100 text-gray-600 text-xs font-medium rounded-full">
                  <XCircle className="w-3 h-3" />
                  {summary.failed} failed
                </span>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mb-6 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
            {error}
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-gray-300 mb-4" />
            <p className="text-sm text-gray-400">Loading documents...</p>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => (
              <DocumentCard
                key={doc.id}
                document={doc}
                onViewResult={handleViewResult}
                onRefresh={handleRefresh}
                isRefreshing={refreshingIds.has(doc.id)}
              />
            ))}

            {!isAllUploaded && (
              <DocumentUpload onUploadComplete={fetchDocuments} />
            )}

            {documents.length === 0 && (
              <div className="bg-white rounded-2xl border border-dashed border-gray-200 p-12 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-base font-medium text-gray-900 mb-1">No documents yet</h3>
                <p className="text-sm text-gray-500 mb-6">Start by uploading your first document</p>
                <DocumentUpload onUploadComplete={fetchDocuments} />
              </div>
            )}
          </div>
        )}
      </main>

      {selectedDocument && (
        <ResultModal document={selectedDocument} onClose={() => setSelectedDocument(null)} />
      )}
    </div>
  );
}
