import { defineComponent, type PropType, computed } from 'vue'
import PerkebunanFormSelect from '../shared/PerkebunanFormSelect'
import TreeCard from './TreeCard'

export interface TreeItem {
  code: string
  varietas: string
  fase?: string
}

export default defineComponent({
  name: 'TreeSelectionGrid',
  props: {
    trees: { type: Array as PropType<TreeItem[]>, required: true },
    selectedCodes: { type: Array as PropType<string[]>, required: true },
    varietasOptions: { type: Array as PropType<string[]>, default: () => ['Semua Varietas'] },
    selectedVarietas: { type: String, default: 'Semua Varietas' },
    fasePohon: { type: String, default: 'Vegetatif' },
    statusProduktivitas: { type: String, default: 'usia produktif (> 4 tahun)' },
    treeIcon: { type: String, default: '/icon/alpukat.png' },
    maxSelection: { type: Number, default: 0 },
    kindTitle: { type: String, default: '' },
  },
  emits: ['update:selectedCodes', 'update:selectedVarietas', 'update:fasePohon', 'update:statusProduktivitas'],
  setup(props, { emit }) {
    const toggleTree = (code: string) => {
      if (props.maxSelection === 1) {
        emit('update:selectedCodes', [code])
        return
      }
      const next = props.selectedCodes.includes(code)
        ? props.selectedCodes.filter(c => c !== code)
        : [...props.selectedCodes, code]
      emit('update:selectedCodes', next)
    }

    const showDropdowns = computed(() => {
      const k = (props.kindTitle || '').toLowerCase()
      return !k.includes('stok') && !k.includes('pengolahan')
    })

    const statusOptions = computed(() => {
      const k = (props.kindTitle || '').toLowerCase()
      if (k.includes('panen') || k.includes('pembuahan')) {
        return ['usia produktif (> 4 tahun)']
      }
      if (k.includes('penanaman')) {
        return ['usia belum produktif (0 - 3 tahun)']
      }
      return ['usia belum produktif (0 - 3 tahun)', 'usia produktif (> 4 tahun)']
    })

    const statusDisabled = computed(() => {
      const k = (props.kindTitle || '').toLowerCase()
      return k.includes('panen') || k.includes('pembuahan') || k.includes('penanaman')
    })

    const showFase = computed(() => {
      return props.statusProduktivitas === 'usia produktif (> 4 tahun)'
    })

    const faseOptions = computed(() => {
      const k = (props.kindTitle || '').toLowerCase()
      if (k.includes('panen') || k.includes('pembuahan')) {
        return ['Generatif']
      }
      return ['Vegetatif', 'Generatif']
    })

    const faseDisabled = computed(() => {
      const k = (props.kindTitle || '').toLowerCase()
      return k.includes('panen') || k.includes('pembuahan')
    })

    return () => (
      <div style="display:flex; flex-direction:column; gap:0.85rem;">
        <div class="form-group">
          <label class="pencatatan-form-label">Varietas</label>
          <PerkebunanFormSelect
            modelValue={props.selectedVarietas}
            options={props.varietasOptions}
            placeholder="Semua Varietas"
            onUpdate:modelValue={(val: string) => emit('update:selectedVarietas', val)}
          />
        </div>

        {showDropdowns.value && (
          <>
            <div class="form-group">
              <label class="pencatatan-form-label">Status Usia Pohon</label>
              <PerkebunanFormSelect
                modelValue={props.statusProduktivitas}
                options={statusOptions.value}
                placeholder="Pilih Status"
                disabled={statusDisabled.value}
                onUpdate:modelValue={(val: string) => {
                  emit('update:statusProduktivitas', val)
                  if (val === 'usia belum produktif (0 - 3 tahun)') {
                    emit('update:fasePohon', 'Belum Produktif')
                  } else {
                    emit('update:fasePohon', 'Vegetatif')
                  }
                }}
              />
            </div>

            {showFase.value && (
              <div class="form-group">
                <label class="pencatatan-form-label">Fase Pohon</label>
                <PerkebunanFormSelect
                  modelValue={props.fasePohon}
                  options={faseOptions.value}
                  placeholder="Pilih Fase"
                  disabled={faseDisabled.value}
                  onUpdate:modelValue={(val: string) => emit('update:fasePohon', val)}
                />
              </div>
            )}
          </>
        )}

        <div class="form-group">
          <label class="pencatatan-form-label">
            {props.maxSelection === 1 ? 'Pilih Pohon (maksimal 1)' : 'Pilih Pohon'}
          </label>
          <div class="pencatatan-tree-grid">
            {props.trees.map(tree => (
              <TreeCard
                key={tree.code}
                code={tree.code}
                varietas={tree.varietas}
                selected={props.selectedCodes.includes(tree.code)}
                icon={props.treeIcon}
                onClick={() => toggleTree(tree.code)}
              />
            ))}
          </div>
        </div>
      </div>
    )
  },
})
