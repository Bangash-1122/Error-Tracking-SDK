import { NextRequest, NextResponse } from 'next/server';
import { getServerDb } from '@/lib/server/db';
import { getServerCache } from '@/lib/server/cache';
import { requireAuthUser } from '@/lib/server/auth';
import { z } from 'zod';

const UpdateSettingsSchema = z.object({
  projectName: z.string().min(2).optional(),
  projectDescription: z.string().optional(),
  defaultEnvironment: z.enum(['production', 'staging', 'development']).optional(),
  timezone: z.string().optional(),
  dateTimeFormat: z.enum(['YYYY-MM-DD HH:mm:ss', 'MM/DD/YYYY hh:mm A', 'DD/MM/YYYY HH:mm']).optional(),
  projectStatus: z.enum(['active', 'archived', 'maintenance']).optional(),
  
  sdkReportingEnabled: z.boolean().optional(),
  sdkVersion: z.string().optional(),
  environmentConfig: z.string().optional(),
  releaseTrackingEnabled: z.boolean().optional(),
  errorSamplingRate: z.number().min(0).max(1).optional(),
  
  severityFilters: z.array(z.enum(['critical', 'error', 'warning', 'info'])).optional(),
  ignoredErrors: z.array(z.string()).optional(),
  errorGroupingPreference: z.enum(['fingerprint', 'type_message', 'semantic']).optional(),
  telemetryRetentionDays: z.number().min(7).max(365).optional(),
  autoResolveInactiveDays: z.number().min(0).max(365).optional(),
  regressionDetectionEnabled: z.boolean().optional(),
  eventRateLimitPerMin: z.number().min(10).max(10000).optional(),
  quotaWarningThresholdPercent: z.number().min(10).max(100).optional(),

  emailAlertsEnabled: z.boolean().optional(),
  criticalOnlyAlerts: z.boolean().optional(),
  newIssueAlertsEnabled: z.boolean().optional(),
  regressionAlertsEnabled: z.boolean().optional(),
  alertFrequency: z.enum(['instant', 'hourly_digest', 'daily_digest']).optional(),
  notificationChannels: z.array(z.enum(['email', 'slack', 'webhook'])).optional(),
  alertThresholdCount: z.number().min(1).max(1000).optional(),
  quietHoursEnabled: z.boolean().optional(),
  quietHoursStart: z.string().optional(),
  quietHoursEnd: z.string().optional(),

  sensitiveDataScrubbing: z.boolean().optional(),
  scrubFields: z.array(z.string()).optional(),
  collectUserIpAddresses: z.boolean().optional(),
  collectUserInfo: z.boolean().optional(),
  sessionTrackingEnabled: z.boolean().optional(),
  allowDataExport: z.boolean().optional(),

  githubIntegrationEnabled: z.boolean().optional(),
  slackIntegrationEnabled: z.boolean().optional(),
  webhookIntegrationEnabled: z.boolean().optional(),
  webhookEndpointUrl: z.string().url().optional().or(z.literal('')),

  performanceMonitoringEnabled: z.boolean().optional(),
  transactionSampleRate: z.number().min(0).max(1).optional(),
  slowRequestThresholdMs: z.number().min(50).max(10000).optional(),
  perfAlertThresholdMs: z.number().min(100).max(30000).optional(),
  perfDataRetentionDays: z.number().min(7).max(90).optional(),

  debugDiagnosticsEnabled: z.boolean().optional(),
  maintenanceMode: z.boolean().optional(),
});

export async function GET(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const db = getServerDb();
    const settings = await db.getProjectSettings(id);
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error fetching project settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { user } = await requireAuthUser(req);
    const body: unknown = await req.json();

    const parsed = UpdateSettingsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Invalid settings payload', details: parsed.error.issues.map((i) => i.message) },
        { status: 400 }
      );
    }

    const db = getServerDb();
    const settings = await db.updateProjectSettings(id, parsed.data, {
      id: user.id,
      name: user.name,
      email: user.email,
    });

    // Invalidate project cache
    const cache = getServerCache();
    cache.invalidateProject(id);

    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Failed to update settings';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
