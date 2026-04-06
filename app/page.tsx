"use client";

import React, { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Entry = {
  id: number;
  name: string;
  type: string;
  status: string;
  chip: string;
  method: string;
  fps: string | null;
  ram_gb: number | null;
  price: string | null;
  notes: string | null;
};

const statusRank: Record<string, number> = {
  working: 0,
  partial: 1,
  broken: 2,
};

function bestStatus(entries: Entry[]) {
  return entries.slice().sort((a, b) => statusRank[a.status] - statusRank[b.status])[0].status;
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    working: "bg-[#4c9a2a] text-white",
    partial: "bg-[#b8860b] text-white",
    broken: "bg-[#8b0000] text-white",
  };
  const labels: Record<string, string> = {
    working: "✓ Working",
    partial: "~ Partial",
    broken: "✗ Broken",
  };
  return (
    <span className={`px-2 py-0.5 rounded text-xs font-semibold ${styles[status] ?? "bg-[#2a3f5f] text-white"}`}>
      {labels[status] ?? status}
    </span>
  );
}

export default function Home() {
  const [entries, setEntries] = useState<Entry[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase
      .from("entries")
      .select("*")
      .then(({ data, error }) => {
        if (error) setError(error.message);
        else setEntries(data ?? []);
      });
  }, []);

  const grouped = entries.reduce<Record<string, Entry[]>>((acc, entry) => {
    acc[entry.name] = acc[entry.name] ?? [];
    acc[entry.name].push(entry);
    return acc;
  }, {});

  const filtered = Object.entries(grouped).filter(([name]) =>
    name.toLowerCase().includes(search.toLowerCase())
  );

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  if (error) return <pre className="text-red-400 p-6">Error: {error}</pre>;

  return (
    <main className="min-h-screen bg-[#1b2838] text-[#c6d4df] font-sans">
      <div className="bg-[#171a21] border-b border-[#2a3f5f] px-6 py-4">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🐧 Asahi Linux Compatibility DB
        </h1>
        <p className="text-sm text-[#8f98a0] mt-1">
          Game & app compatibility for Apple Silicon on Asahi Linux —{" "}
          <a href="/submit" className="text-[#66c0f4] hover:underline">
            Submit an entry
          </a>
        </p>
      </div>

      <div className="px-6 py-6">
        <input
          type="text"
          placeholder="Search games & apps..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md bg-[#2a3f5f] border border-[#3d5a7a] rounded px-4 py-2 text-[#c6d4df] placeholder-[#8f98a0] focus:outline-none focus:border-[#66c0f4] mb-6"
        />

        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="text-left text-[#8f98a0] border-b border-[#2a3f5f]">
              <th className="pb-3 pr-4 font-medium w-6"></th>
              <th className="pb-3 pr-4 font-medium">Name</th>
              <th className="pb-3 pr-4 font-medium">Type</th>
              <th className="pb-3 pr-4 font-medium">Best Status</th>
              <th className="pb-3 pr-4 font-medium">Reports</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(([name, group]) => {
              const isOpen = expanded.has(name);
              const first = group[0];
              return (
                <React.Fragment key={name}>
                  <tr
                    onClick={() => toggle(name)}
                    className="border-b border-[#2a3f5f] hover:bg-[#2a3f5f]/30 transition-colors cursor-pointer"
                  >
                    <td className="py-3 pr-4 text-[#8f98a0]">{isOpen ? "▼" : "▶"}</td>
                    <td className="py-3 pr-4 font-medium text-white">{name}</td>
                    <td className="py-3 pr-4 capitalize text-[#8f98a0]">{first.type}</td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={bestStatus(group)} />
                    </td>
                    <td className="py-3 pr-4 text-[#8f98a0]">{group.length}</td>
                  </tr>
                  {isOpen &&
                    group.map((entry) => (
                      <tr key={entry.id} className="bg-[#172430] border-b border-[#2a3f5f]">
                        <td className="py-2 pr-4"></td>
                        <td className="py-2 pr-4 text-[#8f98a0] text-xs">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="py-2 pr-4 text-[#8f98a0] text-xs">{entry.chip}</td>
                        <td className="py-2 pr-4 text-[#8f98a0] text-xs">
                          {entry.method} · {entry.fps ?? "—"} FPS · {entry.ram_gb ? `${entry.ram_gb}GB RAM` : "—"}
                        </td>
                        <td className="py-2 text-[#8f98a0] text-xs italic">{entry.notes}</td>
                      </tr>
                    ))}
                </React.Fragment>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="py-10 text-center text-[#8f98a0]">
                  No results for "{search}"
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </main>
  );
}
