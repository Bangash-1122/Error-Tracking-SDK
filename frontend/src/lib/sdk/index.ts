/**
 * ErrorPulse Client SDK
 * Production-ready browser and Node.js error capture and telemetry ingestion client.
 */

export interface StackFrame {
  filename: string;
  function: string;
  lineno?: number;
  colno?: number;
  in_app: boolean;
  context_line?: string;
  pre_context?: string[];
  post_context?: string[];
}

export interface Breadcrumb {
  timestamp: string;
  category: string;
  message?: string;
  level: 'debug' | 'info' | 'warning' | 'error' | 'critical';
  data?: Record<string, unknown>;
}

export interface UserContext {
  id?: string;
  username?: string;
  email?: string;
  ip_address?: string;
}

export interface SdkOptions {
  projectKey: string;
  endpoint?: string;
  environment?: string;
  release?: string;
  sampleRate?: number;
  maxBreadcrumbs?: number;
  tags?: Record<string, string>;
  beforeSend?: (event: IngestPayload) => IngestPayload | null;
}

export interface IngestPayload {
  schemaVersion: string;
  eventId: string;
  projectKey: string;
  occurredAt: string;
  release: string;
  environment: string;
  exception: {
    type: string;
    value: string;
    mechanism?: {
      handled: boolean;
      type?: string;
    };
  };
  frames: StackFrame[];
  context: {
    user?: UserContext;
    tags?: Record<string, string>;
    breadcrumbs?: Breadcrumb[];
    request?: {
      url?: string;
      method?: string;
      headers?: Record<string, string>;
    };
    extra?: Record<string, unknown>;
  };
}

export interface IngestResponse {
  status: 'accepted';
  eventId: string;
  requestId: string;
  receivedAt: string;
}

class ErrorTrackerSdk {
  private options: SdkOptions | null = null;
  private breadcrumbs: Breadcrumb[] = [];
  private currentUser: UserContext | null = null;
  private isInitialized = false;

