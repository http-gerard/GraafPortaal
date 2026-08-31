export const formatNumber = (val: number | undefined | null, minimumFractionDigits: number = 0): string => {
  const num = typeof val === 'number' && !isNaN(val) ? val : Number(val) || 0;
  return num.toLocaleString('nl-NL', { minimumFractionDigits });
};

export const formatCurrency = (val: number | undefined | null, minimumFractionDigits: number = 2): string => {
  const num = typeof val === 'number' && !isNaN(val) ? val : Number(val) || 0;
  return `€ ${num.toLocaleString('nl-NL', { minimumFractionDigits })}`;
};
