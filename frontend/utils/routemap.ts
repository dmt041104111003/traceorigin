export function parseRouteCoords(str: string): [number, number][] {
  const points: [number, number][] = [];
  const pairs = str.split(';').map((s) => s.trim()).filter(Boolean);
  for (const pair of pairs) {
    const parts = pair.split(',');
    if (parts.length >= 2) {
      const lat = Number(parts[0]);
      const lng = Number(parts[1]);
      if (Number.isFinite(lat) && Number.isFinite(lng)) {
        points.push([lat, lng]);
      }
    }
  }
  return points;
}

export const DEFAULT_MAP_CENTER: [number, number] = [21.0285, 105.8542];

export const ROUTE_POLYLINE_OPTIONS = {
  weight: 3,
  opacity: 0.8,
  color: '#c41e3a',
} as const;

/** Segment already passed by NFT (on-chain). */
export const ROUTE_POLYLINE_PASSED = {
  weight: 3,
  opacity: 0.9,
  color: '#16a34a',
} as const;

/** Segment not yet passed. */
export const ROUTE_POLYLINE_NOT_PASSED = {
  weight: 3,
  opacity: 0.6,
  color: '#9ca3af',
  dashArray: '8, 8',
} as const;

/** Segment in transit (NFT locked in script, chưa unlock). */
export const ROUTE_POLYLINE_IN_TRANSIT = {
  weight: 3,
  opacity: 0.9,
  color: '#6366f1',
  dashArray: '10, 10',
} as const;
