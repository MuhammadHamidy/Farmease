import { defineComponent, ref, computed } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
import {
  pencatatanSubmissions,
  pendingApprovalCount,
  approveSubmission,
  rejectSubmission,
  type PencatatanSubmission,
  type ApprovalStatus,
} from '@/modules/ternak/store/operatorAdmin';
import { userSession } from '@/store/navigation';

export default defineComponent({
  name: 'PencatatanApprovalView',
  setup() {
    const statusFilter = ref('Menunggu Persetujuan');
    const selectedId = ref<string | null>(null);
    const reviewNote = ref('');

    const filterOptions = ['Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Semua'];

    const filtered = computed(() => {
      const map: Record<string, ApprovalStatus | 'all'> = {
        'Menunggu Persetujuan': 'pending',
        Disetujui: 'approved',
        Ditolak: 'rejected',
        Semua: 'all',
      };
      const key = map[statusFilter.value] || 'all';
      if (key === 'all') return pencatatanSubmissions.value;
      return pencatatanSubmissions.value.filter((s) => s.approvalStatus === key);
    });

    const selected = computed(() =>
      pencatatanSubmissions.value.find((s) => s.id === selectedId.value) || null,
    );

    const openDetail = (sub: PencatatanSubmission) => {
      selectedId.value = sub.id;
      reviewNote.value = sub.reviewNote || '';
    };

    const reviewerName = () => userSession.value?.name || 'Admin Utama';

    const handleApprove = () => {
      if (!selected.value) return;
      approveSubmission(selected.value.id, reviewerName(), reviewNote.value);
      selectedId.value = null;
    };

    const handleReject = () => {
      if (!selected.value) return;
      if (!reviewNote.value.trim()) return alert('Mohon isi catatan penolakan');
      rejectSubmission(selected.value.id, reviewerName(), reviewNote.value);
      selectedId.value = null;
    };

    const statusBadge = (status: ApprovalStatus) => {
      if (status === 'approved') return 'approved';
      if (status === 'rejected') return 'rejected';
      return 'pending';
    };

    const formatDate = (ts: number) =>
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date(ts));

    return () => (
      <div class="pencatatan-approval animate-fade-in-up">
        <div class="view-header">
          <div>
            <Typography variant="h2" class="view-title">
              Persetujuan Pencatatan Operator
            </Typography>
            <Typography variant="span" color="secondary">
              {pendingApprovalCount.value} pencatatan menunggu persetujuan admin
            </Typography>
          </div>
        </div>

        <div class="admin-filter-bar">
          <div class="admin-role-filter" style={{ minWidth: '220px' }}>
            <Select
              options={filterOptions}
              modelValue={statusFilter.value}
              onUpdate:modelValue={(v: string) => {
                statusFilter.value = v;
              }}
            />
          </div>
        </div>

        <div class="row g-4">
          <div class="col-lg-7">
            <div class="view-card p-0 overflow-hidden">
              <table class="admin-table mb-0">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Waktu</th>
                    <th>Operator</th>
                    <th>Jenis</th>
                    <th>Ringkasan</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.value.length === 0 ? (
                    <tr>
                      <td colspan={7} class="text-center py-4 text-muted">
                        Tidak ada data pencatatan.
                      </td>
                    </tr>
                  ) : (
                    filtered.value.map((sub, index) => (
                      <tr
                        key={sub.id}
                        class={selectedId.value === sub.id ? 'table-active' : ''}
                        style={{ cursor: 'pointer' }}
                        onClick={() => openDetail(sub)}
                      >
                        <td>{index + 1}</td>
                        <td class="small" style={{ whiteSpace: 'nowrap' }}>
                          {formatDate(sub.submittedAt)}
                        </td>
                        <td>
                          <div class="fw-bold">{sub.operatorName}</div>
                          <div class="small text-muted">{sub.operatorCode}</div>
                        </td>
                        <td>
                          <span class="role-badge operator-peternakan">{sub.typeLabel}</span>
                          <div class="small text-muted mt-1">
                            Kandang {sub.cageCode} · {sub.scope === 'kandang' ? 'Per Kandang' : 'Per Domba'}
                          </div>
                        </td>
                        <td>{sub.summary}</td>
                        <td>
                          <span class={['status-badge', statusBadge(sub.approvalStatus)]}>
                            {sub.approvalStatus === 'pending'
                              ? 'Menunggu'
                              : sub.approvalStatus === 'approved'
                                ? 'Disetujui'
                                : 'Ditolak'}
                          </span>
                        </td>
                        <td>
                          <button class="btn btn-sm btn-outline-primary" onClick={(e) => { e.stopPropagation(); openDetail(sub); }}>
                            Detail
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div class="col-lg-5">
            <div class="view-card sticky-top" style={{ top: '1rem' }}>
              {!selected.value ? (
                <div class="text-center py-5 text-muted">
                  <img src="/icon/document.png" alt="" style={{ width: '48px', opacity: 0.4, marginBottom: '1rem' }} />
                  <Typography variant="p">Pilih baris pencatatan untuk melihat detail dan melakukan persetujuan.</Typography>
                </div>
              ) : (
                <>
                  <Typography variant="h3" class="mb-3">
                    Detail Pencatatan
                  </Typography>
                  <div class="mb-3">
                    <span class={['status-badge', statusBadge(selected.value.approvalStatus)]}>
                      {selected.value.approvalStatus}
                    </span>
                  </div>

                  <div class="approval-detail-list mb-4">
                    <DetailRow label="ID" value={selected.value.id} />
                    <DetailRow label="Operator" value={`${selected.value.operatorName} (${selected.value.operatorCode})`} />
                    <DetailRow label="Jenis" value={selected.value.typeLabel} />
                    <DetailRow label="Kandang" value={selected.value.cageCode} />
                    <DetailRow label="Mode" value={selected.value.scope === 'kandang' ? 'Per Kandang' : 'Per Domba'} />
                    <DetailRow label="Ringkasan" value={selected.value.summary} />
                    <DetailRow label="Waktu Kirim" value={formatDate(selected.value.submittedAt)} />
                    {selected.value.reviewedBy && (
                      <>
                        <DetailRow label="Direview oleh" value={selected.value.reviewedBy} />
                        <DetailRow label="Waktu Review" value={formatDate(selected.value.reviewedAt || 0)} />
                      </>
                    )}
                  </div>

                  <Typography variant="h4" class="mb-2">
                    Rincian Data
                  </Typography>
                  <pre class="approval-json-preview mb-4">
                    {JSON.stringify(selected.value.payload?.data || selected.value.payload, null, 2)}
                  </pre>

                  {selected.value.approvalStatus === 'pending' && (
                    <>
                      <label class="pencatatan-label">Catatan Admin</label>
                      <textarea
                        class="form-control rounded-3 mb-3"
                        rows={3}
                        placeholder="Catatan persetujuan atau alasan penolakan..."
                        value={reviewNote.value}
                        onInput={(e) => {
                          reviewNote.value = (e.target as HTMLTextAreaElement).value;
                        }}
                      />
                      <div class="d-flex gap-2">
                        <Button variant="outline" class="grow" onClick={handleReject}>
                          Tolak
                        </Button>
                        <Button variant="solid" class="grow" onClick={handleApprove}>
                          Setujui
                        </Button>
                      </div>
                    </>
                  )}

                  {selected.value.approvalStatus !== 'pending' && selected.value.reviewNote && (
                    <div class="admin-verification-box mt-3">
                      <Typography variant="span" weight="bold" class="d-block mb-1">
                        Catatan Review
                      </Typography>
                      <Typography variant="p">{selected.value.reviewNote}</Typography>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  },
});

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div class="d-flex justify-content-between gap-3 py-2 border-bottom">
    <span class="text-muted small fw-bold">{label}</span>
    <span class="fw-bold text-end">{value}</span>
  </div>
);
