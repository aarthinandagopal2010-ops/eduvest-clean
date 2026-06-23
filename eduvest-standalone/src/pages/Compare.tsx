import { useState } from "react";
import { Bookmark, Check, ChevronDown, ChevronUp, Plus, RefreshCw, X } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { currency, computeResult, healthLabel, outlookConfig } from "../lib/calc";
import { useSavedCalcs } from "../hooks/useSavedCalcs";

interface CollegeForm { id: string; name: string; tuition: string; scholarships: string; salary: string; interestRate: string; }
interface CollegeResult extends ReturnType<typeof computeResult> { id: string; name: string; rank: number; color: string; }

const PALETTE = ["#7c3aed", "#db2777", "#d97706", "#0891b2", "#16a34a"];
const RANK_BADGES = ["🥇", "🥈", "🥉", "4th", "5th"];

function newForm(): CollegeForm {
  return { id: Date.now().toString() + Math.random().toString(36).substring(2, 6), name: "", tuition: "", scholarships: "", salary: "", interestRate: "5" };
}

function validate(forms: CollegeForm[]) {
  const errs: Record<string, Partial<Record<keyof CollegeForm, string>>> = {};
  for (const f of forms) {
    const e: Partial<Record<keyof CollegeForm, string>> = {};
    const t = parseFloat(f.tuition), sc = parseFloat(f.scholarships), sal = parseFloat(f.salary), r = parseFloat(f.interestRate);
    if (!f.tuition || isNaN(t) || t < 0) e.tuition = "Required";
    if (f.scholarships && (isNaN(sc) || sc < 0)) e.scholarships = "Invalid";
    if (!f.salary || isNaN(sal) || sal <= 0) e.salary = "Required";
    if (f.interestRate && (isNaN(r) || r < 0 || r > 100)) e.interestRate = "0–100";
    if (Object.keys(e).length) errs[f.id] = e;
  }
  return errs;
}

