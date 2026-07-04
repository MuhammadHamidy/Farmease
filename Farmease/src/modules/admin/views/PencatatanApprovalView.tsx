import { defineComponent, ref, computed, watch, Teleport } from 'vue';
import Typography from '@/shared/ui/admin/Typography';
import Button from '@/shared/ui/admin/Button';
import Select from '@/shared/ui/admin/Select';
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
import { sheep } from '@/store/livestock';
import { fetchStocks } from '@/modules/ternak/store/peternakan';

const labelMappings: Record<string, string> = {
  targetId: 'ID Domba',
  qty: 'Jumlah/Volume',
  unit: 'Satuan',
  note: 'Catatan',
  tindakan: 'Tindakan/Diagnosa',
  obat: 'Obat/Pakan/Vitamin',
  vitaminAmount: 'Jumlah Vitamin Masuk',
  idPejantan: 'ID Pejantan',
  metoda: 'Metode Kawin',
  kotoranState: 'Jenis/Kondisi Kotoran',
  jumlahAnak: 'Jumlah Anak',
  kondisiInduk: 'Kondisi Induk',
  kondisiAnak: 'Kondisi Anak',
  tanggal: 'Tanggal',
  kandangAnak: 'Kandang Anak',
  namaAnak: 'Nama Anak',
  beratLahir: 'Berat Lahir',
  pemanfaatan: 'Pemanfaatan (Kotoran)',
  waktuIB: 'Waktu Inseminasi Buatan (IB)',
  sumberPejantan: 'Sumber Pejantan',
  asalSemen: 'Kode Batch/ Straw Semen',
  namaInseminator: 'Nama Inseminator',
  donorName: 'Nama/ID Pejantan Donor',
  donorOrigin: 'Instansi/Balai Asal Pejantan Donor',
  idMating: 'ID Perkawinan',
  metodePemeriksaan: 'Metode Pemeriksaan',
  hasilPemeriksaan: 'Hasil Pemeriksaan',
  hijauan: 'Pakan Mentah (Hijauan)',
  energi: 'Pakan Tambahan (Energi)',
  protein: 'Pakan Tambahan (Protein)',
  mineral: 'Pakan Tambahan (Mineral)',
  sheepCode: 'Kode Ear Tag Anak',
  genderAnak: 'Jenis Kelamin Anak',

  // Perkebunan Mappings
  alatPembersihan: 'Alat Pembersihan',
  bagianPembersihan: 'Bagian Pembersihan',
  deskripsiPembersihan: 'Deskripsi Pembersihan',
  beratGulma: 'Berat Gulma',
  beratBahanPembumbun: 'Berat Bahan Pembumbun',
  beratLimbah: 'Berat Limbah',
  satuanBerat: 'Satuan Berat',
  jenisGulma: 'Jenis Gulma',
  bahanPembumbun: 'Bahan Pembumbun',
  tujuanPemanfaatan: 'Tujuan Pemanfaatan',
  teknikPenyiraman: 'Teknik Penyiraman',
  sesiPenyiraman: 'Sesi Penyiraman',
  deskripsiPenyiraman: 'Deskripsi Penyiraman',
  volumeAir: 'Volume Air',
  satuanVolumeAir: 'Satuan Volume Air',
  jumlahLubangBiopori: 'Jumlah Lubang Biopori',
  jenisBibit: 'Jenis Bibit',
  alasanPenanaman: 'Alasan Penanaman',
  deskripsiPenanaman: 'Deskripsi Penanaman',
  jenisPerangsang: 'Jenis Perangsang',
  dosisPerangsang: 'Dosis Perangsang',
  deskripsiPembuahan: 'Deskripsi Pembuahan',
  diameterBuah: 'Diameter Buah',
  satuanDiameter: 'Satuan Diameter',
  jumlahBuahDibuang: 'Jumlah Buah Dibuang',
  sisaBuahPerTandan: 'Sisa Buah per Tandan',
  bahanPembungkus: 'Bahan Pembungkus',
  jumlahBuahDibungkus: 'Jumlah Buah Dibungkus',
  jumlahPemangkasan: 'Jumlah Pemangkasan',
  deskripsiPemangkasan: 'Deskripsi Pemangkasan',
  metodePemangkasan: 'Metode Pemangkasan',
  jumlahPanen: 'Jumlah Panen',
  beratPanen: 'Berat Panen',
  deskripsiPanen: 'Deskripsi Panen',
  kondisiPanen: 'Kondisi Panen',
  caraPanen: 'Cara Panen',
  jenisObat: 'Jenis Obat',
  kodePohonPerawatan: 'Kode Pohon Perawatan',
  bagianPohon: 'Bagian Pohon',
  teknikPemberian: 'Teknik Pemberian',
  namaObat: 'Nama Obat/Bahan',
  dosisObat: 'Dosis Obat',
  deskripsiPerawatan: 'Deskripsi Perawatan',
  teknikPengendalian: 'Teknik Pengendalian',
  namaPestisida: 'Nama Pestisida',
  dosisPestisida: 'Dosis Pestisida',
  volumeLarutan: 'Volume Larutan',
  satuanVolumeLarutan: 'Satuan Volume Larutan',
  volumeObat: 'Volume Obat',
  satuanVolumeObat: 'Satuan Volume Obat',
  namaOPT: 'Nama OPT (Organisme Pengganggu)',
  targetHama: 'Target Hama',
  namaGejala: 'Nama Gejala',
  jenisPupuk: 'Jenis Pupuk',
  kodePohonPemupukan: 'Kode Pohon Pemupukan',
  jumlahBeratPupuk: 'Jumlah Berat Pupuk',
  deskripsiPemupukan: 'Deskripsi Pemupukan',
  jenisPupukDetail: 'Detail Jenis Pupuk',
  teknikPemupukan: 'Teknik Pemupukan',
  jumlahStokMasuk: 'Jumlah Stok Masuk',
  jumlahStokKeluar: 'Jumlah Stok Keluar',
  catatanStok: 'Catatan Stok',
  selectedRincian: 'Rincian Aktivitas',
  kategoriPencatatan: 'Kategori Pencatatan',
  selectedVarietas: 'Varietas Tanaman'
};

