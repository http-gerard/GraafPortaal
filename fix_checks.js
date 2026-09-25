const fs = require('fs');
let code = fs.readFileSync('src/offertool/components/QuotePreview.tsx', 'utf8');

if (!code.includes('Check,')) {
    code = code.replace("import { Download, Edit2, Mail, FileText } from 'lucide-react';", "import { Download, Edit2, Mail, FileText, Check } from 'lucide-react';");
    code = code.replace("import { Download, Edit2, FileText } from 'lucide-react';", "import { Download, Edit2, FileText, Check } from 'lucide-react';");
}

code = code.replace(
  '<span className="text-emerald-600 font-bold shrink-0 mt-0.5">✓</span>',
  '<Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />'
);

code = code.replace(
  '<p key={i} className="text-[11px] text-[#1e293b] font-medium">✓ {d}</p>',
  '<p key={i} className="text-[11px] text-[#1e293b] font-medium flex items-center gap-1.5"><Check className="w-3 h-3 text-emerald-600 shrink-0" /> <span>{d}</span></p>'
);

fs.writeFileSync('src/offertool/components/QuotePreview.tsx', code);
