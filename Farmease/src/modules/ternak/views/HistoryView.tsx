import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import '@/modules/ternak/assets/css/modules/PeternakanPage.css';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import CustomInput from '@/shared/ui/Input';
import CustomSelect from '@/shared/ui/admin/Select';
import Button from '@/shared/ui/Button';
import { cageSession } from '@/store/navigation';
import { pencatatanSubmissions, type PencatatanSubmission } from '@/modules/ternak/store/operatorAdmin';

type RiwayatCategory = 'Semua' | 'Pakan' | 'Perkawinan' | 'Kelahiran' | 'Kesehatan' | 'Kotoran' | 'Berat Badan';

interface RiwayatRecord {
  id: string;
  date: string;
  time: string;
  category: Exclude<RiwayatCategory, 'Semua'>;
  operator: string;
  summary: string;
  rawDate: Date;
  status?: string;
  reviewNote?: string;
  raw: PencatatanSubmission;
}

export default defineComponent({
  name: 'RiwayatView',
  setup() {
    const filterCategory = ref<RiwayatCategory>('Semua');
    const searchVal = ref<string>('');
    const listRecords = ref<RiwayatRecord[]>([]);
    const loading = ref(false);
    const selectedRecord = ref<RiwayatRecord | null>(null);

    const categories: RiwayatCategory[] = ['Semua', 'Pakan', 'Berat Badan', 'Kesehatan', 'Perkawinan', 'Kelahiran', 'Kotoran'];

    function formatDate(dateStr: string): string {
      try { return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' }); }
      catch { return dateStr; }
    }
    function formatTime(dateStr: string): string {
      try { return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB'; }
      catch { return ''; }
    }

    async function loadRecords() {
      loading.value = true;
      const records: RiwayatRecord[] = pencatatanSubmissions.value.map(sub => {
        let cat: RiwayatCategory = 'Semua';
        const t = sub.type.toLowerCase();
        if (t.includes('pakan')) cat = 'Pakan';
        else if (t.includes('berat')) cat = 'Berat Badan';
        else if (t.includes('sehat') || t.includes('kesehatan')) cat = 'Kesehatan';
        else if (t.includes('kawin') || t.includes('reproduksi')) cat = 'Perkawinan';
        else if (t.includes('lahir')) cat = 'Kelahiran';
        else if (t.includes('kotoran')) cat = 'Kotoran';
        return {
          id: sub.id,
          date: formatDate(new Date(sub.submittedAt).toISOString()),
          time: formatTime(new Date(sub.submittedAt).toISOString()),
          rawDate: new Date(sub.submittedAt),
          category: cat,
          operator: sub.operatorName || '—',
          summary: sub.summary,
          status: sub.approvalStatus,
          reviewNote: sub.reviewNote,
          raw: sub,
        } as any;
      });
      records.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      listRecords.value = records;
      loading.value = false;
    }

    onMounted(loadRecords);
    watch(() => pencatatanSubmissions.value, () => { loadRecords(); }, { deep: true });

    const filteredRecords = computed(() => listRecords.value.filter(rec => {
      const matchesCategory = filterCategory.value === 'Semua' || rec.category === filterCategory.value;
      const q = searchVal.value.toLowerCase().trim();
      const matchesSearch = !q || rec.id.toLowerCase().includes(q) || rec.operator.toLowerCase().includes(q) || rec.summary.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }));

    const summaryCards = computed(() => [
      { label: 'Total Log', value: listRecords.value.length, tone: 'var(--color-brown-light)' },
      { label: 'Pakan Hari Ini', value: listRecords.value.filter(r => r.category === 'Pakan' && r.date === new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })).length, tone: 'var(--color-primary-light)' },
      { label: 'Menunggu', value: listRecords.value.filter(r => r.status === 'pending').length, tone: '#bc6c25' }
    ]);

    const CATEGORY_ICONS: Record<string, string> = {
      'Pakan': '/icon/catat_pakan.png',
      'Berat Badan': '/icon/statistic.png',
      'Perkawinan': '/icon/catat_kawin.png',
      'Kelahiran': '/icon/catat_lahir.png',
      'Kesehatan': '/icon/catat_sehat.png',
      'Kotoran': '/icon/catat_kotoran.png',
      'Semua': '/icon/catat_jenis.png',
    };

    const openDetail = (rec: RiwayatRecord) => { selectedRecord.value = rec; };
    const closeDetail = () => { selectedRecord.value = null; };

    // Extract meaningful data chips from a payload item
    const getItemChips = (item: any) => {
      const chips: { label: string; value: string }[] = [];
      if (item.targetId) chips.push({ label: 'ID Ternak/Kandang', value: String(item.targetId) });
      if (item.qty) chips.push({ label: 'Jumlah', value: `${item.qty}${item.unit ? ' ' + item.unit : ''}` });
      if (item.tindakan) chips.push({ label: 'Tindakan', value: String(item.tindakan) });
      if (item.obat) chips.push({ label: 'Obat / Pakan', value: String(item.obat) });
      if (item.vitaminAmount) chips.push({ label: 'Vitamin', value: String(item.vitaminAmount) });
      if (item.idPejantan) chips.push({ label: 'ID Pejantan', value: String(item.idPejantan) });
      if (item.metoda) chips.push({ label: 'Metoda', value: String(item.metoda) });
      if (item.jumlahAnak) chips.push({ label: 'Jumlah Anak', value: String(item.jumlahAnak) });
      if (item.namaAnak) chips.push({ label: 'Nama Anak', value: String(item.namaAnak) });
      if (item.kandangAnak) chips.push({ label: 'Kandang Anak', value: String(item.kandangAnak) });
      if (item.beratLahir) chips.push({ label: 'Berat Lahir', value: String(item.beratLahir) + ' kg' });
      if (item.tanggal) chips.push({ label: 'Tanggal', value: String(item.tanggal) });
      if (item.kotoranState) chips.push({ label: 'Kondisi', value: String(item.kotoranState) });
      if (item.kondisiInduk) chips.push({ label: 'Kondisi Induk', value: String(item.kondisiInduk) });
      if (item.note) chips.push({ label: 'Catatan', value: String(item.note) });
      return chips;
    };

    return () => {
      const modal = selectedRecord.value;

      return (
        <div class="animate-fade-in">
          {/* Header */}
          <div class="d-flex flex-column flex-lg-row justify-content-between align-items-lg-center gap-3 mb-4 py-2 border-bottom">
            <div>
              <div class="d-flex align-items-center gap-2">
                <img src="/icon/statistic.png" alt="Riwayat" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                <Typography variant="h3" weight="extrabold" className="m-0 text-almond-beige">Riwayat Aktivitas Kandang</Typography>
              </div>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                Log lengkap seluruh aktivitas peternakan yang tersimpan di sistem
              </Typography>
            </div>
          </div>

          {/* Summary cards */}
          <div class="row g-3 mb-4">
            {summaryCards.value.map(card => (
              <div class="col-12 col-md-4" key={card.label}>
                <div class="bg-white rounded-5 border p-4 h-100"
                  style={{ transition: 'all 0.2s ease' }}
                  onMouseover={(e: any) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)'; }}
                  onMouseout={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}>
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold m-0">{card.label}</Typography>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: card.tone }}></div>
                  </div>
                  <Typography variant="h2" weight="extrabold" className="m-0" style={{ color: card.tone }}>{card.value}</Typography>
                </div>
              </div>
            ))}
          </div>

          {/* Filter Panel */}
          <div class="bg-white rounded-5 border p-3 p-md-4 mb-4">
            <div class="row g-3">
              <div class="col-12">
                <label class="form-label text-secondary small fw-bold mb-2">Cari Riwayat</label>
                <CustomInput modelValue={searchVal.value} placeholder="Cari berdasarkan ID, Operator, atau Ringkasan..." onUpdate:modelValue={(val: string) => searchVal.value = val} />
              </div>
              <div class="col-12">
                <label class="form-label text-secondary small fw-bold mb-2">Saring Kategori</label>
                <CustomSelect options={[...categories]} modelValue={filterCategory.value} onUpdate:modelValue={(val: string) => filterCategory.value = val as RiwayatCategory} />
              </div>
            </div>
          </div>

          {/* Records */}
          {loading.value ? (
            <div class="text-center py-5 text-secondary">
              <div class="spinner-border spinner-border-sm text-secondary me-2" role="status"></div>
              <span>Memuat riwayat aktivitas...</span>
            </div>
          ) : (
            <div class="row g-3">
              {filteredRecords.value.length === 0 ? (
                <div class="col-12">
                  <div class="bg-white rounded-5 border p-5 text-center text-muted d-flex flex-column align-items-center gap-3">
                    <img src="/icon/notification-active.png" alt="Empty" style={{ width: '48px', opacity: 0.5, filter: 'grayscale(1)' }} />
                    <span class="fw-bold">Belum ada riwayat aktivitas yang sesuai dengan filter Anda.</span>
                  </div>
                </div>
              ) : (
                filteredRecords.value.map(rec => (
                  <div class="col-12 col-lg-6" key={rec.id}>
                    <div
                      class="bg-white rounded-5 border p-4 h-100 d-flex flex-column"
                      style={{ transition: 'all 0.25s cubic-bezier(0.4,0,0.2,1)' }}
                      onMouseover={(e: any) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--color-primary-fixed)'; e.currentTarget.style.boxShadow = '0 10px 20px -6px rgba(0,0,0,0.1)'; }}
                      onMouseout={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = ''; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      {/* Card top row */}
                      <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                        <div class="d-flex gap-3 align-items-center">
                          <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-surface-container)' }}>
                            <img src={CATEGORY_ICONS[rec.category] || CATEGORY_ICONS['Semua']} alt={rec.category} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                          </div>
                          <div>
                            <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-1">{rec.category}</Typography>
                            <div class="d-flex align-items-center gap-2 flex-wrap">
                              <Typography variant="h5" weight="extrabold" className="m-0 text-dark">{rec.date}</Typography>
                              <Badge variant="secondary" className="px-2 py-0.5">{rec.time}</Badge>
                            </div>
                          </div>
                        </div>
                        <Badge variant="secondary" className="px-2 py-1 text-uppercase flex-shrink-0" style={{ fontSize: '0.65rem' }}>{rec.id}</Badge>
                      </div>

                      {/* Summary box */}
                      <div class="rounded-4 border p-3 mb-3 flex-grow-1" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                        <Typography variant="p" className="m-0 fw-semibold text-dark" size="text-sm">{rec.summary}</Typography>
                        {rec.reviewNote && (
                          <div class="mt-2 pt-2 border-top">
                            <Typography variant="p" className="m-0 text-danger" size="text-xs">
                              <i class="bi bi-exclamation-circle-fill me-1"></i> Catatan Reviewer: {rec.reviewNote}
                            </Typography>
                          </div>
                        )}
                      </div>

                      {/* Footer row */}
                      <div class="d-flex align-items-center justify-content-between gap-2 pt-3 border-top flex-wrap">
                        <div class="d-flex align-items-center gap-2">
                          <img src="/icon/ternak_op.png" alt="Operator" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                          <Typography variant="span" size="text-xs" className="text-muted m-0 fw-bold">{rec.operator}</Typography>
                        </div>

                        <div class="d-flex align-items-center gap-2">
                          {rec.status && (
                            <Badge
                              variant={rec.status === 'approved' ? 'success' : rec.status === 'rejected' ? 'danger' : 'warning'}
                              className="px-2 py-1 fw-bold"
                            >
                              {rec.status === 'pending' ? '⏳ Validasi' : rec.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                            </Badge>
                          )}
                          {/* Detail button */}
                          <button
                            type="button"
                            class="btn btn-sm rounded-pill fw-bold px-3 py-2"
                            style={{
                              fontSize: '0.8rem',
                              backgroundColor: 'var(--color-primary)',
                              color: '#fff',
                              border: 'none',
                              transition: 'all 0.2s',
                              whiteSpace: 'nowrap',
                            }}
                            onClick={() => openDetail(rec)}
                            onMouseover={(e: any) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.03)'; }}
                            onMouseout={(e: any) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = 'none'; }}
                          >
                            Lihat Detail
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* ── Detail Modal ── */}
          {modal && (
            <div class="peternakan-modal-overlay" onClick={closeDetail}>
              <div class="peternakan-modal-card" onClick={(e: any) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
                {/* Modal header */}
                <div class="peternakan-modal-header">
                  <h2 class="peternakan-modal-title">Detail Pencatatan</h2>
                  <button class="peternakan-modal-close" onClick={closeDetail}>✕</button>
                </div>

                <div class="peternakan-modal-body">
                  {/* Identity row */}
                  <div class="d-flex align-items-center gap-3 mb-4 p-3 rounded-4 border" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                    <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '52px', height: '52px', backgroundColor: 'var(--color-surface-container)' }}>
                      <img src={CATEGORY_ICONS[modal.category] || CATEGORY_ICONS['Semua']} style={{ width: '28px', height: '28px', objectFit: 'contain' }} alt="" />
                    </div>
                    <div class="flex-grow-1 min-w-0">
                      <div class="fw-bold text-dark text-capitalize" style={{ fontSize: '1rem' }}>{modal.category}</div>
                      <div class="text-secondary fw-semibold" style={{ fontSize: '0.8rem' }}>{modal.date} · {modal.time}</div>
                    </div>
                    <Badge
                      variant={modal.status === 'approved' ? 'success' : modal.status === 'rejected' ? 'danger' : 'warning'}
                      className="px-3 py-2 fw-bold flex-shrink-0"
                    >
                      {modal.status === 'approved' ? '✅ Disetujui' : modal.status === 'rejected' ? '❌ Ditolak' : '⏳ Menunggu'}
                    </Badge>
                  </div>

                  {/* Meta info */}
                  <div class="row g-2 mb-4">
                    {[
                      { label: 'ID Submission', value: modal.id },
                      { label: 'Operator', value: modal.operator },
                      { label: 'Kandang', value: `Kandang ${modal.raw.cageCode || cageSession.value?.code || '—'}` },
                      { label: 'Lingkup', value: modal.raw.scope === 'kandang' ? 'Kelompok Kandang' : 'Individu Domba' },
                    ].map(({ label, value }) => (
                      <div class="col-6" key={label}>
                        <div class="rounded-4 border p-3 h-100" style={{ backgroundColor: 'var(--color-surface-container-low)' }}>
                          <div class="text-secondary fw-bold text-uppercase mb-1" style={{ fontSize: '0.65rem', letterSpacing: '0.5px' }}>{label}</div>
                          <div class="fw-bold text-dark" style={{ fontSize: '0.85rem' }}>{value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Review note */}
                  {modal.reviewNote && (
                    <div class="alert border-0 rounded-4 mb-4" style={{ backgroundColor: '#FEE2E2', color: '#991B1B' }}>
                      <div class="fw-bold mb-1" style={{ fontSize: '0.75rem' }}>📋 Catatan Reviewer</div>
                      <div class="fw-semibold" style={{ fontSize: '0.88rem' }}>{modal.reviewNote}</div>
                    </div>
                  )}

                  {/* Rincian items */}
                  <div class="fw-bold text-dark mb-3 d-flex align-items-center gap-2" style={{ fontSize: '0.9rem' }}>
                    <div class="d-flex align-items-center justify-content-center rounded-circle flex-shrink-0" style={{ width: '30px', height: '30px', backgroundColor: 'var(--color-surface-container)' }}>
                      <img src={CATEGORY_ICONS[modal.category] || '/icon/catat_jenis.png'} style={{ width: '16px', height: '16px', objectFit: 'contain' }} alt="" />
                    </div>
                    Rincian Pencatatan
                  </div>

                  {(() => {
                    const items: any[] = (modal.raw.payload as any)?.data?.items || [];
                    if (items.length === 0) return (
                      <div class="text-center py-4 text-secondary rounded-4 border" style={{ backgroundColor: 'var(--color-surface-container-low)', fontSize: '0.85rem' }}>
                        Tidak ada data rincian tersimpan
                      </div>
                    );
                    return items.map((item: any, idx: number) => {
                      const chips = getItemChips(item);
                      return (
                        <div key={idx} class="rounded-4 border p-3 mb-3">
                          <div class="text-secondary fw-bold text-uppercase mb-3" style={{ fontSize: '0.7rem', letterSpacing: '0.5px' }}>
                            Rincian #{idx + 1}{item.name ? ` — ${item.name}` : ''}
                          </div>
                          {chips.length > 0 ? (
                            <table class="w-100" style={{ borderCollapse: 'collapse' }}>
                              <tbody>
                                {chips.map((chip, ci) => (
                                  <tr key={ci} style={{ borderBottom: ci < chips.length - 1 ? '1px solid #f0ebe4' : 'none' }}>
                                    <td style={{ padding: '0.4rem 0', width: '40%', fontSize: '0.8rem', color: '#6B7280', fontWeight: '600', verticalAlign: 'top' }}>{chip.label}</td>
                                    <td style={{ padding: '0.4rem 0', fontSize: '0.85rem', color: '#1a1a1a', fontWeight: '700' }}>{chip.value}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          ) : (
                            <span class="text-secondary" style={{ fontSize: '0.8rem' }}>—</span>
                          )}
                        </div>
                      );
                    });
                  })()}
                </div>

                {/* Footer */}
                <div class="pt-3 border-top mt-2">
                  <Button variant="primary" shape="pill" onClick={closeDetail} className="w-100">
                    Tutup
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      );
    };
  }
});
