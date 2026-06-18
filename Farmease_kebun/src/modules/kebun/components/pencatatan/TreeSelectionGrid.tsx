import { defineComponent, type PropType } from 'vue'
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
    treeIcon: { type: String, default: '/icon/alpukat.png' },
    maxSelection: { type: Number, default: 0 },
  },
  emits: ['update:selectedCodes', 'update:selectedVarietas'],
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

    return () => (
      <div style="display:flex; flex-direction:column; gap:0.85rem;">
        <div class="form-group">
          <label class="pencatatan-form-label">Pilih Varietas</label>
          <PerkebunanFormSelect
            modelValue={props.selectedVarietas}
            options={props.varietasOptions}
            placeholder="Semua Varietas"
            onUpdate:modelValue={(val: string) => emit('update:selectedVarietas', val)}
          />
        </div>
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
