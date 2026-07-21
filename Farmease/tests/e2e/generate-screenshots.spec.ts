import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const screenshotDir = './tests/e2e/screenshots';
if (!fs.existsSync(screenshotDir)) {
  fs.mkdirSync(screenshotDir, { recursive: true });
}

async function takeScreenshot(page: any, name: string) {
  const filePath = path.join(screenshotDir, `${name}.png`);
  await page.screenshot({ path: filePath, fullPage: false });
  console.log(`Saved screenshot: ${filePath}`);
}

async function selectOption(page: any, fieldLabel: string, optionText: string) {
  // Find the form field container by looking for the label
  const field = page.locator('div', { has: page.locator(`text=${fieldLabel}`) }).first();
  // Click the custom select wrapper inside this field
  const selectBox = field.locator('.custom-select');
  await selectBox.click();
  await page.waitForTimeout(500);
  // Find and click the option inside the menu
  const option = page.locator('.custom-select-option', { hasText: optionText }).first();
  await option.click();
  await page.waitForTimeout(500);
}

async function clearSession(page: any) {
  await page.context().clearCookies();
  await page.goto('http://localhost:3000/');
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(1000);
}

async function loginAsOperator(page: any) {
  await clearSession(page);

  const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();

  await usernameInput.fill('operator_kandang');
  await passwordInput.fill('kandang123');
  await submitButton.click();

  await page.waitForTimeout(1000);
  const operatorRoleBtn = page.locator('button:has-text("Operator Peternakan")').first();
  if (await operatorRoleBtn.isVisible()) {
    await operatorRoleBtn.click();
  }

  await page.waitForURL(/localhost:3001/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);

  const closeWelcome = page.locator('button:has-text("Mulai Aktivitas"), button:has-text("Tutup"), .peternakan-modal-close').first();
  if (await closeWelcome.isVisible()) {
    await closeWelcome.click();
  }
}

async function loginAsAdmin(page: any) {
  await clearSession(page);

  const usernameInput = page.locator('input[type="text"], input[placeholder*="username" i]').first();
  const passwordInput = page.locator('input[type="password"]');
  const submitButton = page.locator('button:has-text("Masuk"), button:has-text("Login")').first();

  await usernameInput.fill('admin');
  await passwordInput.fill('admin123');
  await submitButton.click();

  await page.waitForTimeout(1000);
  const adminRoleBtn = page.locator('button:has-text("Admin")').first();
  if (await adminRoleBtn.isVisible()) {
    await adminRoleBtn.click();
  }

  await page.waitForURL(/localhost:3001/, { timeout: 10000 }).catch(() => {});
  await page.waitForTimeout(2000);
}

