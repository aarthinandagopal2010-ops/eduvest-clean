import { useState } from "react";
import { Award, BarChart2, Bookmark, BookOpen, DollarSign } from "lucide-react";
import Calculator from "./pages/Calculator";
import Compare from "./pages/Compare";
import Scholarships from "./pages/Scholarships";
import Learn from "./pages/Learn";
import Saved from "./pages/Saved";

type Tab = "calculator" | "compare" | "scholarships" | "learn" | "saved";

const NAV = [
  { id: "calculator" as Tab, label: "Calculator", icon: DollarSign, desc: "Single ROI" },
  { id: "compare"    as Tab, label: "Compare",    icon: BarChart2,  desc: "Up to 5 schools" },
  { id: "scholarships" as Tab, label: "Scholarships", icon: Award, desc: "Track awards" },
  { id: "learn"      as Tab, label: "Learn",      icon: BookOpen,   desc: "Financial basics" },
  { id: "saved"      as Tab, label: "Saved",      icon: Bookmark,   desc: "Your history" },
];

export default function App() {
  const [tab, setTab] = useState<Tab>("calculator");

  return (
    <div className="flex min-h-screen bg-background">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden lg:flex flex-col w-56 border-r border-border bg-card fixed top-0 left-0 h-full z-30 shadow-sm">
        {/* Logo */}
        <div className="px-5 py-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-sm">
              <BookOpen size={16} className="text-white" />
            </div>
            <div>
              <div className="font-bold text-primary text-base leading-tight">EduVest</div>
              <div className="text-[11px] text-muted-foreground leading-tight">College Finance</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 flex flex-col gap-0.5 overflow-y-auto">
          {NAV.map(({ id, label, icon: Icon, desc }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                tab === id
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              <Icon size={17} className="flex-shrink-0" />
              <div>
                <div className="leading-tight">{label}</div>
                <div className={`text-[10px] font-normal leading-tight ${tab === id ? "text-primary/70" : "text-muted-foreground/70"}`}>{desc}</div>
              </div>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-border">
          <p className="text-[10px] text-muted-foreground leading-relaxed">Estimates for planning only. Consult a financial advisor.</p>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 lg:ml-56 flex flex-col min-h-screen">
        {/* Mobile header */}
        <header className="lg:hidden sticky top-0 z-20 bg-card border-b border-border shadow-sm">
          <div className="flex items-center gap-3 px-4 py-3">
            <div className="w-8 h-8 rounded-xl bg-primary flex items-center justify-center">
              <BookOpen size={14} className="text-white" />
            </div>
            <span className="font-bold text-primary text-base">EduVest</span>
          </div>
          <div className="flex overflow-x-auto border-t border-border">
            {NAV.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={`flex-shrink-0 flex flex-col items-center gap-0.5 px-4 py-2 text-xs font-medium transition-all border-b-2 ${
                  tab === id ? "border-primary text-primary" : "border-transparent text-muted-foreground"
                }`}
              >
                <Icon size={15} />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-4 lg:p-8 max-w-5xl mx-auto w-full">
          {tab === "calculator"   && <Calculator />}
          {tab === "compare"      && <Compare />}
          {tab === "scholarships" && <Scholarships />}
          {tab === "learn"        && <Learn />}
          {tab === "saved"        && <Saved />}
        </main>
      </div>
    </div>
  );
}
