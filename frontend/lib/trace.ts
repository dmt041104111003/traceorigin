import type { TraceData } from '@/types/trace';
import { encodeTraceId } from '@/utils/utils';

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3000';

export type TraceHistoryItem = {
  txHash: string;
  action: string;
  createdAt: string;
};

export type TraceHistoryResponse = {
  items: TraceHistoryItem[];
};

export async function fetchTraceHistory(
  policyId: string,
  assetName: string,
): Promise<TraceHistoryResponse> {
  const params = new URLSearchParams({
    policyId: policyId.trim(),
    assetName: assetName.trim(),
  });
  const url = `${BACKEND_URL}/trace/history?${params.toString()}`;
  const res = await fetch(url);
  const body = await res.json();
  if (body?.statusCode && body.statusCode >= 400) {
    throw new Error(body.message ?? body.error ?? 'Failed to load history.');
  }
  if (!res.ok) {
    throw new Error(body?.message ?? body?.error ?? 'Failed to load history.');
  }
  const b = body as { items?: TraceHistoryItem[] };
  return { items: Array.isArray(b.items) ? b.items : [] };
}

export async function fetchTrace(
  policyId: string,
  assetName: string,
  minterAddress?: string,
  atTxHash?: string | null,
): Promise<TraceData> {
  const minter = minterAddress?.trim() || undefined;
  const params = new URLSearchParams({
    policyId: policyId.trim(),
    assetName: assetName.trim(),
  });
  if (minter) params.set('minterAddress', minter);
  if (atTxHash?.trim()) params.set('atTxHash', atTxHash.trim());
  const url = `${BACKEND_URL}/trace?${params.toString()}`;
  const res = await fetch(url);
  const body = await res.json();
  if (body?.statusCode && body.statusCode >= 400) {
    throw new Error(body.message ?? body.error ?? 'Trace failed.');
  }
  if (!res.ok) {
    throw new Error(body?.message ?? body?.error ?? 'Trace failed.');
  }
  const b = body as Record<string, unknown>;
  const core = b.core as Record<string, unknown> | undefined;
  const rawMapData = b.mapData as Array<{ status?: string; address?: string | null; pointType?: string; label?: string; lat?: number; lng?: number }> | undefined;
  const mapData: TraceData['mapData'] = Array.isArray(rawMapData)
    ? rawMapData
        .filter((p): p is { lat: number; lng: number; label: string; status: string; pointType?: string; address?: string | null } =>
          typeof p.lat === 'number' && typeof p.lng === 'number' && typeof p.label === 'string' && typeof p.status === 'string'
        )
        .map((p) => ({ lat: p.lat, lng: p.lng, label: p.label, status: p.status, pointType: p.pointType, address: p.address ?? null }))
    : undefined;
  const meta = (b.metadata as Record<string, unknown>) ?? {};
  const display = (b.display as Record<string, unknown>) ?? {};
  const receiverAddressesFromMap = Array.isArray(rawMapData) ? rawMapData.map((p) => p.address).filter(Boolean).join(';') : '';
  const receiverAddressesStr = (meta.receiver_addresses as string) ?? (receiverAddressesFromMap || '');
  const metadata: Record<string, unknown> = {
    ...meta,
    ...display,
    name: display.name ?? meta.name,
    image: display.image ?? meta.image,
    standard: display.standard ?? meta.standard,
    receiver_addresses: typeof receiverAddressesStr === 'string' ? receiverAddressesStr.replace(/,/g, ';') : receiverAddressesStr,
  };
  return {
    policyId: (core?.policyId as string) ?? (b.policyId as string) ?? policyId,
    assetName: (core?.assetName as string) ?? (b.assetName as string) ?? assetName,
    metadata,
    routePassed: Array.isArray(mapData)
      ? mapData.map((p) => p.status === 'completed' || p.status === 'burned')
      : undefined,
    revoked: b.revoked === true,
    burnStatus: (b.burnStatus as 'active' | 'burned' | 'revoked') ?? undefined,
    burnedAtAddress: (b.burnedAtAddress as string) ?? undefined,
    mapData,
    currentLocation: (b.currentLocation as TraceData['currentLocation']) ?? undefined,
    snapshotAtTxHash: (b.snapshotAtTxHash as string) ?? undefined,
  };
}

export async function submitTraceForm(
  policyId: string,
  assetName: string
): Promise<string> {
  const p = policyId.trim();
  const a = assetName.trim();
  const res = await fetch(`${BACKEND_URL}/trace`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ policyId: p, assetName: a }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data?.message ?? data?.error ?? 'Trace failed.');
  }
  return encodeTraceId(p, a);
}
