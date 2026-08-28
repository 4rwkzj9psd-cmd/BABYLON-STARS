// Phase 0 of the multi-tenant platform: talent-facing screens are still scoped to a single
// agency (Babylon Stars). Every table underneath is already agency-scoped via RLS -- this
// constant is just how the still-single-tenant app picks which agency's data to query.
export const AGENCY_ID = process.env.EXPO_PUBLIC_AGENCY_ID!;
