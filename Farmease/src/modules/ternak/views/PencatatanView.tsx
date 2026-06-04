import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import PencatatanField from '@/modules/ternak/components/pencatatan/PencatatanField';
import PencatatanSelect from '@/modules/ternak/components/pencatatan/PencatatanSelect';
import { activePencatatanForm, cageSession } from '@/store/navigation';
import PencatatanModeToggle from '@/modules/ternak/components/pencatatan/PencatatanModeToggle';
import type { PencatatanMode } from '@/modules/ternak/components/pencatatan/PencatatanModeToggle';

import InbreedingChecker from '../components/tools/InbreedingChecker';
import WeightHistory from '../components/tools/WeightHistory';
import FeedStock from '../components/tools/FeedStock';
import WasteLog from '../components/tools/WasteLog';
import ReportsExport from '../components/tools/ReportsExport';
import ActivityLog from '../components/tools/ActivityLog';

const recordTypeOptions = [
  { id: 'pakan', label: 'Pakan', icon: '/icon/catat_pakan.png' },
  { id: 'kesehatan', label: 'Kesehatan', icon: '/icon/catat_sehat.png' },
  { id: 'perkawinan', label: 'Perkawinan', icon: '/icon/catat_kawin.png' },
  { id: 'kelahiran', label: 'Kelahiran', icon: '/icon/catat_lahir.png' },
  { id: 'kotoran', label: 'Kotoran', icon: '/icon/catat_kotoran.png' },
  { id: 'berat_badan', label: 'Berat Badan', icon: '/icon/statistic.png' },
] as const;

const detailOptions: Record<string, string[]> = {
  pakan: ['Pakan Pagi', 'Pakan Siang', 'Pakan Sore', 'Suplementasi'],
  kesehatan: ['Pemeriksaan Rutin', 'Vitamin', 'Vaksin', 'Obat Cacing'],
  perkawinan: ['Kawin Alam', 'IB', 'Cek Birahi', 'Kontrol Kebuntingan'],
  kelahiran: ['Lahir Normal', 'Kembar', 'Cek Induk', 'Cek Cempe'],
  kotoran: ['Sanitasi Harian', 'Panen Kotoran', 'Pembersihan Lantai', 'Fermentasi'],
  berat_badan: ['Timbang Rutin', 'Timbang Harian', 'Timbang Bulanan', 'Timbang Mandiri'],
};

const categoryIcons: Record<string, string> = {
  pakan: '/icon/catat_pakan.png',
  kesehatan: '/icon/catat_sehat.png',
  kotoran: '/icon/catat_kotoran.png',
  perkawinan: '/icon/catat_kawin.png',
  kelahiran: '/icon/catat_lahir.png',
  berat_badan: '/icon/statistic.png',
  umum: '/icon/catat_jenis.png',
};

const MODE_TOGGLE_TYPES = new Set(['pakan', 'kesehatan', 'kotoran']);

const toolsList = [
  { 
    id: 'inbreeding', 
    name: 'Cek Hubungan Kekerabatan', 
    description: 'Periksa overlap garis keturunan atau risiko perkawinan sedarah (inbreeding) antara jantan dan betina.', 
    icon: '/icon/catat_kawin.png', 
    component: InbreedingChecker 
  },
  { 
    id: 'weight', 
    name: 'Riwayat Penimbangan Mandiri', 
    description: 'Log khusus penimbangan bobot ternak harian/berkala untuk melacak perkembangan berat badan.', 
    icon: '/icon/statistic.png', 
    component: WeightHistory 
  },
  { 
    id: 'feed', 
    name: 'Stok & Konversi Pakan', 
    description: 'Pantau ketersediaan stok rumput, konsentrat, serta konversi hasil panen perkebunan menjadi pakan.', 
    icon: '/icon/catat_pakan.png', 
    component: FeedStock 
  },
  { 
    id: 'waste', 
    name: 'Sanitasi & Panen Kotoran', 
    description: 'Log pencatatan kebersihan kandang harian dan pengumpulan kotoran untuk diolah menjadi pupuk.', 
    icon: '/icon/catat_kotoran.png', 
    component: WasteLog 
  },
  { 
    id: 'export', 
    name: 'Ekspor Laporan Ternak', 
    description: 'Unduh laporan performa penimbangan, kesehatan, pakan, dan populasi ternak ke CSV/PDF.', 
    icon: '/icon/catat_jenis.png', 
    component: ReportsExport 
  },
  { 
    id: 'activity', 
    name: 'Log Kegiatan Operator', 
    description: 'Tinjau histori kegiatan yang telah diselesaikan di lapangan oleh operator kandang.', 
    icon: '/icon/dashboard.png', 
    component: ActivityLog 
  },
];

