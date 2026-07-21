import { defineComponent, type PropType } from 'vue'
import { Teleport } from 'vue'

export default defineComponent({
  name: 'JenisBottomSheet',
  props: {
    show: { type: Boolean, required: true },
    options: { type: Array as PropType<string[]>, default: () => [] },
    selected: { type: String, default: '' },
    search: { type: String, default: '' },
  },
  emits: ['close', 'save', 'update:selected', 'update:search'],
  setup(props, { emit }) {
    return () => {
      if (!props.show) return null

      const filtered = props.search
        ? props.options.filter(o => o.toLowerCase().includes(props.search.toLowerCase()))
        : props.options

      return (
        <Teleport to="body">
          <div
            class="rincian-sheet-overlay"
            onClick={(e: MouseEvent) => { if (e.target === e.currentTarget) emit('close') }}
          >
            <div
              class="rincian-sheet"
              onClick={(e: MouseEvent) => e.stopPropagation()}
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
              {/* Close button */}
              <div style="padding: 1rem 1.25rem 0.5rem; display: flex; justify-content: flex-start; flex-shrink: 0; width: 100%; box-sizing: border-box;">
                <button
                  type="button"
                  onClick={() => emit('close')}
                  style="background:none; border:none; cursor:pointer; padding:0.25rem; display:flex; align-items:center; justify-content:center;"
                >
                  <img src="/icon/close-cancel/black-24.svg" alt="Tutup" style="width: 24px; height: 24px; object-fit: contain;" />
                </button>
              </div>

              {/* Dark green header with search */}
              <div style="background:#38431f; margin:0 1.25rem; border-radius:1.25rem; padding:1.25rem 1rem; box-sizing:border-box;">
                <h3 style="margin:0 0 0.85rem; color:#fff; font-size:1.35rem; font-weight:800; text-align:center; letter-spacing: -0.01em;">Jenis Pencatatan</h3>
                <div style="position:relative; width: 100%;">
                  <svg
                    style="position: absolute; left: 0.85rem; top: 50%; transform: translateY(-50%); opacity: 0.75; pointer-events: none;"
                    width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1f2937" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"
                  >
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari jenis pencatatan"
                    value={props.search}
                    onInput={(e: Event) => emit('update:search', (e.target as HTMLInputElement).value)}
                    style="width:100%; padding:0.6rem 0.9rem 0.6rem 2.35rem; border-radius:0.5rem; border:none; background:#ffffff; color:#1f2937; font-size:0.9rem; outline:none; box-sizing:border-box;"
                  />
                </div>
              </div>

              {/* List */}
              <div style="padding:1rem 1.25rem; flex:1; overflow-y:auto; display:flex; flex-direction:column; gap:1rem; width:100%; box-sizing:border-box;">
                <div style="text-align:left;">
                  <span style="font-weight: 800; color: #111827; font-size: 1.1rem; display: block;">Pilih Jenis Pencatatan</span>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.75rem; width:100%;">
                  {filtered.length === 0 ? (
                    <p style="text-align:center; color:#9ca3af; font-size:0.85rem; padding:1rem 0;">
                      {props.search ? 'Tidak ditemukan' : 'Tidak ada jenis tersedia'}
                    </p>
                  ) : filtered.map(opt => (
                    <div
                      key={opt}
                      onClick={() => emit('update:selected', opt)}
                      style={`display:flex; align-items:center; gap:0.75rem; padding:1rem 1.15rem; border:1.5px solid ${props.selected === opt ? '#38431f' : '#e5e7eb'}; border-radius:0.75rem; cursor:pointer; background:${props.selected === opt ? '#f6f8ee' : '#fff'}; transition:all 0.15s; box-sizing:border-box; width:100%;`}
                    >
                      {/* Document icon */}
                      <div style="width: 2.2rem; height: 2.2rem; border-radius: 0.45rem; background: #f4f5f0; border: 1.5px solid #dce1d0; display: flex; align-items: center; justify-content: center; flex-shrink: 0;">
                        <img src="/icon/document.png" alt="" style="width:16px; height:16px; object-fit:contain;" />
                      </div>
                      <div style="flex:1; min-width:0; text-align:left; display:flex; flex-direction:column; gap:0.15rem;">
                        <strong style="font-size:1.15rem; color:#111827; font-weight:800; line-height:1.2;">{opt}</strong>
                        <span style="font-size:0.8rem; color:#6b7280; font-weight:600;">Jenis Pencatatan</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </Teleport>
      )
    }
  },
})
