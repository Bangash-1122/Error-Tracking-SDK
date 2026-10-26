'use client';

import React, { useState } from 'react';
import { StackFrame } from '@/types';
import { Copy, Check, FileCode, CheckCircle2, ChevronDown, ChevronRight, Layers } from 'lucide-react';
import { useApp } from '@/lib/store';

export function StackTraceViewer({
  frames,
  exceptionType,
  exceptionValue,
}: {
  frames: StackFrame[];
  exceptionType: string;
  exceptionValue: string;
}) {
  const { showToast } = useApp();
  const [copied, setCopied] = useState(false);
  const [showAllFrames, setShowAllFrames] = useState(false);
  const [expandedFrameIndices, setExpandedFrameIndices] = useState<number[]>([frames.findIndex((f) => f.in_app)]);

  const toggleFrameExpand = (index: number) => {
    setExpandedFrameIndices((prev) =>
      prev.includes(index) ? prev.filter((i) => i !== index) : [...prev, index]
    );
  };

  const handleCopyTrace = () => {
    const text = [
      `${exceptionType}: ${exceptionValue}`,
      ...frames.map(
        (f) => `  at ${f.function} (${f.filename}:${f.lineno || '?'}:${f.colno || '?'})`
      ),
    ].join('\n');

    navigator.clipboard.writeText(text);
    setCopied(true);
    showToast('Stack trace copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const inAppCount = frames.filter((f) => f.in_app).length;
  const displayedFrames = showAllFrames ? frames : frames.filter((f) => f.in_app);

  return (
    <div className="bg-[#0F172A] rounded-2xl border border-slate-800 shadow-xl overflow-hidden text-slate-200">
      {/* Trace Header */}
      <div className="bg-[#1E293B] px-5 py-3 border-b border-slate-700/80 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <FileCode className="w-4 h-4 text-[#60A5FA]" />
          <span className="text-xs font-bold text-white tracking-wide uppercase">
            Stack Trace
          </span>
          {/* Symbolication Badge */}
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950 text-emerald-400 border border-emerald-800/80">
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            Source map verified
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Toggle between In-App only and All Frames */}
          <button
            onClick={() => setShowAllFrames(!showAllFrames)}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium"
          >
            <Layers className="w-3.5 h-3.5 text-slate-400" />
            <span>
              {showAllFrames
                ? `Showing all (${frames.length})`
                : `In-App only (${inAppCount})`}
            </span>
          </button>

          {/* Copy Button */}
          <button
            onClick={handleCopyTrace}
            className="flex items-center gap-1.5 text-xs text-slate-300 hover:text-white transition-colors bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 font-medium"
            title="Copy plain text stack trace"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-emerald-400 font-bold">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Trace</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Stack Frames List */}
      <div className="divide-y divide-slate-800/80 text-xs font-mono">
        {displayedFrames.map((frame, index) => {
          const isExpanded = expandedFrameIndices.includes(index);
          const hasContext = !!frame.context_line;

          return (
            <div
              key={index}
              className={`transition-colors ${
                frame.in_app ? 'bg-[#0F172A]' : 'bg-[#0A0F1D]/80 opacity-75'
              }`}
            >
              {/* Frame summary row */}
              <div
                onClick={() => hasContext && toggleFrameExpand(index)}
                className={`px-5 py-3 flex items-start justify-between gap-4 ${
                  hasContext ? 'cursor-pointer hover:bg-slate-800/40' : ''
                }`}
              >
                <div className="flex items-start gap-2.5 overflow-hidden">
                  {hasContext ? (
                    <button className="mt-0.5 text-slate-400 hover:text-white">
                      {isExpanded ? (
                        <ChevronDown className="w-3.5 h-3.5" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5" />
                      )}
                    </button>
                  ) : (
                    <span className="w-3.5 inline-block" />
                  )}

                  <div className="truncate">
                    <span className="font-bold text-white text-sm">
                      {frame.function || '?'}
                    </span>
                    <p className="text-slate-400 text-xs mt-0.5 truncate">
                      {frame.filename}:{frame.lineno}:{frame.colno}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {frame.in_app ? (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-800">
                      In-App
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-400">
                      vendor
                    </span>
                  )}
                </div>
              </div>

              {/* Expandable Code Context Preview */}
              {isExpanded && hasContext && (
                <div className="bg-[#020617] border-y border-slate-800 px-6 py-3 font-mono text-xs overflow-x-auto">
                  {/* Pre Context */}
                  {frame.pre_context?.map((line, pIdx) => {
                    const lineNum = (frame.lineno || 0) - (frame.pre_context?.length || 0) + pIdx;
                    return (
                      <div key={pIdx} className="flex gap-4 text-slate-500 py-0.5">
                        <span className="w-8 select-none text-right text-slate-600">{lineNum}</span>
                        <span className="whitespace-pre">{line}</span>
                      </div>
                    );
                  })}

                  {/* Crash Context Line */}
                  <div className="flex gap-4 bg-red-950/40 text-red-200 py-1 border-l-2 border-red-500 pl-2 -ml-2 rounded-r my-0.5 font-bold">
                    <span className="w-8 select-none text-right text-red-400 font-bold">{frame.lineno}</span>
                    <span className="whitespace-pre">{frame.context_line}</span>
                  </div>

                  {/* Post Context */}
                  {frame.post_context?.map((line, pIdx) => {
                    const lineNum = (frame.lineno || 0) + 1 + pIdx;
                    return (
                      <div key={pIdx} className="flex gap-4 text-slate-500 py-0.5">
                        <span className="w-8 select-none text-right text-slate-600">{lineNum}</span>
                        <span className="whitespace-pre">{line}</span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
