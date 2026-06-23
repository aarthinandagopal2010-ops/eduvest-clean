import { useState } from "react";
import { Bookmark, Check, RefreshCw, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { currency, computeResult, healthLabel, outlookConfig } from "../lib/calc";
import { useSavedCalcs } from "../hooks/useSavedCalcs";

interface Form {
  collegeName: string;
  tuition: string;
  scholarships: string;
  salary: string;
  interestRate: string;
  growthRate: string;
}

const BLANK: Form = { collegeName: "", tuition: "", scholarships: "", salary: "", interestRate: "5", growthRate: "3" };

function Field({ label, hint, prefix, suffix, value, onChange, placeholder, error }: {
  label: string; hint?: string; prefix?: string; suffix?: string; value: string;
  onChange: (v: string) => void; placeholder?: string; error?: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-semibold text-foreground">{label}</label>
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
      <div className={`flex items-center border rounded-xl bg-background transition-all focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary ${error ? "border-destructive" : "border-border"}`}>
        {prefix && <span className="pl-3 pr-1 text-muted-foreground text-sm select-none">{prefix}</span>}
        <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "0"}
          className="flex-1 bg-transparent outline-none text-foreground placeholder:text-border py-3 px-3 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        {suffix && <span className="pr-3 pl-1 text-muted-foreground text-sm select-none">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

function StatCard({ label, value, sub, highlight }: { label: string; value: string; sub?: string; highlight?: boolean }) {
  return (
    <div className={`rounded-2xl border p-4 flex flex-col gap-1 ${highlight ? "bg-primary/5 border-primary/30" : "bg-card border-border"}`}
      style={{ boxShadow: "0 1px 6px 0 rgba(0,0,0,0.04)" }}>
      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? "text-primary" : "text-foreground"}`}>{value}</p>
      {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
    </div>
  );
}

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-xl px-4 py-3 shadow-lg">
      <p className="text-xs font-semibold text-muted-foreground mb-1">{label}</p>
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-2 text-sm">
          <div className="w-2.5 h-2.5 rounded-sm" style={{ background: p.fill || p.color }} />
          <span className="text-muted-foreground">{p.name}:</span>
          <span className="font-bold text-foreground">{currency(p.value)}</span>
        </div>
      ))}
    </div>
  );
};

export default function Calculator() {
  const [form, setForm] = useState<Form>(BLANK);
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [result, setResult] = useState<ReturnType<typeof computeResult> | null>(null);
  const [collegeName, setCollegeName] = useState("");
  const [saved, setSaved] = useState(false);
  const { saveCalc } = useSavedCalcs();

  function setField(k: keyof Form) { return (v: string) => { setForm((p) => ({ ...p, [k]: v })); setErrors((p) => ({ ...p, [k]: undefined })); }; }

  function validate(): boolean {
    const e: Partial<Record<keyof Form, string>> = {};
    const t = parseFloat(form.tuition), sc = parseFloat(form.scholarships), sal = parseFloat(form.salary), r = parseFloat(form.interestRate), gr = parseFloat(form.growthRate);
    if (!form.tuition || isNaN(t) || t < 0) e.tuition = "Required";
    if (form.scholarships && (isNaN(sc) || sc < 0)) e.scholarships = "Invalid";
    if (!form.salary || isNaN(sal) || sal <= 0) e.salary = "Required";
    if (form.interestRate && (isNaN(r) || r < 0 || r > 100)) e.interestRate = "0–100";
    if (form.growthRate && (isNaN(gr) || gr < 0 || gr > 50)) e.growthRate = "0–50";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleCalculate() {
    if (!validate()) return;
    setResult(computeResult(
      parseFloat(form.tuition) || 0,
      parseFloat(form.scholarships) || 0,
      parseFloat(form.salary) || 0,
      parseFloat(form.interestRate) || 5,
      parseFloat(form.growthRate) || 3,
    ));
    setCollegeName(form.collegeName || "Your College");
    setSaved(false);
  }

  function handleReset() { setForm(BLANK); setErrors({}); setResult(null); setCollegeName(""); setSaved(false); }

  function handleSave() {
    if (!result) return;
    saveCalc({ type: "single", title: collegeName, outlook: result.outlook, totalDebt: result.totalDebt, salary: result.salary, monthlyPayment: result.monthlyPayment, breakEvenYears: result.breakEvenYears });
    setSaved(true);
  }

  const hl = result ? healthLabel(result.healthScore) : null;
  const ok = result ? outlookConfig[result.outlook] : null;

  const debtSalaryChart = result ? [
    { name: "Total Debt", value: result.totalDebt, fill: "#7c3aed" },
    { name: "Year 1 Salary", value: result.salary, fill: "#10b981" },
  ] : [];

  const growthChart = result ? [
    { name: "Year 1", value: result.salary },
    { name: "Year 5", value: result.year5Salary },
    { name: "Year 10", value: result.year10Salary },
  ] : [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ROI Calculator</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Estimate the financial impact of a single college choice.</p>
      </div>

      {/* Form + Score side by side on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        {/* Form */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border p-6 flex flex-col gap-5" style={{ boxShadow: "0 4px 24px 0 rgba(124,58,237,0.06)" }}>
          <div>
            <h2 className="text-base font-semibold text-foreground">College Details</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Fill in the fields below, then click Calculate ROI.</p>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-foreground">College Name</label>
            <input type="text" value={form.collegeName} onChange={(e) => setForm((p) => ({ ...p, collegeName: e.target.value }))}
              placeholder="e.g. State University"
              className="border border-border rounded-xl py-3 px-3.5 text-sm bg-background outline-none text-foreground placeholder:text-border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Annual Tuition" hint="Total cost per year" prefix="$" value={form.tuition} onChange={setField("tuition")} placeholder="35,000" error={errors.tuition} />
            <Field label="Scholarships & Grants/yr" hint="Aid that's not repaid" prefix="$" value={form.scholarships} onChange={setField("scholarships")} placeholder="10,000" error={errors.scholarships} />
            <Field label="Expected Starting Salary" hint="After graduation" prefix="$" value={form.salary} onChange={setField("salary")} placeholder="55,000" error={errors.salary} />
            <Field label="Loan Interest Rate" hint="Federal average ~5–7%" suffix="%" value={form.interestRate} onChange={setField("interestRate")} placeholder="5" error={errors.interestRate} />
            <Field label="Annual Salary Growth" hint="Expected raise % per year" suffix="%" value={form.growthRate} onChange={setField("growthRate")} placeholder="3" error={errors.growthRate} />
          </div>

          <div className="flex gap-3">
            <button onClick={handleCalculate}
              className="flex-1 bg-primary hover:bg-primary/90 active:bg-primary/80 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors shadow-sm">
              Calculate ROI
            </button>
            <button onClick={handleReset}
              className="flex items-center gap-2 px-4 py-3 border border-border hover:bg-muted text-muted-foreground font-medium rounded-xl text-sm transition-colors">
              <RefreshCw size={15} />
            </button>
          </div>
        </div>

        {/* Health Score card */}
        {result && hl ? (
          <div className="lg:col-span-2 rounded-2xl border p-6 flex flex-col gap-4" style={{ backgroundColor: hl.bgColor, borderColor: `${hl.textColor}33`, boxShadow: "0 4px 24px 0 rgba(124,58,237,0.07)" }}>
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: hl.textColor }}>Financial Health Score</p>
              <div className="flex items-end gap-1 mt-1">
                <span className="text-6xl font-bold" style={{ color: hl.textColor }}>{result.healthScore}</span>
                <span className="text-xl mb-2" style={{ color: hl.textColor }}>/100</span>
              </div>
              <span className="inline-block text-sm font-bold" style={{ color: hl.textColor }}>{hl.label}</span>
            </div>
            <div className="bg-black/10 rounded-full h-2.5 overflow-hidden">
              <div className="h-2.5 rounded-full transition-all duration-700" style={{ width: `${result.healthScore}%`, backgroundColor: hl.barColor }} />
            </div>
            <div className="text-xs space-y-1.5" style={{ color: hl.textColor }}>
              <div className="flex justify-between"><span>90–100</span><span className="font-semibold">Excellent Value</span></div>
              <div className="flex justify-between"><span>75–89</span><span className="font-semibold">Good Value</span></div>
              <div className="flex justify-between"><span>60–74</span><span className="font-semibold">Moderate Risk</span></div>
              <div className="flex justify-between"><span>Below 60</span><span className="font-semibold">High Financial Risk</span></div>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-2 rounded-2xl border border-dashed border-border p-6 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <TrendingUp size={22} className="text-primary" />
            </div>
            <div>
              <p className="text-sm font-semibold text-foreground">Financial Health Score</p>
              <p className="text-xs text-muted-foreground mt-0.5">Fill in the form and calculate to see your score.</p>
            </div>
          </div>
        )}
      </div>

      {/* Results */}
      {result && ok && (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          {/* Stats grid */}
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">Results for <span className="text-primary">{collegeName}</span></h2>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <StatCard label="Net Yearly Cost" value={currency(result.netYearlyCost)} sub="Tuition minus aid" />
            <StatCard label="Total 4-Year Cost" value={currency(result.totalDebt)} sub="Before interest" />
            <StatCard label="Estimated Debt" value={currency(result.totalDebt)} sub="Principal borrowed" highlight />
            <StatCard label="Monthly Payment" value={currency(result.monthlyPayment)} sub="10-yr repayment" />
            <StatCard label="Break-Even Time" value={`${result.breakEvenYears.toFixed(1)} yrs`} sub="Debt ÷ annual salary" />
            <StatCard label="Starting Salary" value={currency(result.salary)} sub="Expected pay" />
          </div>

          {/* Outlook badge */}
          <div className={`rounded-2xl border p-5 flex items-start gap-4 ${ok.bg} ${ok.border}`}>
            <div className={`mt-1 w-3 h-3 rounded-full flex-shrink-0 ${ok.dot}`} />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${ok.badge}`}>Financial Outlook</span>
                <span className="text-sm font-bold text-foreground">{ok.label}</span>
              </div>
              <p className={`text-sm mt-1 ${ok.text}`}>{ok.subtitle}</p>
            </div>
          </div>

          {/* Charts side by side */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Debt vs Salary */}
            <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-semibold text-foreground">Debt vs. First-Year Salary</h3>
              <p className="text-xs text-muted-foreground mb-4">What you'll owe compared to what you'll earn</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={debtSalaryChart} barSize={56} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(124,58,237,0.04)", radius: 8 }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {debtSalaryChart.map((e, i) => <Cell key={i} fill={e.fill} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Salary Growth */}
            <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.05)" }}>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-foreground">Salary Growth Projection</h3>
                <TrendingUp size={14} className="text-primary" />
              </div>
              <p className="text-xs text-muted-foreground mb-4">At {form.growthRate || 3}% annual growth over 10 years</p>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={growthChart} barSize={48} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => v >= 1000 ? `$${(v / 1000).toFixed(0)}k` : `$${v}`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={48} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(124,58,237,0.04)", radius: 8 }} />
                  <Bar dataKey="value" name="Salary" fill="#7c3aed" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <p className="text-xs text-muted-foreground mt-3 text-center">
                Grows from <span className="font-semibold text-primary">{currency(result.salary)}</span> → <span className="font-semibold text-primary">{currency(result.year10Salary)}</span> by Year 10
              </p>
            </div>
          </div>

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saved}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${saved ? "border-border bg-muted text-muted-foreground cursor-default" : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"}`}>
              {saved ? <Check size={15} /> : <Bookmark size={15} />}
              {saved ? "Saved!" : "Save Calculation"}
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground">Estimates are for planning purposes only. Consult a financial advisor for personalized advice.</p>
        </div>
      )}
    </div>
  );
}
