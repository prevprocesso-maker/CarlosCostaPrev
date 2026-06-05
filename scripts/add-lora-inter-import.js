const fs = require('fs');
const path = require('path');

const loraInterImport = `  <!-- Fonte — carregamento assíncrono (não bloqueia renderização) -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="preload" href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" as="style" onload="this.onload=null;this.rel='stylesheet'">
  <noscript><link href="https://fonts.googleapis.com/css2?family=Lora:wght@500;600;700&family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet"></noscript>`;

function findHtmlFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory() && file !== 'node_modules' && file !== '.git') {
      findHtmlFiles(filePath, fileList);
    } else if (file.endsWith('.html')) {
      fileList.push(filePath);
    }
  });
  return fileList;
}

const htmlFiles = findHtmlFiles('.');
let updated = 0;

htmlFiles.forEach(filePath => {
  let content = fs.readFileSync(filePath, 'utf8');

  // Skip if already has Lora import
  if (content.includes('family=Lora')) {
    console.log(`✓ ${filePath} — já tem Lora`);
    return;
  }

  // Find closing </head> tag
  const headClosingIndex = content.indexOf('</head>');
  if (headClosingIndex === -1) {
    console.log(`✗ ${filePath} — sem </head>`);
    return;
  }

  // Remove old Inter import if exists
  content = content.replace(
    /\s*<link\s+(?:rel="preload"\s+)?href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]*"[^>]*>\n?/g,
    ''
  ).replace(
    /\s*<link\s+href="https:\/\/fonts\.googleapis\.com\/css2\?family=Inter[^"]*"\s+rel="stylesheet">\n?/g,
    ''
  );

  // Remove old preconnect if exists (to avoid duplication)
  let preconnectCount = (content.match(/rel="preconnect"/g) || []).length;
  if (preconnectCount > 0) {
    // Remove old preconnects related to fonts
    content = content.replace(
      /<link\s+rel="preconnect"\s+href="https:\/\/fonts\.googleapis\.com">\n?/g,
      ''
    ).replace(
      /<link\s+rel="preconnect"\s+href="https:\/\/fonts\.gstatic\.com"[^>]*>\n?/g,
      ''
    );
  }

  // Insert new import before </head>
  content = content.slice(0, headClosingIndex) + '\n\n' + loraInterImport + '\n\n' + content.slice(headClosingIndex);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`✅ ${filePath} — Lora+Inter adicionado`);
  updated++;
});

console.log(`\n✅ ${updated} arquivos atualizados com Lora+Inter font stack`);
