'use client';

import { useState, useRef } from 'react';
import { DocumentType } from '@/types';
import { documentsApi, getErrorMessage } from '@/lib/api';
import { X, Loader2, Check, Upload, CreditCard, FileText, Plus } from 'lucide-react';

interface DocumentUploadProps {
  onUploadComplete: () => void;
}

const documentTypes: { value: DocumentType; label: string; description: string; icon: typeof CreditCard }[] = [
  { value: 'AUSTRALIAN_PASSPORT', label: 'Australian Passport', description: 'Photo page of your passport', icon: CreditCard },
  { value: 'AUSTRALIAN_DRIVERS_LICENCE', label: "Australian Driver's Licence", description: 'Front of your licence', icon: CreditCard },
  { value: 'RESUME', label: 'Resume', description: 'Your CV or resume document', icon: FileText },
];

export default function DocumentUpload({ onUploadComplete }: DocumentUploadProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<DocumentType | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setError('File size must be less than 10MB');
        return;
      }
      const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        setError('Only JPEG, PNG, and PDF files are allowed');
        return;
      }
      setSelectedFile(file);
      setError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || !selectedType) return;

    setIsUploading(true);
    setError('');

    try {
      await documentsApi.upload(selectedFile, selectedType);
      setSuccess(true);
      setTimeout(() => {
        setIsOpen(false);
        resetForm();
        onUploadComplete();
      }, 1000);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsUploading(false);
    }
  };

  const resetForm = () => {
    setSelectedType(null);
    setSelectedFile(null);
    setError('');
    setSuccess(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    setIsOpen(false);
    resetForm();
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="w-full p-4 bg-white rounded-xl border border-dashed border-gray-200 text-gray-500 hover:text-gray-900 hover:border-gray-300 hover:bg-gray-50 transition-all text-sm flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add Document
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Upload Document</h2>
          <button onClick={handleClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="p-5">
          {success ? (
            <div className="text-center py-10">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-emerald-100 rounded-full mb-4">
                <Check className="h-7 w-7 text-emerald-600" />
              </div>
              <p className="text-gray-900 font-medium">Document uploaded!</p>
              <p className="text-sm text-gray-500 mt-1">Processing will begin shortly</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 bg-red-50 border border-red-100 text-red-600 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Document Type
                  </label>
                  <div className="space-y-2">
                    {documentTypes.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          type="button"
                          onClick={() => setSelectedType(type.value)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center gap-3 ${
                            selectedType === type.value
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                            selectedType === type.value ? 'bg-gray-900' : 'bg-gray-100'
                          }`}>
                            <Icon className={`w-4 h-4 ${selectedType === type.value ? 'text-white' : 'text-gray-500'}`} />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-900">{type.label}</p>
                            <p className="text-xs text-gray-500">{type.description}</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select File
                  </label>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={handleFileSelect}
                    className="hidden"
                    id="file-upload"
                  />
                  <label
                    htmlFor="file-upload"
                    className="flex flex-col items-center justify-center w-full h-28 border border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition-all"
                  >
                    {selectedFile ? (
                      <div className="text-center px-4">
                        <p className="text-sm font-medium text-gray-900 truncate max-w-full">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    ) : (
                      <>
                        <Upload className="w-6 h-6 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500">Click to select file</p>
                        <p className="text-xs text-gray-400 mt-0.5">JPEG, PNG, or PDF up to 10MB</p>
                      </>
                    )}
                  </label>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={handleClose}
                  className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-700 text-sm font-medium rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || !selectedType || isUploading}
                  className="flex-1 px-4 py-2.5 bg-gray-900 text-white text-sm font-medium rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-black transition-colors"
                >
                  {isUploading ? (
                    <span className="flex items-center justify-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </span>
                  ) : (
                    'Upload'
                  )}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
