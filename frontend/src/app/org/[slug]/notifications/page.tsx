'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import { api } from '@/lib/apiClient';
import type { NotificationItem } from '@/types';
import {
  Bell,
  AlertTriangle,
  Flame,
  Info,
  Clock,
  ExternalLink,
  Check,
} from 'lucide-react';

export default function NotificationCenterPage() {
  const { org, showToast } = useApp();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    let mounted = true;
    api.getNotifications(org.id)
      .then((data) => {
        if (mounted && data.notifications) setNotifications(data.notifications);
      })
      .catch(() => {});
    return () => {
      mounted = false;
    };
  }, [org.id]);

  const handleMarkAsRead = async (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );
    showToast('Notification marked as read');
    api.markNotificationRead(id, org.id).catch(() => {});
  };

  const handleMarkAllRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    showToast('All notifications marked as read');
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'unread') return !n.isRead;
    if (filterType !== 'all') return n.type === filterType;
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <AppShell>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
              <Bell className="w-6 h-6 text-[#2563EB]" />
              Notification Center
            </h1>
            <p className="text-xs text-[#52647A] mt-0.5">
              Live alert notifications, regression triggers, and quota warnings for <strong className="text-slate-800">{org.name}</strong>
            </p>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors shadow-sm cursor-pointer"
            >
              <Check className="w-4 h-4 text-emerald-600" />
              <span>Mark All as Read ({unreadCount})</span>
            </button>
          )}
        </div>

        {/* Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto bg-white p-2 rounded-2xl border border-[#E2E8F0] shadow-sm text-xs">
          {[
            { id: 'all', label: `All (${notifications.length})` },
            { id: 'unread', label: `Unread (${unreadCount})` },
            { id: 'spike', label: 'Frequency Spikes' },
            { id: 'new_issue', label: 'New Issues' },
            { id: 'regression', label: 'Regressions' },
            { id: 'billing', label: 'Billing' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterType(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                filterType === tab.id
                  ? 'bg-[#10203C] text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Notification Cards List */}
        <div className="space-y-3">
          {filtered.length > 0 ? (
            filtered.map((item) => {
              const icon =
                item.severity === 'critical' || item.type === 'regression' ? (
                  <Flame className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                ) : item.type === 'spike' ? (
                  <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                ) : (
                  <Info className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
                );

              return (
                <div
                  key={item.id}
                  className={`p-5 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    item.isRead
                      ? 'bg-white border-[#E2E8F0] text-slate-700'
                      : 'bg-blue-50/40 border-blue-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    {icon}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{item.title}</span>
                        {!item.isRead && (
                          <span className="w-2 h-2 rounded-full bg-[#2563EB]" />
                        )}
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.severity === 'critical'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 leading-relaxed">{item.message}</p>
                      <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{new Date(item.createdAt).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {item.link && (
                      <Link
                        href={item.link}
                        className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 transition-colors shadow-sm"
                      >
                        <span>View Details</span>
                        <ExternalLink className="w-3 h-3 text-slate-400" />
                      </Link>
                    )}

                    {!item.isRead && (
                      <button
                        onClick={() => handleMarkAsRead(item.id)}
                        className="p-1.5 rounded-xl border border-blue-200 bg-white hover:bg-blue-50 text-[#2563EB] text-xs font-semibold transition-colors shadow-sm"
                        title="Mark as read"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center text-slate-400">
              <Bell className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-slate-600">No notifications to display</p>
              <p className="text-xs mt-0.5">All alerts in this category have been cleared.</p>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
