"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useRouter } from "next/navigation";

export default function SubmitPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: "",
    type: "game",
    status: "working",
    chip: "",
    method: "",
    fps: "",
    ram_gb: "",
    price: "",
    notes: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const { error } = await supabase.from("entries").insert([
      {
        name: form.name.trim().replace(/\w\S*/g, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()),
        type: form.type,
        status: form.status,
        chip: form.chip,
        method: form.method,
        fps: form.fps || null,
        ram_gb: form.ram_gb ? parseInt(form.ram_gb) : null,
        price: form.price || null,
        notes: form.notes,
      },
    ]);

    setLoading(false);
    if (error) {
      setError(error.message);
    } else {
      router.push("/");
    }
  };

  const inputClass =
    "w-full bg-[#2a3f5f] border border-[#3d5a7a] rounded px-3 py-2 text-[#c6d4df] placeholder-[#8f98a0] focus:outline-none focus:border-[#66c0f4]";
  const labelClass = "block text-sm text-[#8f98a0] mb-1";

  return (
    <main className="min-h-screen bg-[#1b2838] text-[#c6d4df] font-sans">
      <div className="bg-[#171a21] border-b border-[#2a3f5f] px-6 py-4">
        <h1 className="text-2xl font-bold text-white tracking-wide">
          🐧 Asahi Linux Compatibility DB
        </h1>
        <p className="text-sm text-[#8f98a0] mt-1">Submit a new entry</p>
      </div>

      <div className="max-w-xl mx-auto px-6 py-10">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className={labelClass}>Name *</label>
            <input
              name="name"
              required
              placeholder="e.g. Blender"
              value={form.name}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Type *</label>
            <select name="type" value={form.type} onChange={handleChange} className={inputClass}>
              <option value="game">Game</option>
              <option value="app">App</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Status *</label>
            <select name="status" value={form.status} onChange={handleChange} className={inputClass}>
              <option value="working">Working</option>
              <option value="partial">Partial</option>
              <option value="broken">Broken</option>
            </select>
          </div>

          <div>
            <label className={labelClass}>Chip *</label>
            <input
              name="chip"
              required
              placeholder="e.g. M1, M2, all"
              value={form.chip}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Method *</label>
            <input
              name="method"
              required
              placeholder="e.g. native, proton, wine"
              value={form.method}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>FPS</label>
            <input
              name="fps"
              placeholder="e.g. 60+, 25-40"
              value={form.fps}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Test machine RAM (GB)</label>
            <input
              name="ram_gb"
              type="number"
              placeholder="e.g. 16"
              value={form.ram_gb}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Price (USD)</label>
            <input
              name="price"
              placeholder="e.g. 29.99 or Free"
              value={form.price}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          <div>
            <label className={labelClass}>Notes</label>
            <textarea
              name="notes"
              rows={3}
              placeholder="Any extra details about compatibility..."
              value={form.notes}
              onChange={handleChange}
              className={inputClass}
            />
          </div>

          {error && <p className="text-red-400 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="bg-[#4c9a2a] hover:bg-[#5cb830] text-white font-semibold py-2 rounded transition-colors disabled:opacity-50"
          >
            {loading ? "Submitting..." : "Submit Entry"}
          </button>
        </form>
      </div>
    </main>
  );
}
