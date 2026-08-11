interface IconProps {
  size?: number;
}

const base = {
  fill: "none",
  stroke: "var(--gold)",
  strokeWidth: 1.4,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function ClapperIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M3 8.5 19.5 4 21 8l-16.5 4.5z" />
      <path d="M6.5 5.2 8 8.7" />
      <path d="M11 4 12.5 7.6" />
      <path d="M15.5 3 17 6.5" />
      <path d="M4 9v10a1 1 0 0 0 1 1h13a1 1 0 0 0 1-1V9" />
    </svg>
  );
}

export function SearchIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m19.5 19.5-4.3-4.3" />
    </svg>
  );
}

export function HandshakeIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <path d="M8 12 4.5 8.7a1.7 1.7 0 0 1 2.3-2.4L8 7.3" />
      <path d="M16 12l3.5-3.3a1.7 1.7 0 0 0-2.3-2.4L16 7.3" />
      <path d="M8 12v2.3a2 2 0 0 0 .7 1.5l2.6 2.2a1 1 0 0 0 1.4 0l2.6-2.2a2 2 0 0 0 .7-1.5V12" />
      <path d="M8 12h8" />
    </svg>
  );
}

export function NetworkIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="5" cy="6" r="2" />
      <circle cx="19" cy="6" r="2" />
      <circle cx="12" cy="13" r="2" />
      <circle cx="5" cy="19" r="2" />
      <circle cx="19" cy="19" r="2" />
      <path d="M6.6 7.2 10.6 11.6" />
      <path d="M17.4 7.2 13.4 11.6" />
      <path d="M10.8 14.4 6.8 17.8" />
      <path d="M13.2 14.4 17.2 17.8" />
    </svg>
  );
}

export function GlobeIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18" />
      <path d="M12 3c2.5 2.5 3.8 5.7 3.8 9s-1.3 6.5-3.8 9c-2.5-2.5-3.8-5.7-3.8-9s1.3-6.5 3.8-9z" />
    </svg>
  );
}

export function ProfileIcon({ size = 20 }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" {...base}>
      <rect x="3" y="4" width="18" height="14" rx="2" />
      <circle cx="12" cy="11" r="3.2" />
      <path d="M7 18c.6-2 2.5-3.2 5-3.2s4.4 1.2 5 3.2" />
    </svg>
  );
}
