'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  AlertTriangle,
  FolderGit2,
  GitBranch,
  Users,
  ArrowRight,
  Clock,
  X,
  CornerDownLeft,
  Loader2,
} from 'lucide-react';
import { api } from '@/lib/apiClient';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgSlug: string;
}

export function GlobalSearchModal({ isOpen, onClose, orgSlug }: GlobalSearchModalProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<{
    issues: any[];
    projects: any[];
    releases: any[];
    users: any[];
  }>({
    issues: [],
    projects: [],
    releases: [],
    users: [],
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  // Load recent searches from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('errorpulse_recent_searches');
      if (stored) {
        setRecentSearches(JSON.parse(stored).slice(0, 5));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    try {
      const updated = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 5);
      setRecentSearches(updated);
      localStorage.setItem('errorpulse_recent_searches', JSON.stringify(updated));
    } catch {
      // ignore
    }
  };

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSelectedIndex(0);
    } else {
      setQuery('');
      setResults({ issues: [], projects: [], releases: [], users: [] });
    }
  }, [isOpen]);

  // Debounced search query
  useEffect(() => {
    if (!query.trim()) {
      setResults({ issues: [], projects: [], releases: [], users: [] });
      setLoading(false);
      return;
    }

    setLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.search(query.trim());
        setResults(res);
        setSelectedIndex(0);
      } catch {
        setResults({ issues: [], projects: [], releases: [], users: [] });
      } finally {
        setLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  // Flattened list of clickable results for keyboard navigation
  const flatResults = [
    ...results.issues.map((i) => ({ type: 'issue', item: i, href: `/org/${orgSlug}/issues/${i.id}` })),
    ...results.projects.map((p) => ({ type: 'project', item: p, href: `/org/${orgSlug}/projects` })),
    ...results.releases.map((r) => ({ type: 'release', item: r, href: `/org/${orgSlug}/releases` })),
    ...results.users.map((u) => ({ type: 'user', item: u, href: `/org/${orgSlug}/settings` })),
  ];

  const handleSelect = useCallback((item: { href: string; title?: string }) => {
    saveRecentSearch(query);
    onClose();
    router.push(item.href);
  }, [onClose, query, router]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatResults.length > 0 ? (prev + 1) % flatResults.length : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (flatResults.length > 0 ? (prev - 1 + flatResults.length) % flatResults.length : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (flatResults[selectedIndex]) {
          handleSelect(flatResults[selectedIndex]);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, flatResults, selectedIndex, handleSelect, onClose]);

  if (!isOpen) return null;

  const totalResults = flatResults.length;
  let runningIndex = -1;

  const highlightMatch = (text: string, term: string) => {
    if (!term.trim()) return text;
    const parts = text.split(new RegExp(`(${term})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === term.toLowerCase() ? (
        <span key={i} className="bg-amber-100 text-amber-900 font-bold px-0.5 rounded">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Search Input */}
        <div className="p-4 border-b border-slate-200 flex items-center gap-3 bg-[#FCFDFE]">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search issues, stack traces, projects, releases, users..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none"
          />
          {loading && <Loader2 className="w-4 h-4 text-[#2563EB] animate-spin shrink-0" />}
          {query && !loading && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 border border-slate-300 rounded shadow-sm">
            ESC
          </kbd>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Recent searches when query is empty */}
          {!query.trim() && (
            <div>
              {recentSearches.length > 0 && (
                <div className="mb-4">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5 mb-2">
                    <Clock className="w-3.5 h-3.5" />
                    Recent Searches
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((s) => (
                      <button
                        key={s}
                        onClick={() => setQuery(s)}
                        className="px-3 py-1 rounded-lg text-xs font-medium bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="text-center py-8 text-xs text-slate-400">
                Type keywords like <strong className="text-slate-600 font-semibold">TypeError</strong>,{' '}
                <strong className="text-slate-600 font-semibold">v1.3.2</strong>, or{' '}
                <strong className="text-slate-600 font-semibold">CartDrawer</strong> to instantly search.
              </div>
            </div>
          )}

          {/* Empty search results */}
          {query.trim() && !loading && totalResults === 0 && (
            <div className="text-center py-12 text-slate-500">
              <AlertTriangle className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="text-sm font-semibold">No results found for &quot;{query}&quot;</p>
              <p className="text-xs text-slate-400 mt-1">Try searching for an error message, filename, or version.</p>
            </div>
          )}

          {/* Issues Section */}
          {results.issues.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                Issues ({results.issues.length})
              </div>
              <div className="space-y-1">
                {results.issues.map((iss) => {
                  runningIndex++;
                  const isCur = runningIndex === selectedIndex;
                  return (
                    <button
                      key={iss.id}
                      onClick={() => handleSelect({ href: `/org/${orgSlug}/issues/${iss.id}` })}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between text-xs group ${
                        isCur ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="overflow-hidden pr-3">
                        <div className="font-bold truncate">
                          {highlightMatch(iss.title, query)}
                        </div>
                        <div className={`text-[11px] font-mono truncate mt-0.5 ${isCur ? 'text-blue-100' : 'text-slate-400'}`}>
                          {iss.culprit}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isCur
                              ? 'bg-white/20 text-white'
                              : iss.severity === 'critical'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-blue-50 text-blue-700'
                          }`}
                        >
                          {iss.severity}
                        </span>
                        <CornerDownLeft className={`w-3.5 h-3.5 ${isCur ? 'text-white' : 'text-slate-300'}`} />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Projects Section */}
          {results.projects.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <FolderGit2 className="w-3.5 h-3.5 text-[#2563EB]" />
                Projects ({results.projects.length})
              </div>
              <div className="space-y-1">
                {results.projects.map((proj) => {
                  runningIndex++;
                  const isCur = runningIndex === selectedIndex;
                  return (
                    <button
                      key={proj.id}
                      onClick={() => handleSelect({ href: `/org/${orgSlug}/projects` })}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between text-xs ${
                        isCur ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <span className="font-bold truncate">{highlightMatch(proj.name, query)}</span>
                      <span className={`text-[10px] uppercase font-mono ${isCur ? 'text-blue-100' : 'text-slate-400'}`}>
                        {proj.platform}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Releases Section */}
          {results.releases.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <GitBranch className="w-3.5 h-3.5 text-teal-600" />
                Releases ({results.releases.length})
              </div>
              <div className="space-y-1">
                {results.releases.map((rel) => {
                  runningIndex++;
                  const isCur = runningIndex === selectedIndex;
                  return (
                    <button
                      key={rel.id}
                      onClick={() => handleSelect({ href: `/org/${orgSlug}/releases` })}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between text-xs ${
                        isCur ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div className="font-bold">{highlightMatch(rel.version, query)}</div>
                      <span className={`font-mono text-[11px] ${isCur ? 'text-blue-100' : 'text-slate-400'}`}>
                        {rel.ref}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Users Section */}
          {results.users.length > 0 && (
            <div>
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-2 mb-1.5 flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-indigo-500" />
                Team Members ({results.users.length})
              </div>
              <div className="space-y-1">
                {results.users.map((u) => {
                  runningIndex++;
                  const isCur = runningIndex === selectedIndex;
                  return (
                    <button
                      key={u.id}
                      onClick={() => handleSelect({ href: `/org/${orgSlug}/settings` })}
                      className={`w-full text-left p-2.5 rounded-xl transition-colors flex items-center justify-between text-xs ${
                        isCur ? 'bg-[#2563EB] text-white' : 'hover:bg-slate-50 text-slate-800'
                      }`}
                    >
                      <div>
                        <span className="font-bold block">{highlightMatch(u.name, query)}</span>
                        <span className={`text-[10px] ${isCur ? 'text-blue-100' : 'text-slate-400'}`}>{u.email}</span>
                      </div>
                      <ArrowRight className={`w-3.5 h-3.5 ${isCur ? 'text-white' : 'text-slate-300'}`} />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 text-[11px] text-slate-500 flex items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-bold shadow-sm">
                ↑↓
              </kbd>{' '}
              Navigate
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-bold shadow-sm">
                ↵
              </kbd>{' '}
              Select
            </span>
            <span>
              <kbd className="px-1.5 py-0.5 rounded bg-white border border-slate-300 text-[10px] font-bold shadow-sm">
                ESC
              </kbd>{' '}
              Close
            </span>
          </div>
          <span className="font-semibold text-slate-600">ErrorPulse Global Search</span>
        </div>
      </div>
    </div>
  );
}
