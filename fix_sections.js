const fs = require('fs');
const files = [
  { p: 'components/sections/asado-section.tsx', item: 'asado' },
  { p: 'components/sections/fernet-section.tsx', item: 'fernet' },
  { p: 'components/sections/micro-section.tsx', item: 'micro' },
  { p: 'components/sections/mate-section.tsx', item: 'yerba' },
  { p: 'components/sections/trabajo-section.tsx', item: 'salario' },
  { p: 'components/sections/alquiler-section.tsx', item: 'alquiler' },
  { p: 'components/sections/pelota-section.tsx', item: 'pelota' },
  { p: 'components/sections/camiseta-section.tsx', item: 'camisetaItem' }
];

for (let f of files) {
  try {
    let content = fs.readFileSync(f.p, 'utf8');
    
    // Remove local formatARS definitions and fix syntax error ))
    content = content.replace(/const formatARS = \(n: number\) => formatCurrency\(n, [^)]*\)\)+/g, '');
    
    // Fix any leftover )) in case the regex missed it
    content = content.replace(/\)\)+/g, ')');
    
    // Remove formatValue={formatARS} from ComparisonBar and add unit={item.unidad}
    content = content.replace(/formatValue=\{formatARS\}/g, `unit={${f.item}?.unidad}`);
    
    // Replace any inline formatARS(...) calls with formatCurrency(..., item?.unidad)
    const inlineRegex = new RegExp(`formatARS\\(([^)]+)\\)`, 'g');
    content = content.replace(inlineRegex, `formatCurrency($1, ${f.item}?.unidad)`);
    
    // Import formatCurrency if not already there
    if (!content.includes('import { formatCurrency }')) {
      content = content.replace('from "framer-motion"', 'from "framer-motion"\nimport { formatCurrency } from "@/lib/utils"');
    }
    
    // Fix use client position (should be very first line)
    if (content.includes('"use client"') && !content.startsWith('"use client"')) {
       content = '"use client"\n' + content.replace('"use client"', '').trim();
    }

    fs.writeFileSync(f.p, content);
    console.log("Cleaned", f.p);
  } catch (e) {
    console.log("Failed", f.p, e.message);
  }
}
