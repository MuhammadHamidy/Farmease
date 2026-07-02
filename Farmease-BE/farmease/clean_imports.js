const fs = require('fs');
const path = require('path');

const moduleDir = path.join(__dirname, 'module');

function cleanUnusedImports(filePath) {
    if (!fs.existsSync(filePath)) return;

    let content = fs.readFileSync(filePath, 'utf8');
    
    // We specifically want to remove net/http and responses from handler.go 
    // if they are not used in actual code (not comments).
    
    // To be safe and quick, we know they are not used in the newly stripped handler.go files.
    // We will just remove the exact import lines:
    // "github.com/farmease/farmease-be/libraries/responses"
    // "net/http"
    
    let lines = content.split('\n');
    let newLines = lines.filter(line => {
        if (line.includes('"github.com/farmease/farmease-be/libraries/responses"')) return false;
        if (line.includes('"net/http"')) return false;
        return true;
    });

    // Write back
    fs.writeFileSync(filePath, newLines.join('\n'));
    console.log(`Cleaned unused imports in: ${filePath}`);
}

function scanModules() {
    if (!fs.existsSync(moduleDir)) return;

    const modules = fs.readdirSync(moduleDir);
    modules.forEach(mod => {
        const modPath = path.join(moduleDir, mod);
        if (!fs.statSync(modPath).isDirectory()) return;

        const handlerPath = path.join(modPath, 'delivery', 'http', 'handler.go');
        cleanUnusedImports(handlerPath);
    });
}

scanModules();
