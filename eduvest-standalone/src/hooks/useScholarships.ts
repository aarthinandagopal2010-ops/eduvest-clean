import { useState } from "react";

const KEY = "eduvest_scholarships_v1";

export type ScholarshipStatus = "interested" | "applying" | "submitted" | "won";

export interface Scholarship {
  id: string;
  name: string;
  amount: number;
  deadline: string;
  status: ScholarshipStatus;
  notes: string;
}

function load(): Scholarship[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function persist(list: Scholarship[]): void {
  localStorage.setItem(KEY, JSON.stringify(list));
}

export function useScholarships() {
  const [scholarships, setScholarships] = useState<Scholarship[]>(load);

  function addScholarship(entry: Omit<Scholarship, "id">): void {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const next = [...scholarships, { ...entry, id }];
    setScholarships(next);
    persist(next);
  }

  function updateScholarship(id: string, patch: Partial<Omit<Scholarship, "id">>): void {
    const next = scholarships.map((s) => (s.id === id ? { ...s, ...patch } : s));
    setScholarships(next);
    persist(next);
  }

  function deleteScholarship(id: string): void {
    const next = scholarships.filter((s) => s.id !== id);
    setScholarships(next);
    persist(next);
  }

  function sortedByDeadline(): Scholarship[] {
    return [...scholarships].sort((a, b) => {
      if (!a.deadline) return 1;
      if (!b.deadline) return -1;
      return a.deadline.localeCompare(b.deadline);
    });
  }

  function daysUntil(dateStr: string): number | null {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  }

  return { scholarships, addScholarship, updateScholarship, deleteScholarship, sortedByDeadline, daysUntil };
}

export const STATUS_CONFIG: Record<ScholarshipStatus, { label: string; bg: string; text: string; dot: string; border: string }> = {
  interested: { label: "Interested", bg: "bg-violet-50", text: "text-violet-700", dot: "bg-violet-500", border: "border-violet-200" },
  applying:   { label: "Applying",   bg: "bg-blue-50",   text: "text-blue-700",   dot: "bg-blue-500",   border: "border-blue-200"   },
  submitted:  { label: "Submitted",  bg: "bg-amber-50",  text: "text-amber-700",  dot: "bg-amber-500",  border: "border-amber-200"  },
  won:        { label: "Won ✓",      bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500", border: "border-emerald-200" },
};
