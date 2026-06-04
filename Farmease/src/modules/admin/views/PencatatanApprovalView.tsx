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
    const jenisFilter = ref('Semua Jenis Pencatatan');
    const selectedId = ref<string | null>(null);
    const reviewNote = ref('');
    const hoveredRowId = ref<string | null>(null);

    const filterOptions = ['Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Semua'];
    const jenisOptions = ['Semua Jenis Pencatatan', 'Pencatatan Peternakan', 'Pencatatan Perkebunan'];

    const filtered = computed(() => {
      const map: Record<string, ApprovalStatus | 'all'> = {
        'Menunggu Persetujuan': 'pending',
        Disetujui: 'approved',
        Ditolak: 'rejected',
        Semua: 'all',
      };
      const key = map[statusFilter.value] || 'all';
      let list = pencatatanSubmissions.value;
      if (key !== 'all') {
        list = list.filter((s) => s.approvalStatus === key);
      }

      if (jenisFilter.value !== 'Semua Jenis Pencatatan') {
        const isPerkebunanTarget = jenisFilter.value === 'Pencatatan Perkebunan';
        list = list.filter((s) => {
          const isPerkebunan = ['perawatan', 'pemangkasan', 'panen', 'aktivitas', 'lahan', 'pohon', 'tanaman'].includes((s.type || '').toLowerCase());
          return isPerkebunan === isPerkebunanTarget;
        });
      }

      return list;
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
              Persetujuan Pencatatan
            </Typography>
            <Typography variant="span" color="secondary">
              {pendingApprovalCount.value} pencatatan menunggu persetujuan admin
            </Typography>
          </div>
        </div>

        <div class="admin-filter-bar d-flex gap-3 mb-4 flex-wrap">
          <div class="admin-role-filter" style={{ minWidth: '220px' }}>
            <Select
              options={filterOptions}
              modelValue={statusFilter.value}
              onUpdate:modelValue={(v: string) => {
                statusFilter.value = v;
              }}
            />
          </div>
          <div class="admin-role-filter" style={{ minWidth: '220px' }}>
            <Select
              options={jenisOptions}
              modelValue={jenisFilter.value}
              onUpdate:modelValue={(v: string) => {
                jenisFilter.value = v;
              }}
            />
          </div>
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="view-card p-0" style={{ overflow: 'hidden' }}>
              <div class="table-responsive">
                <table class="admin-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Kode Pengguna</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Nama Pengguna</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Jenis Pencatatan</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Status Pencatatan</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem', textAlign: 'center' }}>Aksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.value.length === 0 ? (
                      <tr>
                        <td colspan={5} class="text-center py-4 text-muted">
                          Tidak ada data pencatatan.
                        </td>
                      </tr>
                    ) : (
                      filtered.value.map((sub) => {
                        const isPerkebunan = ['perawatan', 'pemangkasan', 'panen', 'aktivitas', 'lahan', 'pohon', 'tanaman'].includes((sub.type || '').toLowerCase());
                        const jenisText = isPerkebunan ? 'Perkebunan' : 'Peternakan';

                        return (
                          <tr
                            key={sub.id}
                            class={selectedId.value === sub.id ? 'table-active' : ''}
                            style={{ cursor: 'pointer' }}
                            onClick={() => openDetail(sub)}
                          >
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}><code>{sub.operatorCode}</code></td>
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                              <div class="fw-bold">{sub.operatorName}</div>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                              <span class={['role-badge', isPerkebunan ? 'operator-perkebunan' : 'operator-peternakan']} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                {jenisText}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem' }}>
                              <span class={['status-badge', sub.approvalStatus === 'approved' ? 'approved' : sub.approvalStatus === 'rejected' ? 'rejected' : 'pending']} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                {sub.approvalStatus === 'approved' ? 'Disetujui' : sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                              </span>
                            </td>
                            <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textAlign: 'center' }} onClick={(e) => e.stopPropagation()}>
                              <div class="d-flex justify-content-center gap-2">
                                {sub.approvalStatus === 'pending' && (
                                  <>
                                    <button
                                      type="button"
                                      class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white"
                                      onClick={() => {
                                        approveSubmission(sub.id, reviewerName(), 'Disetujui via panel aksi');
                                      }}
                                    >
                                      Setujui
                                    </button>
                                    <button
                                      type="button"
                                      class="btn btn-sm btn-danger px-3 rounded-pill fw-bold text-white"
                                      onClick={() => {
                                        const note = prompt('Masukkan alasan penolakan (opsional):');
                                        if (note !== null) {
                                          rejectSubmission(sub.id, reviewerName(), note || 'Ditolak via panel aksi');
                                        }
                                      }}
                                    >
                                      Tolak
                                    </button>
                                  </>
                                )}
                                {sub.approvalStatus === 'approved' && (
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-bold"
                                    onClick={() => {
                                      rejectSubmission(sub.id, reviewerName(), 'Batal disetujui');
                                    }}
                                  >
                                    Batal Setuju
                                  </button>
                                )}
                                {sub.approvalStatus === 'rejected' && (
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white"
                                    onClick={() => {
                                      approveSubmission(sub.id, reviewerName(), 'Disetujui kembali');
                                    }}
                                  >
                                    Setujui
                                  </button>
                                )}
                                <button
                                  type="button"
                                  class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-bold"
                                  onClick={() => openDetail(sub)}
                                >
                                  Detail
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        {selected.value && (
          <div class="admin-modal-overlay animate-fade-in" onClick={() => selectedId.value = null}>
            <div class="admin-modal-content text-start" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', backgroundColor: '#FAFAF8' }}>
              <div class="modal-header">
                <button type="button" class="close-btn" onClick={() => selectedId.value = null}>✕</button>
                <h3>Detail Pencatatan</h3>
              </div>

              <div class="modal-body py-3" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div class="mb-3">
                  <span class={['status-badge', statusBadge(selected.value.approvalStatus)]}>
                    {selected.value.approvalStatus === 'approved' ? 'Disetujui' : selected.value.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                  </span>
                </div>

                <div class="approval-detail-list mb-4">
                  <DetailRow label="ID" value={selected.value.id} />
                  <DetailRow label="Operator" value={`${selected.value.operatorName} (${selected.value.operatorCode})`} />
                  <DetailRow label="Jenis" value={selected.value.typeLabel} />
                  <DetailRow label="Kandang/Lahan" value={selected.value.cageCode} />
                  <DetailRow label="Mode" value={selected.value.scope === 'kandang' ? 'Per Kandang/Lahan' : 'Per Domba/Pohon'} />
                  <DetailRow label="Ringkasan" value={selected.value.summary} />
                  <DetailRow label="Waktu Kirim" value={formatDate(selected.value.submittedAt)} />
                  {selected.value.reviewedBy && (
                    <>
                      <DetailRow label="Direview oleh" value={selected.value.reviewedBy} />
                      <DetailRow label="Waktu Review" value={formatDate(selected.value.reviewedAt || 0)} />
                    </>
                  )}
                </div>

                <Typography variant="h4" class="mb-2" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  Rincian Data (JSON)
                </Typography>
                <pre class="approval-json-preview mb-4">
                  {JSON.stringify(selected.value.payload?.data || selected.value.payload, null, 2)}
                </pre>

                {selected.value.approvalStatus === 'pending' && (
                  <>
                    <label class="pencatatan-label">Catatan Admin (Opsional)</label>
                    <textarea
                      class="form-control rounded-3 mb-3"
                      rows={3}
                      placeholder="Tuliskan catatan persetujuan atau alasan penolakan..."
                      value={reviewNote.value}
                      onInput={(e) => {
                        reviewNote.value = (e.target as HTMLTextAreaElement).value;
                      }}
                    />
                    <div class="d-flex gap-2">
                      <button
                        type="button"
                        class="btn btn-outline-danger grow py-2.5 rounded-pill fw-bold"
                        onClick={handleReject}
                        style={{ flex: 1 }}
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        class="btn btn-success grow py-2.5 rounded-pill fw-bold text-white"
                        onClick={handleApprove}
                        style={{ flex: 1 }}
                      >
                        Setujui
                      </button>
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
              </div>

              <div class="modal-footer pt-3 border-top d-flex justify-content-end">
                <button type="button" class="btn btn-light rounded-pill px-4" onClick={() => selectedId.value = null}>Tutup</button>
              </div>
            </div>
          </div>
        )}
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
