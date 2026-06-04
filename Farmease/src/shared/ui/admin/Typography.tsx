import { defineComponent, type PropType } from 'vue';
import { colors, type ColorSwatch } from '@/shared/ColorPalette';

export default defineComponent({
  name: 'Typography',
  props: {
    variant: {
      type: String as PropType<'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'p' | 'span' | 'div'>,
      default: 'p',
    },
    size: {
      type: String as PropType<'text-xs' | 'text-sm' | 'text-md' | 'text-lg' | 'text-xl' | 'text-2xl' | 'text-3xl' | 'text-4xl' | 'text-5xl' | 'text-6xl'>,
      default: undefined,
    },
    weight: {
      type: String as PropType<'light' | 'normal' | 'medium' | 'semibold' | 'bold' | 'extrabold' | 'black'>,
      default: undefined,
    },
    color: {
      type: String,
      default: 'inherit',
    },
    className: {
      type: String,
      default: '',
    }
  },
  setup(props, { slots }) {
    return () => {
      const Tag = props.variant as any;
      
      const fontWeightMap: Record<string, number> = {
        light: 300,
        normal: 400,
        medium: 500,
        semibold: 600,
        bold: 700,
        extrabold: 800,
        black: 900,
      };

      const fontSizeMap: Record<string, string> = {
        'text-xs': 'var(--font-size-xs)',
        'text-sm': 'var(--font-size-sm)',
        'text-md': 'var(--font-size-md)',
        'text-lg': 'var(--font-size-lg)',
        'text-xl': 'var(--font-size-xl)',
        'text-2xl': 'var(--font-size-2xl)',
        'text-3xl': 'var(--font-size-3xl)',
        'text-4xl': 'var(--font-size-4xl)',
        'text-5xl': 'var(--font-size-5xl)',
        'text-6xl': 'var(--font-size-6xl)',
      };

      const palette = colors as Record<string, ColorSwatch>;
      const colorKey = props.color === 'secondary' ? 'secondary' : props.color;
      const resolvedColor =
        colorKey && colorKey in palette
          ? palette[colorKey]!.hex
          : props.color === 'secondary'
            ? 'var(--color-on-surface-variant)'
            : props.color;

      return (
        <Tag
          class={props.className}
          style={{
            fontFamily: "var(--font-sans, 'Manrope', sans-serif)",
            ...(props.weight ? { fontWeight: fontWeightMap[props.weight] } : {}),
            ...(props.size ? { fontSize: fontSizeMap[props.size] } : {}),
            ...(resolvedColor && resolvedColor !== 'inherit' ? { color: resolvedColor } : {})
          }}
        >
          {slots.default?.()}
        </Tag>
      );
    };
  }
});
