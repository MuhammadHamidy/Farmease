import { defineComponent, Teleport, type PropType } from 'vue';

export default defineComponent({
  name: 'CustomConfirmModal',
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
            class="peternakan-modal-overlay animate-fade-in" 
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
              class="peternakan-modal" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                width: '92%',
                maxWidth: '400px', 
                backgroundColor: 'var(--color-surface, #ffffff)', 
                borderRadius: '24px', 
                boxShadow: '0 20px 40px rgba(0, 0, 0, 0.15)',
                padding: '2.25rem 1.75rem 2rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'var(--font-sans), sans-serif',
                border: '1px solid var(--color-outline-variant, #e6dfd7)',
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
                  background: 'linear-gradient(135deg, #FFF5F0 0%, #FEE2E2 100%)',
                  border: '1.5px solid #FCA5A5'
                }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#DC2626" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                </div>
                
                <h4 style={{ 
                  fontWeight: '800', 
                  marginBottom: '0.75rem', 
                  fontSize: '1.35rem', 
                  color: 'var(--color-on-surface, #2D2219)', 
                  letterSpacing: '-0.02em',
                }}>
                  {props.title}
                </h4>
                
                <p style={{ 
                  color: 'var(--color-on-surface-variant, #6D6D6D)', 
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
                      background: 'var(--color-surface-container-high, #F5F2EE)', 
                      color: 'var(--color-on-surface, #2D2219)', 
                      border: '1px solid var(--color-outline-variant, #E6DFD7)', 
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
                      background: '#DC2626', 
                      color: '#ffffff', 
                      border: 'none', 
                      fontWeight: '700',
                      fontSize: '0.92rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.2)'
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
