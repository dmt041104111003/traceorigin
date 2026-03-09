export type TraceData = {
  policyId: string;
  assetName: string;
  metadata: Record<string, unknown>;
  /** For each route point (origin, receiver1, ...), true if NFT has been seen at that address. */
  routePassed?: boolean[];
  /** Ref100 burned = asset revoked. */
  revoked?: boolean;
  /** "active" | "burned" | "revoked". */
  burnStatus?: 'active' | 'burned' | 'revoked';
  /** When 222 burned, address in chain that burned the token. */
  burnedAtAddress?: string | null;
  /** Map points from backend (include status "burned" for burn location). */
  mapData?: Array<{
    lat: number;
    lng: number;
    label: string;
    status: string;
    pointType?: string;
    address?: string | null;
  }>;
  /** When NFT is in script (locked), locationType is "script". */
  currentLocation?: {
    address: string;
    label?: string;
    locationType?: 'minter' | 'receiver' | 'script' | 'outside';
  } | null;
  /** When set, data is a snapshot at this ref100 update tx (not current state). */
  snapshotAtTxHash?: string | null;
};
