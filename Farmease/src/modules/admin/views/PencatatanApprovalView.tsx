import { defineComponent, ref, computed, watch, Teleport } from 'vue';
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
    const isSubmitting = ref(false);
    
    const rejectModal = ref({
      isOpen: false,
      submissionId: '',
      note: ''
    });

    const openRejectModal = (id: string) => {
      rejectModal.value = {
        isOpen: true,
        submissionId: id,
        note: ''
      };
    };

    const closeRejectModal = () => {
      rejectModal.value.isOpen = false;
    };

    const confirmReject = () => {
      if (rejectModal.value.submissionId) {
        handleRejectAction(rejectModal.value.submissionId, rejectModal.value.note || 'Ditolak via panel aksi');
      }
      closeRejectModal();
    };

    const alertModal = ref({
      isOpen: false,
      title: '',
      message: '',
      type: 'success' as 'success' | 'error',
    });

    const closeAlertModal = () => {
      alertModal.value.isOpen = false;
    };

    // FR6-01: Kunci data yang sudah diverifikasi
    const lockedIds = ref<Set<string>>(new Set());
    const toggleLock = (id: string) => {
      const next = new Set(lockedIds.value);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      lockedIds.value = next;
    };
    const isLocked = (id: string) => lockedIds.value.has(id);

    const currentPage = ref(1);
    const itemsPerPage = 5;

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

    const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage) || 1);

    watch(filtered, () => {
      if (currentPage.value > totalPages.value) {
        currentPage.value = 1;
      }
    });

    const paginatedItems = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage;
      return filtered.value.slice(start, start + itemsPerPage);
    });

    const selected = computed(() =>
      pencatatanSubmissions.value.find((s) => s.id === selectedId.value) || null,
    );

    const openDetail = (sub: PencatatanSubmission) => {
      selectedId.value = sub.id;
      reviewNote.value = sub.reviewNote || '';
    };

    const reviewerName = () => userSession.value?.name || 'Admin Utama';

    const handleApproveAction = async (id: string, note: string) => {
      if (isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        const res = await approveSubmission(id, reviewerName(), note);
        if (res) {
          alertModal.value = {
            isOpen: true,
            title: res.success ? 'Berhasil Disetujui' : 'Gagal Mengeksekusi',
            message: res.message,
            type: res.success ? 'success' : 'error'
          };
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleRejectAction = (id: string, note: string) => {
      const res = rejectSubmission(id, reviewerName(), note);
      if (res) {
        alertModal.value = {
          isOpen: true,
          title: 'Berhasil Ditolak',
          message: res.message,
          type: 'success'
        };
      }
    };

    const handleApprove = async () => {
      if (!selected.value) return;
      await handleApproveAction(selected.value.id, reviewNote.value);
      selectedId.value = null;
    };

    const handleReject = () => {
      if (!selected.value) return;
      if (!reviewNote.value.trim()) {
        alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Mohon isi catatan penolakan', type: 'error' };
        return;
      }
      handleRejectAction(selected.value.id, reviewNote.value);
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

    const formatOperatorCode = (code: string, name: string) => {
      if (code === '1' || name.toLowerCase().includes('admin')) return 'ADM-001';
      if (code === '2' || name.toLowerCase().includes('ternak') || name.toLowerCase().includes('kandang')) return 'OP-Ternak';
      if (code === '3' || name.toLowerCase().includes('kebun')) return 'OP-Kebun';
      if (code === '4' || name.toLowerCase().includes('pemilik')) return 'PEM-001';
      if (/^\d+$/.test(code)) return `OP-00${code}`;
      return code;
    };

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
                    {(() => {
                      const rows = [];
                      const emptyRowsCount = itemsPerPage - paginatedItems.value.length;

                      if (filtered.value.length === 0) {
                        rows.push(
                          <tr key="no-data" style={{ height: '58px' }}>
                            <td colspan={5} class="text-center py-3 text-muted" style={{ verticalAlign: 'middle', height: '58px' }}>
                              Tidak ada data pencatatan.
                            </td>
                          </tr>
                        );
                        for (let i = 1; i < itemsPerPage; i++) {
                          rows.push(
                            <tr key={`empty-${i}`} style={{ height: '58px' }}>
                              <td colspan={5} style={{ height: '58px', padding: '0.75rem 0.5rem' }}>&nbsp;</td>
                            </tr>
                          );
                        }
                      } else {
                        paginatedItems.value.forEach((sub) => {
                          const isPerkebunan = ['perawatan', 'pemangkasan', 'panen', 'aktivitas', 'lahan', 'pohon', 'tanaman'].includes((sub.type || '').toLowerCase());
                          const jenisText = isPerkebunan ? 'Perkebunan' : 'Peternakan';

                          rows.push(
                            <tr
                              key={sub.id}
                              class={selectedId.value === sub.id ? 'table-active' : ''}
                              style={{ cursor: 'pointer', height: '58px' }}
                              onClick={() => openDetail(sub)}
                            >
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}><code>{formatOperatorCode(sub.operatorCode, sub.operatorName)}</code></td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}>
                                <div class="fw-bold">{sub.operatorName}</div>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}>
                                <span class={['role-badge', isPerkebunan ? 'operator-perkebunan' : 'operator-peternakan']} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                  {jenisText}
                                </span>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}>
                                <div class="d-flex align-items-center gap-1">
                                  <span class={['status-badge', sub.approvalStatus === 'approved' ? 'approved' : sub.approvalStatus === 'rejected' ? 'rejected' : 'pending']} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                    {sub.approvalStatus === 'approved' ? 'Disetujui' : sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                                  </span>
                                  {isLocked(sub.id) && <span title="Data Terkunci" style={{ fontSize: '0.85rem' }}>🔒</span>}
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textAlign: 'center', verticalAlign: 'middle', height: '58px' }}>
                                <div class="d-flex justify-content-center gap-2">
                                  {sub.approvalStatus === 'pending' && !isLocked(sub.id) && (
                                    <>
                                      <button
                                        type="button"
                                        class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white"
                                        disabled={isSubmitting.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveAction(sub.id, 'Disetujui via panel aksi');
                                        }}
                                      >
                                        {isSubmitting.value ? 'Loading...' : 'Setujui'}
                                      </button>
                                      <button
                                        type="button"
                                        class="btn btn-sm btn-danger px-3 rounded-pill fw-bold text-white"
                                        disabled={isSubmitting.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openRejectModal(sub.id);
                                        }}
                                      >
                                        Tolak
                                      </button>
                                    </>
                                  )}
                                  {sub.approvalStatus === 'approved' && (
                                    <>
                                      {!isLocked(sub.id) && (
                                        <button
                                          type="button"
                                          class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-bold"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleRejectAction(sub.id, 'Batal disetujui');
                                          }}
                                        >
                                          Batal Setuju
                                        </button>
                                      )}
                                      <button
                                        type="button"
                                        class={['btn btn-sm px-3 rounded-pill fw-bold', isLocked(sub.id) ? 'btn-warning' : 'btn-outline-secondary']}
                                        onClick={(e) => { e.stopPropagation(); toggleLock(sub.id); }}
                                        title={isLocked(sub.id) ? 'Buka Kunci Data' : 'Kunci Data Terverifikasi'}
                                      >
                                        {isLocked(sub.id) ? '🔓 Terkunci' : '🔒 Kunci'}
                                      </button>
                                    </>
                                  )}
                                  {sub.approvalStatus === 'rejected' && !isLocked(sub.id) && (
                                      <button
                                        type="button"
                                        class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white"
                                        onClick={() => handleApproveAction(sub.id, 'Disetujui kembali')}
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
                        });

                        for (let i = 0; i < emptyRowsCount; i++) {
                          rows.push(
                            <tr key={`empty-${i}`} style={{ height: '58px' }}>
                              <td style={{ height: '58px', padding: '0.75rem 0.5rem' }}>&nbsp;</td>
                              <td style={{ height: '58px', padding: '0.75rem 0.5rem' }}>&nbsp;</td>
                              <td style={{ height: '58px', padding: '0.75rem 0.5rem' }}>&nbsp;</td>
                              <td style={{ height: '58px', padding: '0.75rem 0.5rem' }}>&nbsp;</td>
                              <td style={{ height: '58px', padding: '0.75rem 0.5rem' }}>&nbsp;</td>
                            </tr>
                          );
                        }
                      }
                      return rows;
                    })()}
                  </tbody>
                </table>
              </div>

              {/* Pagination controls */}
              <div class="d-flex align-items-center justify-content-between px-4 py-3 bg-white border-top flex-wrap gap-3">
                <div class="text-muted small">
                  Menampilkan <span class="fw-bold text-dark">{filtered.value.length > 0 ? (currentPage.value - 1) * itemsPerPage + 1 : 0}</span> - <span class="fw-bold text-dark">{Math.min(currentPage.value * itemsPerPage, filtered.value.length)}</span> dari <span class="fw-bold text-dark">{filtered.value.length}</span> data pencatatan
                </div>
                {totalPages.value > 1 && (
                  <div class="d-flex align-items-center gap-2">
                    <button
                      type="button"
                      class="btn btn-sm px-3 rounded-pill fw-bold"
                      disabled={currentPage.value === 1}
                      onClick={() => currentPage.value--}
                      style={{
                        cursor: currentPage.value === 1 ? 'not-allowed' : 'pointer',
                        backgroundColor: '#ffffff',
                        color: currentPage.value === 1 ? '#b0a898' : '#3d2f24',
                        borderColor: '#ccc0b4',
                        opacity: currentPage.value === 1 ? 0.6 : 1,
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.85rem'
                      }}
                    >
                      Sebelumnya
                    </button>
                    {Array.from({ length: totalPages.value }, (_, i) => i + 1).map((page) => (
                      <button
                        type="button"
                        class="btn btn-sm rounded-pill fw-bold"
                        onClick={() => currentPage.value = page}
                        style={{
                          backgroundColor: currentPage.value === page ? '#3d2f24' : '#ffffff',
                          color: currentPage.value === page ? '#ffffff' : '#3d2f24',
                          borderColor: currentPage.value === page ? '#3d2f24' : '#ccc0b4',
                          minWidth: '32px',
                          fontSize: '0.8rem',
                          padding: '0.4rem'
                        }}
                      >
                        {page}
                      </button>
                    ))}
                    <button
                      type="button"
                      class="btn btn-sm px-3 rounded-pill fw-bold"
                      disabled={currentPage.value === totalPages.value}
                      onClick={() => currentPage.value++}
                      style={{
                        cursor: currentPage.value === totalPages.value ? 'not-allowed' : 'pointer',
                        backgroundColor: '#ffffff',
                        color: currentPage.value === totalPages.value ? '#b0a898' : '#3d2f24',
                        borderColor: '#ccc0b4',
                        opacity: currentPage.value === totalPages.value ? 0.6 : 1,
                        fontSize: '0.8rem',
                        padding: '0.4rem 0.85rem'
                      }}
                    >
                      Berikutnya
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Detail Modal */}
        <Teleport to="body">
          {selected.value && (
            <div class="peternakan-modal-overlay animate-fade-in" onClick={() => selectedId.value = null} style={{ zIndex: 1050 }}>
              <div class="peternakan-modal-card text-start" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px', backgroundColor: '#FAFAF8', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}>
                <div class="modal-header">
                  <button type="button" class="close-btn" onClick={() => selectedId.value = null} style={{ position: 'absolute', right: '1rem', top: '1rem' }}>✕</button>
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
                  <DetailRow label="Operator" value={`${selected.value.operatorName} (${formatOperatorCode(selected.value.operatorCode, selected.value.operatorName)})`} />
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
                        disabled={isSubmitting.value}
                        onClick={handleReject}
                        style={{ flex: 1 }}
                      >
                        Tolak
                      </button>
                      <button
                        type="button"
                        class="btn btn-success grow py-2.5 rounded-pill fw-bold text-white"
                        disabled={isSubmitting.value}
                        onClick={handleApprove}
                        style={{ flex: 1 }}
                      >
                        {isSubmitting.value ? 'Loading...' : 'Setujui'}
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
        </Teleport>
        {/* Custom Alert Modal */}
        <Teleport to="body">
          {alertModal.value.isOpen && (
            <div class="peternakan-modal-overlay" style={{ zIndex: 1100, alignItems: 'center' }} onClick={alertModal.value.type === 'error' ? closeAlertModal : closeAlertModal}>
              <div class="peternakan-modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', backgroundColor: '#fff', borderRadius: '24px', animation: 'scaleUp 0.3s ease' }}>
                <div class="p-4 text-center">
                  <div style={{ marginBottom: '1.5rem' }}>
                  {alertModal.value.type === 'error' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'rgba(220, 53, 69, 0.1)', color: '#dc3545', borderRadius: '50%' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>!</span>
                    </div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'rgba(25, 135, 84, 0.1)', color: '#198754', borderRadius: '50%' }}>
                      <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>✓</span>
                    </div>
                  )}
                </div>
                
                <h4 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.25rem', color: '#111827' }}>
                  {alertModal.value.title}
                </h4>
                
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: '1.5' }}>
                  {alertModal.value.message}
                </p>

                <button style={{ width: '100%', padding: '0.75rem', borderRadius: '50rem', backgroundColor: '#3D2F24', color: '#fff', border: 'none', fontWeight: 'bold' }} onClick={closeAlertModal}>
                  Tutup
                </button>
              </div>
            </div>
          </div>
          )}
        </Teleport>
        
        {/* Reject Modal */}
        <Teleport to="body">
          {rejectModal.value.isOpen && (
            <div class="peternakan-modal-overlay animate-fade-in" onClick={closeRejectModal} style={{ zIndex: 1100, alignItems: 'center' }}>
              <div class="peternakan-modal-card p-4" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '400px', backgroundColor: '#fff', borderRadius: '16px' }}>
                <h4 class="fw-bold mb-3">Konfirmasi Penolakan</h4>
                <p class="text-muted small mb-3">Silakan masukkan alasan penolakan (opsional):</p>
                <textarea
                  class="form-control mb-4 rounded-3"
                  rows={3}
                  placeholder="Contoh: Data tidak sesuai standar..."
                  value={rejectModal.value.note}
                  onInput={(e) => rejectModal.value.note = (e.target as HTMLTextAreaElement).value}
                ></textarea>
                <div class="d-flex gap-2 justify-content-end">
                  <button class="btn btn-light rounded-pill px-4" onClick={closeRejectModal}>Batal</button>
                  <button class="btn btn-danger rounded-pill px-4 text-white fw-bold" onClick={confirmReject}>Tolak Pencatatan</button>
                </div>
              </div>
            </div>
          )}
        </Teleport>
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
