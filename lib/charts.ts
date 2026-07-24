export interface Pt {
  x: number;
  y: number;
}

/** Catmull-Rom spline → cubic bezier SVG path (smooth line through all points) */
export function smoothPath(points: Pt[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;
  let d = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i - 1] ?? points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = points[i + 2] ?? p2;
    const c1x = p1.x + (p2.x - p0.x) / 6;
    const c1y = p1.y + (p2.y - p0.y) / 6;
    const c2x = p2.x - (p3.x - p1.x) / 6;
    const c2y = p2.y - (p3.y - p1.y) / 6;
    d += ` C ${c1x} ${c1y}, ${c2x} ${c2y}, ${p2.x} ${p2.y}`;
  }
  return d;
}

/** Round a max value up to a friendly tick ceiling */
export function niceMax(max: number): number {
  if (max <= 10) return 10;
  const pow = Math.pow(10, Math.floor(Math.log10(max)));
  const unit = max / pow;
  const nice = unit <= 1.5 ? 1.5 : unit <= 2 ? 2 : unit <= 3 ? 3 : unit <= 5 ? 5 : unit <= 7.5 ? 7.5 : 10;
  return Math.ceil(nice * pow);
}
