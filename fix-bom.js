import fs from 'fs';
import path from 'path';

const filesToFix = ['package.json', 'tsconfig.json'];

filesToFix.forEach(file => {
  const filePath = path.resolve(file);
  let content = fs.readFileSync(filePath, 'utf8');
  
  if (content.charCodeAt(0) === 0xFEFF) {
    fs.writeFileSync(filePath, content.slice(1), 'utf8');
    console.log(`✅ BOM invisible eliminado de: ${file}`);
  }
});