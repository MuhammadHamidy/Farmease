import { defineComponent, ref, computed, watch, onMounted, onUnmounted } from 'vue';
import '@/modules/ternak/assets/css/modules/RecordForm.css';
import Typography from '@/shared/ui/Typography';
import Badge from '@/shared/ui/Badge';
import Button from '@/shared/ui/Button';
import PencatatanField from '@/modules/ternak/components/pencatatan/PencatatanField';
import PencatatanSelect from '@/modules/ternak/components/pencatatan/PencatatanSelect';
import { activePencatatanForm, cageSession, prefilledPencatatanType, prefilledPencatatanRincian } from '@/store/navigation';
import PencatatanModeToggle from '@/modules/ternak/components/pencatatan/PencatatanModeToggle';
import type { PencatatanMode } from '@/modules/ternak/components/pencatatan/PencatatanModeToggle';



const recordTypeOptions = [
  { id: 'pakan', label: 'Pakan', icon: '/icon/catat_pakan.png' },
  { id: 'stok_pakan', label: 'Stok Pakan', icon: '/icon/catat_pakan.png' },
  { id: 'kesehatan', label: 'Kesehatan', icon: '/icon/catat_sehat.png' },
  { id: 'perkawinan', label: 'Perkawinan', icon: '/icon/catat_kawin.png' },
  { id: 'kelahiran', label: 'Kelahiran', icon: '/icon/catat_lahir.png' },
  { id: 'kotoran', label: 'Kotoran', icon: '/icon/catat_kotoran.png' },
  { id: 'berat_badan', label: 'Berat Badan', icon: '/icon/statistic.png' },
] as const;

const detailOptions: Record<string, string[]> = {
  pakan: ['Pakan Pagi', 'Pakan Siang', 'Pakan Sore', 'Suplementasi'],
  stok_pakan: ['Tambah Stok', 'Konversi Pakan'],
  kesehatan: ['Pemeriksaan Rutin', 'Vitamin', 'Vaksin', 'Obat Cacing'],
  perkawinan: ['Kawin Alam', 'IB', 'Cek Birahi', 'Kontrol Kebuntingan'],
  kelahiran: ['Lahir Normal', 'Kembar', 'Lahir Cesar'],
  kotoran: ['Sanitasi Harian', 'Panen Kotoran', 'Pembersihan Lantai', 'Fermentasi'],
  berat_badan: ['Timbang Rutin', 'Timbang Harian', 'Timbang Bulanan', 'Timbang Mandiri'],
};

const categoryIcons: Record<string, string> = {
  pakan: '/icon/catat_pakan.png',
  stok_pakan: '/icon/catat_pakan.png',
  kesehatan: '/icon/catat_sehat.png',
  kotoran: '/icon/catat_kotoran.png',
  perkawinan: '/icon/catat_kawin.png',
  kelahiran: '/icon/catat_lahir.png',
  berat_badan: '/icon/statistic.png',
  umum: '/icon/catat_jenis.png',
};

const MODE_TOGGLE_TYPES = new Set(['pakan', 'kesehatan', 'kotoran']);



export default defineComponent({
  name: 'PencatatanView',
  setup() {
    const now = ref(new Date());
    const selectedScope = ref<'domba' | 'kandang'>('domba');
    const selectedType = ref<string>('pakan');
    const selectedDetail = ref<string>(detailOptions.pakan![0] || 'Pakan Pagi');


    let timer: ReturnType<typeof setInterval> | undefined;

    onMounted(() => {
      timer = setInterval(() => {
        now.value = new Date();
      }, 1000);

      if (prefilledPencatatanType.value) {
        selectedType.value = prefilledPencatatanType.value;
        prefilledPencatatanType.value = null; // Clear after applying
      }
      if (prefilledPencatatanRincian.value) {
        selectedDetail.value = prefilledPencatatanRincian.value;
        prefilledPencatatanRincian.value = null;
      }
    });

    onUnmounted(() => {
      if (timer) clearInterval(timer);
    });

    const currentDetailOptions = computed(() => detailOptions[selectedType.value] || []);
    const showModeToggle = computed(() => MODE_TOGGLE_TYPES.has(selectedType.value));



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

    return () => (
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
                <Badge variant="secondary" className="px-3 py-2">Kandang {cageSession.value?.code || 'A'}</Badge>
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
                      {selectedType.value === 'stok_pakan' ? (
                        <Badge variant="success" className="px-3 py-1">Stok & Gudang</Badge>
                      ) : showModeToggle.value ? (
                        <PencatatanModeToggle
                          modelValue={selectedScope.value === 'kandang' ? 'kelompok' : 'individu'}
                          onUpdateModelValue={(mode: PencatatanMode) => {
                            selectedScope.value = mode === 'kelompok' ? 'kandang' : 'domba';
                          }}
                        />
                      ) : (
                        <Badge variant="solid-primary" className="px-3 py-1">Mode Domba</Badge>
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

                  <div class="d-flex justify-content-center mt-4">
                    <Button variant="primary" shape="pill" onClick={() => openForm()} className="px-5 shadow-sm">
                      Selanjutnya
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      );
  }
});
