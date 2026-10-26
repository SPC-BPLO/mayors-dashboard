export function Sparkline({ points }: { points: number[] }) {
  const path = points.map((point, index) => `${index === 0 ? "M" : "L"}${index * 20},${80 - point}`).join(" ");
  return (
    <svg aria-hidden="true" className="sparkline" viewBox="0 0 120 52" preserveAspectRatio="none">
      <path className="sparklineFill" d={`${path} L120,52 L0,52 Z`} />
      <path className="sparklineLine" d={path} />
    </svg>
  );
}
