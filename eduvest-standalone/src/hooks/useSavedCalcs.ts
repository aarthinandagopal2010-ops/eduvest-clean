import { useState } from "react";

const KEY = "eduvest_saves_v1";

export interface SavedEntry {
  id: string;
  type: "single" | "compare";
  title: string;
  date: string;
  outlook: "green" | "yellow" | "red";
  totalDebt: number;
  salary: number;
  monthlyPayment: number;
  breakEvenYears: number;
  collegeCount?: number;
}

function load(): SavedEntry[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function useSavedCalcs() {
  const [saves, setSaves] = useState<SavedEntry[]>(load);

  function saveCalc(entry: Omit<SavedEntry, "id" | "date">): string {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    const newEntry: SavedEntry = {
      ...entry,
      id,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
    };
    const next = [newEntry, ...saves];
    setSaves(next);
    localStorage.setItem(KEY, JSON.stringify(next));
    return id;
  }

  function deleteCalc(id: string): void {
    const next = saves.filter((s) => s.id !== id);
    setSaves(next);
    localStorage.setItem(KEY, JSON.stringify(next));
  }

  return { saves, saveCalc, deleteCalc };
}
