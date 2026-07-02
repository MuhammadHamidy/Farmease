# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-14a s.d TC-18b: Feed Management & Logistics Monitoring
- Location: tests\e2e\generate-screenshots.spec.ts:374:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('div').filter({ has: locator('text=Jenis Pencatatan') }).first().locator('.custom-select')

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - generic [ref=e6]:
      - generic [ref=e7]:
        - heading "Say Hi Agro Farm" [level=1] [ref=e8]
        - paragraph [ref=e9]: bersama
        - img "FARMease" [ref=e11]
        - paragraph [ref=e12]: Kelola Peternakan & Perkebunan
        - paragraph [ref=e13]: Sistem Informasi pencatatan harian, pemantauan, dan laporan terintegrasi.
      - generic [ref=e14]:
        - heading "Silahkan Masuk" [level=2] [ref=e15]
        - paragraph [ref=e16]: Masukkan data yang sesuai
        - generic [ref=e17]:
          - generic [ref=e18]: Masukkan Nama Pengguna
          - textbox "Masukkan Nama Pengguna" [ref=e19]:
            - /placeholder: Nama pengguna
        - generic [ref=e20]:
          - generic [ref=e21]: Masukkan Kata Sandi
          - generic [ref=e22]:
            - textbox "Masukkan Kata Sandi" [ref=e23]:
              - /placeholder: Kata sandi
            - button "Tampilkan Kata Sandi" [ref=e24] [cursor=pointer]:
              - img "Tampilkan Kata Sandi" [ref=e25]
        - generic [ref=e27] [cursor=pointer]:
          - checkbox "Ingatkan Sandi" [ref=e28]
          - generic [ref=e29]: Ingatkan Sandi
        - button "Masuk" [ref=e30] [cursor=pointer]
    - heading "Keunggulan" [level=2] [ref=e31]
    - generic [ref=e34]:
      - article [ref=e35]:
        - heading "Integrasi Data" [level=4] [ref=e36]
        - paragraph [ref=e37]: Seluruh pencatatan aktivitas peternakan dan perkebunan terhubung dalam satu sistem terpadu.
      - article [ref=e38]:
        - heading "Pencatatan" [level=4] [ref=e39]
        - paragraph [ref=e40]: Catat aktivitas harian secara terstruktur dan akurat untuk kebutuhan operasional maupun laporan.
      - article [ref=e41]:
        - heading "Pemantauan" [level=4] [ref=e42]
        - paragraph [ref=e43]: Pantau perkembangan ternak, lahan, dan jadwal pekerjaan secara berkala dari satu platform.
    - heading "Mengenal Peternakan" [level=2] [ref=e44]
    - generic [ref=e47]:
      - article [ref=e48]:
        - generic [ref=e49]:
          - heading "Domba Dorper – Penghasil Daging Unggul" [level=4] [ref=e50]
          - paragraph [ref=e51]: Domba pedaging dari Afrika Selatan dengan pertumbuhan cepat, tahan cuaca, dan tidak perlu dicukur.
        - img "Domba Dorper – Penghasil Daging Unggul" [ref=e53]
      - article [ref=e54]:
        - generic [ref=e55]:
          - heading "Domba Garut – Domba Lokal Bernilai Budaya" [level=4] [ref=e56]
          - paragraph [ref=e57]: Domba asli Indonesia dengan tubuh besar dan tanduk khas, sering digunakan dalam tradisi adu domba.
        - img "Domba Garut – Domba Lokal Bernilai Budaya" [ref=e59]
      - article [ref=e60]:
        - generic [ref=e61]:
          - heading "Domba Cross Garut – Hasil Persilangan Unggul" [level=4] [ref=e62]
          - paragraph [ref=e63]: Perpaduan Garut dengan jenis lain untuk menghasilkan domba yang lebih produktif dan berkualitas.
        - img "Domba Cross Garut – Hasil Persilangan Unggul" [ref=e65]
      - article [ref=e66]:
        - generic [ref=e67]:
          - heading "Domba Merino – Penghasil Wol Berkualitas Tinggi" [level=4] [ref=e68]
          - paragraph [ref=e69]: Domba penghasil wol halus bernilai tinggi yang banyak digunakan di industri tekstil.
        - img "Domba Merino – Penghasil Wol Berkualitas Tinggi" [ref=e71]
    - heading "Mengenal Perkebunan" [level=2] [ref=e72]
    - generic [ref=e75]:
      - article [ref=e76]:
        - img "Kelengkeng" [ref=e78]: 🍈
        - generic [ref=e79]:
          - heading "Kelengkeng" [level=4] [ref=e80]
          - paragraph [ref=e81]: Buah tropis manis dengan permukaan kulit kasar, banyak dibudidayakan di lahan kebun Say Hi Agro Farm.
      - article [ref=e82]:
        - img "Alpukat Aligator" [ref=e84]: 🥑
        - generic [ref=e85]:
          - heading "Alpukat Aligator" [level=4] [ref=e86]
          - paragraph [ref=e87]: Varietas alpukat dengan kulit hijau kasar dan daging krem, cocok untuk pasar lokal maupun olahan.
      - article [ref=e88]:
        - img "Alpukat" [ref=e90]: 🥑
        - generic [ref=e91]:
          - heading "Alpukat" [level=4] [ref=e92]
          - paragraph [ref=e93]: Tanaman perkebunan unggul dengan produksi buah berkualitas dan pemeliharaan rutin di kebun terintegrasi.
      - article [ref=e94]:
        - img "Kelengkeng" [ref=e96]: 🍈
        - generic [ref=e97]:
          - heading "Kelengkeng" [level=4] [ref=e98]
          - paragraph [ref=e99]: Varietas unggul dengan jadwal panen terencana dan pencatatan perawatan melalui sistem FARMease.
      - article [ref=e100]:
        - img "Alpukat" [ref=e102]: 🥑
        - generic [ref=e103]:
          - heading "Alpukat" [level=4] [ref=e104]
          - paragraph [ref=e105]: Mendukung monitoring pertumbuhan pohon dan dokumentasi aktivitas pemupukan hingga panen.
      - article [ref=e106]:
        - img "Kelengkeng" [ref=e108]: 🍈
        - generic [ref=e109]:
          - heading "Kelengkeng" [level=4] [ref=e110]
          - paragraph [ref=e111]: Bagian dari diversifikasi kebun yang dikelola bersama modul perkebunan terintegrasi.
    - contentinfo [ref=e112]:
      - heading "Hubungi Kami" [level=2] [ref=e113]
      - generic [ref=e115]:
        - generic [ref=e116]:
          - heading "Say Hi Agro Farm" [level=3] [ref=e117]
          - paragraph [ref=e118]: Informasi lebih lanjut
        - generic [ref=e119]:
          - generic [ref=e120]:
            - heading "Jadwal Operasional" [level=4] [ref=e121]
            - generic [ref=e122]:
              - generic [ref=e123]:
                - img [ref=e124]
                - generic [ref=e126]:
                  - text: Senin – Sabtu
                  - text: 08.00 – 16.00
              - generic [ref=e127]:
                - img [ref=e128]
                - generic [ref=e131]: Muara Jambi
          - generic [ref=e132]:
            - heading "Kontak" [level=4] [ref=e133]
            - generic [ref=e134]:
              - generic [ref=e135]:
                - img [ref=e136]
                - generic [ref=e138]: +6208xxxxxxxxxx
              - generic [ref=e139]:
                - img [ref=e140]
                - generic [ref=e143]: xxx@gmail.com
          - generic [ref=e144]:
            - heading "Media Sosial" [level=4] [ref=e145]
            - generic [ref=e146]:
              - link "Instagram" [ref=e147] [cursor=pointer]:
                - /url: "#"
                - img [ref=e148]
              - link "Facebook" [ref=e150] [cursor=pointer]:
                - /url: "#"
                - img [ref=e151]
  - generic [ref=e153]:
    - generic "Toggle devtools panel" [ref=e154] [cursor=pointer]:
      - img [ref=e155]
    - generic "Toggle Component Inspector" [ref=e160] [cursor=pointer]:
      - img [ref=e161]
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
      |                   ^ Error: locator.click: Test timeout of 30000ms exceeded.
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