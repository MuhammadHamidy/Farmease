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
  emits: ['close', 'save', 'updateCategory'],
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
            <div class="peternakan-modal-card animate-fade-in-up" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px', borderRadius: '16px' }}>
              <div class="peternakan-modal-header d-flex justify-content-between align-items-center" style={{ borderBottom: '1px solid #f1eff0', padding: '1.25rem 1.5rem', position: 'relative' }}>
                <div style={{ flex: 1 }} />
                <div class="peternakan-modal-title" style={{ fontSize: '1.25rem', fontWeight: '800', color: '#000000', fontFamily: "'Inter', sans-serif", textAlign: 'center', flex: 8 }}>
                  {isEditing ? 'Edit Jadwal Rutin' : 'Tambah Jadwal Rutin'}
                </div>
                <button 
                  class="peternakan-modal-close border-0" 
                  onClick={() => emit('close')} 
                  style={{ background: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#9ca3af', flex: 1, textAlign: 'right' }}
                >
                  &times;
                </button>
              </div>
              <div class="peternakan-modal-body" style={{ padding: '1.5rem' }}>
                <div class="row g-3">
                  {/* 1. JENIS PENCATATAN / KEGIATAN */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>JENIS PENCATATAN / KEGIATAN</label>
                    <Select
                      options={categories}
                      modelValue={categoryValues.indexOf(form.category) !== -1 ? categories[categoryValues.indexOf(form.category)] : ''}
                      placeholder="Pilih Kegiatan"
                      onUpdate:modelValue={(val: string) => {
                        const idx = categories.indexOf(val);
                        form.category = categoryValues[idx];
                        form.title = val;
                        emit('updateCategory');
                      }}
                      theme={type}
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px' }}
                    />
                  </div>

                  {/* 2. Pilih Kode lahan */}
                  <div class="col-12">
                    <label class="pencatatan-label" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Pilih Kode lahan</label>
                    <Select
                      options={locationOptions.map(opt => ({ value: opt.value, label: opt.label }))}
                      modelValue={form.cageCode}
                      placeholder="Kode Lahan"
                      onUpdate:modelValue={(val: string) => {
                        form.cageCode = val;
                      }}
                      theme={type}
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px' }}
                    />
                  </div>

                  {/* 2.5 RINCIAN PENCATATAN */}
                  {currentRincianOptions.length > 0 && (
                    <div class="col-12">
                      <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>RINCIAN PENCATATAN</label>
                      <Select
                        options={currentRincianOptions.map(o => ({ value: o, label: o }))}
                        modelValue={form.rincian}
                        placeholder="Pilih Rincian Pencatatan"
                        onUpdate:modelValue={(val: string) => { form.rincian = val; }}
                        theme={type}
                        style={{ border: '1px solid #E6D9CE', borderRadius: '8px' }}
                      />
                    </div>
                  )}

                  {/* 3. TANGGAL & Jadwal Aktif Checkbox inline */}
                  <div class="col-12">
                    <div style="display: flex; align-items: flex-end; gap: 1rem;">
                      <div style="flex: 1;">
                        <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>TANGGAL</label>
                        <input
                          type="date"
                          class="form-control pencatatan-input"
                          value={form.startDate}
                          onInput={(e: any) => { form.startDate = e.target.value; }}
                          style={{ height: '42px', border: '1px solid #E6D9CE', borderRadius: '8px' }}
                        />
                      </div>
                      <div style="display: flex; align-items: center; gap: 0.5rem; padding-bottom: 0.65rem; min-width: 120px;">
                        <input
                          type="checkbox"
                          id="jadwal-aktif-chk-modal"
                          checked={form.active}
                          onChange={(e) => {
                            form.active = (e.target as HTMLInputElement).checked;
                          }}
                          style={{ width: '18px', height: '18px', accentColor: '#303B1E', cursor: 'pointer' }}
                        />
                        <label for="jadwal-aktif-chk-modal" style={{ fontWeight: '500', color: '#374151', fontSize: '0.9rem', cursor: 'pointer', margin: 0 }}>Jadwal Aktif</label>
                      </div>
                    </div>
                  </div>

                  {/* 4. Pilih Prioritas Pencatatan */}
                  <div class="col-12">
                    <label class="pencatatan-label" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>Pilih Prioritas Pencatatan</label>
                    <Select
                      options={['Rendah', 'Sedang', 'Tinggi']}
                      modelValue={form.priority === 'rendah' ? 'Rendah' : form.priority === 'tinggi' ? 'Tinggi' : form.priority === 'sedang' ? 'Sedang' : ''}
                      placeholder="Pilih Prioritas Pencatatan"
                      onUpdate:modelValue={(val: string) => {
                        if (val === 'Rendah') form.priority = 'rendah';
                        else if (val === 'Tinggi') form.priority = 'tinggi';
                        else if (val === 'Sedang') form.priority = 'sedang';
                      }}
                      theme={type}
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px' }}
                    />
                  </div>

                  {/* 5. DESKRIPSI (OPSIONAL) */}
                  <div class="col-12">
                    <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>DESKRIPSI (OPSIONAL)</label>
                    <textarea
                      class="form-control pencatatan-textarea"
                      value={form.description}
                      onInput={(e: any) => { form.description = e.target.value; }}
                      placeholder="Masukkan detail instruksi atau catatan tambahan..."
                      rows={3}
                      style={{ border: '1px solid #E6D9CE', borderRadius: '8px', padding: '0.75rem', resize: 'none' }}
                    />
                  </div>

                  {/* 6. WAKTU PELAKSANAAN & WAKTU TENGGAT side-by-side */}
                  <div class="col-12 m-0 p-0">
                    <div class="row g-2 m-0 p-0 w-100">
                      <div class="col-6">
                        <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>WAKTU PELAKSANAAN (WIB)</label>
                        <input
                          type="time"
                          class="form-control pencatatan-input"
                          value={form.time}
                          onInput={(e: any) => { form.time = e.target.value; }}
                          style={{ height: '42px', cursor: 'pointer', border: '1px solid #E6D9CE', borderRadius: '8px' }}
                        />
                      </div>
                      <div class="col-6">
                        <label class="pencatatan-label text-uppercase" style={{ fontSize: '0.78rem', fontWeight: '600', color: '#374151', marginBottom: '0.4rem', display: 'block' }}>WAKTU TENGGAT (WIB)</label>
                        <input
                          type="time"
                          class="form-control pencatatan-input"
                          value={form.endTime || '12:00'}
                          onInput={(e: any) => { form.endTime = e.target.value; }}
                          style={{ height: '42px', cursor: 'pointer', border: '1px solid #E6D9CE', borderRadius: '8px' }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Weekly days selector when frequency is weekly */}
                  {form.frequency === 'mingguan' && (
                    <div class="col-12 mt-3">
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

                  {/* Monthly date selector when frequency is monthly */}
                  {form.frequency === 'bulanan' && (
                    <div class="col-12 mt-3">
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
                        style={{ border: '1px solid #E6D9CE', borderRadius: '8px', height: '42px' }}
                      />
                    </div>
                  )}
                </div>

                {/* Footer Buttons Batal on Left and Simpan Tugas on Right */}
                <div class="mt-4 pt-3 d-flex gap-3">
                  <button 
                    type="button" 
                    class="btn btn-outline-secondary" 
                    onClick={() => emit('close')}
                    style={{ 
                      borderRadius: '8px', 
                      fontWeight: '700', 
                      padding: '0.65rem 0', 
                      width: '45%', 
                      border: '1.5px solid #d1d5db', 
                      color: '#374151', 
                      backgroundColor: '#ffffff' 
                    }}
                  >
                    Batal
                  </button>
                  <button 
                    type="button" 
                    class="btn text-white" 
                    onClick={() => emit('save')}
                    style={{ 
                      borderRadius: '8px', 
                      fontWeight: '700', 
                      padding: '0.65rem 0', 
                      width: '55%', 
                      backgroundColor: '#303B1E', 
                      border: 'none' 
                    }}
                  >
                    Simpan Tugas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Teleport>
      );
    };
  }
});
