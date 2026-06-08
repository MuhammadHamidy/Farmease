const fs = require('fs');
const content = fs.readFileSync('c:\\Kuliah\\Semester 7\\TA\\Keperluan\\Farmease\\Ternak\\Farmease-BE\\server_log.txt', 'utf16le');
const lines = content.split('\n');
console.log(lines.slice(-100).join('\n'));
