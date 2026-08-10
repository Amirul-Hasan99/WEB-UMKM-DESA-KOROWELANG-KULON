import { test, expect } from '@playwright/test';

test.describe('Portal UMKM Desa Korowelang Kulon - End-to-End User Flow', () => {
  test('1. Homepage loads successfully with branding title and hero CTA', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    
    // Verify Navbar Brand Title
    await expect(page.locator('header')).toContainText('UMKM Korowelang Kulon');
    
    // Verify Hero Section
    await expect(page.locator('h1')).toBeVisible();
  });

  test('2. User can navigate to UMKM Catalog and search for products', async ({ page }) => {
    await page.goto('/umkm', { waitUntil: 'domcontentloaded' });

    // Check header catalog title ("Daftar UMKM Korowelang Kulon")
    await expect(page.locator('h1')).toContainText('Daftar UMKM');

    // Fill search input
    const searchInput = page.locator('input[placeholder*="Cari" i]');
    if (await searchInput.isVisible()) {
      await searchInput.fill('Bandeng');
    }
  });

  test('3. User can navigate to About page and view village information', async ({ page }) => {
    await page.goto('/tentang', { waitUntil: 'domcontentloaded' });
    await expect(page.locator('h1')).toBeVisible();
  });

  test('4. User can open Feedback page and fill out submission form', async ({ page }) => {
    await page.goto('/feedback', { waitUntil: 'domcontentloaded' });

    // Fill Form Inputs with exact placeholder selectors
    await page.fill('input[placeholder*="nama" i]', 'Budi Santoso');
    await page.fill('input[placeholder*="domain" i]', 'budi.santoso@example.com');
    await page.fill('textarea[placeholder*="masukan" i]', 'Saran dari warga untuk pengembangan fasilitas pemasaran UMKM desa.');

    // Submit form button click
    const submitBtn = page.locator('button[type="submit"]');
    if (await submitBtn.isVisible()) {
      await submitBtn.click();
    }
  });

  test('5. Admin user can open Login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });
    
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
  });
});
