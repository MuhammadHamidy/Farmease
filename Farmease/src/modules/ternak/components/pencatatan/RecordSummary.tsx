import { defineComponent, computed } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { stocks } from '@/modules/ternak/store/peternakan';
import '@/modules/ternak/assets/css/modules/RecordForm.css';

export default defineComponent({
  name: 'RecordSummary',
  props: {
    payload: { type: Object, required: true }
  },
  setup(props) {
    const data = computed(() => props.payload.data || {});
    const type = computed(() => props.payload.type);

    const typeLabel = computed(() => {
      switch (type.value) {
        case 'pakan': return 'Pencatatan Pakan';
        case 'kesehatan': return 'Pencatatan Kesehatan';
        case 'kotoran': return 'Pencatatan Kotoran';
        case 'reproduksi': return 'Pencatatan Reproduksi';
        case 'kelahiran': return 'Pencatatan Kelahiran';
        case 'perkawinan': return 'Pencatatan Perkawinan';
        default: return 'Detail Pencatatan';
      }
    });

    const typeIcon = computed(() => {
      switch (type.value) {
        case 'pakan': return '/icon/catat_pakan.png';
        case 'kesehatan': return '/icon/catat_sehat.png';
        case 'kotoran': return '/icon/catat_kotoran.png';
        case 'reproduksi':
        case 'kelahiran': return '/icon/catat_lahir.png';
        case 'perkawinan': return '/icon/catat_kawin.png';
        default: return '/icon/document.png';
      }
    });

    const matchedStocks = computed(() => {
      const query = (data.value.jenis || data.value.obat || type.value || '').toString().toLowerCase();
      return stocks.value.filter(s => 
        s.name.toLowerCase().includes(query) || 
        (s.category && s.category.toLowerCase().includes(query)) ||
        (type.value === 'pakan' && s.category === 'pakan') ||
        (type.value === 'kesehatan' && s.category === 'medicine') ||
        (type.value === 'kotoran' && s.category === 'kotoran')
      );
    });

    return () => (
      <div class="record-summary">
        <div class="summary-header d-flex align-items-center gap-3 mb-4">
          <div class="summary-icon-box d-flex align-items-center justify-content-center rounded-2xl" style={{ width: '64px', height: '64px' }}>
            <img src={typeIcon.value} style={{ width: '32px', height: '32px', objectFit: 'contain' }} />
          </div>
          <div>
            <Typography variant="h3" weight="bold" className="m-0 text-primary">{typeLabel.value}</Typography>
            <Typography variant="span" className="text-muted">Berhasil dicatat pada {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })} WIB</Typography>
          </div>
        </div>

        <div class="row g-4">
          <div class="col-md-7">
            <div class="summary-details-container d-flex flex-column gap-4">
              {data.value.items ? (
                data.value.items.map((item: any, idx: number) => (
                  <div key={idx} class="summary-details-card bg-light rounded-4 p-4 border-0">
                    <div class="d-flex align-items-center gap-2 mb-3">
                      <div class="rounded-circle d-flex align-items-center justify-content-center bg-white shadow-sm" style={{ width: '32px', height: '32px' }}>
                        <img src={item.mode === 'kelompok' ? '/icon/kandang.png' : '/icon/domba.png'} style={{ width: '16px', height: '16px', objectFit: 'contain', opacity: 0.6 }} />
                      </div>
                      <Typography variant="h4" weight="extrabold" className="m-0 fs-6">{item.name || typeLabel.value}</Typography>
                      <Badge variant="success" className="bg-white text-almond-beige border shadow-sm">
                        {item.mode === 'kelompok' ? 'Kandang' : 'Individu'}
                      </Badge>
                    </div>

                    <div class="summary-items-grid row g-3">
                      <SummaryItem label={item.mode === 'kelompok' ? 'ID Kandang' : 'ID Ternak'} value={item.targetId} />
                      
                      {type.value === 'pakan' && (
                        <SummaryItem label="Jumlah Pakan" value={`${item.qty} ${item.unit}`} />
                      )}

                      {type.value === 'kesehatan' && (
                        <>
                          <SummaryItem label="Tanggal" value={item.tanggal} />
                          <SummaryItem label="Tindakan" value={item.tindakan} />
                          <SummaryItem label="Obat/Vitamin" value={item.obat} />
                          <SummaryItem label="Dosis Vitamin" value={item.vitaminAmount ? `${item.vitaminAmount} unit` : '-'} />
                        </>
                      )}

                      {type.value === 'kotoran' && (
                        <>
                          <SummaryItem label="Jumlah Hasil" value={`${item.qty} ${item.unit || 'kg'}`} />
                          <SummaryItem label="Kondisi" value={item.kotoranState} />
                        </>
                      )}

                      {type.value === 'perkawinan' && (
                        <>
                          <SummaryItem label="ID Pejantan" value={item.idPejantan} />
                          <SummaryItem label="Metoda" value={item.metoda} />
                          <SummaryItem label="Tanggal" value={item.tanggal} />
                        </>
                      )}

                      {type.value === 'kelahiran' && (
                        <>
                          <SummaryItem label="Jumlah Anak" value={item.jumlahAnak} />
                          <SummaryItem label="Kondisi Induk" value={item.kondisiInduk} />
                          <SummaryItem label="Kondisi Anak" value={item.kondisiAnak} />
                          <SummaryItem label="Tanggal" value={item.tanggal} />
                        </>
                      )}

                      <SummaryItem label="Catatan" value={item.note || '-'} fullWidth />
                    </div>
                  </div>
                ))
              ) : (
                <div class="summary-details-card bg-light rounded-4 p-4 border-0">
                  <Typography variant="p" className="text-muted m-0">Tidak ada data rincian tersedia</Typography>
                </div>
              )}
            </div>
          </div>

          <div class="col-md-5">
            <div class="summary-stock-card bg-white rounded-4 p-4 border shadow-sm">
              <div class="d-flex align-items-center gap-2 mb-3">
                <img src="/icon/package.png" style={{ width: '20px', height: '20px', opacity: 0.7 }} />
                <Typography variant="h4" weight="semibold" className="m-0">Stok Terkait</Typography>
              </div>

              {matchedStocks.value.length === 0 ? (
                <div class="text-center py-4 bg-light rounded-3">
                  <Typography variant="span" className="text-muted">Tidak ada stok yang sesuai dengan jenis pencatatan ini</Typography>
                </div>
              ) : (
                <div class="stock-list">
                  {matchedStocks.value.map(s => (
                    <div class="stock-item d-flex justify-content-between align-items-center p-3 border rounded-3 mb-2 bg-light-hover transition-all" key={s.id}>
                      <div>
                        <div class="fw-bold text-dark">{s.name}</div>
                        <div class="text-muted" style={{ fontSize: '0.8rem' }}>{s.category}</div>
                      </div>
                      <div class="text-end">
                        <div class="badge bg-success-subtle text-success border border-success-subtle px-3 py-2 rounded-pill font-monospace">
                          {s.qty} {s.unit}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              <div class="mt-4 p-3 rounded-3" style={{ background: 'rgba(52, 168, 83, 0.05)', border: '1px dashed rgba(52, 168, 83, 0.3)' }}>
                <Typography variant="p" className="small text-muted m-0">
                  <i class="bi bi-info-circle me-1"></i>
                  Stok otomatis berkurang sesuai dengan jumlah yang dicatatkan di form sebelumnya.
                </Typography>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
});

const SummaryItem = ({ label, value, fullWidth = false }: { label: string, value: string, fullWidth?: boolean }) => (
  <div class={['summary-item mb-3', fullWidth ? 'col-12' : 'col-6']} style={{ flex: fullWidth ? '0 0 100%' : '0 0 50%' }}>
    <div class="text-muted small mb-1">{label}</div>
    <div class="fw-bold text-dark" style={{ fontSize: '1.05rem' }}>{value || '-'}</div>
  </div>
);
