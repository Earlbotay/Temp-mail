const fs = require('fs');
const path = require('path');

function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      if (file !== 'node_modules' && file !== '.git') {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
      }
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

const targetDir = '/storage/emulated/0/deepseek-cli';
const files = getAllFiles(targetDir);

files.forEach(file => {
  if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.md') || file.endsWith('.json') || file.endsWith('.toml') || file.endsWith('.snap.svg') || file.endsWith('.snap')) {
    let content = fs.readFileSync(file, 'utf8');
    if (content.includes('DEEPSEEK.md') || content.includes('deepseek-md')) {
      // Replace DEEPSEEK.md with Deepseek.md
      content = content.replace(/DEEPSEEK\.md/g, 'Deepseek.md');
      // Replace deepseek-md with deepseek-md (for URLs/slugs)
      content = content.replace(/deepseek-md/g, 'deepseek-md');
      fs.writeFileSync(file, content);
    }
  }
});
