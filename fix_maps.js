const fs = require('fs');
const files = [
  'components/sections/asado-section.tsx',
  'components/sections/fernet-section.tsx',
  'components/sections/micro-section.tsx',
  'components/sections/mate-section.tsx',
  'components/sections/trabajo-section.tsx',
  'components/sections/alquiler-section.tsx',
  'components/sections/pelota-section.tsx',
  'components/sections/camiseta-section.tsx',
  'components/sections/playstation-section.tsx'
];

for (let file of files) {
  try {
    let content = fs.readFileSync(file, 'utf8');
    // Find patterns like .map((...) => ( ... ) and fix the missing closing )
    // This is tricky with regex, but we know it usually ends with )} or ) }
    // Actually, let's just look for the specific cases likely to be broken.
    content = content.replace(/\.map\(([^)]+)\) => \(\n([\s\S]*?)\n\s*\}\)/g, '.map(($1) => (\n$2\n      ))');
    
    // Simpler check: if we see .map(( and then later ) } without the second ), fix it.
    // Specifically for motion.div maps
    content = content.replace(/<\/motion\.div>\n\s+\}\)/g, '</motion.div>\n            ))');
    
    fs.writeFileSync(file, content);
    console.log("Checked", file);
  } catch (e) {
    console.log("Failed", file, e.message);
  }
}
