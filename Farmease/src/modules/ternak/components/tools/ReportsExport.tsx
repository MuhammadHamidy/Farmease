import { defineComponent } from 'vue';
import Typography from '@/shared/ui/Typography';

function downloadCSV(filename: string, rows: string[]) {
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export default defineComponent({
  name: 'ReportsExport',
  props: { onClose: { type: Function, default: null } },
  setup(props) {
    const sampleRows = [
      'id,ternak,tanggal,berat',
      'D-001,Domba 001,2026-04-01,42',
      'D-002,Domba 002,2026-04-01,38',
    ];

    return () => (
      <div class="p-3">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <Typography variant="h3" weight="bold">Eksport & Laporan (FE-only)</Typography>
          <button class="btn btn-sm btn-outline-secondary" onClick={() => props.onClose?.()}>Tutup</button>
        </div>

        <div class="d-flex gap-2">
          <button class="btn btn-primary" onClick={() => downloadCSV('berat_ternak.csv', sampleRows)}>Export Berat (CSV)</button>
          <button class="btn btn-outline-secondary" onClick={() => alert('PDF export belum diimplementasikan (FE-only)')}>Export PDF (stub)</button>
        </div>
      </div>
    );
  }
});
