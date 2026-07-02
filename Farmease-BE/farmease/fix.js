const fs = require('fs');
const path = require('path');

const moduleDir = path.join(__dirname, 'module');

function fixFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Find all occurrences of "package <name>"
    const lines = content.split('\n');
    let packageCount = 0;
    
    const newLines = lines.filter(line => {
        if (line.match(/^package\s+\w+/)) {
            packageCount++;
            if (packageCount > 1) {
                return false; // Skip duplicate
            }
        }
        return true;
    });

    if (packageCount > 1) {
        fs.writeFileSync(filePath, newLines.join('\n'));
        console.log(`Fixed duplicates in: ${filePath}`);
    }
}

function scanModules() {
    if (!fs.existsSync(moduleDir)) {
        return;
    }

    const modules = fs.readdirSync(moduleDir);
    modules.forEach(mod => {
        const modPath = path.join(moduleDir, mod);
        if (!fs.statSync(modPath).isDirectory()) return;

        const targets = [
            path.join(modPath, 'repository', 'postgresql', 'repository.go'),
            path.join(modPath, 'usecase', 'usecase.go'),
            path.join(modPath, 'delivery', 'http', 'handler.go')
        ];

        targets.forEach(t => {
            fixFile(t);
        });
    });
}

scanModules();
console.log('Fix complete!');
