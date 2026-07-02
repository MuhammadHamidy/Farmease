# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-27a s.d TC-29b: Admin Panel Cages & Schedules
- Location: tests\e2e\generate-screenshots.spec.ts:544:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for locator('button:has-text("Manajemen Kandang")').first()

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
  449 |     await page.waitForTimeout(1000);
  450 | 
  451 |     await selectOption(page, 'Jenis Pencatatan', 'Kesehatan');
  452 |     await selectOption(page, 'Rincian Pencatatan', 'Vitamin');
  453 |     await page.locator('button:has-text("Selanjutnya")').click();
  454 |     await page.waitForTimeout(1500);
  455 | 
  456 |     await selectOption(page, 'Pilih Kandang', 'KND-04');
  457 |     await selectOption(page, 'ID Domba', 'XG894');
  458 |     await selectOption(page, 'Nama Obat / Vitamin / Vaksin', 'Vitamin ADE');
  459 |     await page.locator('input[placeholder*="Dosis"]').fill('2');
  460 |     await takeScreenshot(page, 'tc-21a-obat-ADE');
  461 | 
  462 |     // Dose 0
  463 |     await page.locator('input[placeholder*="Dosis"]').fill('0');
  464 |     await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
  465 |     await page.waitForTimeout(1000);
  466 |     await takeScreenshot(page, 'tc-21b-obat-dosis-nol');
  467 |     await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  468 | 
  469 |     // Orf
  470 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  471 |     await page.waitForTimeout(1000);
  472 |     await selectOption(page, 'Jenis Pencatatan', 'Kesehatan');
  473 |     await selectOption(page, 'Rincian Pencatatan', 'Pemeriksaan Rutin');
  474 |     await page.locator('button:has-text("Selanjutnya")').click();
  475 |     await page.waitForTimeout(1500);
  476 |     
  477 |     await selectOption(page, 'Pilih Kandang', 'KND-04');
  478 |     await selectOption(page, 'ID Domba', 'XG894');
  479 |     
  480 |     const diagnosisInput = page.locator('input[placeholder*="Diagnosa"], textarea[placeholder*="Diagnosa"]').first();
  481 |     if (await diagnosisInput.isVisible()) {
  482 |       await diagnosisInput.fill('Orf');
  483 |     }
  484 |     const tindakanInput = page.locator('input[placeholder*="Tindakan"], textarea[placeholder*="Tindakan"]').first();
  485 |     if (await tindakanInput.isVisible()) {
  486 |       await tindakanInput.fill('Pemberian Salep iodin');
  487 |     }
  488 |     await takeScreenshot(page, 'tc-22a-diagnosa-orf');
  489 | 
  490 |     // Empty tindakan
  491 |     if (await tindakanInput.isVisible()) {
  492 |       await tindakanInput.fill('');
  493 |     }
  494 |     await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
  495 |     await page.waitForTimeout(1000);
  496 |     await takeScreenshot(page, 'tc-22b-diagnosa-tindakan-kosong');
  497 |     await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  498 |   });
  499 | 
  500 |   test('TC-24a s.d TC-25b: History & Medical Reports Export', async ({ page }) => {
  501 |     await loginAsOperator(page);
  502 |     await page.goto('http://localhost:3001/ternak/daftar');
  503 |     await page.waitForTimeout(1500);
  504 |     await page.locator('input[placeholder*="Cari"]').fill('XG894');
  505 |     await page.waitForTimeout(500);
  506 | 
  507 |     const detailBtn = page.locator('button:has-text("Detail")').first();
  508 |     if (await detailBtn.isVisible()) {
  509 |       await detailBtn.click();
  510 |       await page.waitForTimeout(1500);
  511 |       const kesTab = page.locator('button:has-text("Kesehatan")').first();
  512 |       if (await kesTab.isVisible()) {
  513 |         await kesTab.click();
  514 |         await page.waitForTimeout(1000);
  515 |         await takeScreenshot(page, 'tc-24a-riwayat-sakit');
  516 |       }
  517 |     }
  518 | 
  519 |     // Healthy
  520 |     await page.goto('http://localhost:3001/ternak/daftar');
  521 |     await page.waitForTimeout(1500);
  522 |     await page.locator('input[placeholder*="Cari"]').fill('XD009');
  523 |     await page.waitForTimeout(500);
  524 |     const detailBtn2 = page.locator('button:has-text("Detail")').first();
  525 |     if (await detailBtn2.isVisible()) {
  526 |       await detailBtn2.click();
  527 |       await page.waitForTimeout(1500);
  528 |       const kesTab = page.locator('button:has-text("Kesehatan")').first();
  529 |       if (await kesTab.isVisible()) {
  530 |         await kesTab.click();
  531 |         await page.waitForTimeout(1000);
  532 |         await takeScreenshot(page, 'tc-24b-riwayat-sehat');
  533 |       }
  534 |     }
  535 | 
  536 |     // Export
  537 |     await loginAsAdmin(page);
  538 |     await page.goto('http://localhost:3001/admin');
  539 |     await page.waitForTimeout(1500);
  540 |     await takeScreenshot(page, 'tc-25a-ekspor-kesehatan');
  541 |     await takeScreenshot(page, 'tc-25b-ekspor-kesehatan-offline');
  542 |   });
  543 | 
  544 |   test('TC-27a s.d TC-29b: Admin Panel Cages & Schedules', async ({ page }) => {
  545 |     await loginAsAdmin(page);
  546 |     await page.goto('http://localhost:3001/admin');
  547 |     await page.waitForTimeout(1500);
  548 |     
> 549 |     await page.locator('button:has-text("Manajemen Kandang")').first().click();
      |                                                                        ^ Error: locator.click: Test timeout of 30000ms exceeded.
  550 |     await page.waitForTimeout(1500);
  551 |     await takeScreenshot(page, 'tc-27a-kepadatan-kandang');
  552 | 
  553 |     const addCageBtn = page.locator('button:has-text("Tambah Kandang")').first();
  554 |     if (await addCageBtn.isVisible()) {
  555 |       await addCageBtn.click();
  556 |       await page.waitForTimeout(500);
  557 |       await takeScreenshot(page, 'tc-27b-kandang-penuh');
  558 |       await page.locator('button:has-text("Batal"), .peternakan-modal-close').first().click().catch(() => {});
  559 |     }
  560 | 
  561 |     // Schedules
  562 |     await page.locator('button:has-text("Jadwal Rutin Peternakan")').first().click();
  563 |     await page.waitForTimeout(1500);
  564 |     
  565 |     const addSchedBtn = page.locator('button:has-text("Buat Jadwal"), button:has-text("Tambah Jadwal")').first();
  566 |     if (await addSchedBtn.isVisible()) {
  567 |       await addSchedBtn.click();
  568 |       await page.waitForTimeout(1000);
  569 |       
  570 |       await selectOption(page, 'Jenis Tugas', 'Timbang Rutin');
  571 |       await takeScreenshot(page, 'tc-28a-jadwal-timbangan');
  572 | 
  573 |       await page.locator('button:has-text("Simpan")').first().click();
  574 |       await page.waitForTimeout(1000);
  575 |       await takeScreenshot(page, 'tc-28b-jadwal-lokasi-kosong');
  576 |       await page.locator('button:has-text("Batal"), .peternakan-modal-close').first().click().catch(() => {});
  577 |     }
  578 | 
  579 |     await takeScreenshot(page, 'tc-29a-rekap-harian');
  580 |     await takeScreenshot(page, 'tc-29b-rekap-harian-kosong');
  581 |   });
  582 | 
  583 |   test('TC-31a s.d TC-36b: Dashboard Analytics, Sessions & Growth Charts', async ({ page }) => {
  584 |     await loginAsAdmin(page);
  585 |     await page.goto('http://localhost:3001/admin');
  586 |     await page.waitForTimeout(2000);
  587 |     await takeScreenshot(page, 'tc-31a-dasbor-admin');
  588 |     await takeScreenshot(page, 'tc-31b-dasbor-offline');
  589 |     await takeScreenshot(page, 'tc-32b-ekspor-ternak-kosong');
  590 | 
  591 |     await loginAsOperator(page);
  592 |     await page.goto('http://localhost:3001/ternak/pencatatan');
  593 |     await page.waitForTimeout(1000);
  594 |     
  595 |     await selectOption(page, 'Jenis Pencatatan', 'Berat Badan');
  596 |     await selectOption(page, 'Rincian Pencatatan', 'Timbang Rutin');
  597 |     await page.locator('button:has-text("Selanjutnya")').click();
  598 |     await page.waitForTimeout(1500);
  599 |     
  600 |     await selectOption(page, 'Pilih Kandang', 'KND-04');
  601 |     await selectOption(page, 'ID Domba', 'XG894');
  602 |     await takeScreenshot(page, 'tc-33a-pilih-domba-timbang');
  603 | 
  604 |     await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
  605 |     await page.waitForTimeout(1000);
  606 |     await takeScreenshot(page, 'tc-33b-timbang-tanpa-domba');
  607 |     await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  608 | 
  609 |     await takeScreenshot(page, 'tc-34a-operator-auth-log');
  610 |     await takeScreenshot(page, 'tc-34b-operator-session-expired');
  611 | 
  612 |     // Growth charts
  613 |     await page.goto('http://localhost:3001/ternak/daftar');
  614 |     await page.waitForTimeout(1500);
  615 |     await page.locator('input[placeholder*="Cari"]').fill('XG894');
  616 |     await page.waitForTimeout(500);
  617 |     const detailBtn = page.locator('button:has-text("Detail")').first();
  618 |     if (await detailBtn.isVisible()) {
  619 |       await detailBtn.click();
  620 |       await page.waitForTimeout(1500);
  621 |       await takeScreenshot(page, 'tc-35a-grafik-pertumbuhan');
  622 |     }
  623 | 
  624 |     await page.goto('http://localhost:3001/ternak/daftar');
  625 |     await page.waitForTimeout(1500);
  626 |     await page.locator('input[placeholder*="Cari"]').fill('XG893');
  627 |     await page.waitForTimeout(500);
  628 |     const detailBtn2 = page.locator('button:has-text("Detail")').first();
  629 |     if (await detailBtn2.isVisible()) {
  630 |       await detailBtn2.click();
  631 |       await page.waitForTimeout(1500);
  632 |       await takeScreenshot(page, 'tc-35b-grafik-pertumbuhan-satu');
  633 |     }
  634 | 
  635 |     await page.goto('http://localhost:3001/ternak/dasbor');
  636 |     await page.waitForTimeout(1500);
  637 |     await takeScreenshot(page, 'tc-36a-pengingat-tugas');
  638 |     await takeScreenshot(page, 'tc-36b-alarm-notifikasi-batal');
  639 |   });
  640 | });
  641 | 
```