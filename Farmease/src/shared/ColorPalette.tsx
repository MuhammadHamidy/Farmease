import { defineComponent, type PropType } from 'vue';

export type ColorSwatch = { hex: string; name: string };

/** Palet Ternak (peternakan) — coklat / krem */
export const paletteTernak = {
  primary: { hex: '#3d2f24', name: 'Dark Brown' },
  secondary: { hex: '#a78d78', name: 'Light Brown' },
  tertiary: { hex: '#8b7355', name: 'Medium Brown' },
  background: { hex: '#faf8f5', name: 'Cream White' },
  surface: { hex: '#faf8f5', name: 'Surface Cream' },
  'surface-dim': { hex: '#d4c9ba', name: 'Dimmed Surface' },
  'surface-container': { hex: '#ede8e0', name: 'Container Brown' },
  outline: { hex: '#7a6f65', name: 'Outline Brown' },
  error: { hex: '#ba1a1a', name: 'Error Red' },
  'almond-beige': { hex: '#E1D4C2', name: 'Almond Beige' },
  'coffee-brown': { hex: '#A78D78', name: 'Coffee Brown' },
  cornsilk: { hex: '#FDFBF7', name: 'Off White' },
  fawn: { hex: '#C19A6B', name: 'Deer Brown' },
  'liver-dogs': { hex: '#8B5E3C', name: 'Rust Wood' },
  white: { hex: '#FFFFFF', name: 'White' },
  black: { hex: '#000000', name: 'Black' },
  success: { hex: '#10b981', name: 'Success Green' },
  warning: { hex: '#f59e0b', name: 'Warning Amber' },
  info: { hex: '#3b82f6', name: 'Info Blue' },
  healthy: { hex: '#a78d78', name: 'Healthy Brown' },
  pregnant: { hex: '#c19a6b', name: 'Pregnant Light Brown' },
  sick: { hex: '#8b5e3c', name: 'Sick Dark Brown' },
} as const satisfies Record<string, ColorSwatch>;

/** Palet Kebun (perkebunan) — hijau / krem dari Farmease_FE_Kebun */
export const paletteKebun = {
  primary: { hex: '#283618', name: 'Kombu Green' },
  'primary-light': { hex: '#606C38', name: 'Dark Olive Green' },
  secondary: { hex: '#BC6C25', name: 'Liver (dogs)' },
  accent: { hex: '#DDA15E', name: 'Fawn' },
  background: { hex: '#FEFAE0', name: 'Cornsilk' },
  'dark-olive-green': { hex: '#606C38', name: 'Dark olive green' },
  'kombu-green': { hex: '#283618', name: 'Kombu green' },
  cornsilk: { hex: '#FEFAE0', name: 'Cornsilk' },
  fawn: { hex: '#DDA15E', name: 'Fawn' },
  'liver-dogs': { hex: '#BC6C25', name: 'Liver (dogs)' },
  white: { hex: '#FFFFFF', name: 'White' },
  black: { hex: '#000000', name: 'Black' },
  success: { hex: '#10b981', name: 'Success Green' },
  warning: { hex: '#f59e0b', name: 'Warning Amber' },
  info: { hex: '#3b82f6', name: 'Info Blue' },
  error: { hex: '#ba1a1a', name: 'Error Red' },
} as const satisfies Record<string, ColorSwatch>;

/** Palet SSO — utama coklat (ternak), tombol/aksen hijau (kebun) */
export const paletteSso = {
  ...paletteTernak,
  'btn-primary': { hex: '#283618', name: 'Button Green' },
  'btn-primary-hover': { hex: '#606C38', name: 'Button Green Hover' },
  'surface-tan': { hex: '#E1D4C2', name: 'Tan Section' },
  'card-tan': { hex: '#D4C4B0', name: 'Card Tan' },
} as const satisfies Record<string, ColorSwatch>;

export const palettes = {
  ternak: paletteTernak,
  kebun: paletteKebun,
  sso: paletteSso,
} as const;

export type FarmeasePaletteModule = keyof typeof palettes;

/** Default aktif (ternak) — kompatibilitas kode lama */
export const colors = paletteTernak;

export type ColorPaletteName = keyof typeof paletteTernak | keyof typeof paletteKebun;

export function getPalette(module: FarmeasePaletteModule = 'ternak'): Record<string, ColorSwatch> {
  return palettes[module] as Record<string, ColorSwatch>;
}

const colorAliases: Record<string, string> = {
  'dark olive green': 'dark-olive-green',
  'dark-olive-green': 'dark-olive-green',
  'kombu green': 'kombu-green',
  'kombu-green': 'kombu-green',
  'liver (dogs)': 'liver-dogs',
  white: 'white',
  black: 'black',
};

function resolveColorKey(
  palette: Record<string, ColorSwatch>,
  name: string,
): string | undefined {
  if (!name) return undefined;
  if (name in palette) return name;
  const lower = name.toLowerCase();
  if (lower in palette) return lower;
  const alias = colorAliases[lower];
  if (alias && alias in palette) return alias;
  const hyphen = lower.replace(/\s+/g, '-').replace(/[()]/g, '').replace(/[^a-z0-9-]/g, '');
  if (hyphen in palette) return hyphen;
  return undefined;
}

export default defineComponent({
  name: 'ColorPalette',
  props: {
    color: {
      type: String as PropType<string>,
      required: true,
    },
    module: {
      type: String as PropType<FarmeasePaletteModule>,
      default: 'ternak',
    },
  },
  setup(props) {
    return () => {
      const palette = getPalette(props.module);
      const key = resolveColorKey(palette, String(props.color || '').trim());
      if (!key) return null;

      const colorData = palette[key];
      if (!colorData) return null;
      const hexNum = colorData.hex.substring(1);
      const darkKeys = new Set([
        'primary',
        'kombu-green',
        'dark-olive-green',
        'coffee-brown',
        'liver-dogs',
        'black',
      ]);
      const isDark = darkKeys.has(key);
      const textColor = isDark ? '#FFFFFF' : '#000000';
      const needsBorder = ['#FDFBF7', '#FFFFFF', '#FEFAE0'].includes(colorData.hex);

      return (
        <div
          class="d-flex flex-column justify-content-center align-items-center w-100 py-4"
          style={{
            backgroundColor: colorData.hex,
            color: textColor,
            minHeight: '120px',
            border: needsBorder ? '1px solid #EBEBEB' : 'none',
          }}
        >
          <h4 class="fw-bold mb-1" style={{ letterSpacing: '1.5px' }}>
            {hexNum}
          </h4>
          <span class="text-sm" style={{ opacity: 0.8, fontSize: '0.85rem' }}>
            {colorData.name}
          </span>
        </div>
      );
    };
  },
});
