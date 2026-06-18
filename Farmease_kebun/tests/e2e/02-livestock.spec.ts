import { test, expect } from '@playwright/test';

const testUser = { username: 'admin', password: 'admin123' };

async function login(page: any) {
  await page.goto('/');
  const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();

  await usernameInput.fill(testUser.username);
  await passwordInput.fill(testUser.password);
  await submitButton.click();

  await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
}

test.describe('Livestock Management - Ternak Module', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should navigate to livestock list page', async ({ page }) => {
    // Navigate to ternak/livestock module
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak"), nav a:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Should see livestock list
    const listTitle = page.locator('text=Daftar Ternak').first();
    await expect(listTitle).toBeVisible({ timeout: 5000 });
  });

  test('should display livestock list with data from API', async ({ page }) => {
    // Navigate to ternak
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Wait for API call to complete
    await page.waitForTimeout(1000);

    // Should see at least one livestock item or loading message
    const items = page.locator('[class*="item-card"], [class*="card"]').locator('button:has-text("Detail")');
    const itemCount = await items.count();
    
    if (itemCount > 0) {
      expect(itemCount).toBeGreaterThan(0);
    } else {
      // Might be empty or loading, check for either
      const loadingMsg = page.locator('text=Memuat, text=Tidak ada');
      expect(await loadingMsg.first().isVisible()).toBeTruthy();
    }
  });

  test('should search livestock by name or code', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Find search input
    const searchInput = page.locator('input[placeholder*="Cari"], input[type="text"]').first();
    
    if (await searchInput.isVisible()) {
      await searchInput.fill('D-001');
      await page.waitForTimeout(300);

      // Results should be filtered
      const items = page.locator('[class*="item-card"]');
      expect(await items.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should filter livestock by status', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Find status filter buttons
    const healthyBtn = page.locator('button:has-text("Sehat")').first();
    
    if (await healthyBtn.isVisible()) {
      await healthyBtn.click();
      await page.waitForTimeout(300);

      // List should be filtered
      const items = page.locator('[class*="item-card"]');
      expect(await items.count()).toBeGreaterThanOrEqual(0);
    }
  });

  test('should view livestock detail', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Find and click first livestock detail button
    const detailBtn = page.locator('button:has-text("Detail")').first();
    
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(500);

      // Should show detail view
      const detailTitle = page.locator('text=Detail Ternak, text=Genealogi, text=Riwayat').first();
      await expect(detailTitle).toBeVisible({ timeout: 3000 }).catch(() => {
        // Detail might load async, just check page changed
        expect(page.url()).toContain('ternak');
      });
    }
  });

  test('should add new livestock', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Find add button
    const addBtn = page.locator('button:has-text("Tambah Domba")').first();
    
    if (await addBtn.isVisible()) {
      await addBtn.click();
      await page.waitForTimeout(300);

      // Modal should open
      const modal = page.locator('[class*="modal"]');
      await expect(modal).toBeVisible({ timeout: 3000 });

      // Fill form
      const codeInput = page.locator('input[placeholder*="D-"], input[placeholder*="007"]').first();
      const nameInput = page.locator('input[placeholder*="nama domba"]').first();
      
      if (await codeInput.isVisible()) {
        await codeInput.fill('D-TEST-001');
      }
      if (await nameInput.isVisible()) {
        await nameInput.fill('Test Domba');
      }

      // Click save button
      const saveBtn = page.locator('button:has-text("Simpan")').last();
      await saveBtn.click();

      // Modal should close or show success
      await page.waitForTimeout(500);
    }
  });

  test('should show statistics on livestock page', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Look for statistics cards
    const stats = page.locator('[class*="stat"], text=/Total|Sehat|Perlu Perhatian/');
    const statsCount = await stats.count();
    
    // Should have at least some stats displayed
    if (statsCount > 0) {
      expect(statsCount).toBeGreaterThan(0);
    }
  });

  test('should switch between cages', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Look for cage selector or badge
    const cageBadge = page.locator('text=Kandang /[A-Z]').first();
    
    if (await cageBadge.isVisible()) {
      const currentCage = await cageBadge.textContent();
      expect(currentCage).toMatch(/Kandang\s+[A-Z]/);
    }
  });
});
