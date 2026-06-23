import { useState } from "react";
import { Award, ChevronRight, CreditCard, DollarSign, Percent, PieChart, Shield, TrendingUp } from "lucide-react";

interface Lesson {
  id: string;
  icon: React.ElementType;
  title: string;
  subtitle: string;
  color: string;
  bgColor: string;
  borderColor: string;
  summary: string;
  keyPoints: { emoji: string; text: string }[];
}

const LESSONS: Lesson[] = [
  {
    id: "loans", icon: CreditCard, title: "Student Loans", subtitle: "Understanding what you owe",
    color: "#7c3aed", bgColor: "#f5f3ff", borderColor: "#c4b5fd",
    summary: "Student loans let you borrow money for college and repay it — with interest — after graduation. Federal loans (backed by the government) typically offer lower rates and more protections than private loans.",
    keyPoints: [
      { emoji: "🏛️", text: "Federal loans don't require a credit check or co-signer" },
      { emoji: "📉", text: "Subsidized loans: interest doesn't accrue while you're in school" },
      { emoji: "📈", text: "Unsubsidized loans: interest starts accumulating immediately" },
      { emoji: "💡", text: "Only borrow what you need — every dollar compounds over time" },
      { emoji: "⚠️", text: "Private loans often have higher, variable interest rates" },
    ],
  },
  {
    id: "interest", icon: Percent, title: "Interest Rates", subtitle: "How your debt grows over time",
    color: "#db2777", bgColor: "#fdf2f8", borderColor: "#f9a8d4",
    summary: "Interest is the cost of borrowing money. Even a 1% rate difference can cost thousands over a 10-year repayment period. The lower your rate, the less you pay in total.",
    keyPoints: [
      { emoji: "🧮", text: "Interest = principal × rate × time — it adds up fast" },
      { emoji: "🔴", text: "Higher rate means more paid over the life of the loan" },
      { emoji: "✅", text: "Federal loan rates are fixed — they won't change over time" },
      { emoji: "🎯", text: "Good credit helps you qualify for lower private loan rates" },
      { emoji: "💸", text: "Making extra payments early reduces total interest dramatically" },
    ],
  },
  {
    id: "scholarships", icon: Award, title: "Scholarships & Grants", subtitle: "Free money that's never repaid",
    color: "#d97706", bgColor: "#fffbeb", borderColor: "#fde68a",
    summary: "Scholarships and grants are free money for college — you never pay them back. They're awarded for merit, financial need, specific skills, background, or even essays and random contests.",
    keyPoints: [
      { emoji: "🎓", text: "Merit-based: awarded for grades, athletics, or talent" },
      { emoji: "📋", text: "Need-based: depends on family's financial situation" },
      { emoji: "🌐", text: "Search Fastweb, Scholarships.com, and your school's portal" },
      { emoji: "🔄", text: "Apply to many — quantity matters as much as quality" },
      { emoji: "📝", text: "Strong, personal essays dramatically improve your odds" },
    ],
  },
  {
    id: "budgeting", icon: PieChart, title: "Budgeting in College", subtitle: "Making every dollar count",
    color: "#0891b2", bgColor: "#ecfeff", borderColor: "#a5f3fc",
    summary: "A budget tracks income and spending so you never run short. The 50/30/20 rule is a popular framework: 50% for needs, 30% for wants, 20% for savings and debt repayment.",
    keyPoints: [
      { emoji: "📊", text: "Track all income: financial aid, part-time jobs, family support" },
      { emoji: "🍕", text: "Save on food: meal prep, campus dining plans, cooking at home" },
      { emoji: "📚", text: "Buy used textbooks or borrow from the campus library" },
      { emoji: "🛑", text: "Avoid lifestyle inflation — live like a student while you are one" },
      { emoji: "🏦", text: "Build a small emergency fund of at least $500 before spending on extras" },
    ],
  },
  {
    id: "credit", icon: Shield, title: "Credit Scores", subtitle: "Building your financial reputation",
    color: "#16a34a", bgColor: "#f0fdf4", borderColor: "#bbf7d0",
    summary: "Your credit score (300–850) signals to lenders how reliably you repay debt. A score above 700 earns better loan rates, easier apartment rentals, and sometimes even job offers.",
    keyPoints: [
      { emoji: "✅", text: "Payment history = 35% of your score — always pay on time" },
      { emoji: "💳", text: "A student credit card, paid in full monthly, builds credit safely" },
      { emoji: "🔢", text: "Keep your credit utilization (balance ÷ limit) under 30%" },
      { emoji: "🚫", text: "Don't close old accounts — length of history matters" },
      { emoji: "👀", text: "Check your free report annually at annualcreditreport.com" },
    ],
  },
  {
    id: "compound", icon: TrendingUp, title: "Compound Interest", subtitle: "The eighth wonder of the world",
    color: "#6d28d9", bgColor: "#f5f3ff", borderColor: "#c4b5fd",
    summary: "Compound interest is interest earned on your interest — making savings grow exponentially. It works against you on debt (grows fast) and for you on investments (grows faster over time). Starting early is everything.",
    keyPoints: [
      { emoji: "📅", text: "$1,000 at 7% for 30 years = $7,612 with no extra deposits" },
      { emoji: "⏰", text: "Starting to invest at 22 vs 32 can double your retirement savings" },
      { emoji: "🏦", text: "High-yield savings accounts earn 4–5% vs 0.01% at big banks" },
      { emoji: "📈", text: "Low-cost index funds harness long-term compound market growth" },
      { emoji: "🎯", text: "Even $25/month invested at 18 can grow to $100k+ by 65" },
    ],
  },
];

