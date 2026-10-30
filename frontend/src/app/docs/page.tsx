'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import {
  ShieldAlert,
  ArrowRight,
  Search,
  BookOpen,
  Code2,
  Terminal,
  Cpu,
  Layers,
  Sparkles,
  Zap,
  Check,
  Copy,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  Fingerprint,
  Activity,
  Bell,
  Lock,
  Settings,
  Sliders,
  Database,
  Globe,
  Flame,
  Filter,
  CheckCircle2,
  Server,
  HelpCircle,
  KeyRound,
  Users,
} from 'lucide-react';

interface DocSection {
  id: string;
  category: string;
  title: string;
  badge?: string;
  summary: string;
  content: React.ReactNode;
}

export default function DocsPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeSectionId, setActiveSectionId] = useState('overview');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Copy helper with feedback
  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey((curr) => (curr === key ? null : curr));
    }, 2000);
  };

  // Ultra-fast 3D wireframe constellation canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const onResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', onResize);

    const nodeColors = ['#06B6D4', '#8B5CF6', '#10B981', '#F59E0B', '#38BDF8'];
    const pointCount = Math.min(50, Math.floor(width / 35));
    const points: Array<{ x: number; y: number; z: number; color: string; size: number }> = [];
    const radius = Math.min(width, height) * 0.45;

    for (let i = 0; i < pointCount; i++) {
      const theta = Math.acos(2 * Math.random() - 1);
      const phi = 2 * Math.PI * Math.random();
      points.push({
        x: radius * Math.sin(theta) * Math.cos(phi),
        y: radius * Math.sin(theta) * Math.sin(phi),
        z: radius * Math.cos(theta),
        color: nodeColors[i % nodeColors.length],
        size: Math.random() * 2 + 1,
      });
    }

    let rotX = 0;
    let rotY = 0;
    const fov = 420;

    const render = () => {
      ctx.clearRect(0, 0, width, height);
      rotX += 0.0012;
      rotY += 0.0018;

      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);

      const projected = points.map((p) => {
        const x1 = p.x * cosY + p.z * sinY;
        const z1 = -p.x * sinY + p.z * cosY;
        const y2 = p.y * cosX - z1 * sinX;
        const z2 = p.y * sinX + z1 * cosX;
        const scale = fov / (fov + z2 + radius * 1.2);
        return {
          x2d: x1 * scale + width / 2,
          y2d: y2 * scale + height * 0.35,
          scale,
          color: p.color,
          size: p.size * scale,
        };
      });

      ctx.lineWidth = 0.6;
      for (let i = 0; i < projected.length; i++) {
        for (let j = i + 1; j < projected.length; j++) {
          const dx = projected[i].x2d - projected[j].x2d;
          const dy = projected[i].y2d - projected[j].y2d;
          const dist = dx * dx + dy * dy;
          if (dist < 7200) {
            ctx.strokeStyle = `rgba(139, 92, 246, ${0.14 * (1 - Math.sqrt(dist) / 85)})`;
            ctx.beginPath();
            ctx.moveTo(projected[i].x2d, projected[i].y2d);
            ctx.lineTo(projected[j].x2d, projected[j].y2d);
            ctx.stroke();
          }
        }
      }

      projected.forEach((p) => {
        if (p.scale <= 0) return;
        ctx.beginPath();
        ctx.arc(p.x2d, p.y2d, Math.max(0.8, p.size), 0, Math.PI * 2);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0.2, Math.min(1, p.scale));
        ctx.fill();
      });
      ctx.globalAlpha = 1.0;

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(animId);
    };
  }, []);

  // Comprehensive Documentation Data Sections
  const docSections: DocSection[] = useMemo(
    () => [
      {
        id: 'overview',
        category: 'Getting Started',
        title: 'Platform Overview & Architecture',
        badge: 'Core Concept',
        summary:
          'ErrorPulse is a high-performance, real-time error tracking and APM system designed for modern JavaScript and TypeScript applications.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              Modern distributed web applications generate millions of unhandled exceptions, promise rejections, and
              microservice latency spikes. <strong className="text-white">ErrorPulse</strong> delivers sub-millisecond client telemetry capture,
              deterministic stack trace deduplication via SHA-256 fingerprinting, real-time alert dispatching, and zero-overhead performance transaction tracing.
            </p>

            {/* Architecture Flow Diagram */}
            <div className="p-5 rounded-2xl bg-[#080D1D]/90 border border-white/10 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  Telemetric Pipeline Flow
                </span>
                <span className="text-[11px] font-mono text-slate-400">P99 Ingestion &lt; 8ms</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
                <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-800/40">
                  <div className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                    <Globe className="w-3.5 h-3.5" /> 1. Client SDK
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Zero-overhead hooks intercept `onerror`, unhandled rejections, and HTTP requests with breadcrumbs.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-purple-950/30 border border-purple-800/40">
                  <div className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                    <Server className="w-3.5 h-3.5" /> 2. Ingestion Gateway
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Token-bucket rate limiter validates DSN, authenticates project keys, and filters blacklisted origins.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-950/30 border border-emerald-800/40">
                  <div className="font-bold text-emerald-300 flex items-center gap-1.5 mb-1">
                    <Fingerprint className="w-3.5 h-3.5" /> 3. Normalizer & Fingerprint
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    V8/SpiderMonkey parsers clean stack traces and compute deterministic SHA-256 issue hashes.
                  </p>
                </div>

                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/40">
                  <div className="font-bold text-rose-300 flex items-center gap-1.5 mb-1">
                    <Bell className="w-3.5 h-3.5" /> 4. Alerts & Dashboard
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    Instant spike notifications dispatch to Slack/Discord/Webhooks while the console updates in real time.
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <Zap className="w-4 h-4 text-cyan-400" />
                  <span>Why ErrorPulse?</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Zero external dependencies (&lt; 12KB gzipped footprint)</li>
                  <li>Automatic deduplication of duplicate errors into single issues</li>
                  <li>Full user session breadcrumb timelines</li>
                  <li>Built-in PII and credential sanitization</li>
                </ul>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-2">
                <div className="font-bold text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Compliance & Security</span>
                </div>
                <ul className="text-xs text-slate-400 space-y-1.5 list-disc pl-4">
                  <li>Client-side and gateway regex scrubbing for sensitive keys</li>
                  <li>Multi-tenant RBAC with Owner, Admin, and Member permissions</li>
                  <li>Audit logging for sensitive project setting updates</li>
                  <li>Configurable data retention and sampling controls</li>
                </ul>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'installation',
        category: 'Getting Started',
        title: 'Client SDK Installation & Initialization',
        badge: 'Setup',
        summary: 'Step-by-step guide to installing and configuring ErrorPulse across package managers and frameworks.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              Install the client package using your preferred package manager. ErrorPulse is distributed as an optimized,
              zero-dependency tree-shakeable ES/CommonJS bundle.
            </p>

            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400">
                <span>Terminal Installation</span>
                <button
                  type="button"
                  onClick={() => handleCopy('pnpm add @error-tracker/browser', 'install-cmd')}
                  className="flex items-center gap-1.5 text-cyan-400 hover:text-cyan-300 cursor-pointer"
                >
                  {copiedKey === 'install-cmd' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedKey === 'install-cmd' ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <div className="p-4 rounded-xl bg-[#060A16] border border-white/10 font-mono text-xs text-cyan-300 flex items-center justify-between">
                <code>$ pnpm add @error-tracker/browser</code>
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Next.js 16 (App Router) Setup</h4>
              <p className="text-xs text-slate-400">
                Initialize ErrorPulse once at your application root (e.g. in <code className="text-cyan-300">app/layout.tsx</code>):
              </p>
              <div className="relative group">
                <pre className="p-4 rounded-xl bg-[#060A16] border border-white/10 font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`// app/layout.tsx (Next.js 16 App Router)
import { useEffect } from 'react';
import { init } from '@error-tracker/browser';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    init({
      dsn: process.env.NEXT_PUBLIC_ERRORPULSE_DSN || 'https://pk_live_8f3e902c@ingest.errortracker.io/prj_prod_01',
      environment: process.env.NODE_ENV || 'production',
      release: 'v1.4.0',
      sampleRate: 1.0, // Report 100% of uncaught errors
      maxBreadcrumbs: 50,
      beforeSend(event) {
        // Automatically scrub sensitive data before sending
        if (event.tags?.secret) delete event.tags.secret;
        return event;
      },
    });
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}`}
                </pre>
                <button
                  type="button"
                  onClick={() =>
                    handleCopy(
                      `import { init } from '@error-tracker/browser';\n\ninit({\n  dsn: 'https://pk_live_8f3e902c@ingest.errortracker.io/prj_prod_01',\n  environment: 'production',\n  release: 'v1.4.0',\n  sampleRate: 1.0\n});`,
                      'nextjs-snippet'
                    )
                  }
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 text-xs flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {copiedKey === 'nextjs-snippet' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 p-4 rounded-xl bg-cyan-950/20 border border-cyan-800/40 text-xs text-cyan-200">
              <ExternalLink className="w-4 h-4 text-cyan-400 shrink-0" />
              <div>
                Looking for the interactive wizard? Run through our guided{' '}
                <Link href="/onboarding" className="text-white font-bold underline hover:text-cyan-300">
                  Setup Wizard
                </Link>{' '}
                or view the full{' '}
                <Link href="/installation" className="text-white font-bold underline hover:text-cyan-300">
                  Quickstart Page
                </Link>
                .
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'telemetry',
        category: 'SDK Reference',
        title: 'Core Telemetry & Error Capture',
        badge: 'API',
        summary: 'Learn how to capture exceptions, log custom messages, track breadcrumbs, and tag user identities.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              ErrorPulse captures uncaught exceptions automatically. However, you can also manually capture handled exceptions,
              record informational notices, and attach rich business context.
            </p>

            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-[#060A16] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">1. Manual Exception Capture</span>
                <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import { captureException } from '@error-tracker/browser';

try {
  await checkoutCart(userCart);
} catch (error) {
  // Captures stack trace, local state, and breadcrumb history
  captureException(error, {
    tags: { cartId: userCart.id, paymentTier: 'enterprise' },
    extra: { itemCount: userCart.items.length }
  });
}`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-[#060A16] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">2. Attaching User Identity</span>
                <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import { setUser } from '@error-tracker/browser';

// Call after user signs in to correlate future exceptions with this session
setUser({
  id: 'usr_8921a4',
  email: 'cto@acme.com',
  username: 'alex_acme',
  role: 'admin'
});`}
                </pre>
              </div>

              <div className="p-4 rounded-xl bg-[#060A16] border border-white/10 space-y-2">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">3. Custom Breadcrumbs</span>
                <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import { addBreadcrumb } from '@error-tracker/browser';

addBreadcrumb({
  category: 'auth',
  message: 'User initiated MFA challenge',
  level: 'info',
  data: { method: 'totp', attemptsRemaining: 2 }
});`}
                </pre>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'fingerprinting',
        category: 'Engine Mechanics',
        title: 'Normalization & SHA-256 Fingerprinting',
        badge: 'Algorithms',
        summary: 'How ErrorPulse deduplicates tens of thousands of errors into single actionable issues.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              When a catastrophic bug affects thousands of concurrent users, a raw error log would flood engineers with
              100,000 separate events. ErrorPulse employs an intelligent <strong className="text-white">Deterministic Fingerprinting Engine</strong>.
            </p>

            <div className="p-5 rounded-2xl bg-[#080D1D]/90 border border-white/10 space-y-4">
              <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-cyan-400" />
                The Deduplication Pipeline
              </h4>

              <div className="space-y-3 text-xs">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-xs shrink-0">
                    1
                  </div>
                  <div>
                    <strong className="text-white block mb-0.5">Stack Trace Normalization</strong>
                    <p className="text-slate-400">
                      Standardizes vendor-specific stack traces (Chrome V8, Safari JSC, Firefox SpiderMonkey). Minified hash paths and cache-busting query strings (<code className="text-cyan-300">bundle.js?v=9281</code>) are stripped away.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-xs shrink-0">
                    2
                  </div>
                  <div>
                    <strong className="text-white block mb-0.5">Top-Frame Root Cause Extraction</strong>
                    <p className="text-slate-400">
                      Filters out library noise (e.g. React internal runtime wrappers, webpack bootstrap code) and identifies the highest in-project application frame.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                    3
                  </div>
                  <div>
                    <strong className="text-white block mb-0.5">SHA-256 Hash Computation</strong>
                    <p className="text-slate-400">
                      Computes <code className="text-emerald-300 font-mono">sha256(errorType + normalizedFrameFunction + normalizedFilePath)</code>. Every subsequent occurrence matches this deterministic key and increments the issue count.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xs shrink-0">
                    4
                  </div>
                  <div>
                    <strong className="text-white block mb-0.5">Regression Detection</strong>
                    <p className="text-slate-400">
                      If an issue previously marked as &quot;Resolved&quot; in v1.3.0 is detected again in v1.4.0, ErrorPulse marks it as <span className="text-rose-400 font-bold">Regression</span> and triggers high-priority alerts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'apm',
        category: 'Engine Mechanics',
        title: 'APM & Performance Tracing',
        badge: 'Performance',
        summary: 'Track page load times, API round-trips, and microservice latencies with p50, p95, and p99 percentiles.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              ErrorPulse includes full APM transaction monitoring to identify latency bottlenecks before users notice them.
            </p>

            <div className="p-4 rounded-xl bg-[#060A16] border border-white/10 space-y-2">
              <span className="text-xs font-bold text-white uppercase tracking-wider block">Custom Transaction Spans</span>
              <pre className="font-mono text-xs text-slate-200 overflow-x-auto leading-relaxed">
{`import { startTransaction } from '@error-tracker/browser';

const transaction = startTransaction({
  name: 'GET /api/checkout/summary',
  op: 'http.client'
});

const span = transaction.startChild({
  op: 'db.query',
  description: 'SELECT * FROM order_items WHERE order_id = ?'
});

// Perform database query...
span.finish();
transaction.finish();`}
              </pre>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-center">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Median Latency</span>
                <span className="text-lg font-extrabold text-cyan-400">P50: 42ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">95th Percentile</span>
                <span className="text-lg font-extrabold text-purple-400">P95: 148ms</span>
              </div>
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5">
                <span className="text-[10px] font-mono uppercase text-slate-400 block mb-1">Worst Case</span>
                <span className="text-lg font-extrabold text-rose-400">P99: 412ms</span>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'alerts',
        category: 'Integrations',
        title: 'Alert Rules & Multi-Channel Dispatch',
        badge: 'Alerts',
        summary: 'Configure threshold rules, spike alerts, and instant deliveries across Webhooks, Slack, and Discord.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              Stay ahead of production incidents with customizable alert policies that trigger when specific criteria are satisfied:
            </p>

            <div className="space-y-3">
              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Flame className="w-4 h-4 text-rose-400" />
                  <span>Velocity Spike Alerts</span>
                </div>
                <p className="text-xs text-slate-400">
                  Trigger alerts when error volume exceeds 50 events in a 60-second window, or when an error rate jumps by &gt; 300% over the moving average.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Bell className="w-4 h-4 text-cyan-400" />
                  <span>Regression & New Issue Triggers</span>
                </div>
                <p className="text-xs text-slate-400">
                  Notify on-call engineers the moment an unseen error fingerprint occurs in a newly deployed production release.
                </p>
              </div>

              <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <div className="font-bold text-white flex items-center gap-2">
                  <Globe className="w-4 h-4 text-purple-400" />
                  <span>Webhook Payloads</span>
                </div>
                <p className="text-xs text-slate-400">
                  ErrorPulse signs outgoing HTTP POST webhooks with HMAC SHA-256 signatures for seamless ingestion by PagerDuty, OpsGenie, or custom internal endpoints.
                </p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'privacy',
        category: 'Security & Compliance',
        title: 'Privacy, PII Scrubbing & Data Sanitization',
        badge: 'Security',
        summary: 'Automatic redacting of passwords, bearer tokens, credit cards, and sensitive headers.',
        content: (
          <div className="space-y-6 text-sm text-slate-300 leading-relaxed">
            <p>
              ErrorPulse ensures no sensitive credentials, HIPAA protected health information, or GDPR customer data
              is stored in your telemetry database.
            </p>

            <div className="p-5 rounded-2xl bg-[#080D1D]/90 border border-white/10 space-y-3">
              <div className="font-bold text-white flex items-center gap-2">
                <Lock className="w-4 h-4 text-cyan-400" />
                <span>Multi-Tier Sanitization Engine</span>
              </div>
              <ul className="text-xs text-slate-300 space-y-2 list-disc pl-4">
                <li>
                  <strong className="text-white">Authorization Headers:</strong> Automatically replaces values with <code className="text-cyan-300">[REDACTED]</code>.
                </li>
                <li>
                  <strong className="text-white">Credit Card Numbers:</strong> Any 13 to 19-digit number matching Luhn verification is stripped in memory.
                </li>
                <li>
                  <strong className="text-white">Sensitive Query Parameters:</strong> Keys such as <code className="text-cyan-300">apiKey</code>, <code className="text-cyan-300">token</code>, <code className="text-cyan-300">password</code>, and <code className="text-cyan-300">cvv</code> are masked before transmission.
                </li>
              </ul>
            </div>
          </div>
        ),
      },
      {
        id: 'settings',
        category: 'Configuration',
        title: 'Dashboard & Organization Settings Sections',
        badge: 'Admin',
        summary: 'Exhaustive guide to all 10 enterprise settings sections available in the ErrorPulse console.',
        content: (
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <p>
              Each project in ErrorPulse features 10 specialized enterprise settings panels accessible via the dashboard sidebar:
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-cyan-400" /> 1. General Settings
                </span>
                <p className="text-slate-400 text-[11px]">Project name, slug identifier, platform runtime selection, and environment defaults.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-purple-400" /> 2. SDK & Ingestion Keys
                </span>
                <p className="text-slate-400 text-[11px]">Publishable DSN endpoints, secret keys, key rotation controls, and origin whitelists.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Fingerprint className="w-3.5 h-3.5 text-emerald-400" /> 3. Issue Grouping Rules
                </span>
                <p className="text-slate-400 text-[11px]">Deterministic SHA-256 grouping configuration, custom fingerprint overrides, and ignore patterns.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-rose-400" /> 4. Alert Routing & Notifications
                </span>
                <p className="text-slate-400 text-[11px]">Webhook URLs, Slack integration, Discord webhooks, and spike threshold definitions.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" /> 5. Data Privacy & Scrubbing
                </span>
                <p className="text-slate-400 text-[11px]">Regex scrubbing rules, sensitive headers blocklist, and IP address anonymization.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-amber-400" /> 6. Team & RBAC
                </span>
                <p className="text-slate-400 text-[11px]">Member invites, role permissions (Owner, Admin, Member), and SSO authentication.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Filter className="w-3.5 h-3.5 text-blue-400" /> 7. Inbound Event Filters
                </span>
                <p className="text-slate-400 text-[11px]">Filter out browser extensions, legacy browsers (IE11), and automated search crawler bots.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> 8. Performance & APM
                </span>
                <p className="text-slate-400 text-[11px]">Sampling rates, slow transaction thresholds (&gt; 1000ms), and query tracing toggles.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/5 space-y-1">
                <span className="font-bold text-white flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-purple-400" /> 9. Audit Logs
                </span>
                <p className="text-slate-400 text-[11px]">Immutable security ledger of all member invitations, key rotations, and project deletions.</p>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-950/20 border border-rose-800/30 space-y-1">
                <span className="font-bold text-rose-300 flex items-center gap-1.5">
                  <ShieldAlert className="w-3.5 h-3.5 text-rose-400" /> 10. Dangerous Operations
                </span>
                <p className="text-slate-400 text-[11px]">Bulk issue purging, project transfers, and permanent organization deletion.</p>
              </div>
            </div>
          </div>
        ),
      },
      {
        id: 'reference',
        category: 'SDK Reference',
        title: 'Full SDK Options Reference',
        badge: 'Config',
        summary: 'All parameters accepted by init(options) with types, defaults, and usage descriptions.',
        content: (
          <div className="space-y-4 text-sm text-slate-300 leading-relaxed">
            <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#060A16]">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-white/5 text-[11px] font-mono uppercase text-slate-400 border-b border-white/10">
                  <tr>
                    <th className="py-3 px-4">Property</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Default</th>
                    <th className="py-3 px-4">Description</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5 font-mono">
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">dsn</td>
                    <td className="py-3 px-4 text-purple-300">string</td>
                    <td className="py-3 px-4 text-slate-500">Required</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">Publishable ingestion key and host endpoint.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">environment</td>
                    <td className="py-3 px-4 text-purple-300">string</td>
                    <td className="py-3 px-4 text-slate-400">&apos;production&apos;</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">Logical deployment environment name (staging, production).</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">release</td>
                    <td className="py-3 px-4 text-purple-300">string</td>
                    <td className="py-3 px-4 text-slate-400">&apos;v1.0.0&apos;</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">Semantic version or commit hash for regression tracking.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">sampleRate</td>
                    <td className="py-3 px-4 text-purple-300">number</td>
                    <td className="py-3 px-4 text-slate-400">1.0</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">Sampling rate between 0.0 (0%) and 1.0 (100%).</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">maxBreadcrumbs</td>
                    <td className="py-3 px-4 text-purple-300">number</td>
                    <td className="py-3 px-4 text-slate-400">50</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">Maximum number of user interactions and network calls preserved.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">beforeSend</td>
                    <td className="py-3 px-4 text-purple-300">function</td>
                    <td className="py-3 px-4 text-slate-500">null</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">Callback to inspect or mutate the event, or return null to discard.</td>
                  </tr>
                  <tr>
                    <td className="py-3 px-4 font-bold text-cyan-300">ignoreErrors</td>
                    <td className="py-3 px-4 text-purple-300">string[]</td>
                    <td className="py-3 px-4 text-slate-400">[]</td>
                    <td className="py-3 px-4 text-slate-300 font-sans">List of regex patterns or error messages to ignore (e.g. ResizeObserver).</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      },
    ],
    [copiedKey]
  );

  // Filtered sections based on live search
  const filteredSections = useMemo(() => {
    if (!searchQuery.trim()) return docSections;
    const q = searchQuery.toLowerCase();
    return docSections.filter(
      (sec) =>
        sec.title.toLowerCase().includes(q) ||
        sec.summary.toLowerCase().includes(q) ||
        sec.category.toLowerCase().includes(q)
    );
  }, [docSections, searchQuery]);

  const activeDoc = useMemo(() => {
    return docSections.find((s) => s.id === activeSectionId) || docSections[0];
  }, [docSections, activeSectionId]);

  return (
    <div className="min-h-screen bg-[#050814] text-slate-100 flex flex-col justify-between selection:bg-[#8B5CF6] selection:text-white font-sans antialiased overflow-x-hidden">
      {/* 3D Constellation Canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-55" />

      {/* Multi-Color Aurora Glow Mesh */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/4 w-187.5 h-125 bg-linear-to-br from-[#06B6D4]/20 via-[#2563EB]/15 to-transparent blur-[120px] rounded-full animate-aurora opacity-75" />
        <div className="absolute top-20 right-10 w-162.5 h-137.5 bg-linear-to-bl from-[#8B5CF6]/25 via-[#A855F7]/12 to-transparent blur-[140px] rounded-full opacity-80" />
        <div className="absolute top-162.5 -left-40 w-150 h-150 bg-linear-to-tr from-[#10B981]/18 via-[#06B6D4]/12 to-transparent blur-[130px] rounded-full opacity-70" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/10 bg-[#070B18]/80 backdrop-blur-xl sticky top-0">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-4">
          <Link href="/" prefetch={true} className="flex items-center gap-3 group shrink-0" title="Return to Homepage">
            <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-[#06B6D4] via-[#8B5CF6] to-[#F43F5E] p-[1.5px] shadow-lg shadow-[#8B5CF6]/30 group-hover:scale-105 transition-transform">
              <div className="w-full h-full bg-[#080D1D] rounded-[10px] flex items-center justify-center">
                <ShieldAlert className="w-5 h-5 text-[#38BDF8] group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-xl tracking-tight bg-linear-to-r from-white via-cyan-100 to-purple-200 bg-clip-text text-transparent">
                ErrorPulse
              </span>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-linear-to-r from-[#8B5CF6]/20 to-[#06B6D4]/20 text-[#A78BFA] border border-[#8B5CF6]/40">
                Docs
              </span>
            </div>
          </Link>

          {/* Quick Search Bar */}
          <div className="hidden sm:flex items-center flex-1 max-w-md mx-4 relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search documentation (e.g. fingerprinting, APM, SDK)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs bg-[#0C1427] border border-white/10 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 transition-all text-white placeholder:text-slate-500"
            />
          </div>

          {/* Navigation Links */}
          <div className="flex items-center gap-3">
            <Link
              href="/installation"
              prefetch={true}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors hidden md:block"
            >
              Quickstart
            </Link>
            <Link
              href="/onboarding"
              prefetch={true}
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors hidden md:block"
            >
              Setup Wizard
            </Link>
            <Link
              href="/login"
              prefetch={true}
              className="text-xs font-bold text-white px-4 py-2 rounded-xl bg-linear-to-r from-[#2563EB] to-[#8B5CF6] hover:opacity-95 shadow-md shadow-[#8B5CF6]/20 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Documentation Portal Container */}
      <main className="relative z-10 max-w-7xl mx-auto w-full px-6 py-8 flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sticky Sidebar Navigation */}
        <aside className="lg:col-span-3 lg:sticky lg:top-24 space-y-6">
          <div className="p-4 rounded-2xl bg-[#0C1427]/90 border border-white/10 backdrop-blur-xl shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Documentation
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-300 border border-cyan-500/30">
                v1.4.0
              </span>
            </div>

            <nav className="space-y-1">
              {filteredSections.map((sec) => {
                const isActive = activeSectionId === sec.id;
                return (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setActiveSectionId(sec.id)}
                    className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-medium transition-all flex items-center justify-between group cursor-pointer ${
                      isActive
                        ? 'bg-linear-to-r from-cyan-500/20 via-[#8B5CF6]/20 to-purple-500/10 text-white font-bold border border-cyan-500/40 shadow-sm'
                        : 'text-slate-400 hover:text-white hover:bg-white/5 border border-transparent'
                    }`}
                  >
                    <span className="truncate">{sec.title}</span>
                    <ChevronRight
                      className={`w-3.5 h-3.5 shrink-0 transition-transform ${
                        isActive ? 'text-cyan-400 translate-x-0.5' : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Quick Help Card */}
          <div className="p-4 rounded-2xl bg-linear-to-br from-cyan-950/30 to-purple-950/30 border border-cyan-800/30 text-xs space-y-2">
            <div className="font-bold text-cyan-300 flex items-center gap-1.5">
              <HelpCircle className="w-4 h-4 text-cyan-400" />
              Need custom integration?
            </div>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Our engineering team supports custom ingest proxies, on-prem telemetry sinks, and custom SDK runtimes.
            </p>
            <Link
              href="/system-status"
              className="inline-flex items-center gap-1 text-[11px] font-bold text-cyan-400 hover:underline pt-1"
            >
              <span>View System Status & Gateways →</span>
            </Link>
          </div>
        </aside>

        {/* Documentation Content Area */}
        <section className="lg:col-span-9 space-y-6">
          <div className="p-8 sm:p-10 rounded-3xl bg-[#0C1427]/90 border border-white/10 backdrop-blur-xl shadow-2xl space-y-6">
            {/* Header Badge & Category */}
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 pb-5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase tracking-wider text-cyan-400">
                  {activeDoc.category}
                </span>
                <span className="text-slate-600">/</span>
                <span className="text-xs text-slate-400">{activeDoc.title}</span>
              </div>
              {activeDoc.badge && (
                <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-linear-to-r from-purple-500/20 to-cyan-500/20 text-purple-300 border border-purple-500/30">
                  {activeDoc.badge}
                </span>
              )}
            </div>

            {/* Document Title */}
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeDoc.title}
              </h1>
              <p className="text-sm text-slate-400 mt-2 leading-relaxed">{activeDoc.summary}</p>
            </div>

            {/* Rendered Dynamic Section Content */}
            <div className="pt-2">{activeDoc.content}</div>

            {/* Next / Previous Quick Jump Footer */}
            <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-xs text-slate-400">
                Was this documentation helpful?{' '}
                <a
                  href="mailto:support@errortracker.io?subject=Docs%20Feedback"
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Share feedback
                </a>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href="/installation"
                  className="text-xs font-bold text-slate-300 hover:text-white px-4 py-2 rounded-xl bg-white/5 border border-white/10 hover:border-cyan-400/50 transition-all flex items-center gap-1.5"
                >
                  <Terminal className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Interactive Quickstart</span>
                </Link>

                <Link
                  href="/onboarding"
                  className="text-xs font-bold text-white px-4 py-2 rounded-xl bg-linear-to-r from-[#2563EB] to-[#8B5CF6] hover:opacity-95 shadow-md shadow-[#8B5CF6]/30 transition-all flex items-center gap-1.5"
                >
                  <span>Launch Setup Wizard</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 py-6 text-center text-xs text-slate-500 border-t border-white/5 bg-[#050814]/90">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>© 2026 ErrorPulse Technologies Inc. All rights reserved.</span>
          <div className="flex items-center gap-4 text-slate-400">
            <Link href="/" className="hover:text-white">
              Home
            </Link>
            <Link href="/installation" className="hover:text-white">
              Installation
            </Link>
            <Link href="/system-status" className="hover:text-white">
              Status
            </Link>
            <Link href="/login" className="hover:text-white">
              Dashboard
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
