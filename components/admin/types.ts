export interface TalentRow {
  id: string;
  first_name: string;
  last_name: string;
  city: string;
  country: string | null;
  categories: string[];
  status: "submitted" | "in_review" | "represented" | "not_pursued" | "archived";
  source: "self_submitted" | "scouted";
  photo_url: string | null;
  video_url: string | null;
  languages: string[] | null;
  email: string | null;
  phone: string | null;
  internal_notes: string | null;
  created_at: string;
}

export interface ProductionRow {
  id: string;
  company_name: string;
}

export interface BriefRow {
  id: string;
  production_id: string;
  title: string;
  description: string | null;
  category: string | null;
  deadline: string | null;
  status: "open" | "in_progress" | "closed";
  is_public: boolean;
  casting_mode: "selfcast" | "audition" | "both";
  production?: ProductionRow | ProductionRow[] | null;
}

export interface ProposalRow {
  id: string;
  talent_id: string;
  brief_id: string;
  origin: "agency" | "talent";
  status: "proposed" | "sent_to_production" | "selected" | "rejected";
  notified_at: string | null;
  self_tape_url: string | null;
  talent?: TalentRow | TalentRow[] | null;
}

export const STATUS_META: Record<TalentRow["status"], { color: string; bg: string }> = {
  submitted: { color: "var(--text-muted)", bg: "var(--chip-bg)" },
  in_review: { color: "var(--gold)", bg: "var(--gold-dark-bg)" },
  represented: { color: "var(--teal)", bg: "var(--teal-bg)" },
  not_pursued: { color: "var(--brown)", bg: "var(--brown-bg)" },
  archived: { color: "var(--text-dim)", bg: "var(--bg-hover)" },
};

export const PROPOSAL_STATUS_META: Record<ProposalRow["status"], { color: string; bg: string }> = {
  proposed: { color: "var(--teal)", bg: "var(--teal-bg)" },
  sent_to_production: { color: "var(--teal)", bg: "var(--teal-bg)" },
  selected: { color: "var(--red)", bg: "var(--red-bg)" },
  rejected: { color: "var(--brown)", bg: "var(--brown-bg)" },
};

export interface AppointmentRow {
  id: string;
  talent_id: string | null;
  brief_id: string | null;
  type: "audition" | "callback" | "fitting" | "shoot" | "meeting" | "other";
  status: "scheduled" | "confirmed" | "completed" | "cancelled";
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  notes: string | null;
  talent?: TalentRow | TalentRow[] | null;
  brief?: BriefRow | BriefRow[] | null;
}

export const APPOINTMENT_STATUS_META: Record<AppointmentRow["status"], { color: string; bg: string }> = {
  scheduled: { color: "var(--text-muted)", bg: "var(--chip-bg)" },
  confirmed: { color: "var(--teal)", bg: "var(--teal-bg)" },
  completed: { color: "var(--text-dim)", bg: "var(--bg-hover)" },
  cancelled: { color: "var(--brown)", bg: "var(--brown-bg)" },
};

export function one<T>(v: T | T[] | null | undefined): T | null {
  if (!v) return null;
  return Array.isArray(v) ? v[0] ?? null : v;
}
