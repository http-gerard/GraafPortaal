const fs = require('fs');
let code = fs.readFileSync('src/offertool/components/BuilderView.tsx', 'utf8');

// 1. Calculations at the top
code = code.replace(
  "const monthlyItems = selectedItems.filter(i => i.billingType === 'monthly');",
  "const monthlyItems = selectedItems.filter(i => i.billingType === 'monthly');\n  const yearlyItems = selectedItems.filter(i => i.billingType === 'yearly');"
);
code = code.replace(
  "const monthlySubtotal = monthlyItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);",
  "const monthlySubtotal = monthlyItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);\n  const yearlySubtotal = yearlyItems.reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);"
);

// 2. Category totals
code = code.replace(
  "const catTotalMonthly = selectedCatItems\n              .filter(i => i.billingType === 'monthly')\n              .reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);",
  "const catTotalMonthly = selectedCatItems\n              .filter(i => i.billingType === 'monthly')\n              .reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);\n\n            const catTotalYearly = selectedCatItems\n              .filter(i => i.billingType === 'yearly')\n              .reduce((acc, curr) => acc + ((Number(curr.price) || 0) * (Number(curr.quantity) || 1)), 0);"
);

// 3. Category Header displays
code = code.replace(
  "{catTotalMonthly > 0 && <span className=\"text-slate-500 font-medium text-[11px]\"> + € {catTotalMonthly.toLocaleString('nl-BE')}/mnd</span>}",
  "{catTotalMonthly > 0 && <span className=\"text-slate-500 font-medium text-[11px]\"> + € {catTotalMonthly.toLocaleString('nl-BE')}/mnd</span>}\n                  {catTotalYearly > 0 && <span className=\"text-slate-500 font-medium text-[11px]\"> + € {catTotalYearly.toLocaleString('nl-BE')}/jaar</span>}"
);

// 4. Update the select for billingType to include Yearly, and make it a <select> if it's recurring!
// Let's find where {item.billingType === 'monthly'} is rendered
const monthlyBadgeRegex = /\{item\.billingType === 'monthly' && \(\s*<span className="text-\[10px\] font-bold px-1\.5 py-0\.2 rounded bg-amber-50 text-amber-800 border border-amber-200 shrink-0">\s*Maandelijks\s*<\/span>\s*\)\}/g;
code = code.replace(monthlyBadgeRegex, `{(item.billingType === 'monthly' || item.billingType === 'yearly') && (
  <select
    value={item.billingType}
    onChange={(e) => handleUpdateItemField(item.id, 'billingType', e.target.value as any)}
    className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 shrink-0 focus:outline-none focus:ring-1 focus:ring-amber-500 cursor-pointer appearance-none"
  >
    <option value="monthly">Maandelijks</option>
    <option value="yearly">Jaarlijks</option>
  </select>
)}`);

// 5. Grand Totals Panel
const totalsRegex = /<div className="flex justify-between items-center pt-2 mt-2 border-t border-slate-200">/g;
// We'll just replace the whole summary block if needed, but let's check if we can insert it.
// We'll insert it manually using Python if it's easier, or here with a unique anchor.

fs.writeFileSync('src/offertool/components/BuilderView.tsx', code);
