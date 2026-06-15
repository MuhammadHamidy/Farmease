const { execSync } = require('child_process');
try {
  const output = execSync('go build ./...', { cwd: 'c:\\Kuliah\\Semester 7\\TA\\Keperluan\\Farmease\\Ternak\\Farmease-BE\\farmease' });
  console.log('Build output:', output.toString());
} catch (error) {
  console.error('Build failed with error:', error.message);
  if (error.stdout) console.log('STDOUT:', error.stdout.toString());
  if (error.stderr) console.error('STDERR:', error.stderr.toString());
}
