import { defineComponent, ref } from 'vue';
import { useRouter } from 'vue-router';
import '@/modules/ternak/assets/css/modules/PeternakanPage.css';
import { userSession, cageSession } from '@/store/navigation';
import Typography from '@/shared/ui/Typography';
import DasborView from './DasborView';
import TernakView from './TernakView';
import PencatatanView from './PencatatanView';
import PencatatanDetailView from './PencatatanDetailView';
import RiwayatView from './RiwayatView';
import TernakDetailView from './TernakDetailView';
import PencatatanFormView from './PencatatanFormView';
import Badge from '@/shared/ui/Badge';
import { selectedTernakId } from '@/store/navigation';

const tabs = [
  { id: 'dasbor',      label: 'Dasbor & Ternak' },
  { id: 'pencatatan',  label: 'Pencatatan' },
  { id: 'riwayat',     label: 'Riwayat' },
];

export default defineComponent({
  name: 'PeternakanPage',
  setup() {
    const router = useRouter();
    const activeTab = ref('dasbor');

    return () => (
      <div class="peternakan-page">
        {/* ── Dashboard Header (Clean Version) ────────────────── */}
        <header class="peternakan-header-v2">
          <div class="header-left-group">
            <div 
              class="peternakan-logo-container" 
              onClick={() => router.push({ name: 'home' })} 
              style={{ cursor: 'pointer' }}
            >
              <img src="/icon/logo_farmease.png" alt="FARMease" style={{ height: '44px', objectFit: 'contain' }} />
            </div>
            <div class="header-divider d-none d-sm-block"></div>
            <h1 class="peternakan-header-title d-none d-sm-block">Sah Hi Agro Farm</h1>
          </div>

          <div class="header-right-group">
            <button 
              class="header-logout-btn" 
              onClick={() => { userSession.value = null; cageSession.value = null; router.push({ name: 'home' }) }}
              title="Keluar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16 17 21 12 16 7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
            </button>
          </div>
        </header>

        {/* ── Pill Tab Navigation ──────────────────────── */}
        <nav class="peternakan-nav-container">
          <div class="peternakan-tab-pills">
            {tabs.map(tab => (
              <button
                key={tab.id}
                class={['peternakan-tab-pill', activeTab.value === tab.id ? 'active' : '']}
                onClick={() => activeTab.value = tab.id}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        <div class="peternakan-content">
          {selectedTernakId.value ? (
            <TernakDetailView onGoToPencatatan={() => activeTab.value = 'pencatatan'} />
          ) : (
            <>
              {activeTab.value === 'dasbor'     && <DasborView onGoToPencatatan={() => activeTab.value = 'pencatatan'} />}
              {activeTab.value === 'pencatatan' && <PencatatanView />}
              {activeTab.value === 'riwayat'    && <RiwayatView />}
            </>
          )}
          {/* Jika ada selected pencatatan payload, tunjukkan halaman detail */}
          {/** selectedPencatatanPayload rendered at top-level so it overlays tab views when set */}
          {/** This file intentionally keeps tab flow; PencatatanDetailView reads store directly */}
          <PencatatanFormView />
          <PencatatanDetailView />
        </div>
      </div>
    );
  }
});
