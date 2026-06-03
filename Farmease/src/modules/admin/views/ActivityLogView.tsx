import { defineComponent, ref } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import * as XLSX from 'xlsx';

export default defineComponent({
  name: 'ActivityLogView',
  setup() {
    const logs = ref([
      { id: 1, date: '2026-04-05 08:30', operator: 'Budi Ternak', module: 'Peternakan', activity: 'Mencatat pemberian pakan kandang 01', status: 'Selesai' },
      { id: 2, date: '2026-04-05 09:15', operator: 'Siti Kebun', module: 'Perkebunan', activity: 'Mencatat pemupukan blok A', status: 'Selesai' },
      { id: 3, date: '2026-04-05 10:00', operator: 'Budi Ternak', module: 'Peternakan', activity: 'Mencatat kesehatan ternak (Vaksin)', status: 'Selesai' },
      { id: 4, date: '2026-04-05 11:30', operator: 'Agus Petani', module: 'Perkebunan', activity: 'Mencatat hasil panen jagung sawah 2', status: 'Selesai' },
      { id: 5, date: '2026-04-05 13:00', operator: 'Budi Ternak', module: 'Peternakan', activity: 'Update jumlah kematian ternak kandang 03', status: 'Selesai' },
      { id: 6, date: '2026-04-05 14:45', operator: 'Siti Kebun', module: 'Perkebunan', activity: 'Mencatat penyemprotan hama blok C', status: 'Selesai' },
    ]);

    const exportToExcel = () => {
      const data = logs.value.map(log => ({
        'Waktu': log.date,
        'Operator': log.operator,
        'Modul': log.module,
        'Aktivitas': log.activity,
        'Status': log.status
      }));
      
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Laporan Aktivitas');
      XLSX.writeFile(workbook, `Laporan_Aktivitas_${new Date().toISOString().split('T')[0]}.xlsx`);
    };

    return () => (
      <div class="activity-log animate-fade-in-up">
        <div class="view-header">
           <Typography variant="h2" class="view-title">Laporan Aktivitas</Typography>
           <Button variant="outline" onClick={exportToExcel} class="w-auto">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="me-2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
              </svg>
              {window.innerWidth > 500 ? 'Unduh Excel' : 'Excel'}
           </Button>
        </div>
        
        {/* ── Laporan Aktivitas (Scrollable Table) ─────────── */}
        <div class="view-card">
          <table class="admin-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Waktu</th>
                <th>Operator</th>
                <th>Modul</th>
                <th style={{ minWidth: '200px' }}>Aktivitas</th>
                <th style={{ textAlign: 'right' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {logs.value.map((log, index) => (
                <tr key={log.id}>
                  <td>{index + 1}</td>
                  <td class="small fw-bold" style={{ whiteSpace: 'nowrap' }}>{log.date}</td>
                  <td class="fw-bold" style={{ whiteSpace: 'nowrap' }}>{log.operator}</td>
                  <td>
                    <span class={['role-badge', log.module.toLowerCase() === 'peternakan' ? 'operator-peternakan' : 'operator-perkebunan']}>
                       {log.module}
                    </span>
                  </td>
                  <td>{log.activity}</td>
                  <td style={{ textAlign: 'right' }}>
                    <span class={['status-badge', log.status.toLowerCase()]}>
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div class="mt-4 p-3 rounded-4" style={{ background: 'var(--color-surface-container-low)', border: '1px solid var(--color-outline-variant)' }}>
           <p class="m-0 small text-secondary fw-bold">
             <span class="badge-hint" style={{ background: 'var(--color-primary-fixed)', color: 'var(--color-primary)' }}>Info</span> 
             Data di atas mencakup seluruh aktivitas yang tercatat secara real-time.
           </p>
        </div>
      </div>
    );
  }
});
