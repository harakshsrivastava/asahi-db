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
  return entries
    .slice()
    .sort(
      (a, b) =>
        (statusRank[a.status] ?? 999) -
        (statusRank[b.status] ?? 999)
    )[0]?.status ?? "unknown";
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
    <span
      className={`px-2 py-0.5 rounded text-xs font-semibold ${
        styles[status] ?? "bg-[#2a3f5f] text-white"
      }`}
    >
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
    const key = entry.name.toLowerCase();
    acc[key] = acc[key] ?? [];
    acc[key].push(entry);
    return acc;
  }, {});

  const searchLower = search.toLowerCase();

  const filtered = Object.entries(grouped).filter(([name]) =>
    name.includes(searchLower)
  );

  const toggle = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(name) ? next.delete(name) : next.add(name);
      return next;
    });
  };

  if (error)
    return <pre className="text-red-400 p-6">Error: {error}</pre>;

  const uniqueGames = Object.keys(grouped).length;
  const totalReviews = entries.length;

  return (
    <main className="min-h-screen bg-[#1b2838] text-[#c6d4df] font-sans">
      <div className="bg-[#171a21] border-b border-[#2a3f5f] px-6 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-wide">
            🐧 Asahi Linux Compatibility DB
          </h1>
          <p className="text-sm text-[#8f98a0] mt-1">
            Game & app compatibility for Apple Silicon on Asahi Linux
          </p>
        </div>

        <a
          href="/submit"
          className="bg-[#4c9a2a] hover:bg-[#5cb830] text-white font-semibold px-4 py-2 rounded transition-colors text-sm whitespace-nowrap"
        >
          + Submit Entry
        </a>
      </div>

      <div className="px-6 py-6">
        <div className="flex items-center gap-4 mb-6">
          <input
            type="text"
            placeholder="Search games & apps..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-md bg-[#2a3f5f] border border-[#3d5a7a] rounded px-4 py-2 text-[#c6d4df] placeholder-[#8f98a0] focus:outline-none focus:border-[#66c0f4]"
          />
          <span className="text-sm text-[#8f98a0] whitespace-nowrap">
            {uniqueGames} {uniqueGames === 1 ? "game" : "games"} ·{" "}
            {totalReviews} {totalReviews === 1 ? "review" : "reviews"} — missing yours?{" "}
            <a href="/submit" className="text-[#66c0f4] hover:underline">
              Add it
            </a>
          </span>
        </div>

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
            {filtered.map(([key, group]) => {
              const isOpen = expanded.has(key);
              const first = group[0];

              return (
                <React.Fragment key={key}>
                  <tr
                    onClick={() => toggle(key)}
                    className="border-b border-[#2a3f5f] hover:bg-[#2a3f5f]/30 cursor-pointer"
                  >
                    <td className="py-3 pr-4 text-[#8f98a0]">
                      {isOpen ? "▼" : "▶"}
                    </td>
                    <td className="py-3 pr-4 text-white font-medium">
                      {first.name}
                    </td>
                    <td className="py-3 pr-4 text-[#8f98a0] capitalize">
                      {first.type}
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={bestStatus(group)} />
                    </td>
                    <td className="py-3 pr-4 text-[#8f98a0]">
                      {group.length}
                    </td>
                  </tr>

                  {isOpen &&
                    group.map((entry) => (
                      <tr
                        key={entry.id}
                        className="bg-[#172430] border-b border-[#2a3f5f]"
                      >
                        <td className="py-2 pr-4"></td>
                        <td className="py-2 pr-4 text-xs text-[#8f98a0]">
                          <StatusBadge status={entry.status} />
                        </td>
                        <td className="py-2 pr-4 text-xs text-[#8f98a0]">
                          {entry.chip}
                        </td>
                        <td className="py-2 pr-4 text-xs text-[#8f98a0]">
                          {entry.method} · {entry.fps ?? "—"} FPS ·{" "}
                          {entry.ram_gb ? `${entry.ram_gb}GB RAM` : "—"}
                        </td>
                        <td className="py-2 text-xs text-[#8f98a0] italic">
                          {entry.notes ?? "—"}
                        </td>
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