export default defineComponent({
  name: 'PencatatanView',
  setup() {
    const now = ref(new Date());
    const selectedScope = ref<'domba' | 'kandang'>('domba');
    const selectedType = ref<string>('pakan');
    const selectedDetail = ref<string>(detailOptions.pakan![0] || 'Pakan Pagi');
    const activeToolId = ref<string | null>(null);

    let timer: ReturnType<typeof setInterval> | undefined;

    onMounted(() => {
      timer = setInterval(() => {
        now.value = new Date();
      }, 1000);
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const currentDetailOptions = computed(() => detailOptions[selectedType.value] || []);
    const showModeToggle = computed(() => MODE_TOGGLE_TYPES.has(selectedType.value));

    const activeTool = computed(() => {
      return toolsList.find(t => t.id === activeToolId.value) || null;
    });

    watch(selectedType, (newType) => {
      if (!MODE_TOGGLE_TYPES.has(newType)) {
        selectedScope.value = 'domba';
      }
    });

    const openForm = () => {
      activePencatatanForm.value = {
        scope: selectedScope.value,
        jenis: {
          id: selectedType.value,
          name: recordTypeOptions.find((item) => item.id === selectedType.value)?.label || 'Pencatatan',
        },
        rincian: [
          {
            id: `${selectedType.value}-${selectedScope.value}`,
            name: selectedDetail.value,
            mode: selectedScope.value === 'kandang' ? 'kelompok' : 'individu',
          },
        ],
      };
    };

    const handleTypeChange = (typeId: string) => {
      selectedType.value = typeId;
      selectedDetail.value = detailOptions[typeId]?.[0] || 'Rincian';
    };

    return () => {
      if (activeToolId.value && activeTool.value) {
        const ToolComponent = activeTool.value.component;
        return (
          <div class="animate-fade-in">
            {/* Tool Header with Back Button */}
            <div class="d-flex align-items-center mb-4">
              <button
                onClick={() => activeToolId.value = null}
                class="header-logout-btn"
                style={{ width: '42px', height: '42px', background: 'white' }}
                title="Kembali ke Pencatatan"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <Typography variant="span" size="text-sm" weight="extrabold" className="ms-3 text-secondary">
                Kembali ke Pencatatan
              </Typography>
            </div>

            {/* Tool Render Card */}
            <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5">
              <div class="d-flex align-items-center gap-3 mb-4 pb-3 border-bottom">
                <div class="d-flex align-items-center justify-content-center rounded-4" style={{ width: '48px', height: '48px', backgroundColor: 'var(--color-primary-fixed)' }}>
                  <img src={activeTool.value.icon} alt="" style={{ width: '24px', height: '24px', objectFit: 'contain' }} />
                </div>
                <div>
                  <Typography variant="h3" size="text-lg" weight="extrabold" className="m-0 text-dark">
                    {activeTool.value.name}
                  </Typography>
                  <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                    {activeTool.value.description}
                  </Typography>
                </div>
              </div>

              <div class="tool-content-wrapper">
                <ToolComponent onClose={() => activeToolId.value = null} />
              </div>
            </div>
          </div>
        );
      }

      return (
        <div class="animate-fade-in">
          <div class="peternakan-title-card mb-4 overflow-hidden text-start">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 position-relative" style={{ zIndex: 1 }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-2">
                  <img src="/icon/catat_jenis.png" alt="Pencatatan" style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  <Typography variant="h3" weight="extrabold" className="m-0 text-white">Pencatatan Ternak</Typography>
                </div>
                <Typography variant="p" className="m-0 text-white opacity-85" size="text-sm">
                  Pilih metode pencatatan, pilih detail, lalu lanjutkan ke form yang lebih lengkap.
                </Typography>
              </div>
              <div class="d-flex gap-2 flex-wrap">
                <Badge variant="success" className="px-3 py-2">Kandang {cageSession.value?.code || 'A'}</Badge>
                <Badge variant="secondary" className="px-3 py-2">{new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit' }).format(now.value)} WIB</Badge>
              </div>
            </div>
          </div>

          <div class="bg-white rounded-5 border shadow-sm p-4 p-md-5 mb-4">
            <div class="mb-4">
              <Typography variant="h4" weight="extrabold" className="m-0">Form Pencatatan</Typography>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">Contoh desain dibuat ringkas seperti kartu record, tetapi tetap bisa dibedakan per domba atau per kandang.</Typography>
            </div>

            <div class="row g-4 justify-content-center">
              <div class="col-12 col-xl-7">
                <div class="bg-light rounded-5 border p-4 p-md-5 shadow-sm">
                  <div class="d-flex flex-column flex-md-row justify-content-md-between align-items-center mb-4 gap-3">
                    <div class="d-flex align-items-center gap-2 w-100 w-md-auto">
                      <img src={recordTypeOptions.find(item => item.id === selectedType.value)?.icon || '/icon/catat_pakan.png'} alt="Jenis" style={{ width: '22px', height: '22px', objectFit: 'contain' }} />
                      <Typography variant="h4" weight="extrabold" className="m-0">Jenis Pencatatan</Typography>
                    </div>
                    <div class="d-flex justify-content-center justify-content-md-end w-100 w-md-auto">
                      {showModeToggle.value ? (
                        <PencatatanModeToggle
                          modelValue={selectedScope.value === 'kandang' ? 'kelompok' : 'individu'}
                          onUpdateModelValue={(mode: PencatatanMode) => {
                            selectedScope.value = mode === 'kelompok' ? 'kandang' : 'domba';
                          }}
                        />
                      ) : (
                        <Badge variant="primary" className="px-3 py-1">Mode Domba</Badge>
                      )}
                    </div>
                  </div>

                  <div class="row g-3 mb-4">
                    <PencatatanField label="Jenis Pencatatan" colClass="col-md-6">
                      <PencatatanSelect
                        modelValue={selectedType.value}
                        options={recordTypeOptions.map((o) => ({ value: o.id, label: o.label }))}
                        onUpdateModelValue={(v: string) => handleTypeChange(v)}
                      />
                    </PencatatanField>
                    <PencatatanField label="Rincian Pencatatan" colClass="col-md-6">
                      <PencatatanSelect
                        modelValue={selectedDetail.value}
                        options={currentDetailOptions.value}
                        onUpdateModelValue={(v: string) => { selectedDetail.value = v; }}
                      />
                    </PencatatanField>
                  </div>

                  <div class="pencatatan-info-box mb-4">
                    <Typography variant="span" size="text-xs" className="text-secondary text-uppercase fw-bold d-block mb-1">
                      Petunjuk Pencatatan
                    </Typography>
                    <Typography variant="p" className="m-0" size="text-sm">
                      Form ini sengaja dibuat ringkas seperti contoh record peternakan agar cepat dipilih di lapangan.
                    </Typography>
                  </div>

                  <div class="d-flex justify-content-center mt-4">
                    <Button variant="primary" shape="pill" onClick={() => openForm()} className="px-5 shadow-sm">
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Tools & Reports Section */}
          <div class="mt-5 mb-4 text-start">
            <div class="mb-3">
              <Typography variant="h4" weight="extrabold" className="m-0 text-dark">Alat & Laporan</Typography>
              <Typography variant="p" size="text-xs" color="secondary" className="m-0">
                Kumpulan utilitas pembantu, silsilah perkawinan, pakan, sanitasi, ekspor, dan log kegiatan.
              </Typography>
            </div>

            <div class="row g-3">
              {toolsList.map(t => (
                <div class="col-12 col-md-6 col-xl-4" key={t.id}>
                  <div 
                    class="peternakan-item-card h-100 flex-column align-items-stretch" 
                    style={{ cursor: 'pointer', transition: 'all 0.3s ease' }} 
                    onClick={() => activeToolId.value = t.id}
                  >
                    <div class="d-flex align-items-start gap-3">
                      <div class="peternakan-item-icon-box position-relative" style={{ backgroundColor: 'var(--color-surface-container)' }}>
                        <img src={t.icon} style={{ width: '28px', height: '28px', objectFit: 'contain' }} alt="" />
                      </div>
                      <div class="peternakan-item-main flex-grow-1 min-w-0">
                        <span class="peternakan-item-headline text-truncate d-block">{t.name}</span>
                        <p class="text-secondary small mt-1 mb-0" style={{ fontSize: '0.8rem', lineHeight: '1.4' }}>{t.description}</p>
                      </div>
                    </div>
                    <div class="d-flex justify-content-end align-items-center mt-3 pt-3 border-top">
                      <button class="peternakan-action-btn">Buka Utilitas</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      );
    };
  }
});
