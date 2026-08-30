// বাংলা number formatting — backend keeps English digits, UI renders Bengali
const enToBnMap: Record<string, string> = {
  "0": "০",
  "1": "১",
  "2": "২",
  "3": "৩",
  "4": "৪",
  "5": "৫",
  "6": "৬",
  "7": "৭",
  "8": "৮",
  "9": "৯",
};

export function toBnDigits(input: string | number): string {
  return String(input).replace(/[0-9]/g, (d) => enToBnMap[d] ?? d);
}

export function toEnDigits(input: string): string {
  const bnToEn: Record<string, string> = Object.fromEntries(
    Object.entries(enToBnMap).map(([k, v]) => [v, k])
  );
  return input.replace(/[০-৯]/g, (d) => bnToEn[d] ?? d);
}

export function formatCurrency(amount: number, useBn = true): string {
  const formatted = new Intl.NumberFormat("en-BD", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
  const withSymbol = `৳ ${formatted}`;
  return useBn ? toBnDigits(withSymbol) : withSymbol;
}

export function formatNumber(num: number, useBn = true): string {
  const formatted = new Intl.NumberFormat("en-BD").format(num);
  return useBn ? toBnDigits(formatted) : formatted;
}

export function formatDate(date: string | Date, useBn = true): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const formatted = d.toLocaleDateString("en-GB"); // dd/mm/yyyy
  return useBn ? toBnDigits(formatted) : formatted;
}
