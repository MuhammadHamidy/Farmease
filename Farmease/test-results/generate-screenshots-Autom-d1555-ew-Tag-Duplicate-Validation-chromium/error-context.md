# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-03a & TC-03b: Register New Tag & Duplicate Validation
- Location: tests\e2e\generate-screenshots.spec.ts:133:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Tambah Domba")').first()

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
      - alert [ref=e30]:
        - paragraph [ref=e31]: Memuat data ternak...
      - generic [ref=e34]:
        - heading "Daftar Ternak & Kode Kandang" [level=5] [ref=e35]
        - paragraph [ref=e36]: Berikut adalah daftar ternak yang terdaftar di sistem Farmease.
      - generic [ref=e37]:
        - generic [ref=e39]:
          - generic [ref=e40]:
            - heading "Daftar Semua Ternak" [level=4] [ref=e41]
            - paragraph [ref=e42]: Cari dan pantau seluruh ternak aktif pada semua kandang
          - button "Menyimpan..." [disabled] [ref=e43] [cursor=pointer]:
            - img [ref=e44]
            - text: Menyimpan...
        - generic [ref=e45]:
          - generic [ref=e46]:
            - generic [ref=e48]:
              - generic:
                - img
              - textbox "Cari ID, jenis, status..." [ref=e49]
            - generic [ref=e52] [cursor=pointer]:
              - generic [ref=e53]: Semua Kandang
              - img
            - generic [ref=e56] [cursor=pointer]:
              - generic [ref=e57]: Semua Kondisi / Status
              - img
          - generic [ref=e58]:
            - button "Aktif (0)" [ref=e59] [cursor=pointer]
            - button "Riwayat Keluar (0)" [ref=e60] [cursor=pointer]
        - paragraph [ref=e63]: Memuat data ternak...
  - generic [ref=e64]:
    - generic "Toggle devtools panel" [ref=e65] [cursor=pointer]:
      - img [ref=e66]
    - generic "Toggle Component Inspector" [ref=e71] [cursor=pointer]:
      - img [ref=e72]
```

# Test source

```ts
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
> 139 |     await addBtn.click();
      |                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  206 |     await selectOption(page, 'Rincian Pencatatan', 'Timbang Rutin');
  207 |     await page.locator('button:has-text("Selanjutnya")').click();
  208 |     await page.waitForTimeout(1500);
  209 | 
  210 |     await selectOption(page, 'Pilih Kandang', 'KND-04');
  211 |     await selectOption(page, 'ID Domba', 'XG894');
  212 |     await page.locator('input[placeholder*="0.0"], input[type="number"]').first().fill('30');
  213 |     await page.waitForTimeout(1000);
  214 | 
  215 |     await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
  216 |     await page.waitForTimeout(1000);
  217 |     await page.locator('button:has-text("Selesai")').first().click();
  218 |     await page.waitForTimeout(1500);
  219 | 
  220 |     // Save again same day
  221 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  222 |     await page.waitForTimeout(1000);
  223 |     await selectOption(page, 'Jenis Pencatatan', 'Berat Badan');
  224 |     await selectOption(page, 'Rincian Pencatatan', 'Timbang Rutin');
  225 |     await page.locator('button:has-text("Selanjutnya")').click();
  226 |     await page.waitForTimeout(1500);
  227 |     await selectOption(page, 'Pilih Kandang', 'KND-04');
  228 |     await selectOption(page, 'ID Domba', 'XG894');
  229 |     await page.locator('input[placeholder*="0.0"], input[type="number"]').first().fill('32');
  230 |     await page.waitForTimeout(1000);
  231 | 
  232 |     await takeScreenshot(page, 'tc-05b-adg-nol');
  233 |   });
  234 | 
  235 |   test('TC-07a & TC-07b: Mutation Status Mati', async ({ page }) => {
  236 |     await loginAsOperator(page);
  237 |     await page.goto('http://localhost:3001/ternak/daftar');
  238 |     await page.waitForTimeout(1500);
  239 | 
```