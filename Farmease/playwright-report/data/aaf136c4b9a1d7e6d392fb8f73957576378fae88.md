# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-08a & TC-08b: Sire and Dam Selection validation
- Location: tests\e2e\generate-screenshots.spec.ts:262:3

# Error details

```
Error: locator.click: Error: strict mode violation: locator('div').filter({ has: locator('text=Jenis Pencatatan') }).first().locator('.custom-select') resolved to 2 elements:
    1) <div class="custom-select">…</div> aka locator('div').filter({ hasText: /^Pakan$/ }).nth(1)
    2) <div class="custom-select">…</div> aka locator('div').filter({ hasText: /^Pakan Pagi$/ }).nth(1)

Call log:
  - waiting for locator('div').filter({ has: locator('text=Jenis Pencatatan') }).first().locator('.custom-select')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - banner [ref=e5]:
      - generic [ref=e6]:
        - img "FARMease" [ref=e8] [cursor=pointer]
        - heading "Say Hi Agro Farm" [level=1] [ref=e10]
      - generic [ref=e11]:
        - button "Notifikasi" [ref=e13] [cursor=pointer]:
          - img [ref=e14]
        - button "Keluar / Logout" [ref=e17] [cursor=pointer]:
          - img [ref=e18]
    - navigation [ref=e21]:
      - generic [ref=e22]:
        - link "Dasbor" [ref=e23] [cursor=pointer]:
          - /url: /ternak/dasbor
        - link "Daftar Ternak" [ref=e24] [cursor=pointer]:
          - /url: /ternak/daftar
        - link "Pencatatan" [ref=e25] [cursor=pointer]:
          - /url: /ternak/pencatatan
        - link "Riwayat" [ref=e26] [cursor=pointer]:
          - /url: /ternak/riwayat
        - link "Gudang" [ref=e27] [cursor=pointer]:
          - /url: /ternak/gudang
    - generic [ref=e29]:
      - generic [ref=e31]:
        - generic [ref=e32]:
          - generic [ref=e33]:
            - img "Pencatatan" [ref=e34]
            - heading "Pencatatan Ternak" [level=3] [ref=e35]
          - paragraph [ref=e36]: Pilih metode pencatatan, pilih detail, lalu lanjutkan ke form yang lebih lengkap.
        - generic [ref=e38]: 15.35 WIB
      - generic [ref=e39]:
        - generic [ref=e40]:
          - heading "Form Pencatatan" [level=4] [ref=e41]
          - paragraph [ref=e42]: Contoh desain dibuat ringkas seperti kartu record, tetapi tetap bisa dibedakan per domba atau per kandang.
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e47]:
              - img "Jenis" [ref=e48]
              - heading "Jenis Pencatatan" [level=4] [ref=e49]
            - group "Mode pencatatan" [ref=e51]:
              - button "Per Ternak" [ref=e52] [cursor=pointer]
              - button "Per Kandang" [ref=e53] [cursor=pointer]
          - generic [ref=e54]:
            - generic [ref=e55]:
              - generic [ref=e56]: Jenis Pencatatan
              - generic [ref=e58] [cursor=pointer]:
                - generic [ref=e59]: Pakan
                - img
            - generic [ref=e60]:
              - generic [ref=e61]: Rincian Pencatatan
              - generic [ref=e63] [cursor=pointer]:
                - generic [ref=e64]: Pakan Pagi
                - img
          - button "Selanjutnya" [ref=e66] [cursor=pointer]:
            - generic [ref=e68]: Selanjutnya
  - generic [ref=e69]:
    - generic "Toggle devtools panel" [ref=e70] [cursor=pointer]:
      - img [ref=e71]
    - generic "Toggle Component Inspector" [ref=e76] [cursor=pointer]:
      - img [ref=e77]
```

# Test source