  public init(options: SdkOptions): void {
    this.options = {
      endpoint: '/api/v1/events',
      environment: 'production',
      release: 'v1.0.0',
      sampleRate: 1.0,
      maxBreadcrumbs: 50,
      ...options,
    };

    if (this.isInitialized) return;
    this.isInitialized = true;

    // Attach global unhandled exception listeners if in browser environment
    if (typeof window !== 'undefined') {
      window.addEventListener('error', (event: ErrorEvent) => {
        if (event.error) {
          this.captureException(event.error, {
            mechanism: { handled: false, type: 'onerror' },
          });
        } else {
          this.captureMessage(event.message, 'error');
        }
      });

      window.addEventListener('unhandledrejection', (event: PromiseRejectionEvent) => {
        const error = event.reason instanceof Error ? event.reason : new Error(String(event.reason));
        this.captureException(error, {
          mechanism: { handled: false, type: 'onunhandledrejection' },
        });
      });

      this.addBreadcrumb({
        category: 'navigation',
        message: `Page loaded: ${window.location.pathname}`,
        level: 'info',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public setUser(user: UserContext | null): void {
    this.currentUser = user;
  }

  public addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'> & { timestamp?: string }): void {
    const full: Breadcrumb = {
      timestamp: breadcrumb.timestamp || new Date().toISOString(),
      ...breadcrumb,
    };
    this.breadcrumbs.push(full);
    const max = this.options?.maxBreadcrumbs || 50;
    if (this.breadcrumbs.length > max) {
      this.breadcrumbs.shift();
    }
  }

  public clearBreadcrumbs(): void {
    this.breadcrumbs = [];
  }

  public parseStackTrace(stack?: string): StackFrame[] {
    if (!stack) return [];
    const lines = stack.split('\n');
    const frames: StackFrame[] = [];

    // Parse V8 format: at functionName (filepath:line:col) or at filepath:line:col
    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line.startsWith('at ')) continue;

      let func = '?';
      let location = line.slice(3).trim();

      const parenMatch = location.match(/^(.*?)\s*\((.*?)\)$/);
      if (parenMatch) {
        func = parenMatch[1] || '?';
        location = parenMatch[2];
      }

      const match = location.match(/^(.*?):(\d+):(\d+)$/);
      if (match) {
        const filename = match[1];
        const lineno = parseInt(match[2], 10);
        const colno = parseInt(match[3], 10);
        const in_app = !filename.includes('node_modules') && !filename.includes('internal/');

        frames.push({
          filename,
          function: func,
          lineno,
          colno,
          in_app,
          context_line: line,
        });
      }
    }

    return frames.reverse(); // Standard ordering: oldest frame first, call site last
  }

  public async captureException(
    error: Error | unknown,
    context?: {
      tags?: Record<string, string>;
      extra?: Record<string, unknown>;
      mechanism?: { handled: boolean; type?: string };
    }
  ): Promise<IngestResponse> {
    if (!this.options) {
      throw new Error('SDK must be initialized with init() before capturing exceptions.');
    }

    // Sampling check
    if (this.options.sampleRate !== undefined && Math.random() > this.options.sampleRate) {
      return {
        status: 'accepted',
        eventId: 'sampled_out',
        requestId: 'sampled_out',
        receivedAt: new Date().toISOString(),
      };
    }

    const err = error instanceof Error ? error : new Error(String(error));
    const errorType = err.name || 'Error';
    const errorMessage = err.message || 'An unknown error occurred';
    const frames = this.parseStackTrace(err.stack);

    // Browser / OS environment detection
    let browser = 'Unknown';
    let os = 'Unknown';
    if (typeof navigator !== 'undefined') {
      const ua = navigator.userAgent;
      if (ua.includes('Chrome')) browser = 'Chrome';
      else if (ua.includes('Safari')) browser = 'Safari';
      else if (ua.includes('Firefox')) browser = 'Firefox';
      else if (ua.includes('Edge')) browser = 'Edge';

      if (ua.includes('Mac')) os = 'macOS';
      else if (ua.includes('Windows')) os = 'Windows';
      else if (ua.includes('Linux')) os = 'Linux';
      else if (ua.includes('Android')) os = 'Android';
      else if (ua.includes('iOS') || ua.includes('iPhone')) os = 'iOS';
    }

    const eventId = crypto.randomUUID();
    const payload: IngestPayload = {
      schemaVersion: '1.0.0',
      eventId,
      projectKey: this.options.projectKey,
      occurredAt: new Date().toISOString(),
      release: this.options.release || 'v1.0.0',
      environment: this.options.environment || 'production',
      exception: {
        type: errorType,
        value: errorMessage,
        mechanism: context?.mechanism || { handled: true, type: 'manual' },
      },
      frames: frames.length > 0 ? frames : [
        {
          filename: typeof window !== 'undefined' ? window.location.pathname : 'server.js',
          function: 'captureException',
          lineno: 1,
          colno: 1,
          in_app: true,
          context_line: `${errorType}: ${errorMessage}`,
        },
      ],
      context: {
        user: this.currentUser || undefined,
        tags: {
          browser,
          os,
          ...this.options.tags,
          ...context?.tags,
        },
        breadcrumbs: [...this.breadcrumbs],
        request: typeof window !== 'undefined' ? { url: window.location.href, method: 'GET' } : undefined,
        extra: context?.extra,
      },
    };

    let processedPayload: IngestPayload | null = payload;
    if (this.options.beforeSend) {
      processedPayload = this.options.beforeSend(payload);
      if (!processedPayload) {
        return {
          status: 'accepted',
          eventId: 'dropped_by_beforesend',
          requestId: 'dropped',
          receivedAt: new Date().toISOString(),
        };
      }
    }

    const endpoint = this.options.endpoint || '/api/v1/events';
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Project-Key': this.options.projectKey,
      },
      body: JSON.stringify(processedPayload),
    });

    if (!response.ok) {
      const errBody = await response.json().catch(() => ({}));
      throw new Error(errBody.error || `SDK Ingestion failed with status ${response.status}`);
    }

    return (await response.json()) as IngestResponse;
  }

  public async captureMessage(
    message: string,
    level: 'info' | 'warning' | 'error' | 'critical' = 'info',
    context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }
  ): Promise<IngestResponse> {
    const error = new Error(message);
    error.name = level === 'critical' ? 'FatalMessage' : level === 'warning' ? 'WarningMessage' : 'NotificationMessage';
    return this.captureException(error, context);
  }
}

export const sdk = new ErrorTrackerSdk();

export function init(options: SdkOptions): void {
  sdk.init(options);
}

export function captureException(
  error: Error | unknown,
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }
): Promise<IngestResponse> {
  return sdk.captureException(error, context);
}

export function captureMessage(
  message: string,
  level?: 'info' | 'warning' | 'error' | 'critical',
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> }
): Promise<IngestResponse> {
  return sdk.captureMessage(message, level, context);
}

export function addBreadcrumb(breadcrumb: Omit<Breadcrumb, 'timestamp'>): void {
  sdk.addBreadcrumb(breadcrumb);
}

export function setUser(user: UserContext | null): void {
  sdk.setUser(user);
}
