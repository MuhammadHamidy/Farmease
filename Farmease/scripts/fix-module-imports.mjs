import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..', 'src');

const rules = [
  // Ternak
  [/from ['"]@\/store\/operatorAdmin['"]/g, "from '@/modules/ternak/store/operatorAdmin'"],
  [/from ['"]@\/store\/peternakan['"]/g, "from '@/modules/ternak/store/peternakan'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/store\/operatorAdmin['"]/g, "from '@/modules/ternak/store/operatorAdmin'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/store\/operatorAdmin['"]/g, "from '@/modules/ternak/store/operatorAdmin'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/components\/ui\/peternakan\//g, "from '@/modules/ternak/components/ui/"],
  [/from ['"]\.\.\/\.\.\/\.\.\/components\/peternakan\//g, "from '@/modules/ternak/components/"],
  [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/ui\/peternakan\//g, "from '@/modules/ternak/components/ui/"],
  [/from ['"]\.\.\/\.\.\/\.\.\/\.\.\/components\/ui\/admin\//g, "from '@/modules/ternak/components/ui/admin/"],
  [/from ['"]\.\.\/\.\.\/\.\.\/components\/ui\/admin\//g, "from '@/modules/ternak/components/ui/admin/"],
  [/from ['"]\.\.\/\.\.\/\.\.\/components\/admin\//g, "from '@/modules/ternak/components/admin/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\/modules\/peternakan\//g, "import('@/modules/ternak/assets/css/modules/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\/modules\/admin\//g, "import('@/modules/ternak/assets/css/modules/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/\.\.\/assets\/css\/modules\/admin\//g, "import('@/modules/ternak/assets/css/modules/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/\.\.\/assets\/css\/modules\/admin\//g, "import('@/modules/ternak/assets/css/modules/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\/modules\/admin\//g, "import('@/modules/ternak/assets/css/modules/"],
  [/import\(['"]@\/modules\/admin\/views\//g, "import('@/modules/ternak/admin/views/"],
  [/import\(['"]\.\.\/modules\/peternakan\/views\//g, "import('@/modules/ternak/views/"],
  [/import\(['"]\.\.\/modules\/admin\/views\//g, "import('@/modules/ternak/admin/views/"],
  [/import\(['"]\.\.\/components\/peternakan\//g, "import('@/modules/ternak/components/"],
  [/import\(['"]\.\.\/layouts\/PublicLayout['"]/g, "import('@/modules/sso/layouts/PublicLayout'"],
  [/import\(['"]\.\.\/components\/public\//g, "import('@/modules/sso/components/public/"],
  [/import\(['"]\.\.\/components\/LoginModal['"]/g, "import('@/modules/sso/components/LoginModal'"],
  // Kebun CSS
  [/from ['"]\.\.\/\.\.\/\.\.\/assets\/css\//g, "from '@/modules/kebun/assets/css/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\//g, "import('@/modules/kebun/assets/css/"],
  [/from ['"]\.\.\/\.\.\/assets\/css\/ui\//g, "from '@/modules/kebun/assets/css/ui/"],
  [/import\(['"]\.\.\/\.\.\/assets\/css\/ui\//g, "import('@/modules/kebun/assets/css/ui/"],
  // SSO css in components
  [/import\(['"]\.\.\/assets\/css\/components\//g, "import('@/modules/sso/assets/css/"],
  [/import\(['"]\.\.\/\.\.\/assets\/css\/components\//g, "import('@/modules/sso/assets/css/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\/components\//g, "import('@/modules/sso/assets/css/"],
  // UI css relative in ternak
  [/import\(['"]\.\.\/\.\.\/\.\.\/\.\.\/assets\/css\/ui\/peternakan\//g, "import('@/modules/ternak/assets/css/ui/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\/ui\/peternakan\//g, "import('@/modules/ternak/assets/css/ui/"],
  [/import\(['"]\.\.\/\.\.\/assets\/css\/ui\//g, "import('@/modules/ternak/assets/css/ui/"],
  [/import\(['"]\.\.\/\.\.\/\.\.\/assets\/css\/ui\/admin\//g, "import('@/modules/ternak/assets/css/ui/admin/"],
];

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      if (name === 'node_modules') continue;
      walk(full);
    } else if (/\.(tsx?|css|vue)$/.test(name)) {
      let content = fs.readFileSync(full, 'utf8');
      let next = content;
      for (const [re, rep] of rules) {
        next = next.replace(re, rep);
      }
      if (next !== content) {
        fs.writeFileSync(full, next);
        console.log('updated', path.relative(root, full));
      }
    }
  }
}

walk(path.join(root, 'modules'));
walk(path.join(root, 'router'));
console.log('Import fix complete');
