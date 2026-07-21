import { defineComponent, Teleport, type PropType } from 'vue';

export interface AlertModalState {
  isOpen: boolean;
  title: string;
  message: string;
  type: 'error' | 'success';
}

export default defineComponent({
  name: 'CustomAlertModal',
  props: {
    alert: {
      type: Object as PropType<AlertModalState>,
      required: true,
    },
    onClose: {
      type: Function as PropType<() => void>,
      required: true,
    },
  },
  setup(props) {
    return () => {
      if (!props.alert.isOpen) return null;

      const isSuccess = props.alert.type === 'success';

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
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              transition: 'all 0.3s ease'
            }} 
            onClick={props.alert.type === 'error' ? props.onClose : undefined}
          >
            <div 
              class="peternakan-modal" 
              onClick={(e) => e.stopPropagation()} 
              style={{ 
                width: '90%',
                maxWidth: '360px', 
                backgroundColor: 'var(--color-surface, #ffffff)', 
                borderRadius: '24px', 
                boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
                padding: '2rem 1.5rem 1.75rem',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                fontFamily: 'var(--font-outfit), "Outfit", sans-serif',
                animation: 'scaleUp 0.3s ease'
              }}
            >
              <div class="text-center">
                {/* Icon Container using text spans (no SVG) */}
                <div style={{ 
                  display: 'inline-flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  width: '64px', 
                  height: '64px', 
                  borderRadius: '50%',
                  marginBottom: '1.25rem',
                  background: isSuccess 
                    ? 'var(--color-success-transparent, #e8f5e9)' 
                    : 'var(--color-danger-transparent, #ffebee)',
                }}>
                  {isSuccess ? (
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-success-dark, #2e7d32)', display: 'block', lineHeight: '64px' }}>✓</span>
                  ) : (
                    <span style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--color-danger, #c62828)', display: 'block', lineHeight: '64px' }}>!</span>
                  )}
                </div>
                
                <h4 style={{ 
                  fontWeight: '800', 
                  marginBottom: '0.5rem', 
                  fontSize: '1.25rem', 
                  color: 'var(--color-on-surface, #2d2219)', 
                  letterSpacing: '-0.02em',
                }}>
                  {props.alert.title}
                </h4>
                
                <p style={{ 
                  color: 'var(--color-on-surface-variant, #707070)', 
                  marginBottom: '1.5rem', 
                  whiteSpace: 'pre-line', 
                  fontSize: '0.88rem', 
                  lineHeight: '1.5',
                  fontWeight: '500'
                }}>
                  {props.alert.message}
                </p>

                <button 
                  style={{ 
                    width: '100%', 
                    padding: '0.75rem 1.5rem', 
                    borderRadius: '50rem', 
                    background: 'var(--color-primary, #3D2F24)', 
                    color: 'var(--color-on-primary, #ffffff)', 
                    border: 'none', 
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s'
                  }} 
                  onClick={props.onClose}
                >
                  Tutup
                </button>
              </div>
            </div>
          </div>
        </Teleport>
      );
    };
  }
});
