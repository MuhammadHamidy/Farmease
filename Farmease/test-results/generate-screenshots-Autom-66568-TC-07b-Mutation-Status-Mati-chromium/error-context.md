# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-07a & TC-07b: Mutation Status Mati
- Location: tests\e2e\generate-screenshots.spec.ts:235:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.fill: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('input[placeholder*="Cari"]')

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
  240 |     // Choose detail of DM-NEW-99
> 241 |     await page.locator('input[placeholder*="Cari"]').fill('DM-NEW-99');
      |                                                      ^ Error: locator.fill: Test timeout of 30000ms exceeded.
  242 |     await page.waitForTimeout(500);
  243 |     const detailBtn = page.locator('button:has-text("Detail")').first();
  244 |     if (await detailBtn.isVisible()) {
  245 |       await detailBtn.click();
  246 |       await page.waitForTimeout(1500);
  247 | 
  248 |       const editProfileBtn = page.locator('button:has-text("Ubah Profil")').first();
  249 |       await editProfileBtn.click();
  250 |       await page.waitForTimeout(1000);
  251 | 
  252 |       await selectOption(page, 'Status', 'Mati');
  253 |       await takeScreenshot(page, 'tc-07a-mutasi-status');
  254 | 
  255 |       await page.locator('button:has-text("Simpan")').first().click();
  256 |       await page.waitForTimeout(1500);
  257 | 
  258 |       await takeScreenshot(page, 'tc-07b-mati-disabled');
  259 |     }
  260 |   });
  261 | 
  262 |   test('TC-08a & TC-08b: Sire and Dam Selection validation', async ({ page }) => {
  263 |     await loginAsOperator(page);
  264 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  265 |     await page.waitForTimeout(1000);
  266 | 
  267 |     await selectOption(page, 'Jenis Pencatatan', 'Kelahiran');
  268 |     await selectOption(page, 'Rincian Pencatatan', 'Lahir Normal');
  269 |     await page.locator('button:has-text("Selanjutnya")').click();
  270 |     await page.waitForTimeout(1500);
  271 | 
  272 |     await selectOption(page, 'Pilih Kandang', 'KND-01');
  273 |     await selectOption(page, 'ID Domba Betina', 'XG893');
  274 |     await selectOption(page, 'Pilih Pejantan Pasangan', 'D177');
  275 |     await takeScreenshot(page, 'tc-08a-relasi-silsilah');
  276 | 
  277 |     // Click dropdown to show exclusion of female dam from sire list
  278 |     await page.locator('div', { has: page.locator(`text=Pilih Pejantan Pasangan`) }).locator('.custom-select').first().click();
  279 |     await page.waitForTimeout(500);
  280 |     await takeScreenshot(page, 'tc-08b-silsilah-duplikat');
  281 |   });
  282 | 
  283 |   test('TC-10b: Mating weight validation (Negatif)', async ({ page }) => {
  284 |     await loginAsOperator(page);
  285 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  286 |     await page.waitForTimeout(1000);
  287 | 
  288 |     await selectOption(page, 'Jenis Pencatatan', 'Perkawinan');
  289 |     await selectOption(page, 'Rincian Pencatatan', 'Kawin Alam');
  290 |     await page.locator('button:has-text("Selanjutnya")').click();
  291 |     await page.waitForTimeout(1500);
  292 | 
  293 |     await selectOption(page, 'Pilih Kandang', 'KND-01');
  294 |     // Bocil (XD009) has no weight
  295 |     await selectOption(page, 'ID Domba Betina', 'XD009');
  296 |     await selectOption(page, 'Pilih Pasangan (Pejantan Luar Kandang)', 'D177');
  297 | 
  298 |     await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
  299 |     await page.waitForTimeout(1000);
  300 |     await takeScreenshot(page, 'tc-10b-kawin-tanpa-bobot');
  301 |     await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  302 |   });
  303 | 
  304 |   test('TC-11a & TC-11b: Birth Alerts & Keguguran', async ({ page }) => {
  305 |     await loginAsOperator(page);
  306 |     await page.goto('http://localhost:3001/ternak/dasbor');
  307 |     await page.waitForTimeout(1500);
  308 | 
  309 |     await takeScreenshot(page, 'tc-11a-birth-alerts');
  310 | 
  311 |     // Click Lapor Keguguran
  312 |     const laporBtn = page.locator('button:has-text("Lapor Keguguran")').first();
  313 |     if (await laporBtn.isVisible()) {
  314 |       await laporBtn.click();
  315 |       await page.waitForTimeout(1000);
  316 |       await takeScreenshot(page, 'tc-11b-keguguran');
  317 |       await page.locator('button:has-text("Batal"), button:has-text("Tutup")').first().click().catch(() => {});
  318 |     } else {
  319 |       await takeScreenshot(page, 'tc-11b-keguguran');
  320 |     }
  321 |   });
  322 | 
  323 |   test('TC-12a & TC-12b: Birth data input verification', async ({ page }) => {
  324 |     await loginAsOperator(page);
  325 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  326 |     await page.waitForTimeout(1000);
  327 | 
  328 |     await selectOption(page, 'Jenis Pencatatan', 'Kelahiran');
  329 |     await selectOption(page, 'Rincian Pencatatan', 'Lahir Normal');
  330 |     await page.locator('button:has-text("Selanjutnya")').click();
  331 |     await page.waitForTimeout(1500);
  332 | 
  333 |     await selectOption(page, 'Pilih Kandang', 'KND-01');
  334 |     await selectOption(page, 'ID Domba Betina', 'XG893');
  335 |     await selectOption(page, 'Pilih Pejantan Pasangan', 'D177');
  336 | 
  337 |     await page.locator('input[placeholder*="Jumlah anak"]').fill('2');
  338 |     await page.locator('input[placeholder*="Nama/Kode Anak"]').fill('Lamb-Uji-A, Lamb-Uji-B');
  339 |     await page.locator('input[placeholder*="Berat Lahir"]').fill('2.5');
  340 |     await takeScreenshot(page, 'tc-12a-kelahiran-sukses');
  341 | 
```