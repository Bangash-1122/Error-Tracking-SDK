'use client';

import React from 'react';
import { useApp } from '@/lib/store';
import { KeyRound, AlertTriangle, X } from 'lucide-react';

export function KeyRotationModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const { activeProject, rotateActiveKey } = useApp();

  if (!isOpen) return null;

  const handleConfirm = () => {
    rotateActiveKey();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-150">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="px-6 py-4 bg-rose-950 text-white flex items-center justify-between border-b border-rose-900">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-base text-rose-100">Rotate Ingest Key?</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-rose-300 hover:text-white hover:bg-rose-900 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4 text-xs text-slate-600 leading-relaxed">
          <p>
            Rotating the ingest key for <strong className="text-slate-900">{activeProject.name}</strong> will instantly revoke the existing key:
          </p>
          <div className="p-3 bg-slate-100 rounded-xl font-mono text-[11px] text-slate-800 break-all border border-slate-200">
            {activeProject.publicKey}
          </div>
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
            <p className="font-bold">⚠️ Warning:</p>
            <p className="mt-0.5">
              Any clients or SDKs configured with the old key will be rejected immediately until they update their environment variables to the new key.
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-xl text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-md shadow-rose-600/20 transition-colors"
          >
            Yes, Rotate Key
          </button>
        </div>
      </div>
    </div>
  );
}
