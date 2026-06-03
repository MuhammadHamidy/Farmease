import { defineComponent, computed, ref, watch } from 'vue'
import type { PropType } from 'vue'
import PerkebunanListItemCard from './shared/PerkebunanListItemCard'
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
    const currentSectionLabel = computed(() => (
      step.value === 'jenis' ? 'Pilih Jenis Pencatatan' : 'Pilih Rincian Pencatatan'
    ))
    const currentPlaceholder = computed(() => (
      step.value === 'jenis' ? 'Cari jenis pencatatan' : 'Cari rincian pencatatan'
    ))
    const currentButtonLabel = computed(() => (step.value === 'jenis' ? 'Tambah Jenis' : 'Tambah Rincian'))
    
    // Can save if draft is valid
    const canSave = computed(() => {
      if (step.value === 'jenis') {
        return draftJenis.value !== 'Jenis Pencatatan'
      }
      return draftJenis.value !== 'Jenis Pencatatan' && draftRincian.value !== 'Rincian Pencatatan'
    })

    const handleSelect = (item: SelectionItem) => {
      if (step.value === 'jenis') {
        draftJenis.value = item.label
        draftRincian.value = 'Rincian Pencatatan'
        // Advance to rincian automatically as in normal UX, or keep selection and let user hit Simpan
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
        <div class="perkebunan-modal-backdrop" onClick={() => emit('close')}>
          <div class="perkebunan-record-modal" onClick={(event) => event.stopPropagation()} style="border-radius: 1rem; padding: 1.25rem;">
            
            {/* Close Button X */}
            <button
              class="perkebunan-modal-close"
              onClick={() => emit('close')}
              style="position: absolute; top: 0.75rem; left: 0.75rem; background: none; border: none; cursor: pointer; padding: 0.25rem; z-index: 10;"
            >
              <img src="/icon/close-cancel/black-24.svg" alt="Close" style="width: 1.25rem; height: 1.25rem;" />
            </button>

            {/* Gradient Header Box */}
            <div class="selection-gradient-header" style="position: relative;">
              <h2>{currentTitle.value}</h2>
              <div class="selection-search-pill-wrap">
                <img src="/icon/search.png" alt="Search" class="selection-search-icon" />
                <input
                  class="selection-search-pill"
                  type="text"
                  placeholder={currentPlaceholder.value}
                  value={searchQuery.value}
                  onInput={(event) => { searchQuery.value = (event.target as HTMLInputElement).value }}
                />
              </div>
            </div>

            {/* Selected Jenis Preview (for Rincian step, as in Image 3 right mockup) */}
            {step.value === 'rincian' && (
              <div class="selected-jenis-preview-box" style="margin-bottom: 1rem; border: 1.5px solid #cfd7bb; border-radius: 0.75rem; padding: 0.75rem; background: #fafcf2;">
                <div style="display: flex; align-items: center; gap: 0.75rem;">
                  <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.4rem; background: #ffffff; border: 1px solid #cfd7bb; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                    <img src={getJenisIcon(draftJenis.value)} alt="Icon" style="width: 1.3rem; height: 1.3rem;" />
                  </div>
                  <div>
                    <span style="font-size: 0.72rem; color: #6b7280; display: block;">Jenis Pencatatan</span>
                    <strong style="font-size: 1rem; color: #111827;">{draftJenis.value}</strong>
                  </div>
                </div>
              </div>
            )}

            {/* Add Button */}
            <div style="display: flex; justify-content: flex-end; margin-bottom: 0.75rem;">
              <button
                class="btn-primary"
                onClick={() => emit('add')}
                style="background: #38431f; font-size: 0.78rem; padding: 0.4rem 1rem; border-radius: 9999px; border: none; font-weight: bold; cursor: pointer;"
              >
                + {currentButtonLabel.value}
              </button>
            </div>

            {/* List Heading */}
            <div class="list-heading-row" style="margin-bottom: 0.75rem;">
              <span style="font-weight: 700; color: #111827; font-size: 1rem; display: block;">{currentSectionLabel.value}</span>
              {step.value === 'rincian' && (
                <span style="font-size: 0.75rem; color: #6b7280; display: block; margin-top: 0.15rem;">Maksimal pilih 1</span>
              )}
            </div>

            {/* Selection List */}
            <div class="perkebunan-modal-list" style="margin-bottom: 1.25rem; max-height: 180px; overflow-y: auto; padding-right: 0.25rem;">
              {filteredItems.value.map((item) => (
                <PerkebunanListItemCard
                  key={item.label}
                  title={item.label}
                  subtitle={item.sublabel ?? (step.value === 'jenis' ? 'Jenis Pencatatan' : 'Rincian Pencatatan')}
                  iconSrc={step.value === 'jenis' ? getJenisIcon(item.label) : getJenisIcon(draftJenis.value)}
                  selected={(step.value === 'jenis' ? draftJenis.value : draftRincian.value) === item.label}
                  showRadio={step.value === 'rincian'}
                  onClick={() => handleSelect(item)}
                />
              ))}

              {filteredItems.value.length === 0 && (
                <div style="text-align: center; color: #6b7280; padding: 1.5rem 0; font-size: 0.9rem;">
                  Tidak ada data ditemukan.
                </div>
              )}
            </div>

            {/* Bottom Simpan Button */}
            <button
              class={['btn-primary', !canSave.value ? 'disabled' : '']}
              onClick={handleSave}
              style="width: 100%; border-radius: 9999px; background: #38431f; font-weight: bold; cursor: pointer; padding: 0.65rem 1rem;"
              disabled={!canSave.value}
            >
              Simpan
            </button>

          </div>
        </div>
      )
    }
  },
})
