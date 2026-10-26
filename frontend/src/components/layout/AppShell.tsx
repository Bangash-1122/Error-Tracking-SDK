'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import {
  LayoutDashboard,
  AlertTriangle,
  GitBranch,
  BellRing,
  Settings,
  Building2,
  CreditCard,
  ChevronDown,
  Search,
  Plus,
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  CheckCircle2,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { Suspense } from 'react';

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || '';
  const {
    org,
    projects,
    activeProject,
    setActiveProject,
    issues,
    activeTimeRange,
    setActiveTimeRange,
    activeEnvironment,
    setActiveEnvironment,
    sendSimulatedEvent,
  } = useApp();

  const [collapsed, setCollapsed] = useState(false);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const unresolvedCount = issues.filter(
    (i) => i.projectId === activeProject.id && i.status === 'unresolved'
  ).length;

  const navItems = [
    {
      label: 'Overview',
      href: `/org/${org.slug}/overview`,
      icon: LayoutDashboard,
    },
    {
      label: 'Issues',
      href: `/org/${org.slug}/issues`,
      icon: AlertTriangle,
      badge: unresolvedCount,
    },
    {
      label: 'Releases',
      href: `/org/${org.slug}/releases`,
      icon: GitBranch,
    },
    {
      label: 'Alerts',
      href: `/org/${org.slug}/alerts`,
      icon: BellRing,
    },
    {
      label: 'Project Settings',
      href: `/org/${org.slug}/projects`,
      icon: Settings,
    },
    {
      label: 'Organization',
      href: `/org/${org.slug}/settings`,
      icon: Building2,
    },
    {
      label: 'Billing & Usage',
      href: `/org/${org.slug}/billing`,
      icon: CreditCard,
    },
  ];

  return (
    <div className="flex h-screen bg-[#F5F8FC] overflow-hidden">
      {/* 256px Collapsible Sidebar */}
      <aside
        className={`flex flex-col bg-[#10203C] text-white transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        } border-r border-[#1E2E4A] shadow-xl`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E2E4A]">
          <Link href={`/org/${org.slug}/overview`} className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center shrink-0 shadow-lg shadow-[#2563EB]/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            {!collapsed && (
              <div className="flex flex-col leading-tight">
                <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5">
                  ErrorPulse
                  <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#2563EB]/40 text-[#93C5FD] border border-[#2563EB]/50">
                    {org.plan}
                  </span>
                </span>
                <span className="text-[11px] text-slate-400 font-medium">Enterprise SaaS</span>
              </div>
            )}
          </Link>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2E4A] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Project Selector Mini Bar */}
        <div className="px-3 py-3 border-b border-[#1E2E4A]/60">
          <div className="relative">
            <button
              onClick={() => setProjectDropdownOpen(!projectDropdownOpen)}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#152747] hover:bg-[#1B325B] text-slate-200 transition-colors border border-[#1E2E4A]"
            >
              <div className="flex items-center gap-2 overflow-hidden">
                <div className="w-2 h-2 rounded-full bg-[#12A89D] shrink-0" />
                {!collapsed && (
                  <span className="text-xs font-semibold truncate text-left">
                    {activeProject.name}
                  </span>
                )}
              </div>
              {!collapsed && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
            </button>

            {projectDropdownOpen && (
              <div className="absolute top-full left-0 mt-1.5 w-60 bg-[#10203C] border border-[#1E2E4A] rounded-xl shadow-2xl py-1 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="px-3 py-1.5 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                  Select Project
                </div>
                {projects.map((proj) => (
                  <button
                    key={proj.id}
                    onClick={() => {
                      setActiveProject(proj);
                      setProjectDropdownOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2 text-xs text-left transition-colors ${
                      activeProject.id === proj.id
                        ? 'bg-[#2563EB] text-white font-medium'
                        : 'text-slate-300 hover:bg-[#152747]'
                    }`}
                  >
                    <span className="truncate">{proj.name}</span>
                    <span className="text-[10px] opacity-75 capitalize">{proj.platform}</span>
                  </button>
                ))}
                <div className="border-t border-[#1E2E4A] mt-1 pt-1">
                  <Link
                    href="/onboarding"
                    onClick={() => setProjectDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-[#93C5FD] hover:bg-[#152747] transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Create New Project</span>
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#152747]'
                }`}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="w-5 h-5 shrink-0" />
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444] text-white">
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Onboarding Quick Link */}
        <div className="p-3 border-t border-[#1E2E4A]">
          <Link
            href="/onboarding"
            className="flex items-center gap-3 px-3 py-2 rounded-xl bg-gradient-to-r from-[#2563EB]/20 to-[#12A89D]/20 hover:from-[#2563EB]/30 hover:to-[#12A89D]/30 border border-[#2563EB]/30 text-white text-xs font-semibold transition-all group"
          >
            <Code2 className="w-4 h-4 text-[#93C5FD] shrink-0 group-hover:scale-110 transition-transform" />
            {!collapsed && (
              <div className="flex-1 truncate">
                <span>SDK Integration</span>
                <span className="block text-[10px] font-normal text-slate-400">Setup & Test Guide</span>
              </div>
            )}
          </Link>
        </div>

        {/* User profile footer */}
        <div className="p-3 border-t border-[#1E2E4A] flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
            AU
          </div>
          {!collapsed && (
            <div className="flex-1 overflow-hidden leading-tight">
              <p className="text-xs font-semibold text-white truncate">Admin User</p>
              <p className="text-[10px] text-slate-400 truncate">admin@acme.com</p>
            </div>
          )}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-6 flex items-center justify-between z-20 shrink-0 shadow-sm">
          {/* Left search */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search issues, fingerprints, users (Ctrl+K)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] focus:border-transparent transition-all placeholder:text-slate-400 text-slate-800"
              />
            </div>
          </div>

          {/* Right Filters & Quick Actions */}
          <div className="flex items-center gap-3">
            {/* Time range selector */}
            <div className="flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
              {['1h', '24h', '7d', '30d'].map((range) => (
                <button
                  key={range}
                  onClick={() => setActiveTimeRange(range)}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                    activeTimeRange === range
                      ? 'bg-white text-[#2563EB] shadow-sm font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {range}
                </button>
              ))}
            </div>

            {/* Environment selector */}
            <select
              value={activeEnvironment}
              onChange={(e) => setActiveEnvironment(e.target.value)}
              className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
            >
              <option value="all">All Environments</option>
              <option value="production">Production</option>
              <option value="staging">Staging</option>
              <option value="development">Development</option>
            </select>

            {/* Test Event Simulator Button */}
            <button
              onClick={() => {
                sendSimulatedEvent(
                  'RangeError',
                  'Maximum call stack size exceeded in recursive checkout calculateOrderTotal'
                );
              }}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-[#2563EB] to-[#12A89D] text-white hover:opacity-95 shadow-md shadow-[#2563EB]/20 transition-all active:scale-95 cursor-pointer"
              title="Triggers a real test error event in the live pipeline"
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Simulate Error</span>
            </button>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 bg-[#F5F8FC]">
          {children}
        </main>
      </div>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen bg-[#10203C] items-center justify-center text-white text-sm font-medium">
          Loading ErrorPulse...
        </div>
      }
    >
      <AppShellContent>{children}</AppShellContent>
    </Suspense>
  );
}