function LessonCard({ lesson }: { lesson: Lesson }) {
  const [open, setOpen] = useState(false);
  const Icon = lesson.icon;

  return (
    <div className="bg-card rounded-2xl border overflow-hidden transition-all duration-200"
      style={{ borderColor: open ? lesson.borderColor : undefined, boxShadow: open ? `0 4px 24px 0 ${lesson.color}18` : "0 2px 8px 0 rgba(0,0,0,0.04)" }}>
      <button className="w-full flex items-center gap-4 p-5 text-left hover:bg-muted/30 transition-colors" onClick={() => setOpen((v) => !v)}>
        <div className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: lesson.bgColor }}>
          <Icon size={22} style={{ color: lesson.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-foreground">{lesson.title}</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{lesson.subtitle}</p>
        </div>
        <ChevronRight size={18} className={`text-muted-foreground flex-shrink-0 transition-transform duration-200 ${open ? "rotate-90" : ""}`} />
      </button>

      {open && (
        <div className="px-5 pb-5 flex flex-col gap-4 animate-in fade-in slide-in-from-top-1 duration-150">
          <div className="h-px bg-border" />
          <p className="text-sm text-foreground/80 leading-relaxed">{lesson.summary}</p>
          <div>
            <p className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: lesson.color }}>Key Takeaways</p>
            <div className="flex flex-col gap-2.5">
              {lesson.keyPoints.map((kp, i) => (
                <div key={i} className="flex items-start gap-3">
                  <span className="text-base flex-shrink-0 mt-0.5">{kp.emoji}</span>
                  <p className="text-sm text-foreground/80 leading-relaxed">{kp.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function Learn() {
  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Financial Literacy Hub</h1>
        <p className="text-sm text-muted-foreground mt-0.5">6 beginner-friendly lessons to help you make smarter college financial decisions.</p>
      </div>

      {/* Intro banner */}
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 flex items-start gap-4">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
          <DollarSign size={18} className="text-primary" />
        </div>
        <div>
          <p className="text-sm font-bold text-foreground">Build your money confidence</p>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
            Understanding money is one of the most valuable skills you can develop. These lessons cover the core financial concepts every college student needs — written in plain English.
          </p>
        </div>
      </div>

      {/* Topic chips */}
      <div className="flex flex-wrap gap-2">
        {LESSONS.map((l) => (
          <span key={l.id} className="text-xs font-semibold px-3 py-1.5 rounded-full" style={{ backgroundColor: l.bgColor, color: l.color }}>
            {l.title}
          </span>
        ))}
      </div>

      {/* Lesson cards */}
      <div className="flex flex-col gap-3">
        {LESSONS.map((lesson) => <LessonCard key={lesson.id} lesson={lesson} />)}
      </div>

      {/* Footer disclaimer */}
      <div className="bg-muted/50 rounded-xl border border-border p-4 flex items-start gap-3">
        <Shield size={15} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <p className="text-xs text-muted-foreground leading-relaxed">
          These lessons are educational guides for general financial awareness. For personalized financial advice, consult a certified financial advisor or your school's financial aid office.
        </p>
      </div>
    </div>
  );
}
