const fs = require('fs');
const path = require('path');

const moduleDir = path.join(__dirname, 'module');

function toSnakeCase(str) {
    return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`).replace(/^_/, '');
}

function processFile(filePath) {
    if (!fs.existsSync(filePath)) return;

    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract package name
    const pkgMatch = content.match(/^package\s+(\w+)/m);
    if (!pkgMatch) return;
    const pkgName = pkgMatch[1];

    // Extract all single-line imports inside import blocks or single import statements
    const importRegex = /(?:import\s+\(\s*([\s\S]*?)\s*\))|(?:import\s+([^\n]+))/g;
    let allImports = [];
    
    let match;
    while ((match = importRegex.exec(content)) !== null) {
        if (match[1]) {
            // Block of imports
            const lines = match[1].split('\n').map(l => l.trim()).filter(l => l && !l.startsWith('//'));
            allImports.push(...lines);
        } else if (match[2]) {
            // Single import
            allImports.push(match[2].trim());
        }
    }

    const lines = content.split('\n');
    let insideFunc = false;
    let braceCount = 0;
    let currentFuncName = '';
    let currentFuncBody = [];
    
    let leftoverLines = [];

    const funcRegex = /^func\s+\(\w+\s+\*?[a-zA-Z0-9_]+\)\s+([A-Z][a-zA-Z0-9_]*)\s*\(/;

    let hasExtracted = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        if (!insideFunc) {
            const fMatch = line.match(funcRegex);
            if (fMatch) {
                if (fMatch[1] === 'RegisterRoutes' || fMatch[1] === 'registerGroup') {
                    leftoverLines.push(line);
                    let tempBrace = 0;
                    tempBrace += (line.match(/\{/g) || []).length;
                    tempBrace -= (line.match(/\}/g) || []).length;
                    
                    if (tempBrace > 0) {
                        let j = i + 1;
                        while (j < lines.length && tempBrace > 0) {
                            leftoverLines.push(lines[j]);
                            tempBrace += (lines[j].match(/\{/g) || []).length;
                            tempBrace -= (lines[j].match(/\}/g) || []).length;
                            j++;
                        }
                        i = j - 1;
                    }
                    continue;
                }

                insideFunc = true;
                currentFuncName = fMatch[1];
                currentFuncBody = [line];
                braceCount += (line.match(/\{/g) || []).length;
                braceCount -= (line.match(/\}/g) || []).length;
                
                if (braceCount === 0 && line.includes('{') && line.includes('}')) {
                    saveFunction(filePath, pkgName, allImports, currentFuncName, currentFuncBody);
                    hasExtracted = true;
                    insideFunc = false;
                }
            } else {
                leftoverLines.push(line);
            }
        } else {
            currentFuncBody.push(line);
            braceCount += (line.match(/\{/g) || []).length;
            braceCount -= (line.match(/\}/g) || []).length;

            if (braceCount <= 0) {
                saveFunction(filePath, pkgName, allImports, currentFuncName, currentFuncBody);
                hasExtracted = true;
                insideFunc = false;
                braceCount = 0;
            }
        }
    }

    if (hasExtracted) {
        console.log(`Processed: ${filePath}`);
        // Rewrite original file with leftovers, cleaning up unused imports
        let newContent = leftoverLines.join('\n');
        
        // Remove import blocks from newContent entirely, we will rebuild them
        newContent = newContent.replace(/(?:import\s+\(\s*[\s\S]*?\s*\))|(?:import\s+[^\n]+)/g, '');
        
        // Find which imports are needed for the leftover content
        const neededLeftoverImports = filterImports(allImports, newContent);
        
        let finalOutput = `package ${pkgName}\n\n`;
        if (neededLeftoverImports.length > 0) {
            finalOutput += `import (\n\t${neededLeftoverImports.join('\n\t')}\n)\n\n`;
        }
        
        finalOutput += newContent.replace(/\n{3,}/g, '\n\n').trim() + '\n';
        fs.writeFileSync(filePath, finalOutput);
    }
}

function filterImports(allImports, textBody) {
    return allImports.filter(imp => {
        // Find the package name being used
        // Examples: 
        // "context" -> context
        // "github.com/jackc/pgx/v5/pgxpool" -> pgxpool
        // feedsDomain "github.com/.../feeds/domain" -> feedsDomain
        let parts = imp.split(' ');
        let pkgAlias = '';
        if (parts.length > 1 && !parts[0].startsWith('"')) {
            pkgAlias = parts[0];
        } else {
            let pathPart = parts[parts.length - 1].replace(/"/g, '');
            let splitPath = pathPart.split('/');
            pkgAlias = splitPath[splitPath.length - 1];
            // Handle versions like /v2
            if (pkgAlias.match(/^v\d+$/)) {
                pkgAlias = splitPath[splitPath.length - 2];
            }
        }
        
        // Regex to check if pkgAlias is used as a package accessor e.g. fmt.Println or type e.g. pgxpool.Pool
        // or inside text as whole word
        const usageRegex = new RegExp(`\\b${pkgAlias}\\.`, 'g');
        return usageRegex.test(textBody);
    });
}

function saveFunction(originalFilePath, pkgName, allImports, funcName, bodyLines) {
    const dir = path.dirname(originalFilePath);
    const fileName = toSnakeCase(funcName) + '.go';
    const outPath = path.join(dir, fileName);
    
    const textBody = bodyLines.join('\n');
    const neededImports = filterImports(allImports, textBody);
    
    let fileContent = `package ${pkgName}\n\n`;
    if (neededImports.length > 0) {
        fileContent += `import (\n\t${neededImports.join('\n\t')}\n)\n\n`;
    }
    fileContent += textBody + '\n';

    fs.writeFileSync(outPath, fileContent);
    console.log(` -> Created: ${outPath}`);
}

function scanModules() {
    if (!fs.existsSync(moduleDir)) {
        console.error(`Module dir not found: ${moduleDir}`);
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
            processFile(t);
        });
    });
}

scanModules();
console.log('Refactoring complete!');
