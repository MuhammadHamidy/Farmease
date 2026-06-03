import { defineComponent, ref, type PropType, Teleport } from 'vue';
import Button from './Button';
import CalendarPicker from './CalendarPicker';
import '@/shared/assets/css/ui/SelectionBottomSheet.css'; // Reuse overlay/card/handle/header styles
import '@/shared/assets/css/ui/ReminderScheduleSheet.css';

export interface ReminderScheduleData {
  date: string | null;       // YYYY-MM-DD
  rutin: string;
  kategori: string;
  jumlah: string;
}

const ChevronDownIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="6 9 12 15 18 9"></polyline>
  </svg>
);

export default defineComponent({
  name: 'ReminderScheduleSheet',
  props: {
    show: { type: Boolean, required: true },
    modelValue: {
      type: Object as PropType<ReminderScheduleData>,
      default: () => ({ date: null, rutin: '', kategori: '', jumlah: '' })
    },
    submitButtonLabel: { type: String, default: 'Selanjutnya' },
  },
  emits: ['close', 'submit', 'update:modelValue'],
  setup(props, { emit }) {
    const localDate     = ref<string | null>(props.modelValue?.date ?? null);
    const localRutin    = ref(props.modelValue?.rutin ?? '');
    const localKategori = ref(props.modelValue?.kategori ?? '');
    const localJumlah   = ref(props.modelValue?.jumlah ?? '');

    const handleClose = () => emit('close');

    const handleSubmit = () => {
      const data: ReminderScheduleData = {
        date: localDate.value,
        rutin: localRutin.value,
        kategori: localKategori.value,
        jumlah: localJumlah.value,
      };
      emit('update:modelValue', data);
      emit('submit', data);
    };

    return () => (
      <Teleport to="body">
        <div
          class={['selection-bottom-sheet-overlay', props.show ? 'active' : '']}
          onClick={handleClose}
        >
          <div
            class="selection-bottom-sheet-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag Handle */}
            <div class="selection-sheet-handle" />

            {/* Header */}
            <header class="selection-sheet-header">
              <button class="selection-sheet-close" onClick={handleClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h3 class="selection-sheet-title">Pilih Jadwal Pengingat</h3>
            </header>

            {/* Scrollable body */}
            <div class="reminder-sheet-body">

              {/* Calendar */}
              <div class="reminder-sheet-calendar">
                <CalendarPicker
                  modelValue={localDate.value}
                  onUpdate:modelValue={(d: string) => { localDate.value = d; }}
                />
              </div>

              {/* Dropdowns */}
              <div class="reminder-sheet-select-group">
                {/* Buat Rutin — full width */}
                <div class="reminder-select-wrapper full">
                  <select
                    class="reminder-select"
                    v-model={localRutin.value}
                  >
                    <option value="" disabled>Buat Rutin</option>
                    <option value="harian">Setiap Hari</option>
                    <option value="mingguan">Setiap Minggu</option>
                    <option value="bulanan">Setiap Bulan</option>
                    <option value="sekali">Sekali Saja</option>
                  </select>
                  <span class="reminder-select-chevron"><ChevronDownIcon /></span>
                </div>

                {/* Kategori + Jumlah — side by side */}
                <div class="reminder-sheet-select-row">
                  <div class="reminder-select-wrapper">
                    <select class="reminder-select" v-model={localKategori.value}>
                      <option value="" disabled>Kategori</option>
                      <option value="pakan">Pakan</option>
                      <option value="kesehatan">Kesehatan</option>
                      <option value="kebersihan">Kebersihan</option>
                    </select>
                    <span class="reminder-select-chevron"><ChevronDownIcon /></span>
                  </div>
                  <div class="reminder-select-wrapper">
                    <select class="reminder-select" v-model={localJumlah.value}>
                      <option value="" disabled>Jumlah</option>
                      {[1,2,3,4,5,6,7,8,9,10].map(n => (
                        <option key={n} value={String(n)}>{n}x</option>
                      ))}
                    </select>
                    <span class="reminder-select-chevron"><ChevronDownIcon /></span>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div class="reminder-sheet-footer">
              <Button
                variant="primary"
                fullWidth
                shape="pill"
                onClick={handleSubmit}
              >
                {props.submitButtonLabel}
              </Button>
            </div>
          </div>
        </div>
      </Teleport>
    );
  }
});
