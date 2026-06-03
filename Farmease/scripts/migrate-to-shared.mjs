import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const rules = [
  [/from ['"]\.\/ColorPalette['"]/g, "from '@/shared/ColorPalette'"],
  [/from ['"]\.\.\/ColorPalette['"]/g, "from '@/shared/ColorPalette'"],
  [/@\/modules\/ternak\/components\/ui\/admin\//g, '@/shared/ui/admin/'],
  [/@\/modules\/ternak\/components\/ui\//g, '@/shared/ui/'],
  [/@\/modules\/ternak\/assets\/css\/ui\//g, '@/shared/assets/css/ui/'],
  [/'@\/modules\/ternak\/assets\/css\/ui\//g, "'@/shared/assets/css/ui/"],
  [/"@\/modules\/ternak\/assets\/css\/ui\//g, '"@/shared/assets/css/ui/'],
  [/from ['"]\.\.\/ui\//g, "from '@/shared/ui/"],
  [/from ['"]\.\/ui\//g, "from '@/shared/ui/"],
];

function walk(dir) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full);
    } else if (/\.(tsx?|vue)$/.test(name)) {
      let content = fs.readFileSync(full, 'utf8');
      let next = content;
      for (const [re, rep] of rules) next = next.replace(re, rep);
      if (next !== content) fs.writeFileSync(full, next);
    }
  }
}

walk(path.join(root, 'shared'));
walk(path.join(root, 'modules'));
walk(path.join(root, 'router'));

// admin ColorPalette shim
const adminPaletteShim = `export {
  colors,
  palettes,
  paletteTernak,
  paletteKebun,
  getPalette,
  type ColorPaletteName,
  type FarmeasePaletteModule,
  type ColorSwatch,
  default,
} from '@/shared/ColorPalette';
`;
fs.writeFileSync(path.join(root, 'shared', 'ui', 'admin', 'ColorPalette.tsx'), adminPaletteShim);

// Remove duplicate ColorPalette in shared/ui root
const dup = path.join(root, 'shared', 'ui', 'ColorPalette.tsx');
if (fs.existsSync(dup)) fs.unlinkSync(dup);

console.log('Migration script done');
