/**
 * Dosyanın görevi: Yayın öncesi tarayıcı duman testinin sunucu ve Chrome ayarlarını tanımlar.
 * Kullanıldığı yerler: package.json içindeki test:e2e ve release:check komutları.
 */
import { defineConfig } from '@playwright/test';

const externalSiteUrl = process.env.PLAYWRIGHT_SITE_URL;
const externalAdminUrl = process.env.PLAYWRIGHT_ADMIN_URL;
const baseURL = externalSiteUrl || 'http://127.0.0.1:3100';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  reporter: 'list',
  use: {
    baseURL,
    browserName: 'chromium',
    channel: 'chrome',
    trace: 'retain-on-failure',
  },
  webServer: externalSiteUrl && externalAdminUrl
    ? undefined
    : [
        {
          command: 'npm run dev --workspace @ziraat/site -- --hostname 127.0.0.1 --port 3100',
          url: baseURL,
          reuseExistingServer: true,
          timeout: 120_000,
        },
        {
          command: 'npm run dev --workspace @ziraat/admin -- --hostname 127.0.0.1 --port 3101',
          url: 'http://127.0.0.1:3101/login',
          reuseExistingServer: true,
          timeout: 120_000,
        },
      ],
});
