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
          style="align-items: flex-start; padding-top: 0; overflow-y: auto;"
        >
          <div
            class="perkebunan-record-modal"
            onClick={(e) => e.stopPropagation()}
            style="
              position: relative;
              width: min(100%, 400px);
              border-radius: 1rem;
              padding: 0;
              overflow: hidden;
              background: #ffffff;
              max-height: 100vh;
              display: flex;
              flex-direction: column;
            "
          >
            {/* ── Close Button ── */}
            <button
              onClick={() => emit('close')}
              style="
                position: absolute;
                top: 0.85rem;
                left: 0.85rem;
                background: none;
                border: none;
                cursor: pointer;
                padding: 0.25rem;
                z-index: 20;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0.85;
              "
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"/>
                <line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>

            {/* ── Dark Green Header ── */}
            <div style="background: linear-gradient(160deg, #38431f 0%, #2d3a1a 100%); padding: 1.5rem 1.25rem 1.25rem; flex-shrink: 0;">
              {/* Title */}
              <h2 style="text-align: center; font-size: 1.35rem; font-weight: 800; color: #fff; margin: 0 0 1rem; letter-spacing: -0.01em;">
                {currentTitle.value}
              </h2>

              {/* Search pill */}
              <div style="position: relative; margin-bottom: 1rem;">
                <svg
                  style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); opacity: 0.55; pointer-events: none;"
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

              {/* Selected Jenis Preview Card (in rincian step) */}
              {step.value === 'rincian' && draftJenis.value !== 'Jenis Pencatatan' && (
                <div style="background: #ffffff; border-radius: 0.65rem; padding: 0.65rem 0.85rem;">
                  <div style="font-size: 0.72rem; font-weight: 700; color: #38431f; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Rincian Pencatatan
                  </div>
                  <div
                    onClick={() => { step.value = 'jenis' }}
                    style="display: flex; align-items: center; gap: 0.75rem; border: 1.5px solid #dce1d0; border-radius: 0.5rem; padding: 0.6rem 0.75rem; background: #fff; cursor: pointer;"
                  >
                    <div style="width: 2rem; height: 2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img src={getJenisIcon(draftJenis.value)} alt="" style="width: 1.25rem; height: 1.25rem; object-fit: contain;" />
                    </div>
                    <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                      <span style="font-size: 0.7rem; color: #6b7280;">Jenis Pencatatan</span>
                      <strong style="font-size: 0.95rem; color: #111827; font-weight: 800;">
                        {draftJenis.value.replace(/^Pencatatan\s+/u, '')}
                      </strong>
                    </div>
                  </div>
                </div>
              )}

              {/* Selected Jenis Preview (jenis step) */}
              {step.value === 'jenis' && draftJenis.value !== 'Jenis Pencatatan' && (
                <div style="background: #ffffff; border-radius: 0.65rem; padding: 0.65rem 0.85rem;">
                  <div style="font-size: 0.72rem; font-weight: 700; color: #38431f; margin-bottom: 0.4rem; text-transform: uppercase; letter-spacing: 0.05em;">
                    Jenis Pencatatan
                  </div>
                  <div style="display: flex; align-items: center; gap: 0.75rem; border: 1.5px solid #dce1d0; border-radius: 0.5rem; padding: 0.6rem 0.75rem; background: #fff;">
                    <div style="width: 2rem; height: 2rem; border-radius: 0.4rem; background: #f4f5f0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                      <img src={getJenisIcon(draftJenis.value)} alt="" style="width: 1.25rem; height: 1.25rem; object-fit: contain;" />
                    </div>
                    <div>
                      <strong style="font-size: 0.95rem; color: #111827; font-weight: 800;">
                        {draftJenis.value.replace(/^Pencatatan\s+/u, '')}
                      </strong>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ── Scrollable Body ── */}
            <div style="padding: 1rem 1.25rem; overflow-y: auto; flex: 1;">

              {/* Tambah Button */}
              <div style="display: flex; justify-content: flex-end; margin-bottom: 1rem;">
                <button
                  onClick={() => emit('add')}
                  style="
                    display: inline-flex;
                    align-items: center;
                    gap: 0.4rem;
                    background: #38431f;
                    color: #fff;
                    border: none;
                    border-radius: 9999px;
                    padding: 0.48rem 1.1rem;
                    font-size: 0.82rem;
                    font-weight: 700;
                    cursor: pointer;
                    transition: all 0.18s ease;
                  "
                >
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                  {currentButtonLabel.value}
                </button>
              </div>

              {/* Section Heading */}
              <div style="margin-bottom: 0.55rem;">
                <span style="font-weight: 800; color: #111827; font-size: 1rem; display: block;">
                  {currentSectionLabel.value}
                </span>
                {step.value === 'rincian' && (
                  <span style="font-size: 0.75rem; color: #6b7280; display: block; margin-top: 0.15rem;">
                    Maksimal pilih 1
                  </span>
                )}
              </div>

              {/* Radio Item List */}
              <div style="display: flex; flex-direction: column; gap: 0.55rem; margin-bottom: 1rem;">
                {filteredItems.value.map((item) => {
                  const isSelected =
                    step.value === 'jenis'
                      ? draftJenis.value === item.label
                      : draftRincian.value === item.label

                  return (
                    <button
                      key={item.label}
                      onClick={() => handleSelect(item)}
                      class={['perkebunan-modal-item', isSelected ? 'selected' : '']}
                      style={{
                        justifyContent: step.value === 'jenis' ? 'flex-start' : 'space-between'
                      }}
                    >
                      <div style="display: flex; align-items: center; gap: 0.75rem;">
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
                        <div style="display: flex; flex-direction: column; gap: 0.1rem;">
                          <strong style="font-size: 0.95rem; color: #111827; font-weight: 800; line-height: 1.25;">
                            {item.label.replace(/^Pencatatan\s+/u, '')}
                          </strong>
                          <span style="font-size: 0.75rem; color: #6b7280;">
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
                          background: #fff;
                          display: flex;
                          align-items: center;
                          justify-content: center;
                          flex-shrink: 0;
                          margin-left: 0.75rem;
                        `}>
                          {isSelected && (
                            <div style="width: 0.6rem; height: 0.6rem; border-radius: 50%; background: #38431f;" />
                          )}
                        </div>
                      )}
                    </button>
                  )
                })}

                {filteredItems.value.length === 0 && (
                  <div style="text-align: center; color: #9ca3af; padding: 1.5rem 0; font-size: 0.88rem;">
                    Tidak ada data ditemukan.
                  </div>
                )}
              </div>
            </div>

            {/* ── Simpan Button ── */}
            <div style="padding: 0.85rem 1.25rem 1.25rem; flex-shrink: 0; border-top: 1px solid #f0f0eb;">
              <button
                onClick={handleSave}
                disabled={!canSave.value}
                style={`
                  width: 100%;
                  padding: 0.78rem;
                  border: none;
                  border-radius: 0.6rem;
                  background: ${canSave.value ? '#38431f' : '#9ca3af'};
                  color: #fff;
                  font-size: 0.95rem;
                  font-weight: 700;
                  cursor: ${canSave.value ? 'pointer' : 'not-allowed'};
                  transition: all 0.2s ease;
                  letter-spacing: 0.01em;
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
