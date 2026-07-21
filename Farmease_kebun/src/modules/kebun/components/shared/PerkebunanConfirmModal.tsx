import { defineComponent, Teleport, type PropType } from 'vue';

export default defineComponent({
  name: 'PerkebunanConfirmModal',
  props: {
    isOpen: { type: Boolean, required: true },
    title: { type: String, default: 'Konfirmasi' },
    message: { type: String, required: true },
    confirmLabel: { type: String, default: 'Keluar' },
    cancelLabel: { type: String, default: 'Batal' },
  },
  emits: ['confirm', 'cancel'],
  setup(props, { emit }) {
    return () => {
      if (!props.isOpen) return null;

      return (
        <Teleport to="body">
          <div 
            class="perkebunan-modal-overlay animate-fade-in" 
            style={{ 
              zIndex: 99999, 
              display: 'flex',
              alignItems: 'center', 
              justifyContent: 'center',
              position: 'fixed',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              backgroundColor: 'rgba(0, 0, 0, 0.45)',
              backdropFilter: 'blur(5px)',
              transition: 'all 0.3s ease'
            }} 
            onClick={() => emit('cancel')}
          >
            <div 
              class="perkebunan-modal" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                width: '92%',
                maxWidth: '400px', 
                backgroundColor: '#ffffff', 
                borderRadius: '24px', 
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                padding: '2.25rem 1.75rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: '"Nunito", "Segoe UI", sans-serif',
                border: '1px solid #e5e7eb',
                animation: 'scaleUp 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)'
              }}
            >
              <div class="text-center">
                {/* Warning Logout Icon Container */}
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '68px', 
                  height: '68px', 
                  borderRadius: '20px',
                  marginBottom: '1.25rem',
                  background: 'linear-gradient(135deg, #F0FDF4 0%, #DCFCE7 100%)',
                  border: '1.5px solid #86EFAC'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16A34A" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </div>
                
                <h4 style={{ 
                  fontWeight: '800', 
                  marginBottom: '0.75rem', 
                  fontSize: '1.35rem', 
                  color: '#111827', 
                  letterSpacing: '-0.02em',
                }}>
                  {props.title}
                </h4>
                
                <p style={{ 
                  color: '#4B5563', 
                  marginBottom: '1.85rem', 
                  whiteSpace: 'pre-line', 
                  fontSize: '0.92rem', 
                  lineHeight: '1.6',
                  fontWeight: '500'
                }}>
                  {props.message}
                </p>

                {/* Actions Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.85rem' }}>
                  <button 
                    type="button"
                    style={{ 
                      padding: '0.85rem 1.5rem', 
                      borderRadius: '50rem', 
                      background: '#F3F4F6', 
                      color: '#1F2937', 
                      border: '1px solid #E5E7EB', 
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
                    }} 
                    onClick={() => emit('cancel')}
                  >
                    {props.cancelLabel}
                  </button>
                  <button 
                    type="button"
                    style={{ 
                      padding: '0.85rem 1.5rem', 
                      borderRadius: '50rem', 
                      background: '#38431f', 
                      color: '#ffffff', 
                      border: 'none', 
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(56, 67, 31, 0.25)'
                    }} 
                    onClick={() => emit('confirm')}
                  >
                    {props.confirmLabel}
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
