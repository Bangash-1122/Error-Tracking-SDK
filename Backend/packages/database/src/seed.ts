import { getRepository } from './repository.js';

export async function seedDemoData() {
  const repo = getRepository();

  // Create demo organization
  const org = await repo.createOrganization('Acme Corp', 'acme-corp');
  console.log(`[Seed] Created organization: ${org.name} (${org.id})`);

  // Create demo user
  const user = await repo.createUser('admin@acme.com', 'Admin User', 'hash_pw_demo_123');
  await repo.addMembership(org.id, user.id, 'owner');
  console.log(`[Seed] Created owner: ${user.email} (${user.id})`);

  // Create demo projects
  const webApp = await repo.createProject(org.id, 'Storefront Web App', 'react');
  const apiService = await repo.createProject(org.id, 'Payment API Service', 'node');

  console.log(`[Seed] Created project: ${webApp.name} (${webApp.id})`);
  console.log(`[Seed] Created project: ${apiService.name} (${apiService.id})`);

  // Issue demo keys
  const webKey = await repo.issueProjectKey(webApp.id, 'Web Production Key');
  const apiKey = await repo.issueProjectKey(apiService.id, 'API Production Key');

  console.log(`[Seed] Ingest key for ${webApp.name}: ${webKey.rawKey}`);
  console.log(`[Seed] Ingest key for ${apiService.name}: ${apiKey.rawKey}`);

  // Create alert rule
  await repo.createAlertRule(webApp.id, { type: 'new_issue' }, 'https://hooks.slack.com/services/demo/alert/webhook', 10);
  console.log(`[Seed] Created demo alert rule for ${webApp.name}`);

  return { org, user, webApp, apiService, webKey, apiKey };
}

if (process.argv[1]?.endsWith('seed.ts') || process.argv[1]?.endsWith('seed.js')) {
  seedDemoData()
    .then(() => {
      console.log('[Seed] Seeding completed successfully.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('[Seed] Seeding failed:', err);
      process.exit(1);
    });
}