```ts
  1   | import { test, expect } from '@playwright/test';
  2   | import * as path from 'path';
  3   | import * as fs from 'fs';
  4   | 
  5   | const screenshotDir = './tests/e2e/screenshots';
  6   | if (!fs.existsSync(screenshotDir)) {
  7   |   fs.mkdirSync(screenshotDir, { recursive: true });
  8   | }
  9   | 
  10  | async function takeScreenshot(page: any, name: string) {
  11  |   const filePath = path.join(screenshotDir, `${name}.png`);
  12  |   await page.screenshot({ path: filePath, fullPage: false });
  13  |   console.log(`Saved screenshot: ${filePath}`);
  14  | }
  15  | 
  16  | async function selectOption(page: any, fieldLabel: string, optionText: string) {
  17  |   // Find the form field container by looking for the label
  18  |   const field = page.locator('div', { has: page.locator(`text=${fieldLabel}`) }).first();
  19  |   // Click the custom select wrapper inside this field
  20  |   const selectBox = field.locator('.custom-select');
> 21  |   await selectBox.click();
      |                   ^ Error: locator.click: Error: strict mode violation: locator('div').filter({ has: locator('text=Jenis Pencatatan') }).first().locator('.custom-select') resolved to 2 elements:
  22  |   await page.waitForTimeout(500);
  23  |   // Find and click the option inside the menu
  24  |   const option = page.locator('.custom-select-option', { hasText: optionText }).first();
  25  |   await option.click();
  26  |   await page.waitForTimeout(500);
  27  | }
  28  | 
  29  | async function loginAsOperator(page: any) {
  30  |   await page.goto('http://localhost:3000/');
  31  |   await page.waitForTimeout(1000);
  32  | 
  33  |   if (page.url().includes('localhost:3001')) {
  34  |     const closeWelcome = page.locator('button:has-text("Mulai Aktivitas"), button:has-text("Tutup"), .peternakan-modal-close').first();
  35  |     if (await closeWelcome.isVisible()) {
  36  |       await closeWelcome.click();
  37  |     }
  38  |     return;
  39  |   }
  40  | 
  41  |   const roleSelection = page.locator('button:has-text("Operator Peternakan")').first();
  42  |   if (await roleSelection.isVisible()) {
  43  |     await roleSelection.click();
  44  |     await page.waitForTimeout(2000);
  45  |     return;
  46  |   }
  47  | 
  48  |   const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
  49  |   if (await usernameInput.isVisible()) {
  50  |     const passwordInput = page.locator('input[type="password"]');
  51  |     const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();
  52  | 
  53  |     await usernameInput.fill('operator_kandang');
  54  |     await passwordInput.fill('kandang123');
  55  |     await submitButton.click();
  56  | 
  57  |     await page.waitForTimeout(1000);
  58  |     const operatorRoleBtn = page.locator('button:has-text("Operator Peternakan")').first();
  59  |     if (await operatorRoleBtn.isVisible()) {
  60  |       await operatorRoleBtn.click();
  61  |     }
  62  |   }
  63  | 
  64  |   await page.waitForURL(/localhost:3001/, { timeout: 10000 }).catch(() => {});
  65  |   await page.waitForTimeout(2000);
  66  | 
  67  |   const closeWelcome = page.locator('button:has-text("Mulai Aktivitas"), button:has-text("Tutup"), .peternakan-modal-close').first();
  68  |   if (await closeWelcome.isVisible()) {
  69  |     await closeWelcome.click();
  70  |   }
  71  | }
  72  | 
  73  | async function loginAsAdmin(page: any) {
  74  |   await page.goto('http://localhost:3000/');
  75  |   await page.waitForTimeout(1000);
  76  | 
  77  |   if (page.url().includes('localhost:3001/admin') || page.url().includes('localhost:3001/admin/')) {
  78  |     return;
  79  |   }
  80  | 
  81  |   const roleSelection = page.locator('button:has-text("Admin")').first();
  82  |   if (await roleSelection.isVisible()) {
  83  |     await roleSelection.click();
  84  |     await page.waitForTimeout(2000);
  85  |     return;
  86  |   }
  87  | 
  88  |   const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
  89  |   if (await usernameInput.isVisible()) {
  90  |     const passwordInput = page.locator('input[type="password"]');
  91  |     const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();
  92  | 
  93  |     await usernameInput.fill('admin');
  94  |     await passwordInput.fill('admin123');
  95  |     await submitButton.click();
  96  | 
  97  |     await page.waitForTimeout(1000);
  98  |     const adminRoleBtn = page.locator('button:has-text("Admin")').first();
  99  |     if (await adminRoleBtn.isVisible()) {
  100 |       await adminRoleBtn.click();
  101 |     }
  102 |   }
  103 | 
  104 |   await page.waitForURL(/localhost:3001/, { timeout: 10000 }).catch(() => {});
  105 |   await page.waitForTimeout(2000);
  106 | }
  107 | 
  108 | test.describe('Automated Screenshot Generator for All TA Test Cases', () => {
  109 | 
  110 |   test('TC-02a & TC-02b: Logout & Middleware Redirect', async ({ page }) => {
  111 |     await loginAsOperator(page);
  112 |     await page.goto('http://localhost:3001/ternak');
  113 |     await page.waitForTimeout(1500);
  114 | 
  115 |     const logoutBtn = page.locator('.header-logout-btn').first();
  116 |     await logoutBtn.click();
  117 |     await page.waitForTimeout(500);
  118 | 
  119 |     const confirmBtn = page.locator('button:has-text("Keluar"), button.peternakan-primary-btn:has-text("Keluar")').first();
  120 |     if (await confirmBtn.isVisible()) {
  121 |       await confirmBtn.click();
```