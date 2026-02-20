"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Plus, X, Calendar, MapPin, Users, Trash2 } from "lucide-react";
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
  upcoming: "bg-primary/10 text-primary",
  completed: "bg-muted text-muted-foreground",
  cancelled: "bg-destructive/10 text-destructive",
};

interface EnrolledSeller {
  userId: string;
  name: string | null;
  location: string | null;
  skills: string | null;
}

interface Workshop {
  id: string;
  title: string;
  description: string | null;
  skillArea: string;
  scheduledAt: string;
  location: string;
  maxAttendees: number;
  status: string;
  enrolledCount: number;
  enrolledSellers: EnrolledSeller[];
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleDateString("en-IN", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function WorkshopsClient({ session: _session }: { session: Session }) {
  const [workshops, setWorkshops] = useState<Workshop[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    title: "",
    skillArea: SKILL_OPTIONS[0],
    scheduledAt: "",
    location: "",
    maxAttendees: "20",
    description: "",
  });

  const fetchWorkshops = () => {
    setLoading(true);
    fetch("/api/workshops")
      .then((r) => r.json())
      .then((data) => setWorkshops(data.workshops ?? []))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchWorkshops();
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    setError("");
    const res = await fetch("/api/workshops", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: form.title,
        skillArea: form.skillArea,
        scheduledAt: form.scheduledAt,
        location: form.location,
        maxAttendees: parseInt(form.maxAttendees),
        description: form.description || undefined,
      }),
    });
    const data = await res.json();
    if (!res.ok) {
      setError(data.error ?? "Failed to create workshop");
    } else {
      setShowForm(false);
      setForm({ title: "", skillArea: SKILL_OPTIONS[0], scheduledAt: "", location: "", maxAttendees: "20", description: "" });
      fetchWorkshops();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this workshop? This will also remove all enrollments.")) return;
    await fetch(`/api/workshops/${id}`, { method: "DELETE" });
    fetchWorkshops();
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
            <h1 className="font-display text-5xl sm:text-6xl tracking-tight">Workshops</h1>
            <div className="mt-4 h-[3px] w-10 rounded-full bg-forest" />
          </div>
          <button
            onClick={() => setShowForm((v) => !v)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity"
          >
            {showForm ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {showForm ? "Cancel" : "New Workshop"}
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
            New Workshop
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
                placeholder="e.g. Basic Weaving Techniques"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Skill Area *</label>
              <select
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.skillArea}
                onChange={(e) => setForm((f) => ({ ...f, skillArea: e.target.value }))}
              >
                {SKILL_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Date & Time *</label>
              <input
                required
                type="datetime-local"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.scheduledAt}
                onChange={(e) => setForm((f) => ({ ...f, scheduledAt: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Location *</label>
              <input
                required
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
                placeholder="e.g. Community Hall, Pune"
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Max Attendees</label>
              <input
                type="number"
                min="1"
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.maxAttendees}
                onChange={(e) => setForm((f) => ({ ...f, maxAttendees: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-xs text-muted-foreground mb-1 block">Description</label>
              <input
                className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                placeholder="Optional description"
              />
            </div>
          </div>
          <div className="pt-2">
            <button
              type="submit"
              disabled={creating}
              className="px-5 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {creating ? "Creating…" : "Create Workshop"}
            </button>
          </div>
        </form>
      )}

      {/* Workshop List */}
      {loading ? (
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-2xl border border-border p-5 animate-pulse">
              <div className="h-4 bg-muted rounded w-1/2 mb-3" />
              <div className="h-3 bg-muted rounded w-1/3" />
            </div>
          ))}
        </div>
      ) : workshops.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-border p-14 text-center">
          <p className="text-muted-foreground text-sm">No workshops yet. Create your first one above.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {workshops.map((w) => (
            <div key={w.id} className="rounded-2xl border border-border p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <h3 className="font-medium text-sm">{w.title}</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-accent/10 text-accent-foreground dark:text-accent">
                      {w.skillArea}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_STYLES[w.status] ?? STATUS_STYLES.upcoming}`}>
                      {w.status}
                    </span>
                  </div>
                  {w.description && (
                    <p className="text-xs text-muted-foreground mb-2">{w.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground flex-wrap">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {formatDate(w.scheduledAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {w.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="w-3 h-3" />
                      {w.enrolledCount}/{w.maxAttendees} enrolled
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(w.id)}
                  className="p-2 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors shrink-0"
                  title="Delete workshop"
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
