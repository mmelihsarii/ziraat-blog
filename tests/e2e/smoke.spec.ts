/**
 * Dosyanın görevi: Public sayfaların açıldığını ve dashboard korumasının tarayıcıda çalıştığını denetler.
 * Kullanıldığı yerler: Playwright test çalıştırıcısı.
 */
import { expect, test } from '@playwright/test';

for (const [name, path] of [
  ['ana sayfa', '/'],
  ['makale arşivi', '/makaleler'],
  ['galeri', '/galeri'],
  ['hakkımda', '/hakkimda'],
] as const) {
  test(`${name} ziyaretçiye açılır`, async ({ page }) => {
    const response = await page.goto(path);
    expect(response?.ok()).toBeTruthy();
    await expect(page.locator('body')).not.toContainText('Application error');
  });
}

test('oturumsuz dashboard isteği giriş ekranına yönlenir', async ({ page }) => {
  const adminBaseUrl = process.env.PLAYWRIGHT_ADMIN_URL || 'http://127.0.0.1:3101';
  await page.goto(`${adminBaseUrl}/dashboard`);
  await expect(page).toHaveURL(/\/login\?next=%2Fdashboard$/);
  await expect(page.getByRole('heading', { name: 'Giriş Yap', exact: true })).toBeVisible();
  await expect(page.getByText('Şifremi unuttum')).toHaveCount(0);
  expect((await page.request.get(`${adminBaseUrl}/forgot-password`)).status()).toBe(404);
  expect((await page.request.get(`${adminBaseUrl}/reset-password`)).status()).toBe(404);
});

test('robots ve sitemap canlı rotaları üretir', async ({ request }) => {
  const robots = await request.get('/robots.txt');
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain('Disallow: /dashboard/');

  const sitemap = await request.get('/sitemap.xml');
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  expect(sitemapText).toContain('<urlset');
  expect(sitemapText).toContain('/galeri');
});

test('site ve admin rotaları birbirinden fiziksel olarak ayrıdır', async ({ request }) => {
  const adminBaseUrl = process.env.PLAYWRIGHT_ADMIN_URL || 'http://127.0.0.1:3101';
  expect((await request.get('/dashboard')).status()).toBe(404);
  expect((await request.get(`${adminBaseUrl}/makaleler`)).status()).toBe(404);
});
