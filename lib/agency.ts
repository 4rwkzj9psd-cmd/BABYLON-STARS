// Phase 0 of the multi-tenant platform: the public site and talent-facing flows are still
// scoped to a single agency (Babylon Stars). Every table underneath is already agency-scoped
// via RLS -- this constant is just how the still-single-tenant public UI picks which agency's
// data to query, until per-agency public routing exists.
export const AGENCY_ID = process.env.NEXT_PUBLIC_AGENCY_ID!;
