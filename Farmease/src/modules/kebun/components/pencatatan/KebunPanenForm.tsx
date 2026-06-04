import { defineComponent, ref, computed, onMounted, onUnmounted, type PropType } from 'vue'

export default defineComponent({
  name: 'KebunPanenForm',
  props: {
    form: { type: Object as PropType<any>, required: true },
    activeMode: { type: String as PropType<'lahan' | 'pohon'>, required: true },
  },
  emits: ['update:activeMode', 'save'],
  setup(props, { emit }) {
    const selectedVarietas = ref('Semua Varietas')
    const selectedTrees = ref<string[]>(['LA001'])
    const hoveredTree = ref<string | null>(null)
    const isVarietasDropdownOpen = ref(false)

    const trees = [
      { code: 'LA001', varietas: 'Alpukat Aligator' },
      { code: 'LA002', varietas: 'Alpukat Aligator' },
      { code: 'LA003', varietas: 'Alpukat Aligator' },
      { code: 'LA004', varietas: 'Alpukat Aligator' },
      { code: 'LA005', varietas: 'Alpukat Aligator' },
      { code: 'LA006', varietas: 'Alpukat Miki' },
      { code: 'LA007', varietas: 'Alpukat Miki' },
      { code: 'LA008', varietas: 'Alpukat Miki' },
      { code: 'LA009', varietas: 'Alpukat Miki' },
      { code: 'LA010', varietas: 'Alpukat Miki' },
      { code: 'LA011', varietas: 'Alpukat Markus' },
      { code: 'LA012', varietas: 'Alpukat Markus' },
      { code: 'LA013', varietas: 'Alpukat Markus' },
      { code: 'LA014', varietas: 'Alpukat Kelud' },
      { code: 'LA015', varietas: 'Alpukat Kelud' },
    ]

    const varietasOptions = [
      'Semua Varietas',
      'Alpukat Aligator',
      'Alpukat Miki',
      'Alpukat Markus',
      'Alpukat Kelud',
    ]

    const filteredTrees = computed(() => {
      if (selectedVarietas.value === 'Semua Varietas') return trees
      return trees.filter(tree => tree.varietas === selectedVarietas.value)
    })

    const toggleTreeSelection = (code: string) => {
      if (selectedTrees.value.includes(code)) {
        selectedTrees.value = selectedTrees.value.filter(c => c !== code)
      } else {
        selectedTrees.value.push(code)
      }
      props.form.kodePohon = selectedTrees.value.join(', ')
    }

    const handleDocumentClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.custom-dropdown-container')) {
        isVarietasDropdownOpen.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('click', handleDocumentClick)
      // Initialize formState value with initial selected tree
      props.form.kodePohon = selectedTrees.value.join(', ')
    })

    onUnmounted(() => {
      document.removeEventListener('click', handleDocumentClick)
    })

    return () => (
      <div style="display: flex; flex-direction: column; gap: 1rem; width: 100%;">
        {/* Pilih Kategori Pencatatan (Segmented Toggle) */}
        <div style="margin-top: 0.5rem; margin-bottom: 0.5rem;">
          <span style="font-weight: 800; color: #111827; font-size: 1.1rem; display: block; margin-bottom: 0.55rem;">
            Pilih Kategori Pencatatan
          </span>
          <div style="display: inline-flex; background: #ffffff; padding: 0.25rem; border-radius: 9999px; border: 1.5px solid #dce1d0; gap: 0.25rem; box-shadow: 0 2px 6px rgba(0,0,0,0.02);">
            <button
              type="button"
              onClick={() => { emit('update:activeMode', 'pohon') }}
              style={`
                display: flex;
                align-items: center;
                padding: 0.45rem 1rem;
                border: none;
                border-radius: 9999px;
                font-size: 0.85rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
                background: ${props.activeMode === 'pohon' ? '#2d3a1a' : 'transparent'};
                color: ${props.activeMode === 'pohon' ? '#ffffff' : '#6b7280'};
              `}
            >
              <span style="margin-right: 0.35rem; display: inline-flex; align-items: center; font-size: 0.88rem;">🌳</span>
              Per Pohon
            </button>
            <button
              type="button"
              onClick={() => { emit('update:activeMode', 'lahan') }}
              style={`
                display: flex;
                align-items: center;
                padding: 0.45rem 1rem;
                border: none;
                border-radius: 9999px;
                font-size: 0.85rem;
                font-weight: 800;
                cursor: pointer;
                transition: all 0.2s ease;
                background: ${props.activeMode === 'lahan' ? '#2d3a1a' : 'transparent'};
                color: ${props.activeMode === 'lahan' ? '#ffffff' : '#6b7280'};
              `}
            >
              <span style="margin-right: 0.35rem; display: inline-flex; align-items: center; font-size: 0.88rem;">🍃</span>
              Per Lahan
            </button>
          </div>
        </div>

        {/* Formulir Pencatatan Perkebunan Card */}
        <div style="background: #ffffff; border: 1.5px solid #dce1d0; border-radius: 0.85rem; overflow: hidden; box-shadow: 0 10px 24px rgba(40,54,24,0.04); margin-bottom: 2rem;">
          <div style="background: #2d3a1a; padding: 0.85rem; text-align: center;">
            <h4 style="margin: 0; font-size: 1.25rem; font-weight: 800; color: #ffffff;">
              Formulir Pencatatan Perkebunan
            </h4>
          </div>
          
          <div style="padding: 1.25rem; display: flex; flex-direction: column; gap: 1.15rem;">
            {props.activeMode === 'pohon' ? (
              <>
                {/* Varietas Dropdown */}
                <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                  <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">Pilih Varietas</label>
                  <div class="custom-dropdown-container">
                    <div
                      class="custom-dropdown-trigger"
                      onClick={() => { isVarietasDropdownOpen.value = !isVarietasDropdownOpen.value }}
                    >
                      <span>{selectedVarietas.value}</span>
                      <img
                        src="/icon/caret-down/black-12.svg"
                        alt="Caret"
                        style={`width: 10px; height: 10px; transition: transform 0.2s ease; transform: ${isVarietasDropdownOpen.value ? 'rotate(180deg)' : 'rotate(0)'};`}
                      />
                    </div>
                    {isVarietasDropdownOpen.value && (
                      <ul class="custom-dropdown-menu">
                        {varietasOptions.map((option) => (
                          <li
                            key={option}
                            class={`custom-dropdown-item ${selectedVarietas.value === option ? 'selected' : ''}`}
                            onClick={() => {
                              selectedVarietas.value = option
                              isVarietasDropdownOpen.value = false
                            }}
                          >
                            {option}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>

                {/* Tree Cards Grid */}
                <div style="display: flex; flex-direction: column; gap: 0.45rem;">
                  <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">Pilih Pohon</label>
                  <div
                    style="
                      display: grid;
                      grid-template-columns: repeat(5, 1fr);
                      gap: 0.65rem;
                      max-height: 380px;
                      overflow-y: auto;
                      padding: 0.25rem;
                    "
                  >
                    {filteredTrees.value.map((tree) => {
                      const isSelected = selectedTrees.value.includes(tree.code)
                      const isHovered = hoveredTree.value === tree.code
                      const isActiveOrHovered = isSelected || isHovered
                      return (
                        <div
                          key={tree.code}
                          onClick={() => toggleTreeSelection(tree.code)}
                          onMouseenter={() => {
                            hoveredTree.value = tree.code
                          }}
                          onMouseleave={() => {
                            hoveredTree.value = null
                          }}
                          style={`
                            border: 2px solid ${isActiveOrHovered ? '#787f56' : '#dce1d0'};
                            background: ${isActiveOrHovered ? '#787f56' : '#ffffff'};
                            border-radius: 0.6rem;
                            padding: 0.75rem 0.5rem;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 0.25rem;
                            cursor: pointer;
                            text-align: center;
                            transition: all 0.18s ease;
                            transform: ${isHovered ? 'translateY(-2px)' : 'translateY(0)'};
                            box-shadow: ${isActiveOrHovered ? '0 8px 20px rgba(120, 127, 86, 0.2)' : 'none'};
                          `}
                        >
                          <img src="/icon/alpukat.png" alt="pohon" style="width: 1.5rem; height: 1.5rem; object-fit: contain;" />
                          <span
                            style={`
                              font-size: 0.85rem;
                              font-weight: 800;
                              color: ${isActiveOrHovered ? '#ffffff' : '#111827'};
                              transition: color 0.18s ease;
                            `}
                          >
                            {tree.code}
                          </span>
                          <span
                            style={`
                              font-size: 0.62rem;
                              color: ${isActiveOrHovered ? 'rgba(255, 255, 255, 0.85)' : '#6b7280'};
                              font-weight: 700;
                              white-space: nowrap;
                              overflow: hidden;
                              text-overflow: ellipsis;
                              width: 100%;
                              transition: color 0.18s ease;
                            `}
                          >
                            {tree.varietas}
                          </span>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </>
            ) : (
              <div style="background: #f4f5ee; border: 1.5px dashed #787f56; padding: 1.25rem; border-radius: 0.6rem; text-align: center; color: #2d3a1a; font-size: 0.95rem; font-weight: 700;">
                Pencatatan panen berlaku untuk seluruh area lahan
              </div>
            )}

            {/* Total Buah (Butir) Input */}
            <div style="display: flex; flex-direction: column; gap: 0.45rem;">
              <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">
                Total Buah (Butir)
              </label>
              <input
                type="text"
                value={props.form.jumlahPanen}
                onInput={(e) => { props.form.jumlahPanen = (e.target as HTMLInputElement).value }}
                placeholder="Contoh: 15"
                style="
                  width: 100%;
                  border: 1.5px solid #cfd7bb;
                  border-radius: 0.5rem;
                  background: #ffffff;
                  color: #1f2937;
                  padding: 0.65rem 0.85rem;
                  font-size: 0.9rem;
                  font-weight: 600;
                  outline: none;
                  box-sizing: border-box;
                "
              />
            </div>

            {/* Total Berat Buah (Kg) Input */}
            <div style="display: flex; flex-direction: column; gap: 0.45rem;">
              <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">
                Total Berat Buah (Kg)
              </label>
              <input
                type="text"
                value={props.form.beratPanen}
                onInput={(e) => { props.form.beratPanen = (e.target as HTMLInputElement).value }}
                placeholder="Contoh: 5"
                style="
                  width: 100%;
                  border: 1.5px solid #cfd7bb;
                  border-radius: 0.5rem;
                  background: #ffffff;
                  color: #1f2937;
                  padding: 0.65rem 0.85rem;
                  font-size: 0.9rem;
                  font-weight: 600;
                  outline: none;
                  box-sizing: border-box;
                "
              />
            </div>

            {/* Catatan (Opsional) */}
            <div style="display: flex; flex-direction: column; gap: 0.45rem;">
              <label style="font-weight: 800; color: #111827; font-size: 1.05rem;">Catatan (Opsional)</label>
              <textarea
                value={props.form.deskripsiPanen}
                onInput={(e) => { props.form.deskripsiPanen = (e.target as HTMLTextAreaElement).value }}
                placeholder="Masukkan deskripsi"
                style="
                  width: 100%;
                  border: 1.5px solid #cfd7bb;
                  border-radius: 0.5rem;
                  background: #ffffff;
                  color: #1f2937;
                  padding: 0.65rem 0.85rem;
                  font-size: 0.9rem;
                  font-weight: 600;
                  outline: none;
                  min-height: 80px;
                  resize: vertical;
                  box-sizing: border-box;
                  font-family: inherit;
                "
              />
            </div>

            {/* Simpan Button */}
            <button
              onClick={() => emit('save')}
              style="
                width: 100%;
                background: #2d3a1a;
                color: #ffffff;
                border: none;
                border-radius: 0.5rem;
                padding: 0.75rem;
                font-weight: 800;
                font-size: 1.05rem;
                cursor: pointer;
                text-align: center;
                transition: all 0.2s ease;
                margin-top: 0.5rem;
                box-shadow: 0 4px 12px rgba(45, 58, 26, 0.15);
              "
              onMouseover={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                if (target) {
                  target.style.background = '#1f2912';
                  target.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseout={(e) => {
                const target = e.currentTarget as HTMLButtonElement;
                if (target) {
                  target.style.background = '#2d3a1a';
                  target.style.transform = 'translateY(0)';
                }
              }}
            >
              Simpan
            </button>
          </div>
        </div>
      </div>
    )
  }
})
