import { defineComponent, type PropType } from 'vue';

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

      return (
        <div 
          class="peternakan-modal-overlay" 
          style={{ zIndex: 1050, alignItems: 'center' }} 
          onClick={props.alert.type === 'error' ? props.onClose : undefined}
        >
          <div 
            class="peternakan-modal" 
            onClick={(e) => e.stopPropagation()} 
            style={{ maxWidth: '400px', backgroundColor: '#fff', borderRadius: '24px', animation: 'scaleUp 0.3s ease' }}
          >
            <div class="p-4 text-center">
              <div style={{ marginBottom: '1.5rem' }}>
                {props.alert.type === 'error' ? (
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'var(--color-danger-transparent)', color: 'var(--color-danger)', borderRadius: '50%' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>!</span>
                  </div>
                ) : (
                  <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '64px', height: '64px', backgroundColor: 'var(--color-success-transparent)', color: 'var(--color-success-dark)', borderRadius: '50%' }}>
                    <span style={{ fontSize: '2rem', fontWeight: 'bold' }}>✓</span>
                  </div>
                )}
              </div>
              
              <h4 style={{ fontWeight: '800', marginBottom: '0.5rem', fontSize: '1.25rem', color: 'var(--color-gray-900)' }}>
                {props.alert.title}
              </h4>
              
              <p style={{ color: 'var(--color-gray-500)', marginBottom: '1.5rem', whiteSpace: 'pre-line', fontSize: '0.9rem', lineHeight: '1.5' }}>
                {props.alert.message}
              </p>

              <button 
                style={{ width: '100%', padding: '0.75rem', borderRadius: '50rem', backgroundColor: 'var(--color-button-primary)', color: '#fff', border: 'none', fontWeight: 'bold' }} 
                onClick={props.onClose}
              >
                {props.alert.type === 'error' ? 'Mengerti' : 'Selesai'}
              </button>
            </div>
          </div>
        </div>
      );
    };
  }
});
