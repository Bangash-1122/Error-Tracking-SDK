'use client';

import React, { useState } from 'react';
import { useApp } from '@/lib/store';
import { AppShell } from '@/components/layout/AppShell';
import {
  BookOpen,
  Code,
  Copy,
  Check,
  Terminal,
  Shield,
  Zap,
  HelpCircle,
  FileCode,
  KeyRound,
  ExternalLink,
} from 'lucide-react';

export default function DocumentationPage() {
  const { org, activeProject, showToast } = useApp();
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeNav, setActiveNav] = useState('getting-started');

  const copyCode = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    showToast('Code snippet copied to clipboard');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const sections = [
    { id: 'getting-started', label: '1. Getting Started' },
    { id: 'installation', label: '2. Installation' },
    { id: 'sdk-configuration', label: '3. SDK Configuration' },
    { id: 'error-capture', label: '4. Error & Stack Traces' },
    { id: 'custom-reporting', label: '5. Custom Context & Breadcrumbs' },
    { id: 'environment-config', label: '6. Environment & Releases' },
    { id: 'auth-keys', label: '7. Ingestion Keys & Security' },
    { id: 'api-reference', label: '8. Ingestion API Reference' },
    { id: 'troubleshooting', label: '9. Troubleshooting' },
    { id: 'security-best-practices', label: '10. Security Best Practices' },
  ];

  return (
    <AppShell>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0F172A] tracking-tight flex items-center gap-2">
            <BookOpen className="w-6 h-6 text-[#2563EB]" />
            SDK Documentation & Developer Reference
          </h1>
          <p className="text-xs text-[#52647A] mt-0.5">
            Production integration guides, verified code snippets, and API specifications for{' '}
            <strong className="text-slate-800">{activeProject.name}</strong>
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Table of Contents */}
          <div className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-4 space-y-1 sticky top-6 text-xs">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 px-3 pb-2 block border-b border-slate-100">
              Contents
            </span>
            {sections.map((s) => (
              <a
                key={s.id}
                href={`#${s.id}`}
                onClick={() => setActiveNav(s.id)}
                className={`block px-3 py-2 rounded-xl font-semibold transition-colors ${
                  activeNav === s.id
                    ? 'bg-[#2563EB] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                {s.label}
              </a>
            ))}
          </div>

          {/* Right Main Documentation Body */}
          <div className="lg:col-span-3 space-y-8 text-xs leading-relaxed text-slate-700">
            {/* 1. Getting Started */}
            <section id="getting-started" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Zap className="w-5 h-5 text-[#2563EB]" />
                1. Getting Started
              </h2>
              <p>
                ErrorPulse captures client-side JavaScript runtime exceptions, unhandled Promise rejections, and
                backend Node.js errors with zero configuration. Events are grouped into deterministic issues via
                stack trace fingerprinting and reported to your dashboard in real-time.
              </p>
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-200 text-[#1E3A8A]">
                <strong>Active Project Key: </strong>
                <code className="bg-white px-2 py-0.5 rounded border border-blue-300 font-mono text-[11px]">
                  {activeProject.rawKey}
                </code>
              </div>
            </section>

            {/* 2. Installation */}
            <section id="installation" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Terminal className="w-5 h-5 text-[#2563EB]" />
                2. Installation
              </h2>
              <p>Install the official client SDK via your preferred package manager:</p>

              <div className="relative bg-[#0F172A] rounded-xl p-4 text-slate-200 font-mono text-xs">
                <button
                  onClick={() => copyCode('npm install @error-tracker/browser', 'install-npm')}
                  className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy command"
                >
                  {copiedKey === 'install-npm' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <span>npm install @error-tracker/browser</span>
              </div>
            </section>

            {/* 3. SDK Configuration */}
            <section id="sdk-configuration" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FileCode className="w-5 h-5 text-[#2563EB]" />
                3. SDK Configuration
              </h2>
              <p>Initialize the SDK at your application entry point before rendering any components:</p>

              <div className="relative bg-[#0F172A] rounded-xl p-4 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
                <button
                  onClick={() =>
                    copyCode(
                      `import { init } from '@error-tracker/browser';\n\ninit({\n  projectKey: '${activeProject.rawKey}',\n  environment: 'production',\n  release: 'v1.3.2',\n  sampleRate: 1.0,\n});`,
                      'cfg-code'
                    )
                  }
                  className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy code"
                >
                  {copiedKey === 'cfg-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre>{`import { init } from '@error-tracker/browser';

init({
  projectKey: '${activeProject.rawKey}',
  environment: 'production',
  release: 'v1.3.2',
  sampleRate: 1.0, // 100% of errors captured
  maxBreadcrumbs: 50,
});`}</pre>
              </div>
            </section>

            {/* 4. Error Capture */}
            <section id="error-capture" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Code className="w-5 h-5 text-[#2563EB]" />
                4. Error & Stack Trace Capture
              </h2>
              <p>Manual exception capture with contextual tags:</p>

              <div className="relative bg-[#0F172A] rounded-xl p-4 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
                <button
                  onClick={() =>
                    copyCode(
                      `import { captureException } from '@error-tracker/browser';\n\ntry {\n  executeCriticalPayment();\n} catch (error) {\n  captureException(error, {\n    tags: { section: 'checkout', tier: 'enterprise' },\n  });\n}`,
                      'catch-code'
                    )
                  }
                  className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy code"
                >
                  {copiedKey === 'catch-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre>{`import { captureException } from '@error-tracker/browser';

try {
  executeCriticalPayment();
} catch (error) {
  captureException(error, {
    tags: { section: 'checkout', tier: 'enterprise' },
    extra: { cartSize: 3, orderId: 'ord_9981' }
  });
}`}</pre>
              </div>
            </section>

            {/* 5. Custom Context & Breadcrumbs */}
            <section id="custom-reporting" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#2563EB]" />
                5. Custom User Context & Breadcrumbs
              </h2>
              <p>Identify affected users and record user action trails leading up to crashes:</p>

              <div className="relative bg-[#0F172A] rounded-xl p-4 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
                <button
                  onClick={() =>
                    copyCode(
                      `import { setUser, addBreadcrumb } from '@error-tracker/browser';\n\n// Associate authenticated customer\nsetUser({\n  id: 'usr_8819',\n  email: 'alex@customer.com',\n  username: 'alexchen'\n});\n\n// Record manual breadcrumb\naddBreadcrumb({\n  category: 'ui.click',\n  message: 'User clicked Confirm Order button',\n  level: 'info'\n});`,
                      'user-code'
                    )
                  }
                  className="absolute right-3 top-3 p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                  title="Copy code"
                >
                  {copiedKey === 'user-code' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <pre>{`import { setUser, addBreadcrumb } from '@error-tracker/browser';

// Associate authenticated customer
setUser({
  id: 'usr_8819',
  email: 'alex@customer.com',
  username: 'alexchen'
});

// Record breadcrumb trail
addBreadcrumb({
  category: 'ui.click',
  message: 'User clicked Confirm Order button',
  level: 'info'
});`}</pre>
              </div>
            </section>

            {/* 8. API Reference */}
            <section id="api-reference" className="bg-white rounded-2xl border border-[#E2E8F0] shadow-sm p-6 space-y-3">
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#2563EB]" />
                8. Ingestion API Reference (POST /api/v1/events)
              </h2>
              <p>For custom non-JS platforms (Python, Go, Ruby), submit HTTP POST requests directly:</p>

              <div className="relative bg-[#0F172A] rounded-xl p-4 text-slate-200 font-mono text-xs leading-relaxed overflow-x-auto">
                <pre>{`curl -X POST https://yourdomain.com/api/v1/events \\
  -H "Content-Type: application/json" \\
  -H "X-Project-Key: ${activeProject.rawKey}" \\
  -d '{
    "schemaVersion": "1.0.0",
    "eventId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "occurredAt": "2026-10-28T14:00:00Z",
    "environment": "production",
    "release": "v1.3.2",
    "exception": {
      "type": "RuntimeError",
      "value": "Connection refused to database pool"
    },
    "frames": [
      {
        "filename": "app/services/db.py",
        "function": "connect_pool",
        "lineno": 142,
        "in_app": true
      }
    ]
  }'`}</pre>
              </div>
            </section>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
