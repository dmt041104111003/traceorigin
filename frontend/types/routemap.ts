export type PointType = 'origin' | 'receiver' | 'script' | 'outside' | 'burned';

export type ExtraPoint = {
  lat: number;
  lng: number;
  label?: string;
  pointType?: PointType;
};

export type RouteMapProps = {
  routeCoordinates: string;
  height?: number;
  labels?: string[];
  pointTypes?: PointType[];
  extraPoints?: ExtraPoint[];
  /** Same length as points: true = NFT has passed this point on-chain. */
  routePassed?: boolean[];
  /** Same length as points: status per point for segment styling (e.g. in_transit = dashed line). */
  pointStatus?: string[];
};
