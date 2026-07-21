import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/Typography';
import { sheep } from '@/store/livestock';
import { healthApi, weightApi, breedingApi } from '@/shared/api';
import { pencatatanSubmissions, fetchSubmissions } from '@/store/operatorAdmin';

// ── Helper: Generate & Download CSV ─────────────────────────────────────────
function downloadCSV(filename: string, headers: string[], data: (string | number)[][]) {
  const rows = [
    headers.join(','),
    ...data.map(row =>
      row.map(cell => {
        const str = String(cell ?? '');
        return str.includes(',') || str.includes('"') || str.includes('\n')
          ? `"${str.replace(/"/g, '""')}"`
          : str;
      }).join(',')
    ),
  ];
  const blob = new Blob(['\uFEFF' + rows.join('\r\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function todayStr() {
  return new Date().toISOString().split('T')[0];
}

export default defineComponent({
  name: 'ReportsExport',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const loadingKey = ref<string | null>(null);
    const successMsg = ref<string | null>(null);
    const errorMsg = ref<string | null>(null);

    const exportRekapTernak = async () => {
      if (sheep.value.length === 0) {
        errorMsg.value = 'Gagal mengekspor karena tidak ada data domba aktif';
        setTimeout(() => errorMsg.value = null, 4000);
        return;
      }
      loadingKey.value = 'rekap';
      errorMsg.value = null;
      try {
        let allWeights: any[] = [];
        let allHealth: any[] = [];
        let matings: any[] = [];

        // Fetch all data in parallel
        await Promise.all([
          (async () => { try { allWeights = await weightApi.getList(); } catch {} })(),
          (async () => { try { allHealth = await healthApi.getGlobalList(); } catch {} })(),
          (async () => { try { matings = await breedingApi.getMatingList(); } catch {} })(),
        ]);

        const headers = [
          'No',
          'Kode Domba',
          'Nama Domba',
          'Jenis Kelamin',
          'Tipe/Ras',
          'Tanggal Lahir',
          'Status',
          'Kandang',
          'Asal',
          'Berat Terakhir (kg)',
          'Tanggal Timbang Terakhir',
          'Status Kesehatan Terakhir',
          'Catatan Kesehatan Terakhir',
          'Tanggal Periksa Terakhir',
          'Pasangan Kawin Terakhir (Kode)',
          'Tanggal Kawin Terakhir',
          'Status Perkawinan Terakhir'
        ];

        const rows = sheep.value.map((s, index) => {
          // 1. Get latest weight record
          const sheepWeights = allWeights
            .filter((w: any) => String(w.id_sheep) === String(s.id))
            .sort((a: any, b: any) => new Date(b.date_recorded || b.created_at).getTime() - new Date(a.date_recorded || a.created_at).getTime());
          const latestW = sheepWeights[0];
          const weightVal = latestW ? latestW.weight : '—';
          const weightDate = latestW ? (latestW.date_recorded || latestW.created_at || '').split('T')[0] : '—';

          // 2. Get latest health record
          const sheepHealth = allHealth
            .filter((h: any) => String(h.id_sheep) === String(s.id))
            .sort((a: any, b: any) => new Date(b.checkup_date || b.date_recorded || b.created_at).getTime() - new Date(a.checkup_date || a.date_recorded || a.created_at).getTime());
          const latestH = sheepHealth[0];
          const healthStatus = latestH ? (latestH.health_status || latestH.action || latestH.diagnosis || '—') : '—';
          const healthDesc = latestH ? (latestH.description || latestH.notes || '—') : '—';
          const healthDate = latestH ? (latestH.checkup_date || latestH.date_recorded || latestH.created_at || '').split('T')[0] : '—';

          // 3. Get latest mating record
          const sheepMatings = matings
            .filter((m: any) => String(m.id_sheep_male || m.id_male_sheep) === String(s.id) || String(m.id_sheep_female || m.id_female_sheep) === String(s.id))
            .sort((a: any, b: any) => new Date(b.mating_date).getTime() - new Date(a.mating_date).getTime());
          const latestM = sheepMatings[0];
          let partnerCode = '—';
          let matingDate = '—';
          let matingStatus = '—';
          if (latestM) {
            const isMale = String(latestM.id_sheep_male || latestM.id_male_sheep) === String(s.id);
            const partnerId = isMale ? (latestM.id_sheep_female || latestM.id_female_sheep) : (latestM.id_sheep_male || latestM.id_male_sheep);
            const partner = sheep.value.find(x => String(x.id) === String(partnerId));
            partnerCode = partner ? partner.code : '—';
            matingDate = latestM.mating_date || '—';
            matingStatus = latestM.status || '—';
          }

          return [
            index + 1,
            s.code,
            s.name,
            s.gender === 'jantan' ? 'Jantan' : 'Betina',
            s.type,
            s.birth_date ? s.birth_date.split('T')[0] : '—',
            s.status,
            s.cage_code,
            (s as any).origin || '—',
            weightVal,
            weightDate,
            healthStatus,
            healthDesc,
            healthDate,
            partnerCode,
            matingDate,
            matingStatus
          ];
        });

        downloadCSV(`farmease_rekap_ternak_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Rekap laporan data ternak berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } catch (err) {
        console.error('Error exporting combined report:', err);
      } finally {
        loadingKey.value = null;
      }
    };

    const exportLaporanPakan = async () => {
      loadingKey.value = 'pakan';
      errorMsg.value = null;
      try {
        await fetchSubmissions();
        const headers = [
          'No',
          'Tanggal',
          'Jenis Pakan',
          'Metode Pemberian',
          'Target (Kandang/Domba)',
          'Jumlah/Volume',
          'Satuan',
          'Status Persetujuan',
          'Catatan'
        ];

        const rows: (string | number)[][] = [];
        let counter = 1;

        pencatatanSubmissions.value.forEach((sub: any) => {
          const sType = (sub.type || '').toLowerCase();
          if (sType !== 'pakan') return;
          
          const payloadData = sub.payload?.data || sub.payload;
          const items = payloadData?.items || [];
          const approval = sub.approvalStatus === 'approved' ? 'Disetujui' : 
                           sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Menunggu';

          items.forEach((item: any) => {
            rows.push([
              counter++,
              item.tanggal || sub.submittedAt?.split('T')[0] || '—',
              item.obat || '—',
              item.metoda === 'ib' ? 'Inseminasi Buatan' : 
              item.metoda === 'alami' ? 'Alami' : 
              item.metoda === 'dadakan' ? 'Pakan Dadakan (Racikan)' : 
              item.metoda === 'silase' ? 'Pakan Silase' : item.metoda || '—',
              item.targetId || '—',
              item.qty || 0,
              item.unit || 'kg',
              approval,
              item.note || '—'
            ]);
          });
        });

        downloadCSV(`farmease_laporan_pakan_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Laporan penggunaan pakan berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } catch (err) {
        console.error('Error exporting feed report:', err);
        errorMsg.value = 'Terjadi kesalahan saat mengekspor laporan pakan';
        setTimeout(() => errorMsg.value = null, 4000);
      } finally {
        loadingKey.value = null;
      }
    };

    const exportRekapMedis = async () => {
      if (sheep.value.length === 0) {
        errorMsg.value = 'Gagal mengekspor karena tidak ada data domba aktif';
        setTimeout(() => errorMsg.value = null, 4000);
        return;
      }
      loadingKey.value = 'medis';
      errorMsg.value = null;
      try {
        const allHealth = await healthApi.getGlobalList();
        
        const headers = [
          'No',
          'Kode Domba',
          'Nama Domba',
          'Tindakan/Diagnosa',
          'Obat/Vitamin',
          'Dosis/Jumlah',
          'Tanggal Tindakan',
          'Catatan/Keterangan'
        ];

        const rows = allHealth.map((h: any, index: number) => {
          const s = sheep.value.find(x => String(x.id) === String(h.id_sheep));
          return [
            index + 1,
            s ? s.code : '—',
            s ? s.name : '—',
            h.health_status || h.action || h.diagnosis || '—',
            h.medicine || h.obat || '—',
            h.vitaminAmount || h.dosis || '—',
            h.checkup_date ? h.checkup_date.split('T')[0] : '—',
            h.description || h.notes || '—'
          ];
        });

        downloadCSV(`farmease_rekap_medis_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Rekap laporan kesehatan medis berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } catch (err) {
        console.error('Error exporting medical report:', err);
        errorMsg.value = 'Terjadi kegagalan koneksi, ekspor laporan ditolak';
        setTimeout(() => errorMsg.value = null, 4000);
      } finally {
        loadingKey.value = null;
      }
    };

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Typography variant="h3" weight="bold" className="mb-1">Ekspor Laporan Ternak</Typography>
            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
              Unduh data real dari seluruh populasi domba dalam format CSV yang bisa dibuka di Excel.
            </Typography>
          </div>
          {props.onClose && (
            <button class="btn btn-sm btn-outline-secondary rounded-pill" onClick={() => props.onClose?.()}>Tutup</button>
          )}
        </div>

        {successMsg.value && (
          <div class="alert alert-success py-2 px-3 rounded-4 mb-4" style={{ fontSize: '0.85rem', border: '1.5px solid #10b981', background: 'var(--color-success-bg)', color: 'var(--color-success-text)' }}>
            🎉 {successMsg.value}
          </div>
        )}

        {errorMsg.value && (
          <div class="alert alert-danger py-2 px-3 rounded-4 mb-4" style={{ fontSize: '0.85rem', border: '1.5px solid #ef4444', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
            ⚠️ {errorMsg.value}
          </div>
        )}

        <div class="row g-3">
          {/* 1. Rekap Data Ternak */}
          <div class="col-12 col-md-4">
            <div class="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-outline-variant)' }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-primary-fixed)', flexShrink: 0 }}>
                    <img src="/icon/domba.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} alt="" />
                  </div>
                  <div class="fw-bold" style={{ fontSize: '0.9rem', color: '#3d2f24' }}>Rekap Laporan Data Ternak</div>
                </div>
                <div class="text-secondary mb-4" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  Satu file CSV terpadu yang memuat data seluruh populasi domba aktif beserta riwayat berat badan, kesehatan, dan perkawinan terbaru.
                </div>
              </div>
              <button
                class="btn w-100 rounded-3 fw-bold text-white mt-auto"
                style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.82rem', padding: '0.6rem' }}
                onClick={exportRekapTernak}
                disabled={loadingKey.value === 'rekap'}
              >
                {loadingKey.value === 'rekap' ? '⏳ Menyiapkan...' : '📥 Unduh Rekap Laporan Ternak'}
              </button>
            </div>
          </div>

          {/* 2. Laporan Penggunaan Pakan */}
          <div class="col-12 col-md-4">
            <div class="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-outline-variant)' }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', backgroundColor: 'rgba(96, 108, 56, 0.15)', flexShrink: 0 }}>
                    <img src="/icon/catat_pakan.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} alt="" />
                  </div>
                  <div class="fw-bold" style={{ fontSize: '0.9rem', color: '#3d2f24' }}>Laporan Penggunaan Pakan</div>
                </div>
                <div class="text-secondary mb-4" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  File CSV memuat log harian pemberian pakan untuk masing-masing kandang, jenis pakan, metode, jumlah volume, dan catatan logistik.
                </div>
              </div>
              <button
                class="btn w-100 rounded-3 fw-bold text-white mt-auto"
                style={{ backgroundColor: '#606c38', fontSize: '0.82rem', padding: '0.6rem', borderColor: '#606c38' }}
                onClick={exportLaporanPakan}
                disabled={loadingKey.value === 'pakan'}
              >
                {loadingKey.value === 'pakan' ? '⏳ Menyiapkan...' : '📥 Unduh Laporan Pakan'}
              </button>
            </div>
          </div>

          {/* 3. Rekap Medis & Kesehatan */}
          <div class="col-12 col-md-4">
            <div class="p-4 rounded-4 h-100 d-flex flex-column justify-content-between" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-outline-variant)' }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', backgroundColor: 'rgba(186, 26, 26, 0.12)', flexShrink: 0 }}>
                    <img src="/icon/catat_sehat.png" style={{ width: '22px', height: '22px', objectFit: 'contain' }} alt="" />
                  </div>
                  <div class="fw-bold" style={{ fontSize: '0.9rem', color: '#3d2f24' }}>Rekap Medis & Kesehatan</div>
                </div>
                <div class="text-secondary mb-4" style={{ fontSize: '0.75rem', lineHeight: '1.4' }}>
                  File CSV kronologis yang memuat riwayat medis lengkap, diagnosa penyakit, jenis obat/vitamin, dosis, dan petugas penanggung jawab.
                </div>
              </div>
              <button
                class="btn w-100 rounded-3 fw-bold text-white mt-auto"
                style={{ backgroundColor: '#ba1a1a', fontSize: '0.82rem', padding: '0.6rem', borderColor: '#ba1a1a' }}
                onClick={exportRekapMedis}
                disabled={loadingKey.value === 'medis'}
              >
                {loadingKey.value === 'medis' ? '⏳ Menyiapkan...' : '📥 Unduh Rekap Medis'}
              </button>
            </div>
          </div>
        </div>

        <div class="mt-4 p-3 rounded-3 text-secondary" style={{ background: 'var(--color-gray-50-alt)', fontSize: '0.75rem', border: '1px solid #e5e7eb' }}>
          <strong>ℹ️ Info:</strong> File CSV dapat dibuka langsung di Microsoft Excel or Google Sheets. Gunakan fitur "Data → From Text/CSV" jika encoding karakter tidak terbaca dengan benar.
        </div>
      </div>
    );
  }
});
