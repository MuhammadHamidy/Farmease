import { defineComponent } from 'vue';
import type { PropType } from 'vue';
import '@/shared/assets/css/ui/admin/Button.css';

export default defineComponent({
  name: 'CustomButton',
  props: {
    variant: { type: String as PropType<'solid' | 'disabled' | 'outline'>, default: 'solid' },
    class: { type: String, default: '' },
    className: { type: String, default: '' },
    icon: { type: Function, default: null },
    onClick: { type: Function as PropType<() => void>, default: null },
  },
  setup(props, { slots }) {
    return () => {
      const variantClass = `btn-primary-${props.variant}`;
      return (
        <button
          class={["custom-btn d-flex align-items-center justify-content-center gap-2", variantClass, props.class, props.className]}
          disabled={props.variant === 'disabled'}
          onClick={() => props.onClick?.()}
        >
          {props.icon && props.icon()}
          {slots.default && slots.default()}
        </button>
      );
    }
  }
});
