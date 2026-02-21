"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Trash2 } from "lucide-react";
import Link from "next/link";
import type { Session } from "@/lib/types";

const SKILL_OPTIONS = [
  "Weaving",
  "Pottery",
  "Embroidery",
  "Tailoring",
  "Food Processing",
  "Handicrafts",
  "Jewelry Making",
  "Natural Dyes",
  "Organic Farming",
  "Digital Literacy",
  "Financial Literacy",
  "Leadership",
];

const STATUS_STYLES: Record<string, string> = {
  active: "bg-forest/10 text-forest dark:bg-forest/20",
  upcoming: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
};

interface Program {
  id: string;
  title: string;
  description: string | null;
  skills: string;
  durationWeeks: number | null;
  status: string;
  createdAt: string;
}

export default function ProgramsClient({ session: _session }: { session: Session }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [selectedSkills, setSelectedSkills] = useState<string[]>([]);
  const [form, setForm] = useState({
    title: "",
    durationWeeks: "",
    description: "",
  });

  const fetchPrograms = () => {
    setLoading(true);
    fetch("/api/programs")
      .then((r) => r.json())
      .then((data) => setPrograms(data.programs ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchPrograms();
  }, []);

  const toggleSkill = (skill: string) => {
    setSelectedSkills((prev) =>
      prev.includes(skill) ? prev.filter((s) => s !== skill) : [...prev, skill],
    );
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSkills.length === 0) {
      setError("Please select at least one skill");
      return;
    }
    setCreating(true);
    setError("");
    const res = await fetch("/api/programs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        skills: selectedSkills.join(","),
        durationWeeks: form.durationWeeks ? parseInt(form.durationWeeks) : undefined,
        description: form.description || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create program");
    } else {
      setShowForm(false);
      setForm({ title: "", durationWeeks: "", description: "" });
      setSelectedSkills([]);
      fetchPrograms();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this program?")) return;
    await fetch(`/api/programs/${id}`, { method: "DELETE" });
    fetchPrograms();
  };

  return (
    <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-10">
        <Link
          href="/ngo/dashboard"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Dashboard
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Skill Programs</h1>
            <div className="mt-4 h-[3px] w-10 rounded-full bg-forest" />
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-primary/80 border border-white/15 text-primary-foreground text-sm font-medium hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 transition-all duration-200"
            style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.12)' }}
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Program"}
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showForm && (
        <form
          onSubmit={handleCreate}
          className="rounded-2xl border border-border p-6 mb-8 space-y-4"
        >
          <h2 className="text-sm font-medium tracking-widest uppercase text-muted-foreground mb-4">
            New Program
          </h2>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Title *</label>
              <input
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.title}
                onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Advanced Handloom Weaving"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Duration (weeks)</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.durationWeeks}
                onChange={(e) => setForm((f) => ({ ...f, durationWeeks: e.target.value }))}
                placeholder="e.g. 6"
              />
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-2 block">Skills Covered *</label>
            <div className="flex flex-wrap gap-2">
              {SKILL_OPTIONS.map((skill) => (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-xl transition-all duration-200 ${
                    selectedSkills.includes(skill)
                      ? "bg-primary/20 border border-primary/30 text-primary"
                      : "bg-muted/60 border border-border/50 text-muted-foreground hover:bg-muted/80 hover:border-border/70"
                  }`}
                  style={{
                    boxShadow: selectedSkills.includes(skill)
                      ? 'inset 0 1px 1px rgba(255,255,255,0.2), 0 2px 6px rgba(0,0,0,0.08)'
                      : 'inset 0 1px 1px rgba(255,255,255,0.15), 0 1px 4px rgba(0,0,0,0.04)',
                  }}
                >
                  {skill}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs text-muted-foreground mb-1 block">Description</label>
            <textarea
              rows={3}
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary resize-none"
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              placeholder="Optional description"
            />
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl backdrop-blur-xl bg-primary/80 border border-white/15 text-primary-foreground text-sm font-medium hover:-translate-y-0.5 hover:bg-primary/90 active:translate-y-0 transition-all duration-200 disabled:opacity-50 disabled:translate-y-0 disabled:cursor-not-allowed"
              style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 4px 12px rgba(0,0,0,0.12)' }}
            >
              {creating ? "Creating…" : "Create Program"}
            </button>
          </div>
        </form>
      )}

      {/* Program List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : programs.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="text-muted-foreground text-sm">No programs yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {programs.map((p) => (
            <div key={p.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-2">
                    <h3 className="font-medium text-sm">{p.title}</h3>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[p.status] ?? STATUS_STYLES.active}`}>
                      {p.status}
                    </span>
                    {p.durationWeeks && (
                      <span className="text-xs text-muted-foreground">{p.durationWeeks} weeks</span>
                    )}
                  </div>
                  {p.description && (
                    <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
                  )}
                  <div className="flex flex-wrap gap-1.5">
                    {p.skills.split(",").map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground dark:text-accent"
                      >
                        {skill.trim()}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(p.id)}
                  className="p-2 rounded-lg backdrop-blur-xl bg-muted/40 border border-border/40 text-muted-foreground hover:bg-destructive/10 hover:border-destructive/20 hover:text-destructive transition-all duration-200 shrink-0"
                  style={{ boxShadow: 'inset 0 1px 1px rgba(255,255,255,0.2), 0 1px 4px rgba(0,0,0,0.05)' }}
                  title="Delete program"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
