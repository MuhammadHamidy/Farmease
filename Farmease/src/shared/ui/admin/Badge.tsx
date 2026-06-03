import { defineComponent, type PropType } from 'vue';
import { colors } from '@/shared/ColorPalette';

export type BadgeVariant = 'success' | 'warning' | 'danger' | 'info' | 'primary' | 'secondary';

export default defineComponent({
  name: 'Badge',
  props: {
    variant: {
      type: String as PropType<BadgeVariant>,
      default: 'primary',
    },
    className: {
      type: String,
      default: '',
    },
  },
  setup(props, { slots }) {
    const variantStyles: Record<BadgeVariant, { bg: string, color: string }> = {
      success: { bg: 'rgba(167, 141, 120, 0.08)', color: 'var(--color-secondary)' },
      warning: { bg: 'rgba(193, 154, 107, 0.12)', color: 'var(--color-tertiary)' },
      danger: { bg: 'rgba(186, 26, 26, 0.08)', color: 'var(--color-error)' },
      info: { bg: 'rgba(59, 130, 246, 0.08)', color: colors.info.hex },
      primary: { bg: 'rgba(225, 212, 194, 0.13)', color: 'var(--color-primary-fixed)' },
      secondary: { bg: 'var(--color-surface-container)', color: 'var(--color-on-surface-variant)' },
    };

    return () => (
      <span
        class={['px-2 py-0.5 rounded-full font-extrabold text-[10px] uppercase tracking-wider', props.className]}
        style={{
          backgroundColor: variantStyles[props.variant].bg,
          color: variantStyles[props.variant].color,
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        {slots.default?.()}
      </span>
    );
  }
});
