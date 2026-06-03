import { defineComponent, computed } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import { selectedPencatatanPayload } from '@/store/navigation';
import { pencatatanSubmissions } from '@/modules/ternak/store/operatorAdmin';
import RecordSummary from '@/modules/ternak/components/pencatatan/RecordSummary';
import Button from '@/shared/ui/Button';
import Badge from '@/shared/ui/Badge';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'PencatatanDetailView',
  setup() {
    const goBack = () => {
      selectedPencatatanPayload.value = null;
    };

    const latestSubmission = computed(() => {
      const payload = selectedPencatatanPayload.value;
      if (!payload) return null;
      return pencatatanSubmissions.value.find(
        (s) => s.type === payload.type && s.payload === payload,
      ) || pencatatanSubmissions.value[0];
    });

    return () => {
      const payload = selectedPencatatanPayload.value;
      if (!payload) return null;

      const approval = latestSubmission.value?.approvalStatus || 'pending';

      return (
        <div class="pencatatan-detail-overlay animate-fade-in record-summary">
          <div class="container-fluid mx-auto" style={{ maxWidth: '1200px' }}>
            <div class="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-3">
              <Button variant="ghost" onClick={goBack}>
                <div class="d-flex align-items-center gap-2">
                  <img
                    src="/icon/right-row.png"
                    style={{ width: '20px', height: '20px', transform: 'rotate(180deg)', opacity: 0.6 }}
                    alt=""
                  />
                  <span class="fw-bold">Kembali ke Pencatatan</span>
                </div>
              </Button>

              <div class="d-flex gap-2">
                <Button variant="outline" shape="pill" onClick={() => window.print()}>
                  Cetak Detail
                </Button>
                <Button variant="primary" shape="pill" onClick={goBack}>
                  Selesai
                </Button>
              </div>
            </div>

            <div class="pencatatan-info-box mb-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <Typography variant="h5" weight="extrabold" className="m-0 mb-1">
                  Status Persetujuan Admin
                </Typography>
                <Typography variant="p" size="text-sm" color="secondary" className="m-0">
                  {approval === 'pending' && 'Pencatatan telah dikirim dan menunggu persetujuan admin.'}
                  {approval === 'approved' && 'Pencatatan telah disetujui oleh admin.'}
                  {approval === 'rejected' && 'Pencatatan ditolak admin. Periksa catatan dan kirim ulang jika perlu.'}
                </Typography>
              </div>
              <Badge variant={approval === 'approved' ? 'success' : approval === 'rejected' ? 'danger' : 'warning'}>
                {approval === 'pending' ? 'Menunggu' : approval === 'approved' ? 'Disetujui' : 'Ditolak'}
              </Badge>
            </div>

            <div class="pencatatan-form-card">
              <RecordSummary payload={payload} />
            </div>

            <div class="mt-5 text-center text-on-surface-variant small">
              <p>
                ID Transaksi: {Math.random().toString(36).substring(2, 10).toUpperCase()} · Sistem FARMease v1.0
              </p>
            </div>
          </div>
        </div>
      );
    };
  },
});
