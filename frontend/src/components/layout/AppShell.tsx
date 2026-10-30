'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/lib/store';
import { useUiStore } from '@/lib/stores';
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
  Zap,
  Code2,
  BarChart3,
  Activity,
  Users,
  History,
  Workflow,
  HeartPulse,
  BookOpen,
  Server,
  LogOut,
  Menu,
  X,
  Bell,
  ArrowLeft,
  Home,
} from 'lucide-react';
import { Suspense } from 'react';
import { GlobalSearchModal } from './GlobalSearchModal';

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
    currentUser,
    logout,
  } = useApp();

  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const setCollapsed = useUiStore((s) => s.setSidebarCollapsed);
  const mobileDrawerOpen = useUiStore((s) => s.mobileDrawerOpen);
  const setMobileDrawerOpen = useUiStore((s) => s.setMobileDrawerOpen);
  const searchModalOpen = useUiStore((s) => s.searchModalOpen);
  const setSearchModalOpen = useUiStore((s) => s.setSearchModalOpen);
  const toggleSearchModal = useUiStore((s) => s.toggleSearchModal);
  const [projectDropdownOpen, setProjectDropdownOpen] = useState(false);

  // Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        toggleSearchModal();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [toggleSearchModal]);

  const unresolvedCount = issues.filter(
    (i) => i.projectId === activeProject.id && i.status === 'unresolved'
  ).length;

  const navSections = [
    {
      title: 'Core Monitoring',
      items: [
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
          label: 'Analytics',
          href: `/org/${org.slug}/analytics`,
          icon: BarChart3,
        },
        {
          label: 'Performance',
          href: `/org/${org.slug}/performance`,
          icon: Activity,
        },
        {
          label: 'Users & Sessions',
          href: `/org/${org.slug}/sessions`,
          icon: Users,
        },
        {
          label: 'Releases',
          href: `/org/${org.slug}/releases`,
          icon: GitBranch,
        },
      ],
    },
    {
      title: 'Alerts & Automation',
      items: [
        {
          label: 'Alert Rules',
          href: `/org/${org.slug}/alerts`,
          icon: BellRing,
        },
        {
          label: 'Notification Center',
          href: `/org/${org.slug}/notifications`,
          icon: Bell,
        },
        {
          label: 'Integrations',
          href: `/org/${org.slug}/integrations`,
          icon: Workflow,
        },
        {
          label: 'Audit & Activity',
          href: `/org/${org.slug}/activity`,
          icon: History,
        },
      ],
    },
    {
      title: 'Settings & Health',
      items: [
        {
          label: 'SDK Health',
          href: `/org/${org.slug}/sdk-health`,
          icon: HeartPulse,
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
        {
          label: 'Documentation',
          href: `/org/${org.slug}/documentation`,
          icon: BookOpen,
        },
        {
          label: 'System Status',
          href: `/org/${org.slug}/system-status`,
          icon: Server,
        },
      ],
    },
  ];

  const renderNavContent = () => (
    <>
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-[#1E2E4A]">
        <Link
          href="/"
          prefetch={true}
          className="flex items-center gap-3 overflow-hidden group"
          title="Return to Website Homepage"
        >
          <div className="w-9 h-9 rounded-xl bg-linear-to-tr from-[#2563EB] to-[#12A89D] flex items-center justify-center shrink-0 shadow-lg shadow-[#2563EB]/30 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5 text-white" />
          </div>
          {(!collapsed || mobileDrawerOpen) && (
            <div className="flex flex-col leading-tight">
              <span className="font-bold text-base tracking-tight text-white flex items-center gap-1.5 group-hover:text-[#93C5FD] transition-colors">
                ErrorPulse
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#2563EB]/40 text-[#93C5FD] border border-[#2563EB]/50">
                  {org.plan}
                </span>
              </span>
              <span className="text-[11px] text-slate-400 font-medium">Enterprise SaaS</span>
            </div>
          )}
        </Link>

        {!mobileDrawerOpen && (
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2E4A] transition-colors"
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          >
            {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        )}

        {mobileDrawerOpen && (
          <button
            onClick={() => setMobileDrawerOpen(false)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-[#1E2E4A]"
          >
            <X className="w-5 h-5" />
          </button>
        )}
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
              {(!collapsed || mobileDrawerOpen) && (
                <span className="text-xs font-semibold truncate text-left">
                  {activeProject.name}
                </span>
              )}
            </div>
            {(!collapsed || mobileDrawerOpen) && <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
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

      {/* Navigation Sections */}
      <nav className="flex-1 px-3 py-3 space-y-4 overflow-y-auto">
        {navSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {(!collapsed || mobileDrawerOpen) && (
              <div className="px-3 pt-1 pb-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {section.title}
              </div>
            )}
            {section.items.map((item) => {
              const isActive = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#2563EB] text-white shadow-md shadow-[#2563EB]/30'
                      : 'text-slate-300 hover:text-white hover:bg-[#152747]'
                  }`}
                  title={collapsed && !mobileDrawerOpen ? item.label : undefined}
                >
                  <item.icon className="w-4 h-4 shrink-0" />
                  {(!collapsed || mobileDrawerOpen) && (
                    <div className="flex-1 flex items-center justify-between">
                      <span>{item.label}</span>
                      {item.badge !== undefined && item.badge > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#EF4444] text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* Onboarding Quick Link */}
      <div className="p-3 border-t border-[#1E2E4A]">
        <Link
          href="/onboarding"
          onClick={() => setMobileDrawerOpen(false)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl bg-linear-to-r from-[#2563EB]/20 to-[#12A89D]/20 hover:from-[#2563EB]/30 hover:to-[#12A89D]/30 border border-[#2563EB]/30 text-white text-xs font-semibold transition-all group"
        >
          <Code2 className="w-4 h-4 text-[#93C5FD] shrink-0 group-hover:scale-110 transition-transform" />
          {(!collapsed || mobileDrawerOpen) && (
            <div className="flex-1 truncate">
              <span>SDK Integration</span>
              <span className="block text-[10px] font-normal text-slate-400">Setup & Test Guide</span>
            </div>
          )}
        </Link>
      </div>

      {/* User profile footer with Logout action */}
      <div className="p-3 border-t border-[#1E2E4A] flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-full bg-linear-to-tr from-indigo-500 to-purple-500 flex items-center justify-center font-bold text-xs text-white shrink-0">
            {currentUser?.name?.slice(0, 2).toUpperCase() || 'AU'}
          </div>
          {(!collapsed || mobileDrawerOpen) && (
            <div className="flex-1 overflow-hidden leading-tight">
              <p className="text-xs font-semibold text-white truncate">{currentUser?.name || 'Admin User'}</p>
              <p className="text-[10px] text-slate-400 truncate">{currentUser?.email || 'admin@acme.com'}</p>
            </div>
          )}
        </div>
        {(!collapsed || mobileDrawerOpen) && (
          <button
            onClick={logout}
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-[#1E2E4A] transition-colors"
            title="Sign out of account"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </>
  );

  return (
    <div className="flex h-screen bg-[#F5F8FC] overflow-hidden">
      {/* Desktop 256px Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-[#10203C] text-white transition-all duration-300 z-30 shrink-0 ${
          collapsed ? 'w-20' : 'w-64'
        } border-r border-[#1E2E4A] shadow-xl`}
      >
        {renderNavContent()}
      </aside>

      {/* Mobile Drawer (Accessible on small screens) */}
      {mobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="w-72 bg-[#10203C] text-white flex flex-col h-full shadow-2xl animate-in slide-in-from-left duration-200">
            {renderNavContent()}
          </div>
          <div className="flex-1" onClick={() => setMobileDrawerOpen(false)} />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 bg-white border-b border-[#E2E8F0] px-4 sm:px-6 flex items-center justify-between z-20 shrink-0 shadow-sm gap-3">
          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileDrawerOpen(true)}
            className="md:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100"
            title="Open navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          {/* Left search */}
          <div className="flex items-center gap-4 flex-1 max-w-md">
            <div className="relative w-full cursor-pointer" onClick={() => setSearchModalOpen(true)}>
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                readOnly
                placeholder="Search issues, fingerprints, users (Ctrl+K)..."
                className="w-full pl-10 pr-12 py-2 text-xs bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] transition-all placeholder:text-slate-400 text-slate-800 cursor-pointer"
              />
              <kbd className="hidden sm:inline-block absolute right-3 top-1/2 -translate-y-1/2 px-1.5 py-0.5 text-[10px] font-bold text-slate-400 bg-white border border-slate-200 rounded shadow-xs">
                Ctrl+K
              </kbd>
            </div>
          </div>

          {/* Right Filters & Quick Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Time range selector */}
            <div className="hidden lg:flex items-center bg-[#F1F5F9] p-1 rounded-xl border border-[#E2E8F0]">
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
              className="text-xs bg-[#F8FAFC] border border-[#E2E8F0] text-slate-700 px-2.5 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB] font-medium"
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
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold bg-linear-to-r from-[#2563EB] to-[#12A89D] text-white hover:opacity-95 shadow-md shadow-[#2563EB]/20 transition-all active:scale-95 cursor-pointer shrink-0"
              title="Triggers a real test error event in the live pipeline"
            >
              <Zap className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Simulate Error</span>
            </button>

            {/* Back to Homepage Button (Backward Arrow requested by user) */}
            <Link
              href="/"
              prefetch={true}
              className="flex items-center gap-1.5 px-3 py-2 sm:px-3.5 sm:py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 hover:text-[#2563EB] border border-[#E2E8F0] shadow-xs transition-all active:scale-95 cursor-pointer shrink-0"
              title="Return to Website Homepage"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Back to Home</span>
            </Link>
          </div>
        </header>

        {/* Scrollable Page Body */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 md:p-8 bg-[#F5F8FC]">
          {children}
        </main>
      </div>

      {/* Global Search Dialog Modal */}
      <GlobalSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        orgSlug={org.slug}
      />
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
