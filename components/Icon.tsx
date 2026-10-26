type IconName = "grid" | "building" | "gavel" | "check" | "waves" | "bank" | "store" | "map" | "car" | "file" | "menu" | "bell" | "refresh" | "shield" | "arrow" | "close" | "clock" | "minimize";

const paths: Record<IconName, React.ReactNode> = {
  grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  building: <><path d="M4 21V6l8-3 8 3v15"/><path d="M8 10h1M8 14h1M15 10h1M15 14h1M3 21h18M10 21v-3h4v3"/></>,
  gavel: <><path d="m14 13-7.5 7.5a2.1 2.1 0 0 1-3-3L11 10"/><path d="m8 7 5 5M12 3l6 6M14 1l8 8-3 3-8-8z"/></>,
  check: <><path d="M20 12a8 8 0 1 1-4.7-7.3"/><path d="m9 11 3 3L22 4"/></>,
  waves: <><path d="M3 7c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 12c3 0 3 2 6 2s3-2 6-2 3 2 6 2M3 17c3 0 3 2 6 2s3-2 6-2 3 2 6 2"/></>,
  bank: <><path d="M3 10h18M5 10v8M9 10v8M15 10v8M19 10v8M3 21h18M12 3l9 5H3z"/></>,
  store: <><path d="M4 10v10h16V10M3 4h18l-2 6H5zM9 20v-6h6v6"/></>,
  map: <><path d="m3 6 6-3 6 3 6-3v15l-6 3-6-3-6 3zM9 3v15M15 6v15"/></>,
  car: <><path d="m5 17-2-2v-4l2-2 2-4h10l2 4 2 2v4l-2 2M5 17h14M7 17v2M17 17v2M6 12h2M16 12h2M5 9h14"/></>,
  file: <><path d="M6 2h9l4 4v16H6zM14 2v5h5M9 13h6M9 17h6"/></>,
  menu: <path d="M4 7h16M4 12h16M4 17h16"/>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  refresh: <><path d="M20 11a8 8 0 1 0-2 5.5"/><path d="M20 4v7h-7"/></>,
  shield: <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/><path d="m9 12 2 2 4-4"/></>,
  arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>,
  close: <path d="m6 6 12 12M18 6 6 18"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  minimize: <path d="M5 17h14"/>,
};

export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" className="icon" fill="none" height={size} viewBox="0 0 24 24" width={size} stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8">{paths[name]}</svg>;
}
