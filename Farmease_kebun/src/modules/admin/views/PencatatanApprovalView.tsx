import { defineComponent, ref, computed, watch, onMounted, Teleport } from 'vue';
import {
  pencatatanSubmissions,
  pendingApprovalCount,
  approveSubmission,
  rejectSubmission,
  fetchSubmissions,
  type PencatatanSubmission,
  type ApprovalStatus,
} from '@/store/operatorAdmin';
import { userSession } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';

export default defineComponent({
  name: 'PencatatanApprovalView',
  setup() {
    const statusFilter = ref('Menunggu Persetujuan');
    const jenisFilter = ref('Semua Jenis Pencatatan');
    const selectedId = ref<string | null>(null);
    const isSubmitting = ref(false);
    const isLoading = ref(false);

    const rejectModal = ref({
      isOpen: false,
      submissionId: '',
      note: ''
    });

    const alertModal = ref({
      isOpen: false,
      title: '',
      message: '',
      type: 'success' as 'success' | 'error',
    });

    const currentPage = ref(1);
    const itemsPerPage = 5;

    onMounted(async () => {
      isLoading.value = true;
      try {
        await fetchSubmissions();
      } finally {
        isLoading.value = false;
      }
    });

    const filterOptions = ['Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Semua'];

    const filtered = computed(() => {
      let result = pencatatanSubmissions.value;
      if (statusFilter.value !== 'Semua') {
        const filterVal = statusFilter.value === 'Menunggu Persetujuan' ? 'pending' 
                        : statusFilter.value === 'Disetujui' ? 'approved' 
                        : 'rejected';
        result = result.filter(s => s.approvalStatus === filterVal);
      }
      return result;
    });

    const totalPages = computed(() => Math.ceil(filtered.value.length / itemsPerPage) || 1);

    watch(filtered, () => {
      if (currentPage.value > totalPages.value) currentPage.value = 1;
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
        selectedId.value = null;
      }
    };

    const handleRejectAction = async (id: string, note: string) => {
      const res = await rejectSubmission(id, reviewerName(), note);
      if (res) {
        alertModal.value = {
          isOpen: true,
          title: 'Berhasil Ditolak',
          message: res.message,
          type: 'success'
        };
      }
      selectedId.value = null;
    };

    const openRejectModal = (id: string) => {
      rejectModal.value = { isOpen: true, submissionId: id, note: '' };
    };

    const confirmReject = async () => {
      if (rejectModal.value.submissionId) {
        await handleRejectAction(rejectModal.value.submissionId, rejectModal.value.note || 'Ditolak via panel aksi');
      }
      rejectModal.value.isOpen = false;
    };

    const formatDate = (ts: number) =>
      new Intl.DateTimeFormat('id-ID', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      }).format(new Date(ts));

    const formatOperatorCode = (code: string, name: string) => {
      if (code === '1' || name.toLowerCase().includes('admin')) return 'ADM-01';
      if (code === '2' || name.toLowerCase().includes('ternak') || name.toLowerCase().includes('kandang')) return 'OPT-01';
      if (code === '3' || name.toLowerCase().includes('kebun')) return 'PK001';
      if (code === '4' || name.toLowerCase().includes('pemilik')) return 'PEM-01';
      if (/^\d+$/.test(code)) return `OP-00${code}`;
      return code;
    };

    const getOperatorDisplayName = (sub: PencatatanSubmission) => {
      const name = sub.operatorName || '';
      if (name.toLowerCase().includes('kebun')) return 'Operator Kebun';
      if (name.toLowerCase().includes('ternak')) return 'Operator Ternak';
      return name || 'Operator Perkebunan';
    };

    const isPerkebunanSub = (sub: PencatatanSubmission) =>
      !['pakan', 'kesehatan', 'kotoran', 'perkawinan', 'kelahiran', 'berat_badan', 'stok_pakan', 'weighing'].includes((sub.type || '').toLowerCase());

    const getPayloadInfo = (sub: PencatatanSubmission) => {
      const payload: any = (sub.payload as any)?.data || sub.payload || {};
      const items: any[] = payload?.items || [];
      const firstItem = items[0] || {};
      return {
        tanggal: firstItem.tanggal || (sub.submittedAt ? formatDate(sub.submittedAt) : '-'),
        fasePohon: firstItem.fasePohon || firstItem.fase || '-',
        varietas: firstItem.selectedVarietas || firstItem.varietas || '-',
        jenisPencatatan: sub.typeLabel || sub.type || '-',
        rincian: firstItem.selectedRincian || firstItem.rincian || '-',
        rutinitas: firstItem.rutinitas || 'Bulanan',
        deskripsi: firstItem.deskripsiPemupukan || firstItem.deskripsiPenyiraman || firstItem.deskripsiPenanaman || firstItem.note || firstItem.catatan || sub.summary || '',
        lahanId: sub.cageCode || 'L001',
        lahanNama: (() => {
          const code = sub.cageCode || 'L001';
          if (code === 'L001') return 'Lahan Alpukat';
          if (code === 'L002') return 'Lahan Kelengkeng';
          return `Lahan ${code}`;
        })(),
      };
    };

    return () => (
      <div class="animate-fade-in-up" style={{ padding: '0 0.5rem' }}>
        {/* Header Section */}
        <div class="view-header mb-4 d-flex justify-content-between align-items-center flex-wrap gap-3">
          <div>
            <Typography variant="h2" class="view-title" style={{ fontFamily: "'Inter', sans-serif", fontSize: '1.75rem', fontWeight: '800', margin: 0 }}>
              Persetujuan Pencatatan
            </Typography>
            <Typography variant="span" color="secondary" style={{ fontSize: '0.875rem', color: '#6C757D', marginTop: '4px', display: 'block' }}>
              {pendingApprovalCount.value} pencatatan menunggu persetujuan admin
            </Typography>
          </div>
          
          <div style={{ minWidth: '240px' }}>
            <select
              class="form-select"
              value={statusFilter.value}
              onChange={(e: any) => statusFilter.value = e.target.value}
              style={{
                borderRadius: '8px',
                border: '1.5px solid #dce1d0',
                padding: '0.65rem 1rem',
                fontSize: '0.9rem',
                fontWeight: '600',
                color: '#374151',
                backgroundColor: '#fff',
                cursor: 'pointer',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
              }}
            >
              {filterOptions.map(opt => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          </div>
        </div>



        {/* Table Container */}
        <div style={{ border: '1.5px solid #E6D9CE', borderRadius: '12px', overflow: 'hidden', backgroundColor: '#fff' }}>
          {/* Desktop Table */}
          <div class="d-none d-md-block" style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#F9F8F6' }}>
                <tr>
                  <th style={{ padding: '1rem', fontSize: '0.78rem', fontWeight: '800', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>KODE PENGGUNA</th>
                  <th style={{ padding: '1rem', fontSize: '0.78rem', fontWeight: '800', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>NAMA PENGGUNA</th>
                  <th style={{ padding: '1rem', fontSize: '0.78rem', fontWeight: '800', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>JENIS PENCATATAN</th>
                  <th style={{ padding: '1rem', fontSize: '0.78rem', fontWeight: '800', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px' }}>STATUS PENCATATAN</th>
                  <th style={{ padding: '1rem', fontSize: '0.78rem', fontWeight: '800', color: '#7F8C8D', textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'center', width: '240px' }}>AKSI</th>
                </tr>
              </thead>
              <tbody>
                {isLoading.value ? (
                  <tr>
                    <td colspan={5} style={{ padding: '3rem', textAlign: 'center', color: '#6C757D' }}>
                      Memuat data...
                    </td>
                  </tr>
                ) : filtered.value.length === 0 ? (
                  <tr>
                    <td colspan={5} style={{ padding: '3rem', textAlign: 'center', color: '#6C757D', fontSize: '0.9rem' }}>
                      Tidak ada data pencatatan ditemukan.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.value.map((sub, index) => {
                    const isPerkebunan = isPerkebunanSub(sub);
                    const opCode = formatOperatorCode(sub.operatorCode, sub.operatorName);
                    const opName = getOperatorDisplayName(sub);
                    const isLast = index === paginatedItems.value.length - 1;
                    return (
                      <tr
                        key={sub.id}
                        style={{ borderBottom: isLast ? 'none' : '1px solid #f1eff0', cursor: 'pointer' }}
                        onClick={() => openDetail(sub)}
                      >
                        <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle' }}>
                          <code style={{ fontSize: '0.88rem', fontWeight: '700', color: '#374151', backgroundColor: 'transparent' }}>{opCode}</code>
                        </td>
                        <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle', fontWeight: '700', fontSize: '0.9rem', color: '#000' }}>
                          {opName}
                        </td>
                        <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.73rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            backgroundColor: isPerkebunan ? '#5C6B2E' : '#7B5E3A',
                            color: '#fff',
                          }}>
                            {isPerkebunan ? 'Perkebunan' : 'Peternakan'}
                          </span>
                        </td>
                        <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle' }}>
                          <span style={{
                            display: 'inline-block',
                            padding: '0.3rem 0.75rem',
                            borderRadius: '6px',
                            fontSize: '0.73rem',
                            fontWeight: '800',
                            textTransform: 'uppercase',
                            letterSpacing: '0.3px',
                            backgroundColor: sub.approvalStatus === 'approved' ? '#D4EDDA' : sub.approvalStatus === 'rejected' ? '#F8D7DA' : '#FFF3CD',
                            color: sub.approvalStatus === 'approved' ? '#155724' : sub.approvalStatus === 'rejected' ? '#721C24' : '#856404',
                          }}>
                            {sub.approvalStatus === 'approved' ? 'Disetujui' : sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                          </span>
                        </td>
                        <td style={{ padding: '1.1rem 1rem', verticalAlign: 'middle', textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', alignItems: 'center' }}>
                            {sub.approvalStatus === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  disabled={isSubmitting.value}
                                  onClick={(e) => { e.stopPropagation(); handleApproveAction(sub.id, 'Disetujui via panel aksi'); }}
                                  style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: 'none', backgroundColor: '#38431F', color: '#fff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  Setujui
                                </button>
                                <button
                                  type="button"
                                  disabled={isSubmitting.value}
                                  onClick={(e) => { e.stopPropagation(); openRejectModal(sub.id); }}
                                  style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: 'none', backgroundColor: '#B91C1C', color: '#fff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            {sub.approvalStatus === 'approved' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleRejectAction(sub.id, 'Batal disetujui'); }}
                                style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1.5px solid #E6D9CE', backgroundColor: '#fff', color: '#374151', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Batal Setuju
                              </button>
                            )}
                            {sub.approvalStatus === 'rejected' && (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); handleApproveAction(sub.id, 'Disetujui kembali'); }}
                                style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: 'none', backgroundColor: '#38431F', color: '#fff', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                              >
                                Setujui
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); openDetail(sub); }}
                              style={{ padding: '0.4rem 0.9rem', borderRadius: '20px', border: '1.5px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '0.8rem', fontWeight: '700', cursor: 'pointer' }}
                            >
                              Rincian
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

          {/* Mobile Card List */}
          <div class="d-block d-md-none p-3">
            {paginatedItems.value.map((sub) => {
              const isPerkebunan = isPerkebunanSub(sub);
              const opCode = formatOperatorCode(sub.operatorCode, sub.operatorName);
              const opName = getOperatorDisplayName(sub);
              return (
                <div
                  key={sub.id}
                  onClick={() => openDetail(sub)}
                  style={{ border: '1.5px solid #E6D9CE', borderRadius: '12px', padding: '1.25rem', marginBottom: '1rem', backgroundColor: '#fff', cursor: 'pointer' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <div>
                      <div style={{ fontWeight: '800', fontSize: '1rem', color: '#000' }}>{opName}</div>
                      <code style={{ fontSize: '0.8rem', color: '#6C757D' }}>{opCode}</code>
                    </div>
                    <span style={{ padding: '0.3rem 0.65rem', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', backgroundColor: isPerkebunan ? '#5C6B2E' : '#7B5E3A', color: '#fff' }}>
                      {isPerkebunan ? 'Perkebunan' : 'Peternakan'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <span style={{
                      padding: '0.3rem 0.65rem',
                      borderRadius: '6px',
                      fontSize: '0.7rem',
                      fontWeight: '800',
                      backgroundColor: sub.approvalStatus === 'approved' ? '#D4EDDA' : sub.approvalStatus === 'rejected' ? '#F8D7DA' : '#FFF3CD',
                      color: sub.approvalStatus === 'approved' ? '#155724' : sub.approvalStatus === 'rejected' ? '#721C24' : '#856404',
                    }}>
                      {sub.approvalStatus === 'approved' ? 'Disetujui' : sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                    </span>
                    <div style={{ display: 'flex', gap: '0.4rem' }}>
                      {sub.approvalStatus === 'pending' && (
                        <>
                          <button type="button" onClick={(e) => { e.stopPropagation(); handleApproveAction(sub.id, 'Disetujui via panel aksi'); }} style={{ padding: '0.35rem 0.8rem', borderRadius: '20px', border: 'none', backgroundColor: '#38431F', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>Setujui</button>
                          <button type="button" onClick={(e) => { e.stopPropagation(); openRejectModal(sub.id); }} style={{ padding: '0.35rem 0.8rem', borderRadius: '20px', border: 'none', backgroundColor: '#B91C1C', color: '#fff', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>Tolak</button>
                        </>
                      )}
                      <button type="button" onClick={(e) => { e.stopPropagation(); openDetail(sub); }} style={{ padding: '0.35rem 0.8rem', borderRadius: '20px', border: '1.5px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '0.78rem', fontWeight: '700', cursor: 'pointer' }}>Rincian</button>
                    </div>
                  </div>
                </div>
              );
            })}
            {filtered.value.length === 0 && (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#6C757D', fontSize: '0.9rem' }}>
                Tidak ada data pencatatan ditemukan.
              </div>
            )}
          </div>

          {/* Pagination Footer */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1.25rem', borderTop: '1px solid #f1eff0', flexWrap: 'wrap', gap: '0.5rem' }}>
            <div style={{ fontSize: '0.82rem', color: '#6C757D' }}>
              Menampilkan{' '}
              <span style={{ fontWeight: '700', color: '#000' }}>
                {filtered.value.length > 0 ? (currentPage.value - 1) * itemsPerPage + 1 : 0}
              </span>
              {' - '}
              <span style={{ fontWeight: '700', color: '#000' }}>
                {Math.min(currentPage.value * itemsPerPage, filtered.value.length)}
              </span>
              {' dari '}
              <span style={{ fontWeight: '700', color: '#000' }}>{filtered.value.length}</span>
              {' data pencatatan'}
            </div>
            {totalPages.value > 1 && (
              <div style={{ display: 'flex', gap: '0.35rem', alignItems: 'center' }}>
                <button
                  type="button"
                  disabled={currentPage.value === 1}
                  onClick={() => currentPage.value--}
                  style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1.5px solid #E6D9CE', background: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: currentPage.value === 1 ? 'not-allowed' : 'pointer', opacity: currentPage.value === 1 ? 0.5 : 1 }}
                >
                  ‹
                </button>
                {Array.from({ length: totalPages.value }, (_, i) => i + 1).map((page) => (
                  <button
                    type="button"
                    key={page}
                    onClick={() => currentPage.value = page}
                    style={{
                      padding: '0.35rem 0.65rem',
                      borderRadius: '6px',
                      border: '1.5px solid',
                      borderColor: currentPage.value === page ? '#38431F' : '#E6D9CE',
                      backgroundColor: currentPage.value === page ? '#38431F' : '#fff',
                      color: currentPage.value === page ? '#fff' : '#374151',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                      cursor: 'pointer',
                      minWidth: '32px',
                    }}
                  >
                    {page}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={currentPage.value === totalPages.value}
                  onClick={() => currentPage.value++}
                  style={{ padding: '0.35rem 0.8rem', borderRadius: '6px', border: '1.5px solid #E6D9CE', background: '#fff', fontSize: '0.85rem', fontWeight: '600', cursor: currentPage.value === totalPages.value ? 'not-allowed' : 'pointer', opacity: currentPage.value === totalPages.value ? 0.5 : 1 }}
                >
                  ›
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Rincian Detail Modal */}
        <Teleport to="body">
          {selected.value && (() => {
            const sub = selected.value!;
            const info = getPayloadInfo(sub);
            const opCode = formatOperatorCode(sub.operatorCode, sub.operatorName);
            const opName = getOperatorDisplayName(sub);
            const isPending = sub.approvalStatus === 'pending';

            const payload: any = (sub.payload as any)?.data || sub.payload || {};
            const items: any[] = payload?.items || [];
            const firstItem = items[0] || {};

            return (
              <div
                style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
                onClick={() => selectedId.value = null}
              >
                <div
                  style={{ backgroundColor: '#fff', borderRadius: '16px', width: '100%', maxWidth: '520px', maxHeight: '90vh', display: 'flex', flexDirection: 'column', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                  onClick={(e) => e.stopPropagation()}
                >
                  {/* Modal Header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1.25rem 1.5rem', borderBottom: '1px solid #f1eff0', position: 'relative' }}>
                    <div style={{ flex: 1 }} />
                    <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: '800', color: '#000', textAlign: 'center', flex: 8 }}>Persetujuan Pencatatan</h3>
                    <button
                      type="button"
                      onClick={() => selectedId.value = null}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.5rem', color: '#9ca3af', lineHeight: 1, padding: '0.25rem', flex: 1, textAlign: 'right' }}
                    >
                      &times;
                    </button>
                  </div>

                  {/* Modal Body */}
                  <div style={{ overflowY: 'auto', padding: '1.5rem', flex: 1 }}>
                    {/* Lahan & Operator Cards */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #E6D9CE', borderRadius: '12px', backgroundColor: '#ffffff' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', border: '1px solid #E6D9CE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src="/icon/bibit.png" alt="Lahan" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1.05rem', color: '#000' }}>{info.lahanNama}</div>
                          <div style={{ fontSize: '0.82rem', color: '#6C757D', marginTop: '2px' }}>ID Lahan: {info.lahanId}</div>
                        </div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', padding: '1rem 1.25rem', border: '1px solid #E6D9CE', borderRadius: '12px', backgroundColor: '#ffffff' }}>
                        <div style={{ width: '40px', height: '40px', backgroundColor: '#fff', border: '1px solid #E6D9CE', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <img src="/icon/operator.png" alt="Operator" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <div style={{ fontWeight: '600', fontSize: '1.05rem', color: '#000' }}>{opName}</div>
                          <div style={{ fontSize: '0.82rem', color: '#6C757D', marginTop: '2px' }}>ID Pengguna: {opCode}</div>
                        </div>
                      </div>
                    </div>

                    {/* Informasi Lengkap */}
                    <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#000', marginBottom: '1rem' }}>Informasi Lengkap</h4>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      {(() => {
                        const list = [
                          { label: 'Tanggal', value: info.tanggal },
                          { label: 'Fase Pohon', value: info.fasePohon },
                          { label: 'Varietas', value: info.varietas },
                          { label: 'Jenis Pencatatan', value: info.jenisPencatatan },
                          { label: 'Rincian', value: info.rincian },
                          { label: 'Rutinitas', value: info.rutinitas },
                        ];
                        const typeLower = (sub.type || '').toLowerCase();
                        if (typeLower.includes('siram') || typeLower.includes('penyiraman')) {
                          if (firstItem.sesiPenyiraman) list.push({ label: 'Sesi Penyiraman', value: firstItem.sesiPenyiraman });
                          if (firstItem.volumeAir) list.push({ label: 'Volume Air', value: `${firstItem.volumeAir} Liter` });
                          if (firstItem.teknikPenyiraman && firstItem.teknikPenyiraman !== 'Teknik Penyiraman') list.push({ label: 'Teknik Penyiraman', value: firstItem.teknikPenyiraman });
                        } else if (typeLower.includes('pupuk') || typeLower.includes('pemupukan')) {
                          if (firstItem.jenisPupukDetail && firstItem.jenisPupukDetail !== 'Jenis Pupuk Detail') list.push({ label: 'Detail Jenis Pupuk', value: firstItem.jenisPupukDetail });
                          if (firstItem.teknikPemupukan && firstItem.teknikPemupukan !== 'Teknik Pemupukan') list.push({ label: 'Teknik Pemupukan', value: firstItem.teknikPemupukan });
                          if (firstItem.jumlahBeratPupuk) list.push({ label: 'Jumlah Berat Pupuk', value: `${firstItem.jumlahBeratPupuk} kg` });
                        } else if (typeLower.includes('obat') || typeLower.includes('perawatan') || typeLower.includes('hama') || typeLower.includes('opt')) {
                          if (firstItem.jenisObat && firstItem.jenisObat !== 'Jenis Obat') list.push({ label: 'Jenis Obat', value: firstItem.jenisObat });
                          if (firstItem.namaObat) list.push({ label: 'Nama Obat', value: firstItem.namaObat });
                          if (firstItem.volumeObat) list.push({ label: 'Volume Obat', value: `${firstItem.volumeObat} ${firstItem.satuanVolumeObat || 'ml'}` });
                          if (firstItem.teknikPemberianObat && firstItem.teknikPemberianObat !== 'Teknik Pemberian Obat') list.push({ label: 'Teknik Pemberian', value: firstItem.teknikPemberianObat });
                        } else if (typeLower.includes('pangkas') || typeLower.includes('pemangkasan')) {
                          if (firstItem.metodePemangkasan && firstItem.metodePemangkasan !== 'Metode Pemangkasan') list.push({ label: 'Metode Pemangkasan', value: firstItem.metodePemangkasan });
                          if (firstItem.jumlahPemangkasan) list.push({ label: 'Jumlah Pemangkasan', value: firstItem.jumlahPemangkasan });
                        } else if (typeLower.includes('panen')) {
                          if (firstItem.jumlahPanen) list.push({ label: 'Jumlah Pohon Dipanen', value: firstItem.jumlahPanen });
                          if (firstItem.beratPanen) list.push({ label: 'Berat Hasil Panen', value: `${firstItem.beratPanen} ${firstItem.satuanBerat || 'kg'}` });
                          if (firstItem.kondisiPanen && firstItem.kondisiPanen !== 'Kondisi Panen') list.push({ label: 'Kondisi Panen', value: firstItem.kondisiPanen });
                          if (firstItem.caraPanen && firstItem.caraPanen !== 'Cara Panen') list.push({ label: 'Cara Panen', value: firstItem.caraPanen });
                        } else if (typeLower.includes('fermentasi') || typeLower.includes('pengolahan')) {
                          if (firstItem.dekomposer) list.push({ label: 'Dekomposer', value: firstItem.dekomposer });
                          if (firstItem.molase) list.push({ label: 'Molase', value: firstItem.molase });
                          if (firstItem.jumlahAir) list.push({ label: 'Volume Air Tambahan', value: `${firstItem.jumlahAir} Liter` });
                          if (firstItem.hasilJadi) list.push({ label: 'Hasil Jadi', value: firstItem.hasilJadi });
                          if (firstItem.qty) list.push({ label: 'Estimasi Produksi', value: `${firstItem.qty} ${firstItem.unit || 'kg'}` });
                        }

                        return list.map(({ label, value }) => value && value !== '-' && value !== '' ? (
                          <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.7rem 0', borderBottom: '1px solid #f1eff0' }}>
                            <span style={{ fontSize: '0.88rem', color: '#6C757D' }}>{label}</span>
                            <span style={{ fontSize: '0.88rem', fontWeight: '600', color: '#000', textAlign: 'right', maxWidth: '55%' }}>{value}</span>
                          </div>
                        ) : null);
                      })()}
                    </div>

                    {/* Deskripsi */}
                    <div style={{ marginTop: '1.5rem' }}>
                      <h4 style={{ fontWeight: '700', fontSize: '1.1rem', color: '#000', marginBottom: '0.75rem' }}>Deskripsi</h4>
                      <textarea
                        rows={3}
                        class="form-control"
                        value={info.deskripsi}
                        readonly={true}
                        style={{ borderRadius: '8px', border: '1.5px solid #E6D9CE', resize: 'none', fontSize: '0.9rem', color: '#374151', backgroundColor: '#FAFAF8' }}
                      />
                    </div>

                    {/* Review note if already reviewed */}
                    {sub.approvalStatus !== 'pending' && sub.reviewNote && (
                      <div style={{ marginTop: '1rem', padding: '0.85rem 1rem', borderRadius: '8px', backgroundColor: sub.approvalStatus === 'approved' ? '#EDF7ED' : '#FDECEC', border: `1px solid ${sub.approvalStatus === 'approved' ? '#c3e6cb' : '#f5c6cb'}` }}>
                        <div style={{ fontSize: '0.75rem', fontWeight: '800', color: sub.approvalStatus === 'approved' ? '#155724' : '#721C24', marginBottom: '0.3rem', textTransform: 'uppercase' }}>Catatan Review</div>
                        <div style={{ fontSize: '0.88rem', color: '#374151' }}>{sub.reviewNote}</div>
                      </div>
                    )}

                    {/* Action Buttons Inline inside Modal Body */}
                    {isPending ? (
                      <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem' }}>
                        <button
                          type="button"
                          disabled={isSubmitting.value}
                          onClick={() => openRejectModal(sub.id)}
                          style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', backgroundColor: '#B91C1C', color: '#fff', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Tolak
                        </button>
                        <button
                          type="button"
                          disabled={isSubmitting.value}
                          onClick={() => handleApproveAction(sub.id, 'Disetujui via modal rincian')}
                          style={{ flex: 1, padding: '0.85rem', borderRadius: '8px', border: 'none', backgroundColor: '#303B1E', color: '#fff', fontSize: '1rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          {isSubmitting.value ? 'Memproses...' : 'Setujui'}
                        </button>
                      </div>
                    ) : (
                      <div style={{ marginTop: '1.5rem' }}>
                        <button
                          type="button"
                          onClick={() => selectedId.value = null}
                          style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #d1d5db', backgroundColor: '#fff', color: '#374151', fontSize: '0.95rem', fontWeight: '700', cursor: 'pointer' }}
                        >
                          Tutup
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}
        </Teleport>

        {/* Alert Modal */}
        <Teleport to="body">
          {alertModal.value.isOpen && (
            <div
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
              onClick={() => alertModal.value.isOpen = false}
            >
              <div
                style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '2rem', maxWidth: '380px', width: '100%', textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <div style={{ marginBottom: '1.25rem' }}>
                  {alertModal.value.type === 'error' ? (
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: 'rgba(220,53,69,0.1)', color: '#dc3545', borderRadius: '50%', fontSize: '1.75rem', fontWeight: 'bold' }}>!</div>
                  ) : (
                    <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', backgroundColor: 'rgba(25,135,84,0.1)', color: '#198754', borderRadius: '50%', fontSize: '1.75rem', fontWeight: 'bold' }}>✓</div>
                  )}
                </div>
                <h4 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.2rem', color: '#111827' }}>{alertModal.value.title}</h4>
                <p style={{ color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{alertModal.value.message}</p>
                <button
                  style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', backgroundColor: '#38431F', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer' }}
                  onClick={() => alertModal.value.isOpen = false}
                >
                  Tutup
                </button>
              </div>
            </div>
          )}
        </Teleport>

        {/* Reject Modal */}
        <Teleport to="body">
          {rejectModal.value.isOpen && (
            <div
              style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}
              onClick={() => rejectModal.value.isOpen = false}
            >
              <div
                style={{ backgroundColor: '#fff', borderRadius: '16px', padding: '1.75rem', maxWidth: '400px', width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}
                onClick={(e) => e.stopPropagation()}
              >
                <h4 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.1rem', color: '#000' }}>Konfirmasi Penolakan</h4>
                <p style={{ color: '#6C757D', fontSize: '0.88rem', marginBottom: '1rem' }}>Silakan masukkan alasan penolakan (opsional):</p>
                <textarea
                  class="form-control mb-4"
                  rows={3}
                  placeholder="Contoh: Data tidak sesuai standar..."
                  value={rejectModal.value.note}
                  onInput={(e) => rejectModal.value.note = (e.target as HTMLTextAreaElement).value}
                  style={{ borderRadius: '8px', border: '1.5px solid #E6D9CE', fontSize: '0.9rem', resize: 'none' }}
                />
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => rejectModal.value.isOpen = false}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: '1.5px solid #E6D9CE', backgroundColor: '#fff', color: '#374151', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Batal
                  </button>
                  <button
                    type="button"
                    onClick={confirmReject}
                    style={{ flex: 1, padding: '0.75rem', borderRadius: '8px', border: 'none', backgroundColor: '#B91C1C', color: '#fff', fontWeight: '700', cursor: 'pointer', fontSize: '0.9rem' }}
                  >
                    Tolak Pencatatan
                  </button>
                </div>
              </div>
            </div>
          )}
        </Teleport>
      </div>
    );
  },
});
