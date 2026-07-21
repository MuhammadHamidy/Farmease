# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-24a s.d TC-25b: History & Medical Reports Export
- Location: tests\e2e\generate-screenshots.spec.ts:500:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Target page, context or browser has been closed
```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e4]:
    - generic [ref=e5]:
      - button "← Kembali" [ref=e6] [cursor=pointer]
      - img "FARMease" [ref=e7]
    - generic [ref=e8]:
      - heading "Selamat Datang" [level=2] [ref=e9]
      - paragraph [ref=e10]: Silahkan pilih kategori yang ingin dikelola!
    - generic [ref=e11]:
      - button "Peternakan Kelola Peternakan Masuk untuk memantau peternakan" [ref=e12] [cursor=pointer]:
        - img "Peternakan" [ref=e14]
        - heading "Kelola Peternakan" [level=3] [ref=e15]
        - paragraph [ref=e16]: Masuk untuk memantau peternakan
      - button "Perkebunan Kelola Perkebunan Masuk untuk memantau perkebunan" [ref=e17] [cursor=pointer]:
        - img "Perkebunan" [ref=e19]
        - heading "Kelola Perkebunan" [level=3] [ref=e20]
        - paragraph [ref=e21]: Masuk untuk memantau perkebunan
  - generic [ref=e22]:
    - generic "Toggle devtools panel" [ref=e23] [cursor=pointer]:
      - img [ref=e24]
    - generic "Toggle Component Inspector" [ref=e29] [cursor=pointer]:
      - img [ref=e30]
```

# Test source

```ts
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
  21  |   await selectBox.click();
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
> 105 |   await page.waitForTimeout(2000);
      |              ^ Error: page.waitForTimeout: Target page, context or browser has been closed
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
  122 |     }
  123 |     
  124 |     await page.waitForURL(/localhost:3000/, { timeout: 5000 }).catch(() => {});
  125 |     await page.waitForTimeout(1000);
  126 |     await takeScreenshot(page, 'tc-02a-logout');
  127 | 
  128 |     await page.goto('http://localhost:3001/ternak');
  129 |     await page.waitForTimeout(1500);
  130 |     await takeScreenshot(page, 'tc-02b-middleware');
  131 |   });
  132 | 
  133 |   test('TC-03a & TC-03b: Register New Tag & Duplicate Validation', async ({ page }) => {
  134 |     await loginAsOperator(page);
  135 |     await page.goto('http://localhost:3001/ternak/daftar');
  136 |     await page.waitForTimeout(1500);
  137 |     
  138 |     const addBtn = page.locator('button:has-text("Tambah Domba")').first();
  139 |     await addBtn.click();
  140 |     await page.waitForTimeout(1000);
  141 |     
  142 |     await page.locator('input[placeholder*="Kode Domba"]').fill('DM-NEW-99');
  143 |     await page.locator('input[placeholder*="Nama Domba"]').fill('Domba Uji Baru');
  144 |     await takeScreenshot(page, 'tc-03a-add-sheep');
  145 | 
  146 |     await page.locator('button:has-text("Simpan")').first().click();
  147 |     await page.waitForTimeout(1500);
  148 | 
  149 |     await addBtn.click();
  150 |     await page.waitForTimeout(1000);
  151 | 
  152 |     await page.locator('input[placeholder*="Kode Domba"]').fill('DM-NEW-99');
  153 |     await page.locator('input[placeholder*="Nama Domba"]').fill('Domba Duplikat');
  154 |     await page.locator('button:has-text("Simpan")').first().click();
  155 |     await page.waitForTimeout(1000);
  156 | 
  157 |     await takeScreenshot(page, 'tc-03b-ear-tag-duplicate');
  158 |     await page.locator('button:has-text("Batal"), .peternakan-modal-close').first().click().catch(() => {});
  159 |   });
  160 | 
  161 |   test('TC-04a & TC-04b: Pedigree Tree Display', async ({ page }) => {
  162 |     await loginAsOperator(page);
  163 |     
  164 |     // Tania (XG882) has complete pedigree
  165 |     await page.goto('http://localhost:3001/ternak/daftar');
  166 |     await page.waitForTimeout(1500);
  167 |     await page.locator('input[placeholder*="Cari"]').fill('XG882');
  168 |     await page.waitForTimeout(500);
  169 | 
  170 |     const detailBtn = page.locator('button:has-text("Detail")').first();
  171 |     if (await detailBtn.isVisible()) {
  172 |       await detailBtn.click();
  173 |       await page.waitForTimeout(1500);
  174 |       const pedigreeTab = page.locator('button:has-text("Silsilah")').first();
  175 |       if (await pedigreeTab.isVisible()) {
  176 |         await pedigreeTab.click();
  177 |         await page.waitForTimeout(1000);
  178 |         await takeScreenshot(page, 'tc-04a-silsilah-lengkap');
  179 |       }
  180 |     }
  181 | 
  182 |     // Bocil (XD009) has incomplete parent pedigree
  183 |     await page.goto('http://localhost:3001/ternak/daftar');
  184 |     await page.waitForTimeout(1500);
  185 |     await page.locator('input[placeholder*="Cari"]').fill('XD009');
  186 |     await page.waitForTimeout(500);
  187 |     const detailBtn2 = page.locator('button:has-text("Detail")').first();
  188 |     if (await detailBtn2.isVisible()) {
  189 |       await detailBtn2.click();
  190 |       await page.waitForTimeout(1500);
  191 |       const pedigreeTab = page.locator('button:has-text("Silsilah")').first();
  192 |       if (await pedigreeTab.isVisible()) {
  193 |         await pedigreeTab.click();
  194 |         await page.waitForTimeout(1000);
  195 |         await takeScreenshot(page, 'tc-04b-silsilah-kosong');
  196 |       }
  197 |     }
  198 |   });
  199 | 
  200 |   test('TC-05b: Weight ADG Calculation (Zero Days)', async ({ page }) => {
  201 |     await loginAsOperator(page);
  202 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  203 |     await page.waitForTimeout(1000);
  204 | 
  205 |     await selectOption(page, 'Jenis Pencatatan', 'Berat Badan');
```