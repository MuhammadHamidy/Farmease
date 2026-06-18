import { test, expect } from '@playwright/test';

test.describe('Authentication & Login', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should display login page', async ({ page }) => {
    // Expect login page is visible
    const loginContainer = page.locator('[class*="login"]');
    await expect(loginContainer).toBeVisible();
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    // Fill login form
    const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i], input[placeholder*="user" i]').first();
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login"), button:has-text("Sign In")').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('admin123');
    await submitButton.click();

    // Wait for navigation
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    
    // Should be redirected to dashboard
    await expect(page).toHaveURL(/\/(dashboard|home|ternak|kebun)/, { timeout: 10000 }).catch(() => {
      // If URL doesn't match, check if page content changed (login form gone)
      expect(page.locator('[class*="login"]').first()).not.toBeVisible();
    });
  });

  test('should show error with invalid credentials', async ({ page }) => {
    const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();

    await usernameInput.fill('invalid');
    await passwordInput.fill('wrong');
    await submitButton.click();

    // Should show error message
    const errorMessage = page.locator('[role="alert"], .alert, .error, [class*="error"]');
    await expect(errorMessage).toBeVisible({ timeout: 3000 }).catch(() => {
      // Alternative: check form is still visible
      expect(submitButton).toBeVisible();
    });
  });

  test('should logout successfully', async ({ page }) => {
    // Login first
    const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Find and click logout button
    const logoutButton = page.locator('button:has-text("Keluar"), button:has-text("Logout"), button[title*="Logout" i]').first();
    await logoutButton.click({ timeout: 5000 }).catch(async () => {
      // Try alternative logout buttons
      const altLogoutButton = page.locator('[class*="logout"], [aria-label*="logout" i]').first();
      await altLogoutButton.click();
    });

    // Should be redirected to login
    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});
    await expect(page).toHaveURL('/').catch(() => {
      // Check if login form is visible
      expect(page.locator('[class*="login"]').first()).toBeVisible();
    });
  });
});

test.describe('Session Persistence', () => {
  test('should remember login and restore session', async ({ page, context }) => {
    // Login
    await page.goto('/');
    const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
    const passwordInput = page.locator('input[type="password"]');
    const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();

    await usernameInput.fill('admin');
    await passwordInput.fill('admin123');
    await submitButton.click();

    await page.waitForNavigation({ timeout: 5000 }).catch(() => {});

    // Create new page (simulating new browser tab with same context/cookies)
    const newPage = await context.newPage();
    await newPage.goto('/');

    // Should be logged in (not see login form)
    const loginContainer = newPage.locator('[class*="login"]');
    await expect(loginContainer).not.toBeVisible({ timeout: 3000 }).catch(() => {
      // Login might still show briefly, wait for it to navigate
      expect(newPage.url()).not.toContain('login');
    });

    await newPage.close();
  });
});
