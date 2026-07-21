# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: generate-screenshots.spec.ts >> Automated Screenshot Generator for All TA Test Cases >> TC-31a s.d TC-36b: Dashboard Analytics, Sessions & Growth Charts
- Location: tests\e2e\generate-screenshots.spec.ts:583:3

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
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
        - button "Keluar / Logout" [ref=e18] [cursor=pointer]:
          - img [ref=e19]
    - navigation [ref=e22]:
      - generic [ref=e23]:
        - link "Dasbor" [ref=e24] [cursor=pointer]:
          - /url: /ternak/dasbor
        - link "Daftar Ternak" [ref=e25] [cursor=pointer]:
          - /url: /ternak/daftar
        - link "Pencatatan" [ref=e26] [cursor=pointer]:
          - /url: /ternak/pencatatan
        - link "Riwayat" [ref=e27] [cursor=pointer]:
          - /url: /ternak/riwayat
        - link "Gudang" [ref=e28] [cursor=pointer]:
          - /url: /ternak/gudang
    - generic [ref=e30]:
      - generic [ref=e33]:
        - heading "Dashboard Semua Kandang" [level=3] [ref=e35]
        - paragraph [ref=e36]: Memantau populasi ternak, kesehatan, serta penyelesaian tugas harian di peternakan Farmease.
      - generic [ref=e37]:
        - generic [ref=e38]:
          - heading "Filter Tampilan Dasbor" [level=5] [ref=e39]
          - paragraph [ref=e40]: Pilih kandang spesifik untuk menyaring ringkasan populasi, tugas rutin harian, dan grafik pendukung keputusan.
        - generic [ref=e41]:
          - generic [ref=e42]: "Kandang Aktif:"
          - generic [ref=e44] [cursor=pointer]:
            - generic [ref=e45]: Semua Kandang
            - img
      - generic [ref=e46]:
        - generic [ref=e48]:
          - generic [ref=e49]:
            - img "Populasi" [ref=e50]
            - heading "Ringkasan Populasi Ternak" [level=4] [ref=e51]
          - paragraph [ref=e52]: Klik pada baris status untuk melihat daftar domba secara detail.
          - table [ref=e54] [cursor=pointer]:
            - rowgroup [ref=e55]:
              - row "Status Kesehatan Jumlah Aksi" [ref=e56]:
                - columnheader "Status Kesehatan" [ref=e57]
                - columnheader "Jumlah" [ref=e58]
                - columnheader "Aksi" [ref=e59]
            - rowgroup [ref=e60]:
              - row "Total Populasi Ternak 0 Ekor Lihat →" [ref=e61]:
                - cell "Total Populasi Ternak" [ref=e62]:
                  - generic [ref=e63]:
                    - img [ref=e65]
                    - generic [ref=e66]: Total Populasi Ternak
                - cell "0 Ekor" [ref=e67]
                - cell "Lihat →" [ref=e68]
              - row "Domba Sehat 0 Ekor Lihat →" [ref=e69]:
                - cell "Domba Sehat" [ref=e70]:
                  - generic [ref=e71]:
                    - img [ref=e73]
                    - generic [ref=e74]: Domba Sehat
                - cell "0 Ekor" [ref=e75]
                - cell "Lihat →" [ref=e76]
              - row "Domba Hamil 0 Ekor Lihat →" [ref=e77]:
                - cell "Domba Hamil" [ref=e78]:
                  - generic [ref=e79]:
                    - img [ref=e81]
                    - generic [ref=e82]: Domba Hamil
                - cell "0 Ekor" [ref=e83]
                - cell "Lihat →" [ref=e84]
              - row "Domba Birahi 0 Ekor Lihat →" [ref=e85]:
                - cell "Domba Birahi" [ref=e86]:
                  - generic [ref=e87]:
                    - img [ref=e89]
                    - generic [ref=e90]: Domba Birahi
                - cell "0 Ekor" [ref=e91]
                - cell "Lihat →" [ref=e92]
              - row "Domba Sakit 0 Ekor Lihat →" [ref=e93]:
                - cell "Domba Sakit" [ref=e94]:
                  - generic [ref=e95]:
                    - img [ref=e97]
                    - generic [ref=e98]: Domba Sakit
                - cell "0 Ekor" [ref=e99]
                - cell "Lihat →" [ref=e100]
        - generic [ref=e102]:
          - generic [ref=e103]:
            - generic [ref=e104]:
              - generic [ref=e105]:
                - img "Task" [ref=e106]
                - heading "Tugas Rutin Peternakan" [level=4] [ref=e107]
              - paragraph [ref=e108]: Klik kartu tugas untuk melihat detail dan panduan kerja.
            - generic [ref=e109]:
              - generic [ref=e110]: Hari Ini
              - generic [ref=e111]: "Tugas Harian: 0/0 Selesai"
          - generic [ref=e112]: Memuat tugas...
      - generic [ref=e113]:
        - generic [ref=e115]:
          - generic [ref=e117]:
            - generic [ref=e118]:
              - img "Statistik" [ref=e119]
              - heading "Perkembangan Rata-Rata Berat Badan" [level=4] [ref=e120]
            - paragraph [ref=e121]: Tren kenaikan berat badan domba di Kandang — (5 Bulan Terakhir)
          - generic [ref=e122]:
            - generic [ref=e124]:
              - generic [ref=e125]: Rata-Rata Berat
              - heading "67.5 kg" [level=4] [ref=e126]
            - generic [ref=e128]:
              - generic [ref=e129]: Pertumbuhan
              - heading "+28.7 kg (74%)" [level=4] [ref=e130]
            - generic [ref=e132]:
              - generic [ref=e133]: Total Populasi
              - heading "45 / 42 Ekor" [level=4] [ref=e134]
          - img [ref=e136]:
            - generic [ref=e137]: 0 kg
            - generic [ref=e138]: 10 kg
            - generic [ref=e139]: 20 kg
            - generic [ref=e140]: 30 kg
            - generic [ref=e141]: 40 kg
            - generic [ref=e142]: 50 kg
            - generic [ref=e145]:
              - generic [ref=e147]: 38.8 kg
              - generic [ref=e148]: Mei
            - generic [ref=e149]:
              - generic [ref=e151]: 37.1 kg
              - generic [ref=e152]: Jun
            - generic [ref=e153]:
              - generic [ref=e155]: 67.5 kg
              - generic [ref=e156]: Jul
        - generic [ref=e158]:
          - generic [ref=e160]:
            - generic [ref=e161]:
              - img "Kandang" [ref=e162]
              - heading "Kondisi & Kepadatan Kandang" [level=4] [ref=e163]
            - paragraph [ref=e164]: Rasio kapasitas kandang dan persebaran status kesehatan domba
          - generic [ref=e165]:
            - generic [ref=e166]:
              - generic [ref=e167]:
                - generic [ref=e168]:
                  - generic [ref=e169]: Kandang Anakan
                  - generic [ref=e170]: "Tipe: Koloni (Grup)"
                - generic [ref=e172]: 14 / 15 Ekor (Padat)
              - generic [ref=e175]:
                - generic [ref=e177]:
                  - generic [ref=e178]: Sehat
                  - strong [ref=e179]: "8"
                - generic [ref=e181]:
                  - generic [ref=e182]: Hamil
                  - strong [ref=e183]: "0"
                - generic [ref=e185]:
                  - generic [ref=e186]: Birahi
                  - strong [ref=e187]: "6"
                - generic [ref=e189]:
                  - generic [ref=e190]: Sakit
                  - strong [ref=e191]: "0"
            - generic [ref=e192]:
              - generic [ref=e193]:
                - generic [ref=e194]:
                  - generic [ref=e195]: Kandang Indukan
                  - generic [ref=e196]: "Tipe: Koloni (Grup)"
                - generic [ref=e198]: 27 / 15 Ekor (Penuh (Overcap))
              - generic [ref=e201]:
                - generic [ref=e203]:
                  - generic [ref=e204]: Sehat
                  - strong [ref=e205]: "25"
                - generic [ref=e207]:
                  - generic [ref=e208]: Hamil
                  - strong [ref=e209]: "0"
                - generic [ref=e211]:
                  - generic [ref=e212]: Birahi
                  - strong [ref=e213]: "2"
                - generic [ref=e215]:
                  - generic [ref=e216]: Sakit
                  - strong [ref=e217]: "0"
            - generic [ref=e218]:
              - generic [ref=e219]:
                - generic [ref=e220]:
                  - generic [ref=e221]: Kandang Baterai A (Garut)
                  - generic [ref=e222]: "Tipe: Baterai (Individu)"
                - generic [ref=e224]: 2 / 1 Ekor (Penuh (Overcap))
              - generic [ref=e227]:
                - generic [ref=e229]:
                  - generic [ref=e230]: Sehat
                  - strong [ref=e231]: "2"
                - generic [ref=e233]:
                  - generic [ref=e234]: Hamil
                  - strong [ref=e235]: "0"
                - generic [ref=e237]:
                  - generic [ref=e238]: Birahi
                  - strong [ref=e239]: "0"
                - generic [ref=e241]:
                  - generic [ref=e242]: Sakit
                  - strong [ref=e243]: "0"
            - generic [ref=e244]:
              - generic [ref=e245]:
                - generic [ref=e246]:
                  - generic [ref=e247]: Kandang Baterai B (Garut)
                  - generic [ref=e248]: "Tipe: Baterai (Individu)"
                - generic [ref=e250]: 2 / 1 Ekor (Penuh (Overcap))
              - generic [ref=e253]:
                - generic [ref=e255]:
                  - generic [ref=e256]: Sehat
                  - strong [ref=e257]: "1"
                - generic [ref=e259]:
                  - generic [ref=e260]: Hamil
                  - strong [ref=e261]: "0"
                - generic [ref=e263]:
                  - generic [ref=e264]: Birahi
                  - strong [ref=e265]: "1"
                - generic [ref=e267]:
                  - generic [ref=e268]: Sakit
                  - strong [ref=e269]: "0"
            - generic [ref=e270]:
              - generic [ref=e271]:
                - generic [ref=e272]:
                  - generic [ref=e273]: Garut Super
                  - generic [ref=e274]: "Tipe: Baterai (Individu)"
                - generic [ref=e276]: 0 / 10 Ekor (Aman)
              - generic [ref=e278]:
                - generic [ref=e280]:
                  - generic [ref=e281]: Sehat
                  - strong [ref=e282]: "0"
                - generic [ref=e284]:
                  - generic [ref=e285]: Hamil
                  - strong [ref=e286]: "0"
                - generic [ref=e288]:
                  - generic [ref=e289]: Birahi
                  - strong [ref=e290]: "0"
                - generic [ref=e292]:
                  - generic [ref=e293]: Sakit
                  - strong [ref=e294]: "0"
      - generic [ref=e296]:
        - img "Welcome" [ref=e298]
        - heading "Selamat Datang!" [level=3] [ref=e299]
        - heading "operator_kandang" [level=5] [ref=e300]
        - generic [ref=e301]:
          - generic [ref=e302]: "ID: OPT-01"
          - generic [ref=e303]: Operator
        - paragraph [ref=e304]: Anda telah masuk ke dalam sistem **FARMease (Portal Peternakan)**. Seluruh fitur pencatatan pakan, pemantauan kesehatan, perkembangan reproduksi, dan tugas kandang harian siap digunakan untuk memudahkan aktivitas Anda hari ini.
        - button "Mulai Aktivitas" [ref=e305] [cursor=pointer]
      - generic [ref=e306]:
        - generic [ref=e307]: ✅
        - generic [ref=e308]:
          - generic [ref=e309]: Login Berhasil
          - generic [ref=e310]: Berhasil masuk ke portal Peternakan Farmease
  - generic [ref=e311]:
    - generic "Toggle devtools panel" [ref=e312] [cursor=pointer]:
      - img [ref=e313]
    - generic "Toggle Component Inspector" [ref=e318] [cursor=pointer]:
      - img [ref=e319]
```

# Test source

```ts
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
  549 |     await page.locator('button:has-text("Manajemen Kandang")').first().click();
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
> 593 |     await page.waitForTimeout(1000);
      |                ^ Error: page.waitForTimeout: Test timeout of 30000ms exceeded.
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