const camelToTitle = (text: string) => {
  const result = text.replace(/([A-Z])/g, " $1");
  return result.charAt(0).toUpperCase() + result.slice(1);
};

const shouldShowKey = (type: string, key: string, item: any): boolean => {
  const t = (type || '').toLowerCase();
  const formName = item.name || '';
  
  if (t === 'perkawinan') {
    if (formName === 'Kontrol Kebuntingan') {
      return ['targetId', 'idMating', 'metodePemeriksaan', 'hasilPemeriksaan', 'tanggal', 'note'].includes(key);
    }
    if (formName === 'Cek Birahi' || formName === 'Pengecekan Birahi') {
      return ['targetId', 'hasilPemeriksaan', 'tanggal', 'note'].includes(key);
    }
    const baseKeys = ['targetId', 'idPejantan', 'metoda', 'tanggal', 'note'];
    if (baseKeys.includes(key)) {
      if (key === 'metoda' && (formName === 'IB' || formName === 'Inseminasi Buatan' || formName === 'Kawin Alam' || formName === 'Kawin Alami')) {
        return false;
      }
      return true;
    }
    
    const isIB = item.metoda === 'ib' || item.metoda === 'inseminasi buatan' || formName === 'IB' || formName === 'Inseminasi Buatan';
    if (isIB) {
      const ibKeys = ['waktuIB', 'sumberPejantan', 'asalSemen', 'namaInseminator'];
      if (ibKeys.includes(key)) return true;
      if (item.sumberPejantan === 'eksternal') {
        return ['donorName', 'donorOrigin'].includes(key);
      }
    }
    return false;
  }
  
  if (t === 'kelahiran') {
    return [
      'targetId', 'idPejantan', 'sheepCode', 'namaAnak', 'genderAnak',
      'jumlahAnak', 'kondisiInduk', 'kondisiAnak', 'kandangAnak', 'beratLahir', 
      'tanggal', 'note'
    ].includes(key);
  }
  
  if (t === 'pakan') {
    return ['targetId', 'metoda', 'obat', 'qty', 'unit', 'tanggal', 'note', 'hijauan', 'energi', 'protein', 'mineral'].includes(key);
  }
  
  if (t === 'stok_pakan') {
    if (formName === 'Konversi Pakan') {
      return ['obat', 'qty', 'unit', 'tanggal', 'note', 'hijauan', 'energi', 'protein', 'mineral'].includes(key);
    }
    return ['obat', 'qty', 'unit', 'tanggal', 'note'].includes(key);
  }
  
  if (t === 'kesehatan') {
    return ['targetId', 'tindakan', 'obat', 'vitaminAmount', 'tanggal', 'note'].includes(key);
  }
  
  if (t === 'kotoran') {
    return ['targetId', 'qty', 'unit', 'kotoranState', 'tanggal', 'note'].includes(key);
  }
  
  if (t === 'weighing' || t === 'berat_badan') {
    return ['targetId', 'qty', 'unit', 'tanggal', 'note'].includes(key);
  }
  
  return !['id', 'name', 'mode'].includes(key);
};

