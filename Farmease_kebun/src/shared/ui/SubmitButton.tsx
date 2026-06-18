import { defineComponent, type PropType } from 'vue';

export default defineComponent({
  name: 'SubmitButton',
  props: {
    onClick: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      default: null
    },
    label: {
      type: String,
      default: 'Simpan'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    className: {
      type: String,
      default: ''
    },
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button'
    },
    style: {
      type: Object,
      default: () => ({})
    }
  },
  setup(props) {
    const handleClick = (e: MouseEvent) => {
      if (props.disabled || props.loading) return;
      if (props.onClick) props.onClick(e);
    };

    return () => (
      <button
        type={props.type}
        class={['peternakan-primary-btn text-center justify-content-center', props.className, props.loading ? 'btn-loading' : '']}
        style={{ padding: '0.8rem 1.5rem', borderRadius: '50rem', ...props.style }}
        onClick={handleClick}
        disabled={props.disabled || props.loading}
      >
        {props.loading ? 'Memproses...' : props.label}
      </button>
    );
  }
});
