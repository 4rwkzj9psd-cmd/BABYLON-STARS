export const colors = {
  bg: "#0f0e13",
  bgAlt: "#131218",
  bgCard: "#17151d",
  bgHover: "#1c1b24",
  border: "#221f29",
  borderLight: "#443f52",
  inputBorder: "#332f3d",
  text: "#f2f0ea",
  textMuted: "#9a97a6",
  textDim: "#6f6b7c",
  textLight: "#c9c6d1",
  placeholder: "#55515f",
  gold: "#d4a843",
  goldHover: "#e3bb5c",
  goldDarkBg: "#2e2712",
  teal: "#6fbbb2",
  tealBg: "#122624",
  red: "#e0645a",
  redBg: "#2a1414",
  brown: "#8a6a6a",
  brownBg: "#241717",
  chipBg: "#26242f",
};

export const statusMeta: Record<string, { color: string; bg: string }> = {
  submitted: { color: colors.textMuted, bg: colors.chipBg },
  in_review: { color: colors.gold, bg: colors.goldDarkBg },
  represented: { color: colors.teal, bg: colors.tealBg },
  not_pursued: { color: colors.brown, bg: colors.brownBg },
  archived: { color: colors.textDim, bg: colors.bgHover },
};

export const proposalStatusMeta: Record<string, { color: string; bg: string }> = {
  proposed: { color: colors.teal, bg: colors.tealBg },
  sent_to_production: { color: colors.teal, bg: colors.tealBg },
  selected: { color: colors.red, bg: colors.redBg },
  rejected: { color: colors.brown, bg: colors.brownBg },
};

export const appointmentStatusMeta: Record<string, { color: string; bg: string }> = {
  scheduled: { color: colors.textMuted, bg: colors.chipBg },
  confirmed: { color: colors.teal, bg: colors.tealBg },
  completed: { color: colors.textDim, bg: colors.bgHover },
  cancelled: { color: colors.brown, bg: colors.brownBg },
};
