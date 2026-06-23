import { useState } from "react";
import { Award, Calendar, Clock, DollarSign, Edit2, Plus, Trash2, X } from "lucide-react";
import { currency } from "../lib/calc";
import { type Scholarship, type ScholarshipStatus, useScholarships, STATUS_CONFIG } from "../hooks/useScholarships";

const BLANK = { name: "", amount: "", deadline: "", status: "interested" as ScholarshipStatus, notes: "" };

function formatDate(dateStr: string): string {
  if (!dateStr) return "No deadline";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function Modal({ title, onClose, children }: { title: string; onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative bg-card rounded-2xl border border-border shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card z-10">
          <h2 className="font-bold text-foreground text-base">{title}</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><X size={17} className="text-muted-foreground" /></button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

function ScholarshipForm({ initial, onSave, onCancel }: {
  initial?: typeof BLANK; onSave: (data: typeof BLANK) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ ...BLANK, ...initial });
  const [errors, setErrors] = useState<Partial<Record<string, string>>>({});

  function validate() {
    const e: Partial<Record<string, string>> = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.amount || isNaN(parseFloat(form.amount)) || parseFloat(form.amount) <= 0) e.amount = "Enter a valid amount";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">Scholarship Name *</label>
        <input type="text" value={form.name} onChange={(e) => { setForm((p) => ({ ...p, name: e.target.value })); setErrors((p) => ({ ...p, name: undefined })); }}
          placeholder="e.g. Gates Millennium Scholarship"
          className={`border rounded-xl py-2.5 px-3.5 text-sm bg-background outline-none text-foreground placeholder:text-border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all ${errors.name ? "border-destructive" : "border-border"}`} />
        {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
      </div>

      {/* Amount */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">Award Amount *</label>
        <div className={`flex items-center border rounded-xl bg-background focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary transition-all ${errors.amount ? "border-destructive" : "border-border"}`}>
          <span className="pl-3 pr-1 text-muted-foreground text-sm">$</span>
          <input type="number" min="0" value={form.amount} onChange={(e) => { setForm((p) => ({ ...p, amount: e.target.value })); setErrors((p) => ({ ...p, amount: undefined })); }}
            placeholder="5,000"
            className="flex-1 bg-transparent outline-none text-foreground placeholder:text-border py-2.5 px-2 text-sm [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" />
        </div>
        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
      </div>

      {/* Deadline */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">Deadline</label>
        <input type="date" value={form.deadline} onChange={(e) => setForm((p) => ({ ...p, deadline: e.target.value }))}
          className="border border-border rounded-xl py-2.5 px-3.5 text-sm bg-background outline-none text-foreground focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all" />
      </div>

      {/* Status */}
      <div className="flex flex-col gap-2">
        <label className="text-sm font-semibold text-foreground">Status</label>
        <div className="grid grid-cols-2 gap-2">
          {(Object.keys(STATUS_CONFIG) as ScholarshipStatus[]).map((st) => {
            const cfg = STATUS_CONFIG[st];
            const active = form.status === st;
            return (
              <button key={st} type="button" onClick={() => setForm((p) => ({ ...p, status: st }))}
                className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all ${active ? `${cfg.bg} ${cfg.text} ${cfg.border}` : "border-border text-muted-foreground hover:bg-muted"}`}>
                <span className={`w-2 h-2 rounded-full flex-shrink-0 ${cfg.dot}`} />
                {cfg.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Notes */}
      <div className="flex flex-col gap-1.5">
        <label className="text-sm font-semibold text-foreground">Notes (optional)</label>
        <textarea value={form.notes} onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
          placeholder="Requirements, links, contacts..."
          rows={3}
          className="border border-border rounded-xl py-2.5 px-3.5 text-sm bg-background outline-none text-foreground placeholder:text-border focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all resize-none" />
      </div>

      <div className="flex gap-3 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 border border-border rounded-xl text-sm font-semibold text-muted-foreground hover:bg-muted transition-colors">Cancel</button>
        <button onClick={() => { if (validate()) onSave(form); }} className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">Save</button>
      </div>
    </div>
  );
}

export default function Scholarships() {
  const { scholarships, addScholarship, updateScholarship, deleteScholarship, sortedByDeadline, daysUntil } = useScholarships();
  const [showAdd, setShowAdd] = useState(false);
  const [editItem, setEditItem] = useState<Scholarship | null>(null);

  function handleAdd(form: typeof BLANK) {
    addScholarship({ name: form.name.trim(), amount: parseFloat(form.amount), deadline: form.deadline, status: form.status, notes: form.notes.trim() });
    setShowAdd(false);
  }

  function handleEdit(form: typeof BLANK) {
    if (!editItem) return;
    updateScholarship(editItem.id, { name: form.name.trim(), amount: parseFloat(form.amount), deadline: form.deadline, status: form.status, notes: form.notes.trim() });
    setEditItem(null);
  }

  function cycleStatus(s: Scholarship) {
    const order: ScholarshipStatus[] = ["interested", "applying", "submitted", "won"];
    updateScholarship(s.id, { status: order[(order.indexOf(s.status) + 1) % order.length] });
  }

  const sorted = sortedByDeadline();
  const upcoming = sorted.filter((s) => { const d = daysUntil(s.deadline); return d !== null && d >= 0 && d <= 30 && s.status !== "won"; });
  const totalWon = scholarships.filter((s) => s.status === "won").reduce((acc, s) => acc + s.amount, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Scholarship Tracker</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Track awards, deadlines, and application statuses.</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm flex-shrink-0">
          <Plus size={16} /> Add Scholarship
        </button>
      </div>

      {/* Stats */}
      {scholarships.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          {[
            { icon: Award, label: "Total", value: String(scholarships.length) },
            { icon: Award, label: "Won", value: String(scholarships.filter((s) => s.status === "won").length) },
            { icon: DollarSign, label: "Amount Won", value: currency(totalWon) },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 flex flex-col gap-1" style={{ boxShadow: "0 2px 10px 0 rgba(124,58,237,0.05)" }}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">{stat.label}</p>
              <p className="text-xl font-bold text-foreground">{stat.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Upcoming deadlines */}
      {upcoming.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Clock size={15} className="text-amber-600" />
            <span className="text-sm font-bold text-amber-800">Upcoming Deadlines (within 30 days)</span>
          </div>
          <div className="flex flex-col gap-2">
            {upcoming.map((s) => {
              const days = daysUntil(s.deadline)!;
              return (
                <div key={s.id} className="flex items-center justify-between">
                  <span className="text-sm font-medium text-amber-900">{s.name}</span>
                  <span className={`text-sm font-bold ${days <= 7 ? "text-red-600" : "text-amber-700"}`}>
                    {days === 0 ? "Today!" : `${days} day${days === 1 ? "" : "s"}`}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Empty state */}
      {scholarships.length === 0 && (
        <div className="flex flex-col items-center gap-4 py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <Award size={28} className="text-primary" />
          </div>
          <div>
            <p className="text-base font-semibold text-foreground">No scholarships yet</p>
            <p className="text-sm text-muted-foreground mt-1 max-w-xs">Add scholarships to track deadlines, amounts, and application status — all in one place.</p>
          </div>
          <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-white rounded-xl text-sm font-semibold transition-colors shadow-sm">
            <Plus size={15} /> Add Your First Scholarship
          </button>
        </div>
      )}

      {/* Scholarship list */}
      <div className="flex flex-col gap-3">
        {sorted.map((s) => {
          const cfg = STATUS_CONFIG[s.status];
          const days = daysUntil(s.deadline);
          const urgent = days !== null && days >= 0 && days <= 7 && s.status !== "won";
          return (
            <div key={s.id} className={`bg-card rounded-2xl border p-5 flex flex-col gap-3 ${urgent ? "border-amber-300" : "border-border"}`}
              style={{ borderLeft: `4px solid ${cfg.dot.replace("bg-", "")}`, boxShadow: "0 2px 12px 0 rgba(0,0,0,0.05)" }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-foreground text-base leading-tight">{s.name}</h3>
                  <p className="text-xl font-bold text-primary mt-1">{currency(s.amount)}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => setEditItem(s)} className="p-2 rounded-xl bg-primary/5 hover:bg-primary/10 text-primary transition-colors"><Edit2 size={14} /></button>
                  <button onClick={() => deleteScholarship(s.id)} className="p-2 rounded-xl bg-destructive/5 hover:bg-destructive/10 text-destructive transition-colors"><Trash2 size={14} /></button>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-wrap">
                {s.deadline && (
                  <div className={`flex items-center gap-1.5 text-xs ${urgent ? "text-amber-700 font-semibold" : "text-muted-foreground"}`}>
                    <Calendar size={12} />
                    <span>{formatDate(s.deadline)}{days !== null && days >= 0 && s.status !== "won" ? ` · ${days}d left` : ""}</span>
                  </div>
                )}
              </div>

              {s.notes && <p className="text-xs text-muted-foreground line-clamp-2">{s.notes}</p>}

              <button onClick={() => cycleStatus(s)}
                className={`self-start flex items-center gap-2 px-3.5 py-1.5 rounded-full border text-xs font-semibold transition-all hover:opacity-80 ${cfg.bg} ${cfg.text} ${cfg.border}`}>
                <span className={`w-2 h-2 rounded-full ${cfg.dot}`} />
                {cfg.label}
                <span className="opacity-50">· tap to advance</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Add modal */}
      {showAdd && (
        <Modal title="Add Scholarship" onClose={() => setShowAdd(false)}>
          <ScholarshipForm onSave={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {/* Edit modal */}
      {editItem && (
        <Modal title="Edit Scholarship" onClose={() => setEditItem(null)}>
          <ScholarshipForm
            initial={{ name: editItem.name, amount: String(editItem.amount), deadline: editItem.deadline, status: editItem.status, notes: editItem.notes }}
            onSave={handleEdit}
            onCancel={() => setEditItem(null)}
          />
        </Modal>
      )}
    </div>
  );
}
