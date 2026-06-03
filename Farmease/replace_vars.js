const fs = require('fs');
const path = require('path');

const directories = [
  'C:/Kuliah/Semester 7/TA/Keperluan/Farmease/Farmease/src/components',
  'C:/Kuliah/Semester 7/TA/Keperluan/Farmease/Farmease/src/assets/css'
];

const replacements = [
  // Specific replacements with quotes for JS/TS/Vue template literals
  { regex: /'var\(--color-primary\)'/g, replacement: "'#283618'" },
  { regex: /'var\(--color-primary-light\)'/g, replacement: "'#606C38'" },
  { regex: /'var\(--color-secondary\)'/g, replacement: "'#BC6C25'" },
  { regex: /'var\(--color-accent\)'/g, replacement: "'#DDA15E'" },
  { regex: /'var\(--color-background\)'/g, replacement: "'#FEFAE0'" },
  { regex: /'var\(--color-cornsilk\)'/g, replacement: "'#FEFAE0'" },
  { regex: /'var\(--ui-primary\)'/g, replacement: "'#283618'" },
  { regex: /'var\(--ui-border\)'/g, replacement: "'#EBEBEB'" },
  { regex: /'var\(--font-outfit\)'/g, replacement: "'Outfit', sans-serif" },
  { regex: /'var\(--font-sans\)'/g, replacement: "'Inter', system-ui, -apple-system, sans-serif" },

  // common rgba variables with quotes
  { regex: /'rgba\(40,\s*54,\s*24,\s*0\.1\)'/g, replacement: "'#2836181A'" },
  { regex: /'rgba\(40,\s*54,\s*24,\s*0\.05\)'/g, replacement: "'#2836180D'" },
  { regex: /'rgba\(221,\s*161,\s*94,\s*0\.15\)'/g, replacement: "'#DDA15E26'" },
  { regex: /'rgba\(0,\s*0,\s*0,\s*0\.075\)'/g, replacement: "'#00000013'" },

  // fallback for unquoted or bare in CSS files
  { regex: /var\(--color-primary\)/g, replacement: "#283618" }, 
  { regex: /var\(--color-primary-light\)/g, replacement: "#606C38" },
  { regex: /var\(--color-secondary\)/g, replacement: "#BC6C25" },
  { regex: /var\(--color-accent\)/g, replacement: "#DDA15E" },
  { regex: /var\(--color-background\)/g, replacement: "#FEFAE0" },
  { regex: /var\(--color-cornsilk\)/g, replacement: "#FEFAE0" },
  { regex: /var\(--ui-primary\)/g, replacement: "#283618" },
  { regex: /var\(--ui-border\)/g, replacement: "#EBEBEB" },
  { regex: /var\(--font-outfit\)/g, replacement: "Outfit, sans-serif" },
  { regex: /var\(--font-sans\)/g, replacement: "Inter, system-ui, -apple-system, sans-serif" },
  
  { regex: /rgba\(40,\s*54,\s*24,\s*0\.1\)/g, replacement: "#2836181A" },
  { regex: /rgba\(40,\s*54,\s*24,\s*0\.05\)/g, replacement: "#2836180D" },
  { regex: /rgba\(221,\s*161,\s*94,\s*0\.15\)/g, replacement: "#DDA15E26" },
  { regex: /rgba\(0,\s*0,\s*0,\s*0\.075\)/g, replacement: "#00000013" },
];

function walkDir(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      results = results.concat(walkDir(file));
    } else { 
      if (file.endsWith('.tsx') || file.endsWith('.vue') || file.endsWith('.css') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

let modifiedCount = 0;
directories.forEach(dir => {
  if (fs.existsSync(dir)) {
    const files = walkDir(dir);
    files.forEach(file => {
      let content = fs.readFileSync(file, 'utf8');
      let originalContent = content;
      
      replacements.forEach(rep => {
         // Special handling: if the regex aims at 'var(--something)', replace with '#hex'. If the content just has var(--something) unquoted, we replace with #hex.
         content = content.replace(rep.regex, rep.replacement);
      });
      
      // Cleanup double quotes if the replacement introduced "'#hex'" inside a CSS file
      if (file.endsWith('.css')) {
        content = content.replace(/'#([0-9A-Fa-f]{6,8})'/g, '#$1');
        content = content.replace(/"#([0-9A-Fa-f]{6,8})"/g, '#$1');
      }

      if (content !== originalContent) {
        fs.writeFileSync(file, content, 'utf8');
        console.log(`Updated ${file}`);
        modifiedCount++;
      }
    });
  }
});
console.log(`Completed. Modified ${modifiedCount} files.`);
