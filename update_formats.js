const fs = require('fs');
const files = [
  { p: 'components/sections/asado-section.tsx', v: 'asado' },
  { p: 'components/sections/micro-section.tsx', v: 'microItem' },
  { p: 'components/sections/fernet-section.tsx', v: 'fernet' },
  { p: 'components/sections/playstation-section.tsx', v: 'psItem' },
  { p: 'components/sections/camiseta-section.tsx', v: 'camisetaItem' },
  { p: 'components/sections/trabajo-section.tsx', v: 'salario' },
  { p: 'components/sections/mate-section.tsx', v: 'yerba' },
  { p: 'components/sections/alquiler-section.tsx', v: 'alquiler' },
  { p: 'components/sections/pelota-section.tsx', v: 'pelotaItem' },
  { p: 'components/sections/album-section.tsx', v: 'sobreItem' }
];

for (let f of files) {
  try {
    let content = fs.readFileSync(f.p, 'utf8');
    if (!content.includes('formatCurrency')) {
      content = content.replace('framer-motion"', 'framer-motion"\nimport { formatCurrency } from "@/lib/utils"');
      if (!content.includes('import { formatCurrency }')) {
        content = 'import { formatCurrency } from "@/lib/utils"\n' + content;
      }
    }
    // Pattern 1: exactly like `const formatARS = (n: number) => n.toLocaleString("es-AR", ... )`
    content = content.replace(/const formatARS = \(n: number\) =>\s*n\.toLocaleString\([^)]*\}/g, `const formatARS = (n: number) => formatCurrency(n, ${f.v}?.unidad)`);
    content = content.replace(/const formatARS = \(n: number\) =>\s*n\.toLocaleString\([^)]*\)[^}\n]*/g, `const formatARS = (n: number) => formatCurrency(n, ${f.v}?.unidad)`);
    
    // Pattern 2 (playstation): const formatARS = (n: number) => { return n.toLocaleString(...) }
    content = content.replace(/const formatARS = \(n: number\) => \{\s*return n\.toLocaleString\([^}]*\}\)/g, `const formatARS = (n: number) => formatCurrency(n, ${f.v}?.unidad)`);

    fs.writeFileSync(f.p, content);
    console.log("Updated", f.p);
  } catch (e) {
    console.log("Failed", f.p, e.message);
  }
}
