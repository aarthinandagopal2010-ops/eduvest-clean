import { BarChart2, Bookmark, DollarSign, Trash2 } from "lucide-react";
import { currency } from "../lib/calc";
import { useSavedCalcs } from "../hooks/useSavedCalcs";

const outlookConfig = {
  green:  { badge: "bg-emerald-100 text-emerald-800", label: "Low Burden",  dot: "bg-emerald-500" },
  yellow: { badge: "bg-amber-100 text-amber-800",     label: "Moderate",    dot: "bg-amber-500"   },
  red:    { badge: "bg-red-100 text-red-800",          label: "High Risk",   dot: "bg-red-500"     },
};

export default function Saved() {
  const { saves, deleteCalc } = useSavedCalcs();

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Saved Calculations</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          {saves.length} saved {saves.length === 1 ? "calculation" : "calculations"} stored in your browser.
        </p>
      </div>

      {/* Empty state */}
      {saves.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Bookmark size={26} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No saved calculations yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">
              Use the <span className="font-semibold text-foreground">Calculator</span> or{" "}
              <span className="font-semibold text-foreground">Compare</span> tabs, then click
              {" "}<span className="font-semibold text-foreground">Save Calculation</span> to store results here.
            </p>
          </div>
        </div>
      )}

      {/* Saved list */}
      <div className="flex flex-col gap-3">
        {saves.map((entry) => {
          const ok = outlookConfig[entry.outlook];
          return (
            <div key={entry.id} className="bg-card rounded-2xl border border-border p-5 flex flex-col gap-4" style={{ boxShadow: "0 2px 12px 0 rgba(124,58,237,0.05)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-primary/10 text-primary">
                      {entry.type === "compare" ? <BarChart2 size={10} /> : <DollarSign size={10} />}
                      {entry.type === "compare" ? `Compare · ${entry.collegeCount ?? ""} colleges` : "Single"}
                    </span>
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <h3 className="font-bold text-foreground text-base leading-tight truncate">{entry.title}</h3>
                </div>
                <button onClick={() => deleteCalc(entry.id)} className="p-2 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive transition-colors flex-shrink-0">
                  <Trash2 size={15} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { label: "Total Debt", value: currency(entry.totalDebt) },
                  { label: "Monthly Pay.", value: currency(entry.monthlyPayment) },
                  { label: "Break-Even", value: `${entry.breakEvenYears.toFixed(1)} yrs` },
                ].map((stat) => (
                  <div key={stat.label} className="bg-muted/50 rounded-xl p-3">
                    <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
                    <p className="text-sm font-bold text-foreground mt-0.5">{stat.value}</p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <span className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full ${ok.badge}`}>
                  <span className={`w-2 h-2 rounded-full ${ok.dot}`} />
                  {ok.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {saves.length > 0 && (
        <p className="text-xs text-center text-muted-foreground">Calculations are stored locally in your browser and persist across sessions.</p>
      )}
    </div>
  );
}