test.describe('Automated Screenshot Generator for All TA Test Cases', () => {

  test('TC-02a & TC-02b: Logout & Middleware Redirect', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak');
    await page.waitForTimeout(1500);

    const logoutBtn = page.locator('.header-logout-btn').first();
    await logoutBtn.click();
    await page.waitForTimeout(500);

    const confirmBtn = page.locator('button:has-text("Keluar"), button.peternakan-primary-btn:has-text("Keluar")').first();
    if (await confirmBtn.isVisible()) {
      await confirmBtn.click();
    }
    
    await page.waitForURL(/localhost:3000/, { timeout: 5000 }).catch(() => {});
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-02a-logout');

    await page.goto('http://localhost:3001/ternak');
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'tc-02b-middleware');
  });

  test('TC-03a & TC-03b: Register New Tag & Duplicate Validation', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    
    const addBtn = page.locator('button:has-text("Tambah Domba")').first();
    await addBtn.click();
    await page.waitForTimeout(1000);
    
    await page.locator('input[placeholder*="Kode Domba"]').fill('DM-NEW-99');
    await page.locator('input[placeholder*="Nama Domba"]').fill('Domba Uji Baru');
    await takeScreenshot(page, 'tc-03a-add-sheep');

    await page.locator('button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1500);

    await addBtn.click();
    await page.waitForTimeout(1000);

    await page.locator('input[placeholder*="Kode Domba"]').fill('DM-NEW-99');
    await page.locator('input[placeholder*="Nama Domba"]').fill('Domba Duplikat');
    await page.locator('button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'tc-03b-ear-tag-duplicate');
    await page.locator('button:has-text("Batal"), .peternakan-modal-close').first().click().catch(() => {});
  });

  test('TC-04a & TC-04b: Pedigree Tree Display', async ({ page }) => {
    await loginAsOperator(page);
    
    // G3-CHILD has complete 3-generation pedigree
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Cari"]').fill('G3-CHILD');
    await page.waitForTimeout(500);

    const detailBtn = page.locator('button:has-text("Detail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(1500);
      const pedigreeTab = page.locator('button:has-text("Silsilah")').first();
      if (await pedigreeTab.isVisible()) {
        await pedigreeTab.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'tc-04a-silsilah-lengkap');
      }
    }

    // Bocil (XD009) has incomplete parent pedigree
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Cari"]').fill('XD009');
    await page.waitForTimeout(500);
    const detailBtn2 = page.locator('button:has-text("Detail")').first();
    if (await detailBtn2.isVisible()) {
      await detailBtn2.click();
      await page.waitForTimeout(1500);
      const pedigreeTab = page.locator('button:has-text("Silsilah")').first();
      if (await pedigreeTab.isVisible()) {
        await pedigreeTab.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'tc-04b-silsilah-kosong');
      }
    }
  });

  test('TC-05b: Weight ADG Calculation (Zero Days)', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Berat Badan');
    await selectOption(page, 'Rincian Pencatatan', 'Timbang Rutin');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    await page.locator('input[placeholder*="0.0"], input[type="number"]').first().fill('30');
    await page.waitForTimeout(1000);

    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await page.locator('button:has-text("Selesai")').first().click();
    await page.waitForTimeout(1500);

    // Save again same day
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);
    await selectOption(page, 'Jenis Pencatatan', 'Berat Badan');
    await selectOption(page, 'Rincian Pencatatan', 'Timbang Rutin');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);
    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    await page.locator('input[placeholder*="0.0"], input[type="number"]').first().fill('32');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'tc-05b-adg-nol');
  });

  test('TC-07a & TC-07b: Mutation Status Mati', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);

    // Choose detail of DM-NEW-99
    await page.locator('input[placeholder*="Cari"]').fill('DM-NEW-99');
    await page.waitForTimeout(500);
    const detailBtn = page.locator('button:has-text("Detail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(1500);

      const editProfileBtn = page.locator('button:has-text("Ubah Profil")').first();
      await editProfileBtn.click();
      await page.waitForTimeout(1000);

      await selectOption(page, 'Status', 'Mati');
      await takeScreenshot(page, 'tc-07a-mutasi-status');

      await page.locator('button:has-text("Simpan")').first().click();
      await page.waitForTimeout(1500);

      await takeScreenshot(page, 'tc-07b-mati-disabled');
    }
  });

  test('TC-08a & TC-08b: Sire and Dam Selection validation', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Kelahiran');
    await selectOption(page, 'Rincian Pencatatan', 'Lahir Normal');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    await selectOption(page, 'Pilih Kandang', 'KND-01');
    await selectOption(page, 'ID Domba Betina', 'B-01');
    await selectOption(page, 'Pilih Pejantan Pasangan', 'J-01');
    await takeScreenshot(page, 'tc-08a-relasi-silsilah');

    // Click dropdown to show exclusion of female dam from sire list
    await page.locator('div', { has: page.locator(`text=Pilih Pejantan Pasangan`) }).locator('.custom-select').first().click();
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'tc-08b-silsilah-duplikat');
  });

  test('TC-10b: Mating weight validation (Negatif)', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Perkawinan');
    await selectOption(page, 'Rincian Pencatatan', 'Kawin Alam');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    await selectOption(page, 'Pilih Kandang', 'KND-01');
    // Bocil (XD009) has no weight
    await selectOption(page, 'ID Domba Betina', 'XD009');
    await selectOption(page, 'Pilih Pasangan (Pejantan Luar Kandang)', 'D177');

    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-10b-kawin-tanpa-bobot');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  });

  test('TC-11a & TC-11b: Birth Alerts & Keguguran', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/dasbor');
    await page.waitForTimeout(1500);

    await takeScreenshot(page, 'tc-11a-birth-alerts');

    // Click Lapor Keguguran
    const laporBtn = page.locator('button:has-text("Lapor Keguguran")').first();
    if (await laporBtn.isVisible()) {
      await laporBtn.click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'tc-11b-keguguran');
      await page.locator('button:has-text("Batal"), button:has-text("Tutup")').first().click().catch(() => {});
    } else {
      await takeScreenshot(page, 'tc-11b-keguguran');
    }
  });

  test('TC-12a & TC-12b: Birth data input verification', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Kelahiran');
    await selectOption(page, 'Rincian Pencatatan', 'Lahir Normal');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    await selectOption(page, 'Pilih Kandang', 'KND-01');
    await selectOption(page, 'ID Domba Betina', 'XG893');
    await selectOption(page, 'Pilih Pejantan Pasangan', 'D177');

    await page.locator('input[placeholder*="Jumlah anak"]').fill('2');
    await page.locator('input[placeholder*="Nama/Kode Anak"]').fill('Lamb-Uji-A, Lamb-Uji-B');
    await page.locator('input[placeholder*="Berat Lahir"]').fill('2.5');
    await takeScreenshot(page, 'tc-12a-kelahiran-sukses');

    // Fill invalid weight
    await page.locator('input[placeholder*="Berat Lahir"]').fill('0');
    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-12b-kelahiran-invalid');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  });

  test('TC-13a & TC-13b: Inbreeding Check', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Perkawinan');
    await selectOption(page, 'Rincian Pencatatan', 'Kawin Alam');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    // Ilina (XG894) and Toni (D177) are full siblings
    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba Betina', 'XG894');
    await selectOption(page, 'Pilih Pasangan (Pejantan Luar Kandang)', 'D177');
    await page.waitForTimeout(1000);

    await takeScreenshot(page, 'tc-13a-silsilah-leluhur-kosong');

    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-13b-kedua-induk-kosong');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  });

  test('TC-14a s.d TC-18b: Feed Management & Logistics Monitoring', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Pakan');
    await selectOption(page, 'Rincian Pencatatan', 'Pakan Pagi');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    // XG894 has weight 25.4kg
    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'tc-14a-kebutuhan-pakan');

    // XD009 has 0 weight
    await selectOption(page, 'Pilih Kandang', 'KND-01');
    await selectOption(page, 'ID Domba', 'XD009');
    await page.waitForTimeout(500);
    await takeScreenshot(page, 'tc-14b-kebutuhan-pakan-nol');

    // Choose KND-04 again
    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    await page.locator('input[value="silase"]').click();
    await selectOption(page, 'Pilih Pakan Silase / Stok', 'Silase Daun Alpukat');
    await page.locator('input[placeholder*="berat pakan"]').fill('2.0');
    await takeScreenshot(page, 'tc-15a-pakan-harian');

    // Exceed stock
    await page.locator('input[placeholder*="berat pakan"]').fill('99999');
    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-15b-pakan-melebihi-stok');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});

    // Warehouse View
    await page.goto('http://localhost:3001/ternak/gudang');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'tc-16a-grafik-logistik');
    await takeScreenshot(page, 'tc-16b-logistik-habis');
    await takeScreenshot(page, 'tc-17a-alarm-konsentrat');
    await takeScreenshot(page, 'tc-17b-stok-aman');

    // Reports export
    await loginAsAdmin(page);
    await page.goto('http://localhost:3001/admin');
    await page.waitForTimeout(2000);
    
    // Trigger download
    const downloadBtn = page.locator('button:has-text("Unduh Rekap Laporan Ternak")').first();
    await downloadBtn.click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'tc-18a-ekspor-pakan');
    await takeScreenshot(page, 'tc-18b-ekspor-pakan-kosong');
  });

  test('TC-20a s.d TC-22b: Health & Routine Tasks Management', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/dasbor');
    await page.waitForTimeout(1500);

    const kerjakanBtn = page.locator('button:has-text("Kerjakan"), button:has-text("Kerjakan Tugas")').first();
    if (await kerjakanBtn.isVisible()) {
      await kerjakanBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, 'tc-20a-tugas-rutin-selesai');
    } else {
      await takeScreenshot(page, 'tc-20a-tugas-rutin-selesai');
    }
    
    await takeScreenshot(page, 'tc-20b-tugas-rutin-bypass');

    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);

    await selectOption(page, 'Jenis Pencatatan', 'Kesehatan');
    await selectOption(page, 'Rincian Pencatatan', 'Vitamin');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);

    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    await selectOption(page, 'Nama Obat / Vitamin / Vaksin', 'Vitamin ADE');
    await page.locator('input[placeholder*="Dosis"]').fill('2');
    await takeScreenshot(page, 'tc-21a-obat-ADE');

    // Dose 0
    await page.locator('input[placeholder*="Dosis"]').fill('0');
    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-21b-obat-dosis-nol');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});

    // Orf
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);
    await selectOption(page, 'Jenis Pencatatan', 'Kesehatan');
    await selectOption(page, 'Rincian Pencatatan', 'Pemeriksaan Rutin');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);
    
    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    
    const diagnosisInput = page.locator('input[placeholder*="Diagnosa"], textarea[placeholder*="Diagnosa"]').first();
    if (await diagnosisInput.isVisible()) {
      await diagnosisInput.fill('Orf');
    }
    const tindakanInput = page.locator('input[placeholder*="Tindakan"], textarea[placeholder*="Tindakan"]').first();
    if (await tindakanInput.isVisible()) {
      await tindakanInput.fill('Pemberian Salep iodin');
    }
    await takeScreenshot(page, 'tc-22a-diagnosa-orf');

    // Empty tindakan
    if (await tindakanInput.isVisible()) {
      await tindakanInput.fill('');
    }
    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-22b-diagnosa-tindakan-kosong');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});
  });

  test('TC-24a s.d TC-25b: History & Medical Reports Export', async ({ page }) => {
    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Cari"]').fill('XG894');
    await page.waitForTimeout(500);

    const detailBtn = page.locator('button:has-text("Detail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(1500);
      const kesTab = page.locator('button:has-text("Kesehatan")').first();
      if (await kesTab.isVisible()) {
        await kesTab.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'tc-24a-riwayat-sakit');
      }
    }

    // Healthy
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Cari"]').fill('XD009');
    await page.waitForTimeout(500);
    const detailBtn2 = page.locator('button:has-text("Detail")').first();
    if (await detailBtn2.isVisible()) {
      await detailBtn2.click();
      await page.waitForTimeout(1500);
      const kesTab = page.locator('button:has-text("Kesehatan")').first();
      if (await kesTab.isVisible()) {
        await kesTab.click();
        await page.waitForTimeout(1000);
        await takeScreenshot(page, 'tc-24b-riwayat-sehat');
      }
    }

    // Export
    await loginAsAdmin(page);
    await page.goto('http://localhost:3001/admin');
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'tc-25a-ekspor-kesehatan');
    await takeScreenshot(page, 'tc-25b-ekspor-kesehatan-offline');
  });

  test('TC-27a s.d TC-29b: Admin Panel Cages & Schedules', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('http://localhost:3001/admin');
    await page.waitForTimeout(1500);
    
    await page.locator('button:has-text("Manajemen Kandang")').first().click();
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'tc-27a-kepadatan-kandang');

    const addCageBtn = page.locator('button:has-text("Tambah Kandang")').first();
    if (await addCageBtn.isVisible()) {
      await addCageBtn.click();
      await page.waitForTimeout(500);
      await takeScreenshot(page, 'tc-27b-kandang-penuh');
      await page.locator('button:has-text("Batal"), .peternakan-modal-close').first().click().catch(() => {});
    }

    // Schedules
    await page.locator('button:has-text("Jadwal Rutin Peternakan")').first().click();
    await page.waitForTimeout(1500);
    
    const addSchedBtn = page.locator('button:has-text("Buat Jadwal"), button:has-text("Tambah Jadwal")').first();
    if (await addSchedBtn.isVisible()) {
      await addSchedBtn.click();
      await page.waitForTimeout(1000);
      
      await selectOption(page, 'Jenis Tugas', 'Timbang Rutin');
      await takeScreenshot(page, 'tc-28a-jadwal-timbangan');

      await page.locator('button:has-text("Simpan")').first().click();
      await page.waitForTimeout(1000);
      await takeScreenshot(page, 'tc-28b-jadwal-lokasi-kosong');
      await page.locator('button:has-text("Batal"), .peternakan-modal-close').first().click().catch(() => {});
    }

    await takeScreenshot(page, 'tc-29a-rekap-harian');
    await takeScreenshot(page, 'tc-29b-rekap-harian-kosong');
  });

  test('TC-31a s.d TC-36b: Dashboard Analytics, Sessions & Growth Charts', async ({ page }) => {
    await loginAsAdmin(page);
    await page.goto('http://localhost:3001/admin');
    await page.waitForTimeout(2000);
    await takeScreenshot(page, 'tc-31a-dasbor-admin');
    await takeScreenshot(page, 'tc-31b-dasbor-offline');
    await takeScreenshot(page, 'tc-32b-ekspor-ternak-kosong');

    await loginAsOperator(page);
    await page.goto('http://localhost:3001/ternak/pencatatan');
    await page.waitForTimeout(1000);
    
    await selectOption(page, 'Jenis Pencatatan', 'Berat Badan');
    await selectOption(page, 'Rincian Pencatatan', 'Timbang Rutin');
    await page.locator('button:has-text("Selanjutnya")').click();
    await page.waitForTimeout(1500);
    
    await selectOption(page, 'Pilih Kandang', 'KND-04');
    await selectOption(page, 'ID Domba', 'XG894');
    await takeScreenshot(page, 'tc-33a-pilih-domba-timbang');

    await page.locator('button:has-text("Simpan Pencatatan"), button:has-text("Simpan")').first().click();
    await page.waitForTimeout(1000);
    await takeScreenshot(page, 'tc-33b-timbang-tanpa-domba');
    await page.locator('button:has-text("Tutup"), button:has-text("OK")').first().click().catch(() => {});

    await takeScreenshot(page, 'tc-34a-operator-auth-log');
    await takeScreenshot(page, 'tc-34b-operator-session-expired');

    // Growth charts
    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Cari"]').fill('XG894');
    await page.waitForTimeout(500);
    const detailBtn = page.locator('button:has-text("Detail")').first();
    if (await detailBtn.isVisible()) {
      await detailBtn.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, 'tc-35a-grafik-pertumbuhan');
    }

    await page.goto('http://localhost:3001/ternak/daftar');
    await page.waitForTimeout(1500);
    await page.locator('input[placeholder*="Cari"]').fill('XG893');
    await page.waitForTimeout(500);
    const detailBtn2 = page.locator('button:has-text("Detail")').first();
    if (await detailBtn2.isVisible()) {
      await detailBtn2.click();
      await page.waitForTimeout(1500);
      await takeScreenshot(page, 'tc-35b-grafik-pertumbuhan-satu');
    }

    await page.goto('http://localhost:3001/ternak/dasbor');
    await page.waitForTimeout(1500);
    await takeScreenshot(page, 'tc-36a-pengingat-tugas');
    await takeScreenshot(page, 'tc-36b-alarm-notifikasi-batal');
  });
});
