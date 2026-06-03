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
        'text-xs': '0.75rem',
        'text-sm': '0.875rem',
        'text-md': '1rem',
        'text-lg': '1.125rem',
        'text-xl': '1.25rem',
        'text-2xl': '1.5rem',
        'text-3xl': '1.875rem',
        'text-4xl': '2.25rem',
        'text-5xl': '3rem',
        'text-6xl': '3.75rem',
      };

      const palette = colors as Record<string, ColorSwatch>;
      const resolvedColor =
        props.color && props.color in palette ? palette[props.color]!.hex : props.color;

      return (
        <Tag
          class={props.className}
          style={{
            fontFamily: "'Manrope', sans-serif",
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
