import { defineComponent, ref, watch, computed, type PropType, Teleport } from 'vue';
import '@/shared/assets/css/ui/admin/SelectionBottomSheet.css';

export interface SelectionOption {
  id: string | number;
  name: string;
  desc?: string;
  icon?: string;
}

export default defineComponent({
  name: 'SelectionBottomSheet',
  props: {
    show: { type: Boolean, required: true },
    title: { type: String, default: 'Pilih Item' },
    options: { type: Array as PropType<SelectionOption[]>, default: () => [] },
    // Single-select
    selectedId: { type: [String, Number] as PropType<string | number | null>, default: null },
    // Multi-select
    multiple: { type: Boolean, default: false },
    selectedIds: { type: Array as PropType<(string | number)[]>, default: () => [] },
    searchPlaceholder: { type: String, default: 'Cari...' },
    showAddButton: { type: Boolean, default: false },
    addButtonLabel: { type: String, default: 'Tambah Baru' },
    submitButtonLabel: { type: String, default: 'Simpan' }
  },
  emits: ['close', 'select', 'submit', 'add', 'update:selectedIds'],
  setup(props, { emit }) {
    const searchQuery = ref('');

    // Single select state
    const localSelectedId = ref<string | number | null>(props.selectedId);

    // Multi select state
    const localSelectedIds = ref<(string | number)[]>([...(props.selectedIds || [])]);

    // Sync single from parent
    watch(() => props.selectedId, (val) => { localSelectedId.value = val; });

    // Sync multi from parent
    watch(() => props.selectedIds, (val) => { localSelectedIds.value = [...(val || [])]; });

    // Reset search on open
    watch(() => props.show, (isOpen) => { if (!isOpen) searchQuery.value = ''; });

    const filteredOptions = computed(() => {
      if (!searchQuery.value) return props.options;
      const q = searchQuery.value.toLowerCase();
      return props.options.filter(o =>
        o.name.toLowerCase().includes(q) || (o.desc && o.desc.toLowerCase().includes(q))
      );
    });

    const isSelected = (id: string | number) => {
      if (props.multiple) return localSelectedIds.value.includes(id);
      return localSelectedId.value === id;
    };

    const handleSelect = (option: SelectionOption) => {
      if (props.multiple) {
        const idx = localSelectedIds.value.indexOf(option.id);
        if (idx >= 0) {
          localSelectedIds.value = localSelectedIds.value.filter(id => id !== option.id);
        } else {
          localSelectedIds.value = [...localSelectedIds.value, option.id];
        }
        emit('update:selectedIds', [...localSelectedIds.value]);
        emit('select', localSelectedIds.value.map(id => props.options.find(o => o.id === id)!));
      } else {
        localSelectedId.value = option.id;
        emit('select', option);
      }
    };

    const handleSubmit = () => {
      if (props.multiple) {
        const selected = localSelectedIds.value.map(id => props.options.find(o => o.id === id)!).filter(Boolean);
        emit('submit', selected);
      } else {
        if (localSelectedId.value !== null) {
          const selected = props.options.find(o => o.id === localSelectedId.value);
          emit('submit', selected);
        }
      }
    };

    const handleClose = () => {
      emit('close');
    };

    const canSubmit = computed(() => {
      if (props.multiple) return localSelectedIds.value.length > 0;
      return localSelectedId.value !== null;
    });

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
            {/* ── Drag Handle ────────────────────────────── */}
            <div class="selection-sheet-handle" />

            {/* ── Header ─────────────────────────────────── */}
            <header class="selection-sheet-header">
              <button class="selection-sheet-close" onClick={handleClose}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
              <h3 class="selection-sheet-title">{props.title}</h3>
            </header>

            {/* ── Search Bar ─────────────────────────────── */}
            <div class="selection-sheet-search-container">
              <span class="selection-sheet-search-icon">
                <img src="/icon/search.png" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
              </span>
              <input
                type="text"
                class="selection-sheet-search-input"
                placeholder={props.searchPlaceholder}
                v-model={searchQuery.value}
              />
            </div>

            {/* ── Add Button ────────────────────────────── */}
            {props.showAddButton && (
              <button class="selection-sheet-add-btn" onClick={() => emit('add')}>
                <img src="/icon/plus.png" style={{ width: '18px', height: '18px', objectFit: 'contain' }} />
                <span>{props.addButtonLabel}</span>
              </button>
            )}

            {/* ── Options List ───────────────────────────── */}
            <div class="selection-sheet-options-list">
              {filteredOptions.value.length > 0 ? (
                filteredOptions.value.map((opt) => (
                  <div
                    key={opt.id}
                    class={['selection-sheet-option-item', isSelected(opt.id) ? 'selected' : '']}
                    onClick={() => handleSelect(opt)}
                  >
                    <div class="selection-sheet-row-icon-box">
                      {opt.icon || '📋'}
                    </div>
                    <div class="selection-sheet-row-body">
                      <span class="selection-sheet-row-title">{opt.name}</span>
                      {opt.desc && <span class="selection-sheet-row-desc">{opt.desc}</span>}
                    </div>
                    {/* Checkbox for multi, Radio for single */}
                    {props.multiple ? (
                      <div class={['selection-sheet-checkbox', isSelected(opt.id) ? 'selected' : '']}>
                        {isSelected(opt.id) && (
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round">
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        )}
                      </div>
                    ) : (
                      <div class="selection-sheet-radio-circle">
                        <div class="selection-sheet-radio-inner" />
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div style="text-align: center; padding: 3rem; color: var(--color-on-surface-variant); font-size: 0.9rem; font-weight: 700;">
                  Tidak ada opsi yang sesuai
                </div>
              )}
            </div>

            {/* ── Submit Button ────────────────────────────── */}
            <div class="selection-sheet-submit-container">
              {props.multiple && localSelectedIds.value.length > 0 && (
                <div class="selection-sheet-selected-count">
                  {localSelectedIds.value.length} item dipilih
                </div>
              )}
              <button
                class="selection-sheet-submit-btn"
                onClick={handleSubmit}
                disabled={!canSubmit.value}
              >
                {props.submitButtonLabel}
              </button>
            </div>
          </div>
        </div>
      </Teleport>
    );
  }
});
