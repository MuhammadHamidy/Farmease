import { defineComponent, Teleport, type PropType } from 'vue';
import Select from '@/shared/ui/admin/Select';

const dayLabels = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

export default defineComponent({
  name: 'RoutineScheduleFormModal',
  props: {
    isOpen: {
      type: Boolean,
      required: true
    },
    isEditing: {
      type: Boolean,
      required: true
    },
    form: {
      type: Object as PropType<any>,
      required: true
    },
    type: {
      type: String as PropType<'peternakan' | 'perkebunan'>,
      required: true
    },
    categories: {
      type: Array as PropType<string[]>,
      required: true
    },
    categoryValues: {
      type: Array as PropType<string[]>,
      required: true
    },
    currentRincianOptions: {
      type: Array as PropType<string[]>,
      required: true
    },
    locationOptions: {
      type: Array as PropType<{value: string, label: string}[]>,
      required: true
    },
    frequencyLabel: {
      type: Function as PropType<(f: string) => string>,
      required: true
    }
  },
  emits: ['close', 'save', 'update-category'],
  setup(props, { emit }) {
    const toggleDay = (day: number) => {
      const form = props.form;
      if (form.daysOfWeek.includes(day)) {
        form.daysOfWeek = form.daysOfWeek.filter((d: number) => d !== day);
      } else {
        form.daysOfWeek = [...form.daysOfWeek, day].sort();
      }
    };

    return () => {
      if (!props.isOpen) return null;

      const { form, isEditing, type, categories, categoryValues, currentRincianOptions, locationOptions, frequencyLabel } = props;

      return (
        <Teleport to="body">
          <div class="peternakan-modal-overlay" onClick={() => emit('close')}>
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()}>
              <div class="peternakan-modal-header">
                <button class="peternakan-modal-close" onClick={() => emit('close')}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
                <div class="peternakan-modal-title">
                  {isEditing ? 'Edit Jadwal Rutin' : 'Tambah Jadwal Rutin'}
                </div>
              </div>
              <div class="peternakan-modal-body mt-4">
                <div class="row g-3">
                  <div class="col-12">
                    <label class="pencatatan-label">Jenis Pencatatan / Kegiatan <span class="text-danger">*</span></label>
                    <Select
                      options={categories}
                      modelValue={categories[categoryValues.indexOf(form.category)] || categories[0]}
                      onUpdate:modelValue={(val: string) => {
                        const idx = categories.indexOf(val);
                        form.category = categoryValues[idx];
                        form.title = val;
                        emit('update-category');
                      }}
                      theme={type}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Rincian Pencatatan <span class="text-danger">*</span></label>
                    <Select
                      options={currentRincianOptions}
                      modelValue={form.rincian}
                      onUpdate:modelValue={(val: string) => {
                        form.rincian = val;
                      }}
                      theme={type}
                    />
                  </div>
                  <div class="col-12">
                    <label class="pencatatan-label">Deskripsi <span class="text-muted fw-normal">(Opsional)</span></label>
                    <textarea
                      class="form-control pencatatan-textarea"
                      value={form.description}
                      onInput={(e: any) => { form.description = e.target.value; }}
                      placeholder="Masukkan deskripsi tugas"
                      rows={2}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Kode {type === 'peternakan' ? 'Kandang' : 'Lahan'} <span class="text-danger">*</span></label>
                    <Select
                      options={locationOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                      modelValue={form.cageCode}
                      onUpdate:modelValue={(val: string) => {
                        form.cageCode = val;
                      }}
                      theme={type}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Tanggal <span class="text-danger">*</span></label>
                    <input
                      type="date"
                      class="form-control pencatatan-input"
                      value={form.startDate}
                      onInput={(e: any) => { form.startDate = e.target.value; }}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Jam Pelaksanaan (WIB) <span class="text-danger">*</span></label>
                    <input
                      type="time"
                      class="form-control pencatatan-input"
                      value={form.time}
                      onInput={(e: any) => { form.time = e.target.value; }}
                      style={{ height: '38px', cursor: 'pointer' }}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Jam Tenggat (WIB) <span class="text-danger">*</span></label>
                    <input
                      type="time"
                      class="form-control pencatatan-input"
                      value={form.endTime || '12:00'}
                      onInput={(e: any) => { form.endTime = e.target.value; }}
                      style={{ height: '38px', cursor: 'pointer' }}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Frekuensi <span class="text-danger">*</span></label>
                    <Select
                      options={['Sekali', 'Harian', 'Mingguan', 'Bulanan']}
                      modelValue={frequencyLabel(form.frequency)}
                      onUpdate:modelValue={(val: string) => {
                        if (val === 'Sekali') form.frequency = 'sekali';
                        else if (val === 'Harian') form.frequency = 'harian';
                        else if (val === 'Mingguan') form.frequency = 'mingguan';
                        else form.frequency = 'bulanan';
                      }}
                      theme={type}
                    />
                  </div>

                  <div class="col-12">
                    <label class="pencatatan-label">Prioritas <span class="text-danger">*</span></label>
                    <Select
                      options={['Rendah', 'Sedang', 'Tinggi']}
                      modelValue={form.priority === 'rendah' ? 'Rendah' : form.priority === 'tinggi' ? 'Tinggi' : 'Sedang'}
                      onUpdate:modelValue={(val: string) => {
                        if (val === 'Rendah') form.priority = 'rendah';
                        else if (val === 'Tinggi') form.priority = 'tinggi';
                        else form.priority = 'sedang';
                      }}
                      theme={type}
                    />
                  </div>

                  {form.frequency === 'mingguan' && (
                    <div class="col-12">
                      <label class="pencatatan-label">Hari dalam Seminggu</label>
                      <div class="d-flex gap-2 flex-wrap">
                        {dayLabels.map((label, idx) => (
                          <button
                            type="button"
                            key={idx}
                            class={[
                              'btn btn-sm rounded-pill px-3 py-1 fw-bold',
                              form.daysOfWeek.includes(idx) ? 'btn-primary' : 'btn-outline-secondary',
                            ]}
                            onClick={() => toggleDay(idx)}
                          >
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {form.frequency === 'bulanan' && (
                    <div class="col-md-6">
                      <label class="pencatatan-label">Tanggal (1-28)</label>
                      <input
                        type="number"
                        min="1"
                        max="28"
                        class="form-control pencatatan-input"
                        value={form.dayOfMonth}
                        onInput={(e: any) => {
                          form.dayOfMonth = Math.min(28, Math.max(1, Number(e.target.value) || 1));
                        }}
                      />
                    </div>
                  )}
                  <div class="col-12 mt-2">
                    <label class="d-flex align-items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.active}
                        onChange={(e) => {
                          form.active = (e.target as HTMLInputElement).checked;
                        }}
                      />
                      <span class="fw-bold text-dark">Jadwal aktif</span>
                    </label>
                  </div>

                </div>
                <div class="d-flex gap-3 mt-4 pt-3 border-top">
                  <button 
                    type="button" 
                    class="btn flex-grow-1"
                    style={{ borderRadius: '1rem', fontWeight: 700, color: '#606C38', borderColor: '#606C38', backgroundColor: 'transparent' }}
                    onClick={() => emit('close')}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    class="btn flex-grow-1"
                    style={{ borderRadius: '1rem', fontWeight: 700, backgroundColor: '#606C38', color: 'white', border: 'none' }}
                    onClick={() => emit('save')}
                  >
                    Simpan Tugas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      );
    }
  }
});
