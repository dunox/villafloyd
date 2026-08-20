import type { IconName } from '../../types';

interface IconProps {
  name: IconName;
  size?: number;
  strokeWidth?: number;
  className?: string;
}

const paths: Record<IconName, JSX.Element> = {
  arrow: <path d="M5 12h14M13 6l6 6-6 6" />,
  bath: <><path d="M4 12h16v3a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4v-3Z"/><path d="M6 12V7a3 3 0 0 1 6 0"/><path d="M8 19v2M16 19v2"/></>,
  bed: <><path d="M3 18v-6h18v6"/><path d="M5 12V7h6a3 3 0 0 1 3 3v2"/><path d="M3 18v3M21 18v3"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></>,
  check: <path d="m5 12 4 4L19 6" />,
  chevronLeft: <path d="m15 18-6-6 6-6" />,
  chevronRight: <path d="m9 18 6-6-6-6" />,
  close: <><path d="M6 6l12 12"/><path d="M18 6 6 18"/></>,
  hotTub: <><path d="M5 12h14l-1 6H6l-1-6Z"/><path d="M8 3c-1 1-1 2 0 3s1 2 0 3M12 3c-1 1-1 2 0 3s1 2 0 3M16 3c-1 1-1 2 0 3s1 2 0 3"/></>,
  info: <><circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/></>,
  menu: <><path d="M4 7h16M4 12h16M4 17h16"/></>,
  mountain: <><path d="m3 20 6-10 4 6 2-3 6 7Z"/><path d="m7.8 12 1.2 2 1.2-2"/></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/></>,
  plane: <><path d="m22 2-7 20-4-9-9-4Z"/><path d="M22 2 11 13"/></>,
  pool: <><path d="M4 6h4v6M8 8h5v4M13 5h4v7"/><path d="M3 16c2-2 4 2 6 0s4 2 6 0 4 2 6 0M3 20c2-2 4 2 6 0s4 2 6 0 4 2 6 0"/></>,
  snowflake: <><path d="M12 2v20M4.9 6l14.2 12M4.9 18 19.1 6"/><path d="m9 4 3 3 3-3M9 20l3-3 3 3M3.5 9.5 7.5 9 7 5M20.5 14.5 16.5 15l.5 4M3.5 14.5l4 .5L7 19M20.5 9.5l-4-.5.5-4"/></>,
  sparkle: <path d="M12 2c.6 5.2 4.8 9.4 10 10-5.2.6-9.4 4.8-10 10-.6-5.2-4.8-9.4-10-10 5.2-.6 9.4-4.8 10-10Z" />,
  sunrise: <><path d="M3 19h18M5 19a7 7 0 0 1 14 0M12 5v3M4.2 9.2l2.1 2.1M19.8 9.2l-2.1 2.1M2 15h3M19 15h3"/><path d="m8 3 4-2 4 2"/></>,
  sunset: <><path d="M3 19h18M5 19a7 7 0 0 1 14 0M12 3v3M4.2 7.2l2.1 2.1M19.8 7.2l-2.1 2.1M2 13h3M19 13h3"/></>,
  train: <><rect x="5" y="3" width="14" height="15" rx="3"/><path d="M8 21l2-3M16 18l2 3M8 8h8M8 13h.01M16 13h.01"/></>,
  tv: <><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m8 2 4 3 4-3M8 22h8"/></>,
  users: <><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/></>,
  villa: <><path d="m3 11 9-7 9 7M5 10v10h14V10M9 20v-6h6v6"/><path d="M7 11h2M15 11h2"/></>,
  walk: <><circle cx="13" cy="4" r="2"/><path d="m10 9 3-3 3 3 3 1M11 9l-2 5-4 2M14 10l-1 5 4 5M9 14l3 2"/></>,
  wifi: <><path d="M5 12.5a10 10 0 0 1 14 0M8.5 16a5 5 0 0 1 7 0"/><circle cx="12" cy="20" r="1" fill="currentColor" stroke="none"/><path d="M2 9a15 15 0 0 1 20 0"/></>,
};

function Icon({ name, size = 24, strokeWidth = 1.7, className }: IconProps) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      fill="none"
      height={size}
      viewBox="0 0 24 24"
      width={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={strokeWidth}
    >
      {paths[name]}
    </svg>
  );
}

export default Icon;
