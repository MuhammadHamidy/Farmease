import { defineComponent, computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import { getJenisIcon } from './shared/pencatatanIcons'

type SelectionItem = {
  label: string
  sublabel?: string
}

type RecordingChoice = {
  jenis: string
  rincian: string
}

type Stage = 'jenis' | 'rincian'

export default defineComponent({
  name: 'PerkebunanSelectionModal',
  props: {
    open: {
      type: Boolean,
      required: true,
    },
    initialStage: {
      type: String as PropType<Stage>,
      required: true,
    },
    selectedJenis: {
      type: String,
      required: true,
    },
    selectedRincian: {
      type: String,
      required: true,
    },
    jenisItems: {
      type: Array as PropType<SelectionItem[]>,
      required: true,
    },
    rincianItemsByJenis: {
      type: Object as PropType<Record<string, SelectionItem[]>>,
      required: true,
    },
  },
  emits: ['close', 'select', 'add'],
  setup(props, { emit }) {
    const step = ref<Stage>(props.initialStage)
    const searchQuery = ref('')
    const draftJenis = ref(props.selectedJenis)
    const draftRincian = ref(props.selectedRincian)

    watch(
      () => [props.open, props.initialStage, props.selectedJenis, props.selectedRincian],
      ([isOpen, initialStage, selectedJenis, selectedRincian]) => {
        if (isOpen) {
          step.value = initialStage as Stage
          draftJenis.value = selectedJenis as string
          draftRincian.value = selectedRincian as string
          searchQuery.value = ''
        }
      },
      { immediate: true },
    )

    const currentItems = computed(() => {
      if (step.value === 'jenis') return props.jenisItems
      return props.rincianItemsByJenis[draftJenis.value] ?? []
    })

    const filteredItems = computed(() => {
      const q = searchQuery.value.trim().toLowerCase()
      if (!q) return currentItems.value
      return currentItems.value.filter((item) => item.label.toLowerCase().includes(q))
    })

    const currentTitle = computed(() => (step.value === 'jenis' ? 'Jenis Pencatatan' : 'Rincian Pencatatan'))
    const currentPlaceholder = computed(() =>
      step.value === 'jenis' ? 'Cari jenis pencatatan' : 'Cari rincian pencatatan',
    )
    const currentButtonLabel = computed(() => (step.value === 'jenis' ? 'Tambah Jenis' : 'Tambah Rincian'))
    const currentSectionLabel = computed(() =>
      step.value === 'jenis' ? 'Pilih Jenis Pencatatan' : 'Pilih Rincian Pencatatan',
    )

    const canSave = computed(() => {
      if (step.value === 'jenis') return draftJenis.value !== 'Jenis Pencatatan'
      return draftJenis.value !== 'Jenis Pencatatan' && draftRincian.value !== 'Rincian Pencatatan'
    })

    const handleSelect = (item: SelectionItem) => {
      if (step.value === 'jenis') {
        draftJenis.value = item.label
        draftRincian.value = 'Rincian Pencatatan'
        step.value = 'rincian'
        searchQuery.value = ''
        return
      }
      draftRincian.value = item.label
    }

    const handleSave = () => {
      if (!canSave.value) return
      emit('select', {
        jenis: draftJenis.value,
        rincian: draftRincian.value === 'Rincian Pencatatan' ? '' : draftRincian.value,
      } satisfies RecordingChoice)
    }

    return () => {
      if (!props.open) return null

      return (
        <div
          class="perkebunan-modal-backdrop"
          onClick={() => emit('close')}
          style="align-items: center; justify-content: center; padding: 1rem; overflow-y: auto;"
        >
          <div
            class="perkebunan-record-modal"
            onClick={(e) => e.stopPropagation()}
            style="
              position: relative;
              width: min(100%, 380px);
              border-radius: 1.25rem;
              padding: 0 0 1.25rem;
              overflow-y: auto;
              background: #ffffff;
              max-height: 90vh;
              display: flex;
              flex-direction: column;
              box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
              box-sizing: border-box;
            "
          >
            {/* ── Close Button ── */}
            <div style="padding: 1rem 1.25rem 0.5rem; display: flex; justify-content: flex-start; flex-shrink: 0; width: 100%; box-sizing: border-box;">
              <button
                onClick={() => emit('close')}
                style="
                  background: none;
                  border: none;
                  cursor: pointer;
                  padding: 0.25rem;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                "
              >
                <img src="/icon/close-cancel/black-24.svg" alt="Tutup" style="width: 24px; height: 24px; object-fit: contain;" />
              </button>
            </div>

            {/* ── Dark Green Header Card ── */}
            <div style="padding: 0 1.25rem; flex-shrink: 0; width: 100%; box-sizing: border-box;">
              <div
                style="
                  background: #38431f;
                  border-radius: 1.25rem;
                  padding: 1.25rem 1rem;
                  display: flex;
                  flex-direction: column;
                  gap: 0.85rem;
                  box-sizing: border-box;
                "
              >
                {/* Title */}
                <h2 style="text-align: center; font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0; letter-spacing: -0.01em;">
                  {currentTitle.value}
                </h2>

                {/* Search Input Box */}
                <div style="position: relative; width: 100%;">
                  <svg
                    style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); opacity: 0.75; pointer-events: none;"
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder={currentPlaceholder.value}
                    value={searchQuery.value}
                    onInput={(e) => { searchQuery.value = (e.target as HTMLInputElement).value }}
                    style="
                      width: 100%;
                      padding: 0.6rem 0.9rem 0.6rem 2.35rem;
                      border: none;
                      border-radius: 0.5rem;
                      font-size: 0.9rem;
                      background: #ffffff;
                      color: #1f2937;
                      outline: none;
                      box-sizing: border-box;
                    "
                  />
                </div>

                {/* Selected Jenis Preview Card (for rincian step) */}
                {step.value === 'rincian' && draftJenis.value !== 'Jenis Pencatatan' && (
                  <div
                    style="
                      background: #ffffff;
                      border-radius: 0.85rem;
                      padding: 0.85rem 1rem;
                      border: 1.5px solid #111827;
                      display: flex;
                      flex-direction: column;
                      gap: 0.45rem;
                      width: 100%;
                      box-sizing: border-box;
                    "
                  >
                    <span style="font-size: 0.85rem; font-weight: 800; color: #111827; text-align: left;">Rincian Pencatatan</span>
                    <div
                      onClick={() => { step.value = 'jenis' }}
                      style="
                        border: 1.5px solid #111827;
                        border-radius: 0.6rem;
                        padding: 0.65rem 0.85rem;
                        background: #fff;
                        cursor: pointer;
                        display: flex;
                        align-items: center;
                        gap: 0.75rem;
                        width: 100%;
                        box-sizing: border-box;
                      "
                    >
                      <div
                        style="
                          width: 2.2rem;
                          height: 2.2rem;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                        "
                      >
                        <img src="/icon/calender.png" alt="Jenis" style="width: 1.5rem; height: 1.5rem; object-fit: contain;" />
                      </div>
                      <div style="display: flex; flex-direction: column; gap: 0.1rem; text-align: left;">
                        <span style="font-size: 0.7rem; color: #6b7280; font-weight: 600;">Jenis Pencatatan</span>
                        <strong style="font-size: 1.1rem; color: #111827; font-weight: 800;">
                          {draftJenis.value.replace(/^Pencatatan\s+/u, '')}
                        </strong>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* ── Scrollable Body ── */}
            <div style="padding: 1rem 1.25rem; overflow-y: auto; flex: 1; display: flex; flex-direction: column; gap: 1rem; width: 100%; box-sizing: border-box;">
              
              {/* Tambah Button */}
              <div style="display: flex; justify-content: flex-end;">
                <button
                  type="button"
                  onClick={() => emit('add')}
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #38431f;
                    color: #fff;
                    border: none;
                    border-radius: 0.5rem;
                    padding: 0.55rem 1rem;
                    font-size: 0.9rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.18s ease;
                  "
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {currentButtonLabel.value}
                </button>
              </div>

              {/* Section Heading */}
              <div style="text-align: left;">
                <span style="font-weight: 800; color: #111827; font-size: 1.1rem; display: block;">
                  {currentSectionLabel.value}
                </span>
                {step.value === 'rincian' && (
                  <span style="font-size: 0.78rem; color: #6b7280; display: block; margin-top: 0.15rem; font-weight: 600;">
                    Maksimal pilih 1
                  </span>
                )}
              </div>

              {/* Radio Item List */}
              <div style="display: flex; flex-direction: column; gap: 0.75rem;">
                {filteredItems.value.map((item) => {
                  const isSelected =
                    step.value === 'jenis'
                      ? draftJenis.value === item.label
                      : draftRincian.value === item.label

                  let displayLabel = item.label.replace(/^Pencatatan\s+/u, '')
                  if (displayLabel === 'Perangsang') {
                    displayLabel = 'Perangsing'
                  }

                  return (
                    <button
                      type="button"
                      key={item.label}
                      onClick={() => handleSelect(item)}
                      class={['perkebunan-modal-item', isSelected ? 'selected' : '']}
                      style={{
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        display: 'flex',
                        padding: '1rem 1.15rem',
                        boxSizing: 'border-box',
                        width: '100%',
                        borderRadius: '0.75rem',
                      }}
                    >
                      <div style="display: flex; align-items: center; gap: 0.75rem; text-align: left;">
                        {step.value === 'jenis' && (
                          <div style="
                            width: 2.2rem;
                            height: 2.2rem;
                            border-radius: 0.45rem;
                            background: #f4f5f0;
                            border: 1.5px solid #dce1d0;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            flex-shrink: 0;
                          ">
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38431f" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                              <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/>
                              <rect x="8" y="2" width="8" height="4" rx="1" ry="1"/>
                              <line x1="9" y1="10" x2="15" y2="10"/>
                              <line x1="9" y1="14" x2="15" y2="14"/>
                            </svg>
                          </div>
                        )}
                        <div style="display: flex; flex-direction: column; gap: 0.15rem;">
                          <strong style="font-size: 1.15rem; color: #111827; font-weight: 800; line-height: 1.2;">
                            {displayLabel}
                          </strong>
                          <span style="font-size: 0.8rem; color: #6b7280; font-weight: 600;">
                            {item.sublabel ?? (step.value === 'jenis' ? 'Jenis Pencatatan' : 'Rincian Pencatatan')}
                          </span>
                        </div>
                      </div>

                      {/* Radio circle */}
                      {step.value === 'rincian' && (
                        <div style={`
                          width: 1.35rem;
                          height: 1.35rem;
                          border-radius: 50%;
                          border: 2px solid ${isSelected ? '#38431f' : '#c8cfb6'};
                          background: ${isSelected ? '#38431f' : '#fff'};
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          margin-left: 0.75rem;
                          transition: all 0.15s ease;
                        `}>
                          {isSelected && (
                            <div style="width: 0.55rem; height: 0.55rem; border-radius: 50%; background: #ffffff;" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}

                {filteredItems.value.length === 0 && (
                  <div style="text-align: center; color: #9ca3af; padding: 2rem 0; font-size: 0.9rem;">
                    Tidak ada data ditemukan.
                  </div>
                )}
              </div>
            </div>

            {/* ── Simpan Button ── */}
            <div style="padding: 0.85rem 1.25rem 0.5rem; flex-shrink: 0; display: flex; justify-content: center; align-items: center; width: 100%; box-sizing: border-box;">
              <button
                type="button"
                onClick={handleSave}
                disabled={!canSave.value}
                style={`
                  width: 75%;
                  padding: 0.8rem;
                  border: none;
                  border-radius: 0.6rem;
                  background: ${canSave.value ? '#2d3a1a' : '#6e7a55'};
                  color: #fff;
                  font-size: 1.05rem;
                  font-weight: 700;
                  cursor: ${canSave.value ? 'pointer' : 'not-allowed'};
                  transition: all 0.2s ease;
                  text-align: center;
                `}
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )
    }
  },
})
