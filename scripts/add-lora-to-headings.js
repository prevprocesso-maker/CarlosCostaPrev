const fs = require('fs');

// Classes que deveriam usar Lora (display/heading elements)
const headingPatterns = [
  'title', 'heading', 'label', 'logo', 'brand', 'name', 'text-1', 'text-2',
  'val', 'number', 'stat', 'kicker', 'nav'
];

const cssFiles = [
  'assets/css/sections.css',
  'assets/css/components.css'
];

cssFiles.forEach(file => {
  if (!fs.existsSync(file)) return;

  let content = fs.readFileSync(file, 'utf8');
  let updated = 0;

  // Find all class selectors with font-weight >= 700 and no font-family
  const classRegex = /^(\.[a-z0-9_-]+(?:\s*[>,+~]\s*\.?[a-z0-9_-:]+)*)\s*\{([^}]+font-weight:\s*[789]\d0[^}]*)\}/gm;

  content = content.replace(classRegex, (match, selector, styles) => {
    // Check if class name matches heading patterns
    const matchesPattern = headingPatterns.some(pattern =>
      selector.toLowerCase().includes(pattern)
    );

    if (!matchesPattern) return match;

    // Check if already has font-family
    if (/font-family\s*:/.test(styles)) {
      return match;
    }

    // Add font-family: var(--font-display) after font-weight
    const updated = styles.replace(
      /(font-weight:\s*[789]\d0)/,
      `$1;\n  font-family: var(--font-display)`
    );

    console.log(`✅ Added Lora to: ${selector}`);
    updated++;
    return selector + ' {' + updated;
  });

  fs.writeFileSync(file, content, 'utf8');
  console.log(`\n✅ ${file} updated`);
});

console.log('\n✅ Lora added to heading/display classes');