function Field({ label, prefix, suffix, value, onChange, placeholder, error, compact }: {
  label: string; prefix?: string; suffix?: string; value: string; onChange: (v: string) => void;
  placeholder?: string; error?: string; compact?: boolean;
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className={`font-semibold text-foreground ${compact ? "text-xs" : "text-sm"}`}>{label}</label>
      <div className={`flex items-center border rounded-xl bg-background transition-all focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary ${error ? "border-destructive" : "border-border"}`}>
        {prefix && <span className="pl-2.5 pr-1 text-muted-foreground text-xs select-none">{prefix}</span>}
        <input type="number" min="0" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder ?? "0"}
          className={`flex-1 bg-transparent outline-none text-foreground placeholder:text-border [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none ${compact ? "py-2 px-2 text-xs" : "py-3 px-3 text-sm"}`} />
        {suffix && <span className="pr-2.5 pl-1 text-muted-foreground text-xs select-none">{suffix}</span>}
      </div>
      {error && <p className="text-[10px] text-destructive">{error}</p>}
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

export default function Compare() {
  const [forms, setForms] = useState<CollegeForm[]>([newForm(), newForm()]);
  const [errors, setErrors] = useState<Record<string, Partial<Record<keyof CollegeForm, string>>>>({});
  const [results, setResults] = useState<CollegeResult[] | null>(null);
  const [saved, setSaved] = useState(false);
  const [showOpp, setShowOpp] = useState(false);
  const { saveCalc } = useSavedCalcs();

  function setField(id: string, key: keyof CollegeForm) {
    return (val: string) => {
      setForms((p) => p.map((f) => (f.id === id ? { ...f, [key]: val } : f)));
      setErrors((p) => { const n = { ...p }; if (n[id]) n[id] = { ...n[id], [key]: undefined }; return n; });
    };
  }

  function addCollege() { if (forms.length >= 5) return; setForms((p) => [...p, newForm()]); }
  function removeCollege(id: string) { setForms((p) => p.filter((f) => f.id !== id)); setResults(null); setSaved(false); setShowOpp(false); }

  function handleCompare() {
    const errs = validate(forms);
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    const sorted: CollegeResult[] = forms
      .map((f, i) => ({
        ...computeResult(parseFloat(f.tuition) || 0, parseFloat(f.scholarships) || 0, parseFloat(f.salary) || 0, parseFloat(f.interestRate) || 5, 3),
        id: f.id, name: f.name || `College ${i + 1}`, color: PALETTE[i % PALETTE.length], rank: 0,
      }))
      .sort((a, b) => a.debtToSalary - b.debtToSalary)
      .map((r, i) => ({ ...r, rank: i + 1 }));
    setResults(sorted);
    setSaved(false);
    setShowOpp(false);
  }

  function handleReset() { setForms([newForm(), newForm()]); setErrors({}); setResults(null); setSaved(false); setShowOpp(false); }

  function handleSave() {
    if (!results?.length) return;
    const best = results[0];
    const names = results.map((r) => r.name).join(", ");
    saveCalc({ type: "compare", title: names.length > 35 ? `${results.length} Colleges` : names, outlook: best.outlook, totalDebt: best.totalDebt, salary: best.salary, monthlyPayment: best.monthlyPayment, breakEvenYears: best.breakEvenYears, collegeCount: results.length });
    setSaved(true);
  }

  // Chart: one group per college
  const chartData = results ? results.map((r) => ({
    name: r.name.length > 10 ? r.name.slice(0, 10) + "…" : r.name,
    "Total Debt": r.totalDebt,
    "Year 1 Salary": r.salary,
  })) : [];

  const opp = results && results.length >= 2 ? {
    first: results[0], second: results[1],
    debtDiff: results[1].totalDebt - results[0].totalDebt,
    monthlyDiff: results[1].monthlyPayment - results[0].monthlyPayment,
    breakEvenDiff: results[1].breakEvenYears - results[0].breakEvenYears,
  } : null;

  const okMap = {
    green: { badge: "bg-emerald-100 text-emerald-800", label: "Low Burden" },
    yellow: { badge: "bg-amber-100 text-amber-800", label: "Moderate" },
    red: { badge: "bg-red-100 text-red-800", label: "High Risk" },
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">College Comparison</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Compare up to 5 colleges side-by-side, ranked by financial outcome.</p>
      </div>

      {/* College forms */}
      <div className="flex flex-col gap-4">
        {forms.map((form, idx) => {
          const color = PALETTE[idx % PALETTE.length];
          const formErr = errors[form.id] ?? {};
          return (
            <div key={form.id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4" style={{ borderLeft: `4px solid ${color}`, boxShadow: "0 4px 24px 0 rgba(0,0,0,0.05)" }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ background: color }} />
                  <span className="text-sm font-semibold text-foreground">College {idx + 1}</span>
                </div>
                {forms.length > 2 && (
                  <button onClick={() => removeCollege(form.id)} className="flex items-center gap-1 text-xs text-muted-foreground hover:text-destructive transition-colors px-2 py-1 rounded-lg hover:bg-destructive/5">
                    <X size={13} /> Remove
                  </button>
                )}
              </div>
              <input type="text" value={form.name} onChange={(e) => setForms((p) => p.map((f) => (f.id === form.id ? { ...f, name: e.target.value } : f)))}
                placeholder="College name"
                className="border border-border rounded-xl py-2.5 px-3.5 text-sm bg-background outline-none text-foreground placeholder:text-border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Field label="Annual Tuition" prefix="$" value={form.tuition} onChange={setField(form.id, "tuition")} placeholder="35,000" error={formErr.tuition} compact />
                <Field label="Scholarships/yr" prefix="$" value={form.scholarships} onChange={setField(form.id, "scholarships")} placeholder="10,000" error={formErr.scholarships} compact />
                <Field label="Exp. Salary" prefix="$" value={form.salary} onChange={setField(form.id, "salary")} placeholder="55,000" error={formErr.salary} compact />
                <Field label="Interest %" suffix="%" value={form.interestRate} onChange={setField(form.id, "interestRate")} placeholder="5" error={formErr.interestRate} compact />
              </div>
            </div>
          );
        })}
      </div>

      {forms.length < 5 && (
        <button onClick={addCollege} className="flex items-center justify-center gap-2 py-3.5 border-2 border-dashed border-border rounded-2xl text-sm font-medium text-muted-foreground hover:border-primary/40 hover:text-primary hover:bg-primary/5 transition-all">
          <Plus size={17} /> Add College ({forms.length}/5)
        </button>
      )}

      <div className="flex gap-3">
        <button onClick={handleCompare} className="flex-1 bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-6 rounded-xl text-sm transition-colors shadow-sm">Compare All</button>
        <button onClick={handleReset} className="flex items-center gap-2 px-4 py-3 border border-border hover:bg-muted text-muted-foreground rounded-xl text-sm transition-colors"><RefreshCw size={15} /></button>
      </div>

      {/* Results */}
      {results && (
        <div className="flex flex-col gap-5 animate-in fade-in slide-in-from-bottom-3 duration-500">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-5 rounded-full bg-primary" />
            <h2 className="text-base font-semibold text-foreground">Ranked Results <span className="text-xs font-normal text-muted-foreground ml-1">best to worst</span></h2>
          </div>

          {/* Ranked cards */}
          <div className="flex flex-col gap-3">
            {results.map((r, i) => {
              const hl = healthLabel(r.healthScore);
              const ok = okMap[r.outlook];
              return (
                <div key={r.id} className={`bg-card rounded-2xl border p-5 flex flex-col gap-4 ${i === 0 ? "border-primary/40 shadow-md" : "border-border"}`} style={{ borderLeft: `4px solid ${r.color}`, ...(i === 0 ? { boxShadow: "0 4px 24px 0 rgba(124,58,237,0.10)" } : {}) }}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{RANK_BADGES[i]}</span>
                      <div>
                        <div className="font-bold text-foreground text-base">{r.name}</div>
                        {i === 0 && <div className="text-xs font-semibold text-primary mt-0.5">Best Choice</div>}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${ok.badge}`}>{ok.label}</span>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full" style={{ backgroundColor: hl.bgColor, color: hl.textColor }}>{hl.shortLabel} · {r.healthScore}/100</span>
                    </div>
                  </div>

                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {[
                      { label: "Net/Year", value: currency(r.netYearlyCost) },
                      { label: "Total Debt", value: currency(r.totalDebt) },
                      { label: "Monthly Pay.", value: currency(r.monthlyPayment) },
                      { label: "Break-Even", value: `${r.breakEvenYears.toFixed(1)} yrs` },
                    ].map((s) => (
                      <div key={s.label} className="bg-muted/50 rounded-xl p-3">
                        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{s.label}</p>
                        <p className="text-sm font-bold text-foreground mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>

                  {/* DTS bar */}
                  <div>
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>Debt-to-salary ratio</span>
                      <span className="font-semibold">{r.debtToSalary === Infinity ? "N/A" : `${r.debtToSalary.toFixed(2)}×`}</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div className="h-2 rounded-full" style={{ width: `${Math.min(100, (r.debtToSalary / 3) * 100)}%`, backgroundColor: r.outlook === "green" ? "#10b981" : r.outlook === "yellow" ? "#f59e0b" : "#ef4444" }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Comparison chart */}
          {results.length >= 2 && (
            <div className="bg-card rounded-2xl border border-border p-5" style={{ boxShadow: "0 4px 24px 0 rgba(0,0,0,0.05)" }}>
              <h3 className="text-sm font-semibold text-foreground">Debt vs. Salary Comparison</h3>
              <p className="text-xs text-muted-foreground mb-4">Total debt and first-year salary across all colleges</p>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={chartData} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#9ca3af", fontFamily: "Poppins" }} axisLine={false} tickLine={false} />
                  <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 10, fill: "#9ca3af" }} axisLine={false} tickLine={false} width={44} />
                  <Tooltip content={<ChartTooltip />} cursor={{ fill: "rgba(124,58,237,0.04)", radius: 8 }} />
                  <Legend wrapperStyle={{ fontSize: 12, fontFamily: "Poppins" }} />
                  <Bar dataKey="Total Debt" fill="#7c3aed" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="Year 1 Salary" fill="#10b981" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Opportunity Cost */}
          {opp && (
            <div className="flex flex-col gap-0">
              <button onClick={() => setShowOpp((v) => !v)}
                className="flex items-center justify-between w-full px-5 py-3.5 bg-primary/5 rounded-t-2xl border border-primary/20 text-sm font-semibold text-primary hover:bg-primary/10 transition-colors">
                <span>Opportunity Cost Calculator</span>
                {showOpp ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
              {showOpp && (
                <div className="bg-card border border-t-0 border-primary/20 rounded-b-2xl p-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <p className="text-sm text-foreground">
                    Choosing <span className="font-bold" style={{ color: opp.second.color }}>{opp.second.name}</span> over{" "}
                    <span className="font-bold" style={{ color: opp.first.color }}>{opp.first.name}</span> means:
                  </p>
                  <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-sm text-amber-800 font-medium">
                    This choice costs <span className="font-bold">{currency(Math.abs(opp.debtDiff))}</span> more over four years.
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                      { label: "Additional Debt", value: `+${currency(Math.abs(opp.debtDiff))}` },
                      { label: "Extra Monthly Payment", value: `+${currency(Math.abs(opp.monthlyDiff))}` },
                      { label: "Longer Break-Even", value: `+${Math.abs(opp.breakEvenDiff).toFixed(1)} years` },
                    ].map((s) => (
                      <div key={s.label} className="bg-red-50 border border-red-100 rounded-xl p-3 text-center">
                        <p className="text-xs font-semibold text-muted-foreground">{s.label}</p>
                        <p className="text-base font-bold text-destructive mt-0.5">{s.value}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Save */}
          <div className="flex justify-end">
            <button onClick={handleSave} disabled={saved}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border-2 transition-all ${saved ? "border-border bg-muted text-muted-foreground cursor-default" : "border-primary/40 bg-primary/5 text-primary hover:bg-primary/10"}`}>
              {saved ? <Check size={15} /> : <Bookmark size={15} />}
              {saved ? "Saved!" : "Save Comparison"}
            </button>
          </div>

          <p className="text-xs text-center text-muted-foreground">Estimates are for planning purposes only. Consult a financial advisor for personalized advice.</p>
        </div>
      )}
    </div>
  );
}
