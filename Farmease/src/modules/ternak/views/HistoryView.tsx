import { defineComponent, ref, computed, onMounted, watch } from 'vue';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import { userSession, cageSession } from '@/store/navigation';
import {
  healthApi,
  weightApi,
  feedsApi,
  breedingApi,
  birthApi,
} from '@/shared/api';
import { pencatatanSubmissions } from '@/modules/ternak/store/operatorAdmin';

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
}

export default defineComponent({
  name: 'RiwayatView',
  setup() {
    const filterCategory = ref<RiwayatCategory>('Semua');
    const searchVal = ref<string>('');
    const listRecords = ref<RiwayatRecord[]>([]);
    const loading = ref(false);
    const error = ref<string | null>(null);



    const categories: RiwayatCategory[] = ['Semua', 'Pakan', 'Berat Badan', 'Kesehatan', 'Perkawinan', 'Kelahiran', 'Kotoran'];

    function formatDate(dateStr: string): string {
      try {
        return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      } catch {
        return dateStr;
      }
    }

    function formatTime(dateStr: string): string {
      try {
        return new Date(dateStr).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB';
      } catch {
        return '';
      }
    }
    async function loadRecords() {
      loading.value = true;
      error.value = null;

      const records: RiwayatRecord[] = pencatatanSubmissions.value.map(sub => {
        let cat: RiwayatCategory = 'Semua';
        const typeLow = sub.type.toLowerCase();
        if (typeLow.includes('pakan')) cat = 'Pakan';
        else if (typeLow.includes('berat')) cat = 'Berat Badan';
        else if (typeLow.includes('sehat')) cat = 'Kesehatan';
        else if (typeLow.includes('kawin') || typeLow.includes('reproduksi')) cat = 'Perkawinan';
        else if (typeLow.includes('lahir')) cat = 'Kelahiran';
        else if (typeLow.includes('kotoran')) cat = 'Kotoran';

        return {
          id: sub.id,
          date: formatDate(new Date(sub.submittedAt).toISOString()),
          time: formatTime(new Date(sub.submittedAt).toISOString()),
          rawDate: new Date(sub.submittedAt),
          category: cat,
          operator: sub.operatorName || '—',
          summary: sub.summary,
          status: sub.approvalStatus,
          reviewNote: sub.reviewNote
        } as any;
      });

      // Sort by date descending
      records.sort((a, b) => b.rawDate.getTime() - a.rawDate.getTime());
      listRecords.value = records;
      loading.value = false;
    }

    onMounted(loadRecords);

    // Watch for new submissions
    watch(() => pencatatanSubmissions.value, () => {
      loadRecords();
    }, { deep: true });

    const filteredRecords = computed(() => listRecords.value.filter(rec => {
      const matchesCategory = filterCategory.value === 'Semua' || rec.category === filterCategory.value;
      const q = searchVal.value.toLowerCase().trim();
      const matchesSearch = !q ||
        rec.id.toLowerCase().includes(q) ||
        rec.operator.toLowerCase().includes(q) ||
        rec.summary.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    }));

    const summaryCards = computed(() => [
      { label: 'Total Log', value: listRecords.value.length, tone: 'var(--color-brown-light)' },
      { label: 'Pakan Hari Ini', value: listRecords.value.filter(recordItem => recordItem.category === 'Pakan' && recordItem.date === new Date().toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })).length, tone: 'var(--color-primary-light)' },
      { label: 'Menunggu', value: listRecords.value.filter(recordItem => recordItem.status === 'pending').length, tone: '#bc6c25' }
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

    return () => (
      <div class="animate-fade-in">
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

          <div class="d-flex gap-2 flex-wrap">
          </div>
        </div>

        <div class="row g-3 mb-4">
          {summaryCards.value.map(card => (
            <div class="col-12 col-md-4" key={card.label}>
              <div 
                class="bg-white rounded-5 border p-4 h-100" 
                style={{ transition: 'all 0.2s ease', cursor: 'default' }} 
                onMouseover={(e: any) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 10px 15px -3px rgba(0,0,0,0.05)'; }} 
                onMouseout={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                <div class="d-flex justify-content-between align-items-center mb-2">
                  <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold m-0">{card.label}</Typography>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: card.tone }}></div>
                </div>
                <Typography variant="h2" weight="extrabold" className="m-0 text-truncate" style={{ color: card.tone }}>{card.value}</Typography>
              </div>
            </div>
          ))}
        </div>

        {/* Filter Panel */}
        <div class="bg-white rounded-5 border p-3 p-md-4 mb-4">
          <div class="row g-3 align-items-center">
            <div class="col-md-6 col-lg-8">
              <label class="pencatatan-label">Cari Riwayat</label>
              <input 
                type="text" 
                class="form-control pencatatan-input" 
                placeholder="Cari berdasarkan ID, Operator, atau Ringkasan..." 
                value={searchVal.value} 
                onInput={(e: any) => searchVal.value = e.target.value} 
              />
            </div>
            <div class="col-md-6 col-lg-4">
              <label class="pencatatan-label">Saring Kategori</label>
              <select
                class="form-select pencatatan-select"
                value={filterCategory.value}
                onChange={(e) => {
                  filterCategory.value = (e.target as HTMLSelectElement).value as RiwayatCategory;
                }}
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
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
                    class="bg-white rounded-5 border p-4 h-100 position-relative overflow-hidden d-flex flex-column" 
                    style={{ transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', cursor: 'pointer' }}
                    onMouseover={(e: any) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = 'var(--color-primary-fixed)'; e.currentTarget.style.boxShadow = '0 12px 24px -8px rgba(0,0,0,0.1)'; }} 
                    onMouseout={(e: any) => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.borderColor = 'var(--color-outline-variant)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div class="d-flex justify-content-between align-items-start gap-3 mb-3">
                      <div class="d-flex gap-3 align-items-center">
                        <div class="d-flex align-items-center justify-content-center rounded-circle" style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-surface-container)' }}>
                           <img src={CATEGORY_ICONS[rec.category] || CATEGORY_ICONS['Semua']} alt={rec.category} style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        </div>
                        <div>
                          <Typography variant="span" size="text-xs" weight="bold" className="text-secondary text-uppercase d-block mb-1">{rec.category}</Typography>
                          <div class="d-flex align-items-center gap-2">
                            <Typography variant="h5" weight="extrabold" className="m-0 text-dark">{rec.date}</Typography>
                            <Badge variant="secondary" className="px-2 py-0.5">{rec.time}</Badge>
                          </div>
                        </div>
                      </div>
                      <Badge variant="secondary" className="px-2 py-1 text-uppercase" style={{ fontSize: '0.65rem' }}>{rec.id}</Badge>
                    </div>

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

                    <div class="d-flex flex-wrap align-items-center justify-content-between gap-3 mt-auto pt-3 border-top">
                      <div class="d-flex align-items-center gap-2">
                        <img src="/icon/ternak_op.png" alt="Operator" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                        <Typography variant="span" size="text-xs" className="text-muted m-0 fw-bold">{rec.operator}</Typography>
                      </div>
                      
                      <div class="d-flex align-items-center gap-2">
                        <Badge variant="secondary" className="px-2 py-1 fw-bold text-dark">
                          <i class="bi bi-geo-alt-fill me-1"></i> Kandang {cageSession.value?.code || '—'}
                        </Badge>
                        {rec.status && (
                          <Badge 
                            variant={rec.status === 'approved' ? 'success' : rec.status === 'rejected' ? 'danger' : 'warning'}
                            className="px-2 py-1 fw-bold"
                          >
                            {rec.status === 'pending' ? '⏳ Validasi' : rec.status === 'approved' ? '✅ Disetujui' : '❌ Ditolak'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    );
  }
});