export default defineComponent({
  name: 'PencatatanApprovalView',
  setup() {
    fetchSubmissions();
    const statusFilter = ref('Menunggu Persetujuan');
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

    const currentPage = ref(1);
    const itemsPerPage = 5;

    const filterOptions = ['Menunggu Persetujuan', 'Disetujui', 'Ditolak', 'Semua'];

    const filtered = computed(() => {
      const map: Record<string, ApprovalStatus | 'all'> = {
        'Menunggu Persetujuan': 'pending',
        Disetujui: 'approved',
        Ditolak: 'rejected',
        Semua: 'all',
      };
      const key = map[statusFilter.value] || 'all';
      let list = pencatatanSubmissions.value || [];
      if (key !== 'all') {
        list = list.filter((s) => s.approvalStatus === key);
      }

      // Automatically filter out any perkebunan records (only show livestock/peternakan)
      list = list.filter((s) => {
        const typeLower = (s.type || '').toLowerCase();
        const isPerkebunan = ['perawatan', 'pemangkasan', 'panen', 'aktivitas', 'lahan', 'pohon', 'tanaman', 'stok obat', 'stok pupuk', 'stok_obat', 'stok_pupuk'].includes(typeLower);
        return !isPerkebunan;
      });

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
      pencatatanSubmissions.value.find((s) => s.id_submission === selectedId.value) || null,
    );

    const openDetail = (sub: PencatatanSubmission) => {
      selectedId.value = sub.id_submission;
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
          // Refresh stock data so operator sees updated stok after approval
          if (res.success) {
            fetchStocks().catch(() => {});
          }
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleRejectAction = async (id: string, note: string) => {
      if (isSubmitting.value) return;
      isSubmitting.value = true;
      try {
        const res = await rejectSubmission(id, reviewerName(), note);
        if (res) {
          alertModal.value = {
            isOpen: true,
            title: res.success ? 'Berhasil Ditolak' : 'Gagal Menolak',
            message: res.message,
            type: res.success ? 'success' : 'error'
          };
        }
      } finally {
        isSubmitting.value = false;
      }
    };

    const handleApprove = async () => {
      if (!selected.value) return;
      await handleApproveAction(selected.value.id_submission, reviewNote.value);
      selectedId.value = null;
    };

    const handleReject = () => {
      if (!selected.value) return;
      if (!reviewNote.value.trim()) {
        alertModal.value = { isOpen: true, title: 'Validasi Gagal', message: 'Mohon isi catatan penolakan', type: 'error' };
        return;
      }
      handleRejectAction(selected.value.id_submission, reviewNote.value);
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
      if (code === '1' || name.toLowerCase().includes('admin')) return 'ADM-01';
      if (code === '2' || name.toLowerCase().includes('ternak') || name.toLowerCase().includes('kandang')) return 'OPT-01';
      if (code === '3' || name.toLowerCase().includes('kebun')) return 'PK001';
      if (code === '4' || name.toLowerCase().includes('pemilik')) return 'PEM-01';
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
        </div>

        <div class="row g-4">
          <div class="col-12">
            <div class="view-card p-0" style={{ overflow: 'hidden' }}>
              {/* Desktop Table View */}
              <div class="table-responsive d-none d-md-block">
                <table class="admin-table mb-0">
                  <thead>
                    <tr>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Kode Pengguna</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Kode Pencatatan</th>
                      <th style={{ padding: '0.75rem 0.5rem', fontSize: '0.75rem' }}>Nama Pengguna</th>
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
                          rows.push(
                            <tr
                              key={sub.id_submission}
                              class={selectedId.value === sub.id_submission ? 'table-active' : ''}
                              style={{ cursor: 'pointer', height: '58px' }}
                              onClick={() => openDetail(sub)}
                            >
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}><code>{formatOperatorCode(sub.operatorCode, sub.operatorName)}</code></td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}><code>{sub.submission_code || '-'}</code></td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}>
                                <div class="fw-bold">{sub.operatorName}</div>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', verticalAlign: 'middle', height: '58px' }}>
                                <div class="d-flex align-items-center gap-1">
                                  <span class={['status-badge', sub.approvalStatus === 'approved' ? 'approved' : sub.approvalStatus === 'rejected' ? 'rejected' : 'pending']} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                                    {sub.approvalStatus === 'approved' ? 'Disetujui' : sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                                  </span>
                                </div>
                              </td>
                              <td style={{ padding: '0.75rem 0.5rem', fontSize: '0.85rem', textAlign: 'center', verticalAlign: 'middle', height: '58px' }}>
                                <div class="d-flex justify-content-center gap-2">
                                  {sub.approvalStatus === 'pending' && (
                                    <>
                                      <button
                                        type="button"
                                        class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white border-0"
                                        disabled={isSubmitting.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveAction(sub.id_submission, 'Disetujui via panel aksi');
                                        }}
                                      >
                                        {isSubmitting.value ? 'Loading...' : 'Setujui'}
                                      </button>
                                      <button
                                        type="button"
                                        class="btn btn-sm btn-danger px-3 rounded-pill fw-bold text-white border-0"
                                        disabled={isSubmitting.value}
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          openRejectModal(sub.id_submission);
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
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRejectAction(sub.id_submission, 'Batal disetujui');
                                      }}
                                    >
                                      Batal Setuju
                                    </button>
                                  )}
                                  {sub.approvalStatus === 'rejected' && (
                                      <button
                                        type="button"
                                        class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white border-0"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleApproveAction(sub.id_submission, 'Disetujui kembali');
                                        }}
                                      >
                                        Setujui
                                      </button>
                                  )}
                                  <button
                                    type="button"
                                    class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-bold"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      openDetail(sub);
                                    }}
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

              {/* Mobile Card List View */}
              <div class="d-block d-md-none p-3">
                <div class="mobile-card-list">
                  {paginatedItems.value.map((sub) => {
                    return (
                      <div
                        key={sub.id_submission}
                        class={['admin-mobile-card', selectedId.value === sub.id_submission ? 'border-primary' : '']}
                        onClick={() => openDetail(sub)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div class="card-top">
                          <div class="card-info">
                            <span class="card-name">{sub.operatorName}</span>
                            <span class="card-sub">
                              <code>{formatOperatorCode(sub.operatorCode, sub.operatorName)}</code>
                              {sub.submission_code && <code class="ms-2 text-primary">{sub.submission_code}</code>}
                            </span>
                          </div>
                          <div class="d-flex align-items-center gap-1">
                            <span class="role-badge operator-peternakan" style={{ fontSize: '0.65rem', padding: '0.25rem 0.5rem' }}>
                              Peternakan
                            </span>
                          </div>
                        </div>

                        <div class="text-start" style={{ fontSize: '0.85rem', margin: '0.25rem 0' }}>
                          <div class="text-muted small mb-1">
                            Dikirim: {formatDate(sub.submittedAt)}
                          </div>
                          <div class="fw-bold text-dark text-truncate-2" title={sub.summary} style={{ minHeight: 'auto' }}>
                            {sub.summary}
                          </div>
                        </div>

                        <div class="card-footer flex-column gap-2 align-items-stretch" onClick={(e) => e.stopPropagation()}>
                          <div class="d-flex justify-content-between align-items-center w-100">
                            <span class="small text-muted">Status:</span>
                            <span class={['status-badge', sub.approvalStatus === 'approved' ? 'approved' : sub.approvalStatus === 'rejected' ? 'rejected' : 'pending']} style={{ fontSize: '0.7rem', padding: '0.25rem 0.5rem' }}>
                              {sub.approvalStatus === 'approved' ? 'Disetujui' : sub.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                            </span>
                          </div>

                          <div class="d-flex flex-wrap gap-2 justify-content-end mt-2">
                            {sub.approvalStatus === 'pending' && (
                              <>
                                <button
                                  type="button"
                                  class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white border-0"
                                  disabled={isSubmitting.value}
                                  onClick={(e) => { e.stopPropagation(); handleApproveAction(sub.id_submission, 'Disetujui via panel aksi'); }}
                                >
                                  {isSubmitting.value ? '...' : 'Setujui'}
                                </button>
                                <button
                                  type="button"
                                  class="btn btn-sm btn-danger px-3 rounded-pill fw-bold text-white border-0"
                                  disabled={isSubmitting.value}
                                  onClick={(e) => { e.stopPropagation(); openRejectModal(sub.id_submission); }}
                                >
                                  Tolak
                                </button>
                              </>
                            )}
                            {sub.approvalStatus === 'approved' && (
                              <button
                                type="button"
                                class="btn btn-sm btn-outline-danger px-3 rounded-pill fw-bold"
                                onClick={(e) => { e.stopPropagation(); handleRejectAction(sub.id_submission, 'Batal disetujui'); }}
                              >
                                Batal
                              </button>
                            )}
                            {sub.approvalStatus === 'rejected' && (
                              <button
                                type="button"
                                class="btn btn-sm btn-success px-3 rounded-pill fw-bold text-white border-0"
                                onClick={(e) => { e.stopPropagation(); handleApproveAction(sub.id_submission, 'Disetujui kembali'); }}
                              >
                                Setujui
                              </button>
                            )}
                            <button
                              type="button"
                              class="btn btn-sm btn-outline-primary px-3 rounded-pill fw-bold"
                              onClick={(e) => { e.stopPropagation(); openDetail(sub); }}
                            >
                              Detail
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {filtered.value.length === 0 && (
                    <div class="text-center py-4 text-muted small">
                      Tidak ada data pencatatan.
                    </div>
                  )}
                </div>
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
                  <button type="button" class="close-btn" onClick={() => selectedId.value = null}>
                    <img src="/icon/close-cancel/grey-24.svg" alt="Tutup" style={{ width: '16px', height: '16px', objectFit: 'contain' }} />
                  </button>
                  <h3>Detail Pencatatan</h3>
                </div>

              <div class="modal-body py-3" style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '0.5rem' }}>
                <div class="mb-3">
                  <span class={['status-badge', statusBadge(selected.value.approvalStatus)]}>
                    {selected.value.approvalStatus === 'approved' ? 'Disetujui' : selected.value.approvalStatus === 'rejected' ? 'Ditolak' : 'Belum Disetujui'}
                  </span>
                </div>

                <div class="approval-detail-list mb-4">
                  <DetailRow label="Kode Pencatatan" value={selected.value.submission_code || '-'} />
                  <DetailRow label="ID Sistem" value={selected.value.id_submission} />
                  <DetailRow label="Operator" value={`${selected.value.operatorName} (${formatOperatorCode(selected.value.operatorCode, selected.value.operatorName)})`} />
                  <DetailRow label="Jenis" value={selected.value.typeLabel} />
                  {selected.value.type !== 'stok_pakan' && (
                    <DetailRow label="Kandang" value={selected.value.cageCode} />
                  )}
                  {selected.value.type !== 'stok_pakan' && (
                    <DetailRow label="Mode" value={selected.value.scope === 'kandang' ? 'Per Kandang' : 'Per Domba'} />
                  )}
                  <DetailRow label="Ringkasan" value={selected.value.summary} />
                  <DetailRow label="Waktu Kirim" value={formatDate(selected.value.submittedAt)} />
                  {selected.value.reviewedBy && (
                    <>
                      <DetailRow label="Direview oleh" value={selected.value.reviewedBy} />
                      <DetailRow label="Waktu Review" value={formatDate(selected.value.reviewedAt || 0)} />
                    </>
                  )}
                </div>

                <Typography variant="h4" class="mb-3 mt-4" style={{ fontSize: '1rem', fontWeight: 'bold' }}>
                  Rincian Data Tersimpan
                </Typography>
                <div class="approval-data-preview mb-4">
                  {(() => {
                    const dataObj: any = (selected.value.payload as any)?.data || selected.value.payload;
                    const items = dataObj?.items || [];
                    if (!items || !items.length) {
                       return <div class="text-muted small p-3 bg-light rounded text-center">Tidak ada rincian data.</div>;
                    }

                    return items.map((item: any, i: number) => (
                      <div key={i} class="p-3 mb-2 rounded-4 border shadow-sm" style={{ backgroundColor: '#ffffff', borderColor: '#e2dfd8' }}>
                        <div class="d-flex align-items-center gap-2 mb-3 pb-2 border-bottom">
                          <span class="badge bg-secondary rounded-circle" style={{ width: '24px', height: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{i + 1}</span>
                          <Typography variant="p" weight="bold" class="m-0" style={{ color: '#3d2f24' }}>
                            {item.name || 'Data Pencatatan'}
                          </Typography>
                          <span class="ms-auto badge bg-light text-dark border">{item.mode === 'individu' ? 'Individu' : 'Kandang/Kelompok'}</span>
                        </div>
                        <div class="row g-3">
                          {Object.entries(item).map(([key, val]) => {
                            if (!val || val === '' || key === 'id' || key === 'name' || key === 'mode') return null;
                            if (!shouldShowKey(selected.value?.type || '', key, item)) return null;
                            const formName = item.name || '';
                            let displayLabel = labelMappings[key] || camelToTitle(key);
                            if (key === 'targetId') displayLabel = item.mode === 'individu' ? 'ID Domba/Target' : 'ID Kandang';
                            const subType = (selected.value?.type || '').toLowerCase();
                            if (subType === 'stok pupuk' || subType === 'stok_pupuk') {
                              if (key === 'jenisObat') displayLabel = 'Jenis Pupuk';
                              else if (key === 'namaObat') displayLabel = 'Nama Pupuk';
                              else if (key === 'volumeObat') displayLabel = 'Jumlah Stok Pupuk';
                              else if (key === 'satuanVolumeObat') displayLabel = 'Satuan Volume Pupuk';
                              else if (key === 'teknikPemberianObat') displayLabel = 'Teknik Pemupukan';
                            }
                            if (key === 'qty') {
                              if (subType === 'stok_pakan' && formName === 'Konversi Pakan') displayLabel = 'Target Hasil Konversi';
                              else if (subType === 'pakan') displayLabel = 'Jumlah Pemberian';
                              else if (subType === 'kotoran') displayLabel = 'Jumlah Produksi';
                              else if (subType === 'berat_badan' || subType === 'weighing') displayLabel = 'Berat Badan';
                              else displayLabel = labelMappings['qty'] || 'Jumlah/Volume';
                            }
                            if (key === 'obat') {
                              if (subType === 'stok_pakan' && formName === 'Konversi Pakan') displayLabel = 'Hasil Konversi Jadi';
                              else if (subType === 'stok_pakan' && formName === 'Tambah Stok') displayLabel = 'Nama Pakan/Sumber';
                              else if (subType === 'pakan') displayLabel = 'Nama Pakan';
                              else displayLabel = labelMappings['obat'] || 'Obat/Pakan/Vitamin';
                            }
                            if (key === 'vitaminAmount') {
                              if (subType === 'kesehatan') displayLabel = 'Jumlah Vitamin/Dosis';
                              else displayLabel = labelMappings['vitaminAmount'] || 'Jumlah/Dosis';
                            }
                            if (key === 'hijauan') {
                              if (subType === 'stok_pakan') displayLabel = 'Pakan Mentah Asal';
                              else if (subType === 'pakan') displayLabel = 'Hijauan';
                            }
                            if (key === 'energi') {
                              if (subType === 'stok_pakan') displayLabel = 'Pakan Tambahan (Sumber Energi)';
                              else if (subType === 'pakan') displayLabel = 'Sumber Energi';
                            }
                            if (key === 'protein') {
                              if (subType === 'stok_pakan') displayLabel = 'Pakan Tambahan (Sumber Protein)';
                              else if (subType === 'pakan') displayLabel = 'Sumber Protein';
                            }
                            if (key === 'mineral') {
                              if (subType === 'stok_pakan') displayLabel = 'Pakan Tambahan (Pemberian Mineral)';
                              else if (subType === 'pakan') displayLabel = 'Pemberian Mineral';
                            }
                            if (key === 'metoda') {
                              if (subType === 'pakan') displayLabel = 'Metode Pemberian Pakan';
                              else displayLabel = 'Metode Kawin';
                            }
                             
                             let displayValue = String(val);
                             if (key === 'hasilPemeriksaan') {
                               if (formName === 'Cek Birahi' || formName === 'Pencatatan Birahi' || formName === 'Pengecekan Birahi') {
                                 displayValue = val === 'birahi' ? 'Birahi (Siap Kawin)' : 'Tidak Birahi';
                               } else {
                                 displayValue = val === 'bunting_terkonfirmasi' ? 'Bunting Terkonfirmasi' :
                                                val === 'masih_menunggu' ? 'Masih Menunggu' :
                                                val === 'gagal' ? 'Gagal' :
                                                val === 'keguguran' ? 'Keguguran' : String(val);
                               }
                             } else if (key === 'targetId') {
                               const s = sheep.value.find(x => String(x.id) === String(val) || String(x.code) === String(val));
                               if (s) displayValue = `[${s.code}] ${s.name}`;
                             } else if (key === 'idPejantan') {
                               const s = sheep.value.find(x => String(x.id) === String(val) || String(x.code) === String(val));
                               if (s) displayValue = `[${s.code}] ${s.name}`;
                             } else if (key === 'metodePemeriksaan') {
                               displayValue = val === 'usg' ? 'Cek USG' :
                                              val === 'palpasi' ? 'Palpasi' :
                                              val === 'testpack' ? 'Testpack' : String(val);
                             } else if (key === 'metoda') {
                               displayValue = val === 'ib' ? 'Inseminasi Buatan (IB)' :
                                              val === 'alami' ? 'Alami' :
                                              val === 'dadakan' ? 'Pakan Dadakan (Racikan Sendiri)' :
                                              val === 'silase' ? 'Pakan Silase / Stok' : String(val);
                             } else if (key === 'genderAnak') {
                               displayValue = val === 'jantan' ? 'Jantan' : val === 'betina' ? 'Betina' : String(val);
                             }
                            
                            return (
                              <div key={key} class="col-6 col-sm-4">
                                <span class="d-block text-muted mb-1" style={{ fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 'bold' }}>{displayLabel}</span>
                                <span class="d-block fw-bold text-dark text-truncate" style={{ fontSize: '0.9rem' }} title={displayValue}>{displayValue}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ));
                  })()}
                </div>

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
                  <button type="button" class="btn rounded-pill px-4 fw-bold text-white" style={{ backgroundColor: '#3D2F24', border: 'none' }} onClick={() => selectedId.value = null}>Tutup</button>
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
