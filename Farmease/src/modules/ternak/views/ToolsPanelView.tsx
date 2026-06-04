import { defineComponent, ref, computed } from 'vue';
import Typography from '@/shared/ui/Typography';
import InbreedingChecker from '../components/tools/InbreedingChecker';
import WeightHistory from '../components/tools/WeightHistory';
import FeedStock from '../components/tools/FeedStock';
import WasteLog from '../components/tools/WasteLog';
import ReportsExport from '../components/tools/ReportsExport';
import ActivityLog from '../components/tools/ActivityLog';

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
  name: 'ToolsPanelView',
  setup() {
    const activeToolId = ref<string | null>(null);

    const activeTool = computed(() => {
      return toolsList.find(t => t.id === activeToolId.value) || null;
    });

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
                title="Kembali ke Menu Alat"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M19 12H5M12 19l-7-7 7-7" />
                </svg>
              </button>
              <Typography variant="span" size="text-sm" weight="extrabold" className="ms-3 text-secondary">
                Kembali ke Alat & Laporan
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
          {/* Title Header */}
          <div class="peternakan-title-card mb-4 overflow-hidden text-start">
            <div class="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-4 position-relative" style={{ zIndex: 1 }}>
              <div>
                <div class="d-flex align-items-center gap-3 mb-2">
                  <img src="/icon/catat_jenis.png" alt="Tools" style={{ width: '34px', height: '34px', objectFit: 'contain', filter: 'brightness(0) invert(1)' }} />
                  <Typography variant="h3" weight="extrabold" className="m-0 text-white">Alat & Laporan</Typography>
                </div>
                <Typography variant="p" className="m-0 text-white opacity-85" size="text-sm">
                  Kumpulan utilitas, detektor silsilah, analisis pakan, log kegiatan, dan ekspor data peternakan.
                </Typography>
              </div>
            </div>
          </div>

          {/* Tools Grid */}
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
      );
    };
  }
});
