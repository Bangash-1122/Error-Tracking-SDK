# 🖥️ ErrorTracker — Frontend Web Application

The customer-facing SaaS management and investigation dashboard for the ErrorTracker platform. Built with **Next.js 16 (App Router)**, **React 19**, **TypeScript**, and **Tailwind CSS**, designed strictly to the specifications of **Technical Blueprint 01: Complete Project Design** and **Technical Blueprint 02: Frontend Pages & Functionality**.

---

## 🎨 Design System & Tokens

The application features a dark navy navigation shell paired with clean neutral work surfaces, high-contrast severity badging, and accessible focus outlines.

| Token Name | Hex Code | Role |
|---|---|---|
| `--color-navy-dark` | `#10203C` | App sidebar, top banner, card borders, dark navigation |
| `--color-navy-sidebar` | `#0B172B` | Expanded sidebar backdrop |
| `--color-blue-accent` | `#2563EB` | Active routes, primary action buttons, links, trend graphs |
| `--color-teal-success` | `#12A89D` | Resolved status badges, healthy uptime metrics |
| `--color-amber-warning` | `#F59E0B` | Warning severity chips, rate-limit thresholds |
| `--color-red-danger` | `#EF4444` | Critical / fatal errors, key revocation modals |
| `--color-neutral-bg` | `#F5F8FC` | Content canvas background |
| `--color-neutral-text` | `#52647A` | Muted descriptions, code line numbers |

---

## 🗺️ Route Map

| Path | Screen | Functionality |
|---|---|---|
| `/` | Root Redirect | Seamless redirection to the primary tenant overview |
| `/login` | Authentication | Sign-in with session authorization and password reset |
| `/signup` | Registration | New user registration and organization onboarding kickoff |
| `/onboarding` | Wizard | Project creation, SDK selector, copyable snippets, test event receiver |
| `/org/[slug]/overview` | Project Overview | KPI cards, 24h crash volume chart, recent issues list, simulation trigger |
| `/org/[slug]/issues` | Issues List | Search, status filters, level chips, cursor pagination, bulk triage |
| `/org/[slug]/issues/[id]` | Issue Detail | Grouped stack trace viewer, breadcrumbs trail, event samples, triage |
| `/org/[slug]/releases` | Releases | Release version history, new vs regressed issues, source-map status |
| `/org/[slug]/alerts` | Alerts | Active alert rules, spike thresholds, create & dry-run test modal |
| `/org/[slug]/projects` | Projects | Ingestion DSN keys, zero-downtime key rotation, SDK setup guides |
| `/org/[slug]/settings` | Organization | Team member list, RBAC roles (Owner/Admin/Member), invite workflows |
| `/org/[slug]/billing` | Billing | Usage metering against monthly quotas, plan tiers, invoices |

---

## 🧩 Component Inventory

### Layout & Global
- **`AppShell`** ([src/components/layout/AppShell.tsx](src/components/layout/AppShell.tsx)): Collapsible 256px navy sidebar, organization/project switcher, environment filter, time-range picker, and error simulation action.
- **`Badges`** ([src/components/common/Badges.tsx](src/components/common/Badges.tsx)): Accessible `SeverityBadge` (Fatal, Error, Warning, Info) and `StatusBadge` (Unresolved, Resolved, Ignored).

### Dashboard & Analytics
- **`MetricsCard`** ([src/components/dashboard/MetricsCard.tsx](src/components/dashboard/MetricsCard.tsx)): Real-time counter cards featuring percentage trends and time-window labels.
- **`EventsChart`** ([src/components/dashboard/EventsChart.tsx](src/components/dashboard/EventsChart.tsx)): Time-series crash histogram with interactive hover states and empty states.

### Issue Investigation
- **`IssuesTable`** ([src/components/issues/IssuesTable.tsx](src/components/issues/IssuesTable.tsx)): Data table with cursor-based pagination, bulk selection, search filtering, and event counts.
- **`StackTraceViewer`** ([src/components/issues/StackTraceViewer.tsx](src/components/issues/StackTraceViewer.tsx)): Syntax-styled frame viewer distinguishing in-app code from vendor libraries, expandable source context lines, line numbers, copy-to-clipboard, and source-map status indicator.
- **`BreadcrumbsViewer`** ([src/components/issues/BreadcrumbsViewer.tsx](src/components/issues/BreadcrumbsViewer.tsx)): Chronological visual trail of user interactions, network fetch calls, and console logs leading to the error.

### Setup & Modals
- **`SdkSetupPanel`** ([src/components/onboarding/SdkSetupPanel.tsx](src/components/onboarding/SdkSetupPanel.tsx)): Copyable npm and script snippets, real-time event listener waiting for first ingest.
- **`AlertRuleModal`** ([src/components/alerts/AlertRuleModal.tsx](src/components/alerts/AlertRuleModal.tsx)): Condition builder for spike thresholds and new issues with webhook dry-run test.
- **`KeyRotationModal`** ([src/components/projects/KeyRotationModal.tsx](src/components/projects/KeyRotationModal.tsx)): Key generation modal with revocation warning confirmation.

---

## ⚡ Getting Started Locally

### Install Dependencies
```bash
pnpm install
```

### Run Development Server
```bash
pnpm dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

### Build Production Bundle
```bash
pnpm build
```
Optimized with Next.js Turbopack and static page prerendering.
