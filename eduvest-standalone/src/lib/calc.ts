export function currency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(n);
}

export function computeHealthScore(dts: number): number {
  return Math.max(1, Math.min(100, Math.round(100 - dts * 25)));
}

export function healthLabel(score: number) {
  if (score >= 90) return { label: "Excellent Value", shortLabel: "Excellent", textColor: "#065f46", bgColor: "#ecfdf5", barColor: "#10b981", badgeCls: "bg-emerald-100 text-emerald-800" };
  if (score >= 75) return { label: "Good Value", shortLabel: "Good", textColor: "#1e40af", bgColor: "#eff6ff", barColor: "#3b82f6", badgeCls: "bg-blue-100 text-blue-800" };
  if (score >= 60) return { label: "Moderate Risk", shortLabel: "Moderate", textColor: "#92400e", bgColor: "#fffbeb", barColor: "#f59e0b", badgeCls: "bg-amber-100 text-amber-800" };
  return { label: "High Financial Risk", shortLabel: "High Risk", textColor: "#991b1b", bgColor: "#fef2f2", barColor: "#ef4444", badgeCls: "bg-red-100 text-red-800" };
}

export interface CalcResult {
  netYearlyCost: number;
  totalDebt: number;
  monthlyPayment: number;
  breakEvenYears: number;
  debtToSalary: number;
  salary: number;
  outlook: "green" | "yellow" | "red";
  healthScore: number;
  year5Salary: number;
  year10Salary: number;
}

export function computeResult(
  tuition: number,
  scholarships: number,
  salary: number,
  interestRate: number,
  growthRate: number
): CalcResult {
  const netYearlyCost = Math.max(0, tuition - scholarships);
  const totalDebt = netYearlyCost * 4;
  const rate = interestRate / 100;
  const monthlyRate = rate / 12;
  const n = 120;
  const monthlyPayment =
    monthlyRate > 0 && totalDebt > 0
      ? (totalDebt * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1)
      : totalDebt / n;
  const dts = salary > 0 ? totalDebt / salary : Infinity;
  const breakEvenYears = salary > 0 ? totalDebt / salary : 0;
  const outlook: CalcResult["outlook"] = dts <= 1 ? "green" : dts <= 2 ? "yellow" : "red";
  const healthScore = computeHealthScore(dts === Infinity ? 4 : dts);
  const g = growthRate / 100;
  const year5Salary = salary * Math.pow(1 + g, 5);
  const year10Salary = salary * Math.pow(1 + g, 10);
  return { netYearlyCost, totalDebt, monthlyPayment, breakEvenYears, debtToSalary: dts, salary, outlook, healthScore, year5Salary, year10Salary };
}

export const outlookConfig = {
  green: { label: "Low Debt Burden", bg: "bg-emerald-50", border: "border-emerald-200", badge: "bg-emerald-100 text-emerald-800", dot: "bg-emerald-500", text: "text-emerald-700", subtitle: "Debt is well within range of expected income." },
  yellow: { label: "Moderate Risk", bg: "bg-amber-50", border: "border-amber-200", badge: "bg-amber-100 text-amber-800", dot: "bg-amber-500", text: "text-amber-700", subtitle: "Manageable — budget carefully after graduation." },
  red: { label: "High Risk", bg: "bg-red-50", border: "border-red-200", badge: "bg-red-100 text-red-800", dot: "bg-red-500", text: "text-red-700", subtitle: "Debt significantly exceeds expected income." },
};
