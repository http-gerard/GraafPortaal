const fs = require('fs');
let code = fs.readFileSync('src/offertool/components/QuotePreview.tsx', 'utf8');

// Fix 1: Table header
code = code.replace(
  '<tr className="border-b-2 border-slate-900 text-white">',
  '<tr className="border-b-2 border-slate-900 text-slate-900">'
);

// Fix 2: Signature text field which has bg-white text-white
code = code.replace(
  '<div className="h-14 bg-white px-4 rounded-md border border-emerald-200 flex items-center font-serif italic text-lg text-white">',
  '<div className="h-14 bg-white px-4 rounded-md border border-emerald-200 flex items-center font-serif italic text-lg text-slate-900">'
);

// Fix 3: Let's check line 311
code = code.replace(
  '<span className="font-semibold text-white block text-[11px]">',
  '<span className="font-semibold text-slate-900 block text-[11px]">'
);

fs.writeFileSync('src/offertool/components/QuotePreview.tsx', code);
