import { defineComponent, type PropType, computed } from 'vue';
import '@/shared/assets/css/ui/Button.css';

export type ButtonVariant = 'primary' | 'secondary' | 'success' | 'danger' | 'outline' | 'ghost' | 'link' | 'solid';
export type ButtonSize = 'sm' | 'md' | 'lg';
export type ButtonShape = 'standard' | 'pill' | 'square';

export default defineComponent({
  name: 'Button',
  props: {
    variant: {
      type: String as PropType<ButtonVariant>,
      default: 'primary'
    },
    size: {
      type: String as PropType<ButtonSize>,
      default: 'md'
    },
    shape: {
      type: String as PropType<ButtonShape>,
      default: 'standard'
    },
    disabled: {
      type: Boolean,
      default: false
    },
    loading: {
      type: Boolean,
      default: false
    },
    fullWidth: {
      type: Boolean,
      default: false
    },
    onClick: {
      type: Function as PropType<(payload: MouseEvent) => void>,
      default: null
    },
    type: {
      type: String as PropType<'button' | 'submit' | 'reset'>,
      default: 'button'
    },
    className: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: undefined
    }
  },
  setup(props, { slots }) {
    const classes = computed(() => [
      'custom-btn',
      `btn-variant-${props.variant}`,
      `btn-size-${props.size}`,
      `btn-shape-${props.shape}`,
      props.loading ? 'btn-loading' : '',
      props.fullWidth ? 'w-full' : '',
      props.className
    ]);

    const handleClick = (event: MouseEvent) => {
      if (props.disabled || props.loading) {
        event.preventDefault();
        return;
      }
      if (props.onClick) props.onClick(event);
    };

    return () => (
      <button
        type={props.type}
        class={classes.value}
        disabled={props.disabled || props.loading}
        onClick={handleClick}
        title={props.title}
      >
        <div class="d-flex align-items-center justify-content-center gap-2">
          {slots.iconLeft && slots.iconLeft()}
          <div class="btn-content">
            {slots.default && slots.default()}
          </div>
          {slots.iconRight && slots.iconRight()}
        </div>
      </button>
    );
  }
});
