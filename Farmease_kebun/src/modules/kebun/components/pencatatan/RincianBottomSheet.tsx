import { defineComponent, type PropType } from 'vue'
import { Teleport } from 'vue'

export default defineComponent({
  name: 'RincianBottomSheet',
  props: {
    show: { type: Boolean, required: true },
    jenisLabel: { type: String, required: true },
    options: { type: Array as PropType<string[]>, default: () => [] },
    selected: { type: String, default: '' },
    search: { type: String, default: '' },
  },
  emits: ['close', 'save', 'update:selected', 'update:search'],
  setup(props, { emit }) {
    return () => {
      if (!props.show) return null

      return (
        <Teleport to="body">
          <div
            class="rincian-sheet-overlay"
            onClick={(e: MouseEvent) => { if (e.target === e.currentTarget) emit('close') }}
          >
            <div class="rincian-sheet" onClick={(e: MouseEvent) => e.stopPropagation()}>
              <div style="display:flex; justify-content:space-between; align-items:center; padding:0.85rem 1rem 0;">
                <button
                  type="button"
                  onClick={() => emit('close')}
                  style="background:none; border:none; font-size:1.4rem; color:#374151; cursor:pointer; line-height:1; padding:0.1rem 0.3rem;"
                >
                  ×
                </button>
              </div>

              <div style="background:#38431f; margin:0.5rem 0.85rem; border-radius:0.85rem; padding:1rem 1.1rem;">
                <h3 style="margin:0 0 0.7rem; color:#fff; font-size:1.1rem; font-weight:800; text-align:center;">Rincian Pencatatan</h3>
                <div style="position:relative; margin-bottom:0.65rem;">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.7)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="position:absolute; left:0.75rem; top:50%; transform:translateY(-50%); pointer-events:none;">
                    <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                  <input
                    type="text"
                    placeholder="Cari rincian pencatatan"
                    value={props.search}
                    onInput={(e: Event) => emit('update:search', (e.target as HTMLInputElement).value)}
                    style="width:100%; padding:0.6rem 0.75rem 0.6rem 2.25rem; border-radius:9999px; border:none; background:rgba(255,255,255,0.15); color:#fff; font-size:0.85rem; font-weight:600; outline:none; box-sizing:border-box;"
                  />
                </div>
                <div style="background:#fff; border-radius:0.55rem; overflow:hidden;">
                  <div style="padding:0.4rem 0.75rem; font-size:0.77rem; font-weight:800; color:#374151; border-bottom:1px solid #f3f4f6;">
                    Rincian Pencatatan
                  </div>
                  <div style="display:flex; align-items:center; gap:0.6rem; padding:0.65rem 0.75rem;">
                    <div style="width:2rem; height:2rem; background:#f6f8ee; border-radius:0.4rem; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#38431f" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                      </svg>
                    </div>
                    <div>
                      <div style="font-size:0.72rem; color:#9ca3af; font-weight:600;">Jenis Pencatatan</div>
                      <div style="font-size:0.92rem; font-weight:800; color:#1f2937;">{props.jenisLabel}</div>
                    </div>
                  </div>
                </div>
              </div>

              <div style="padding:0 0.85rem; flex:1; overflow-y:auto;">
                {props.jenisLabel !== 'Panen' && (
                  <div style="display: flex; justify-content: flex-end; margin-top: 0.75rem; margin-bottom: 0.5rem;">
                    <button
                      type="button"
                      onClick={() => alert('Fitur tambah rincian baru hanya dapat diakses oleh Admin Utama.')}
                      style="
                        display: inline-flex;
                        align-items: center;
                        gap: 0.4rem;
                        background: #38431f;
                        color: #fff;
                        border: none;
                        border-radius: 0.5rem;
                        padding: 0.5rem 1rem;
                        font-size: 0.85rem;
                        font-weight: 700;
                        cursor: pointer;
                        transition: all 0.18s ease;
                      "
                    >
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
                      </svg>
                      Tambah Rincian
                    </button>
                  </div>
                )}
                <div style="margin-bottom:0.35rem;">
                  <h4 style="font-size:0.92rem; font-weight:800; color:#1f2937; margin:0 0 0.1rem;">Pilih Rincian Pencatatan</h4>
                  <p style="font-size:0.75rem; color:#9ca3af; margin:0;">Maksimal pilih 1</p>
                </div>
                <div style="display:flex; flex-direction:column; gap:0.55rem; padding:0.65rem 0;">
                  {props.options.length === 0 ? (
                    <p style="text-align:center; color:#9ca3af; font-size:0.85rem; padding:1rem 0;">
                      {props.search ? 'Tidak ditemukan' : 'Tidak ada rincian tersedia'}
                    </p>
                  ) : props.options.map(opt => (
                    <div
                      key={opt}
                      onClick={() => emit('update:selected', opt)}
                      style="display:flex; align-items:center; justify-content:space-between; padding:0.85rem 1rem; border:1.5px solid #e5e7eb; border-radius:0.75rem; cursor:pointer; background:#fff;"
                    >
                      <div>
                        <div style="font-size:0.92rem; font-weight:800; color:#1f2937;">{opt}</div>
                        <div style="font-size:0.72rem; color:#9ca3af; font-weight:600;">Rincian Pencatatan</div>
                      </div>
                      <div style={`width:1.25rem; height:1.25rem; border-radius:50%; border:2px solid ${props.selected === opt ? '#38431f' : '#d1d5db'}; background:${props.selected === opt ? '#38431f' : 'transparent'}; flex-shrink:0;`} />
                    </div>
                  ))}
                </div>
              </div>

              <div style="padding:0.85rem; border-top:1px solid #f3f4f6;">
                <button type="button" class="pencatatan-primary-btn" onClick={() => emit('save')}>
                  Simpan
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      )
    }
  },
})
