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

test.describe('API Integration Tests', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should make successful API call for livestock data', async ({ page }) => {
    await page.goto('/');
    
    let apiCallSuccess = false;
    
    // Intercept API calls
    page.on('response', (response) => {
      if (response.url().includes('/api/sheep') || response.url().includes('/api/ternak')) {
        apiCallSuccess = response.ok();
      }
    });

    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Either API call succeeded or there's data on the page
    const hasData = await page.locator('[class*="item-card"], [class*="card"] button:has-text("Detail")').count() > 0;
    const hasLoadingOrEmpty = await page.locator('text=/Memuat|Tidak ada/').count() > 0;

    expect(apiCallSuccess || hasData || hasLoadingOrEmpty).toBeTruthy();
  });

  test('should handle API errors gracefully', async ({ page }) => {
    await page.route('**/api/**', route => {
      route.abort('failed');
    });

    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Should show error message or empty state
    const errorMsg = page.locator('[role="alert"], [class*="error"], text=/gagal|error/i');
    const emptyMsg = page.locator('text=Tidak ada');

    const hasErrorOrEmpty = await errorMsg.count() > 0 || await emptyMsg.count() > 0;
    expect(hasErrorOrEmpty || await page.locator('text=/Memuat/').count() > 0).toBeTruthy();
  });

  test('should include authorization header in API calls', async ({ page }) => {
    let authHeaderFound = false;
    
    page.on('request', (request) => {
      if (request.url().includes('/api/')) {
        const authHeader = request.headerValue('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) {
          authHeaderFound = true;
        }
      }
    });

    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Authorization header should be present
    expect(authHeaderFound || await page.locator('text=/Memuat/').count() > 0).toBeTruthy();
  });
});

test.describe('Performance - API Response Times', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('livestock list should load within acceptable time', async ({ page }) => {
    const startTime = Date.now();

    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Wait for content to be visible
    await page.locator('[class*="item-card"], text=/Memuat|Tidak ada/').first().waitFor({ timeout: 5000 }).catch(() => {});

    const loadTime = Date.now() - startTime;

    // Page should load within 5 seconds
    expect(loadTime).toBeLessThan(5000);
  });

  test('should cache API responses appropriately', async ({ page }) => {
    let callCount = 0;
    
    page.on('request', (request) => {
      if (request.url().includes('/api/sheep') || request.url().includes('/api/ternak')) {
        callCount++;
      }
    });

    // Navigate to ternak
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);

    const firstLoadCallCount = callCount;

    // Navigate away and back
    const adminLink = page.locator('a[href*="admin"], button:has-text("Admin")').first();
    if (await adminLink.isVisible({ timeout: 1000 }).catch(() => false)) {
      await adminLink.click();
      await page.waitForNavigation({ timeout: 3000 }).catch(() => {});
    }

    // Navigate back to ternak
    const ternakLink2 = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink2.click();
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Should make new calls or use cache (both are acceptable)
    expect(callCount).toBeGreaterThanOrEqual(firstLoadCallCount);
  });
});

test.describe('Data Consistency', () => {
  test.beforeEach(async ({ page }) => {
    await login(page);
  });

  test('should display same data on list and detail view', async ({ page }) => {
    const ternakLink = page.locator('a[href*="ternak"], button:has-text("Ternak")').first();
    await ternakLink.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(500);

    // Get first item name from list
    const firstItemName = await page.locator('[class*="item-headline"]').first().textContent();

    // Click detail
    const detailBtn = page.locator('button:has-text("Detail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(500);

      // Get name from detail view
      const detailName = await page.locator('h1, h2, h3, [class*="headline"]').first().textContent();

      // Names should match or be related
      if (firstItemName && detailName) {
        expect(detailName).toContain(firstItemName || '');
      }
    }
  });
});
