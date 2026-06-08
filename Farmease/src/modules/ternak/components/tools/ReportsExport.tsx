import { defineComponent, ref, onMounted } from 'vue';
import Typography from '@/shared/ui/Typography';
import { sheep, weightRecords, healthRecords } from '@/store/livestock';
import { healthApi, weightApi, breedingApi } from '@/shared/api';

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

    const exportPopulasi = async () => {
      loadingKey.value = 'populasi';
      try {
        const headers = ['Kode', 'Nama', 'Ras/Jenis', 'Jenis Kelamin', 'Tgl Lahir', 'Status', 'Kandang'];
        const rows = sheep.value.map(s => [
          s.code, s.name, s.type, s.gender === 'jantan' ? 'Jantan' : 'Betina',
          s.birth_date || '—', s.status, s.cage_code,
        ]);
        downloadCSV(`farmease_populasi_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Laporan populasi berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } finally {
        loadingKey.value = null;
      }
    };

    const exportBerat = async () => {
      loadingKey.value = 'berat';
      try {
        let allWeights: any[] = [];
        try { allWeights = await weightApi.getList(); } catch {}

        const headers = ['ID Domba', 'Kode Domba', 'Berat (kg)', 'Tanggal Rekam'];
        const rows = allWeights.map((w: any) => {
          const s = sheep.value.find(x => String(x.id) === String(w.id_sheep));
          return [String(w.id_sheep), s?.code || '—', w.weight, w.date_recorded || w.created_at];
        });
        downloadCSV(`farmease_berat_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Laporan berat badan berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } finally {
        loadingKey.value = null;
      }
    };

    const exportKesehatan = async () => {
      loadingKey.value = 'kesehatan';
      try {
        let allHealth: any[] = [];
        try { allHealth = await healthApi.getGlobalList(); } catch {}

        const headers = ['ID Domba', 'Kode Domba', 'Status Kesehatan', 'Deskripsi', 'Tanggal Rekam'];
        const rows = allHealth.map((h: any) => {
          const s = sheep.value.find(x => String(x.id) === String(h.id_sheep));
          const healthStatus = h.health_status || h.action || h.diagnosis || '—';
          const desc = h.description || h.notes || '—';
          const checkDate = h.checkup_date || h.date_recorded || h.created_at || '—';
          return [String(h.id_sheep), s?.code || '—', healthStatus, desc, checkDate];
        });
        downloadCSV(`farmease_kesehatan_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Laporan kesehatan berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } finally {
        loadingKey.value = null;
      }
    };

    const exportPerkawinan = async () => {
      loadingKey.value = 'perkawinan';
      try {
        let matings: any[] = [];
        try { matings = await breedingApi.getMatingList(); } catch {}

        const headers = ['ID Jantan', 'Kode Jantan', 'ID Betina', 'Kode Betina', 'Tanggal Kawin', 'Status'];
        const rows = matings.map((m: any) => {
          const maleId = m.id_sheep_male || m.id_male_sheep;
          const femaleId = m.id_sheep_female || m.id_female_sheep;
          const male = sheep.value.find(x => String(x.id) === String(maleId));
          const female = sheep.value.find(x => String(x.id) === String(femaleId));
          return [String(maleId || '—'), male?.code || '—', String(femaleId || '—'), female?.code || '—', m.mating_date || '—', m.status || '—'];
        });
        downloadCSV(`farmease_perkawinan_${todayStr()}.csv`, headers, rows);
        successMsg.value = 'Laporan perkawinan berhasil diunduh!';
        setTimeout(() => successMsg.value = null, 4000);
      } finally {
        loadingKey.value = null;
      }
    };

    const reports = [
      {
        key: 'populasi',
        title: 'Laporan Populasi Ternak',
        desc: 'Data seluruh domba aktif: kode, nama, ras, jenis kelamin, tanggal lahir, status, kandang.',
        icon: '/icon/domba.png',
        action: exportPopulasi,
      },
      {
        key: 'berat',
        title: 'Riwayat Berat Badan',
        desc: 'Seluruh catatan penimbangan domba: ID, berat, tanggal pengukuran.',
        icon: '/icon/statistic.png',
        action: exportBerat,
      },
      {
        key: 'kesehatan',
        title: 'Riwayat Kesehatan',
        desc: 'Log pemeriksaan kesehatan per domba: status, deskripsi, tanggal rekam.',
        icon: '/icon/catat_sehat.png',
        action: exportKesehatan,
      },
      {
        key: 'perkawinan',
        title: 'Data Perkawinan & Breeding',
        desc: 'Riwayat pasangan kawin: kode jantan, kode betina, tanggal, dan status perkawinan.',
        icon: '/icon/catat_kawin.png',
        action: exportPerkawinan,
      },
    ];

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-4">
          <div>
            <Typography variant="h3" weight="bold" className="mb-1">Ekspor Laporan Ternak</Typography>
            <Typography variant="p" size="text-xs" color="secondary" className="m-0">
              Unduh data real dari sistem dalam format CSV yang bisa dibuka di Excel.
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

        <div class="row g-3">
          {reports.map(r => (
            <div class="col-12 col-md-6" key={r.key}>
              <div class="p-4 rounded-4 h-100" style={{ background: 'var(--color-surface)', border: '1.5px solid var(--color-outline-variant)' }}>
                <div class="d-flex align-items-center gap-3 mb-3">
                  <div class="d-flex align-items-center justify-content-center rounded-3" style={{ width: '42px', height: '42px', backgroundColor: 'var(--color-primary-fixed)', flexShrink: 0 }}>
                    <img src={r.icon} style={{ width: '22px', height: '22px', objectFit: 'contain' }} alt="" />
                  </div>
                  <div>
                    <div class="fw-bold" style={{ fontSize: '0.85rem' }}>{r.title}</div>
                    <div class="text-secondary" style={{ fontSize: '0.72rem' }}>{r.desc}</div>
                  </div>
                </div>
                <button
                  class="btn w-100 rounded-3 fw-bold text-white"
                  style={{ backgroundColor: 'var(--color-primary)', fontSize: '0.82rem' }}
                  onClick={r.action}
                  disabled={loadingKey.value === r.key}
                >
                  {loadingKey.value === r.key ? '⏳ Menyiapkan...' : '📥 Unduh CSV'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div class="mt-4 p-3 rounded-3 text-secondary" style={{ background: 'var(--color-gray-50-alt)', fontSize: '0.75rem', border: '1px solid #e5e7eb' }}>
          <strong>ℹ️ Info:</strong> File CSV dapat dibuka langsung di Microsoft Excel atau Google Sheets. Gunakan fitur "Data → From Text/CSV" jika encoding karakter tidak terbaca dengan benar.
        </div>
      </div>
    );
  }
});
