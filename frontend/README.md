# 🖥️ ErrorTracker (ErrorPulse) — Frontend Web Application

The customer-facing SaaS management and investigation dashboard for the ErrorTracker platform. Built with **Next.js 16 (App Router & Turbopack)**, **React 19**, **TypeScript 5.x**, **Tailwind CSS**, **Zustand v5**, **TanStack Query v5**, and an enterprise **in-memory LRU CacheService**.

---

## 🎨 Design System & Tokens

The application features a dark navy navigation shell paired with clean neutral work surfaces, high-contrast severity badging, and accessible focus outlines:

| Token Name | Hex Code | Role |
|---|---|---|
| `--color-navy-dark` | `#10203C` | App sidebar, top banner, card borders, dark navigation |
| `--color-navy-sidebar` | `#0B172B` | Expanded sidebar backdrop |
| `--color-blue-accent` | `#2563EB` | Active routes, primary action buttons, links, trend graphs |
| `--color-teal-success` | `#12A89D` | Resolved status badges, healthy uptime metrics |
| `--color-amber-warning` | `#F59E0B` | Warning severity chips, rate-limit thresholds, unsaved changes |
| `--color-red-danger` | `#EF4444` | Critical / fatal errors, key revocation modals, delete confirmation |
| `--color-neutral-bg` | `#F5F8FC` | Content canvas background |
| `--color-neutral-text` | `#52647A` | Muted descriptions, code line numbers |

---

## 🗺️ Complete Route Map

| Path | Screen | Functionality |
|---|---|---|
| `/` | Root Redirect | Seamless redirection to the primary tenant overview |
| `/login` | Authentication | Sign-in with session authorization and password reset |
| `/signup` | Registration | New user registration and organization onboarding kickoff |
| `/forgot-password` | Password Recovery | Generates secure password reset request |
| `/reset-password` | Password Reset | Updates account password with verified reset token |
| `/onboarding` | Wizard | Project creation, SDK selector, copyable snippets, test event receiver |
| `/org/[slug]/overview` | Project Overview | KPI cards, 24h crash volume chart, recent issues list, simulation trigger |
| `/org/[slug]/issues` | Issues List | Search, status filters, level chips, cursor pagination, bulk triage |
| `/org/[slug]/issues/[id]` | Issue Detail | Grouped stack trace viewer, breadcrumbs trail, event samples, triage |
| `/org/[slug]/releases` | Releases | Release version history, new vs regressed issues, source-map status |
| `/org/[slug]/alerts` | Alerts | Active alert rules, spike thresholds, create & dry-run test modal |
| `/org/[slug]/projects` | Project Settings | **Sections A–E, G, H, J**: SDK controls, scrubbing, export, delete |
| `/org/[slug]/settings` | Organization | **Section F**: Team member list, RBAC roles (Admin/Dev/Viewer), invite modal |
| `/org/[slug]/billing` | Billing | **Section I**: Usage metering against monthly quotas, plan tiers, invoices |
| `/org/[slug]/activity` | Audit Trail | Immutable security audit log of auth, key rotations, and triage |
| `/org/[slug]/analytics` | Analytics | Error frequency charts, affected users, CSV export |
| `/org/[slug]/integrations`| Integrations | GitHub, Slack, Webhooks connections with test delivery |
| `/org/[slug]/notifications`| Notification Center| System alerts, critical issue notifications, read/unread status |
| `/org/[slug]/performance` | APM Performance | Transaction latency, p95/p99 percentiles, slow endpoints |
| `/org/[slug]/sdk-health` | SDK Diagnostics | DSN verification, ingestion latency, sample rate compliance |
| `/org/[slug]/sessions` | User Sessions | Crash-free session rates, active user device breakdown |
| `/org/[slug]/system-status`| Infrastructure Health | Platform health, API latency, auto-refreshing status checks |

---

## 🧩 Architecture & Component Inventory

### 1. State Management (Zustand v5)
- **`uiStore`** ([src/lib/stores/uiStore.ts](src/lib/stores/uiStore.ts)): Manages sidebar collapse, modal visibility, active filters, and toast notifications with granular selectors to eliminate unnecessary component re-renders.
- **`projectStore`** ([src/lib/stores/projectStore.ts](src/lib/stores/projectStore.ts)): Active project context and rotated key indicators.
- **`authStore`** ([src/lib/stores/authStore.ts](src/lib/stores/authStore.ts)): Session user and organization state with zero sensitive credential storage.
- **`useApp` Adapter** ([src/lib/store.tsx](src/lib/store.tsx)): Backward-compatible adapter for existing component consumers.

### 2. Server Caching & Data Fetching (TanStack Query v5)
- **`QueryClient`** ([src/lib/queryClient.ts](src/lib/queryClient.ts)): Centralized caching policies (30s stale, 5m GC), exponential retry policy, and tenant cache isolation (`clearTenantCache()`).
- **`hooks`** ([src/lib/queries/hooks.ts](src/lib/queries/hooks.ts)): Typed hooks for queries and mutations with automatic cache invalidation.

### 3. Backend Caching Engine
- **`CacheService`** ([src/lib/server/cache.ts](src/lib/server/cache.ts)): In-memory LRU cache (5,000 capacity), background TTL sweeps, and tag-based invalidations (`project:*`, `org:*`).

### 4. Layout & Global
- **`AppShell`** ([src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx)): Collapsible 256px navy sidebar, organization/project switcher, environment filter, time-range picker, and error simulation action.
- **`GlobalSearchModal`** ([src/components/layout/GlobalSearchModal.tsx](src/components/layout/GlobalSearchModal.tsx)): Global `Ctrl+K` search modal across issues, projects, releases, and members.
- **`Badges`** ([src/components/common/Badges.tsx](src/components/common/Badges.tsx)): Accessible `SeverityBadge` and `StatusBadge`.

### 5. Issue Investigation
- **`IssuesTable`** ([src/components/issues/IssuesTable.tsx](src/components/issues/IssuesTable.tsx)): Data table with cursor pagination, bulk selection, search filtering, and event counts.
- **`StackTraceViewer`** ([src/components/issues/StackTraceViewer.tsx](src/components/issues/StackTraceViewer.tsx)): Syntax-styled frame viewer distinguishing in-app code from vendor libraries, expandable source context lines, line numbers, copy-to-clipboard, and source-map status indicator.
- **`BreadcrumbsViewer`** ([src/components/issues/BreadcrumbsViewer.tsx](src/components/issues/BreadcrumbsViewer.tsx)): Chronological visual trail of user interactions, network fetch calls, and console logs leading to the error.

---

## ⚡ Getting Started Locally

### Install Dependencies
```bash
pnpm install
```

### Run Type Checking
```bash
pnpm exec tsc --noEmit
```

### Run Linting
```bash
pnpm lint
```

### Run Frontend Test Suite
```bash
pnpm test
```
*32 unit & integration tests passing across 10 suites.*

### Run Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Build Production Bundle
```bash
pnpm build
```
Optimized with Next.js Turbopack with 52 static and dynamic routes.
