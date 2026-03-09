'use client';

import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { decodeTraceId } from '@/utils/utils';
import { fetchTrace, fetchTraceHistory } from '@/lib/trace';
import type { TraceData } from '@/types/trace';
import type { TraceHistoryItem } from '@/lib/trace';
import { formatPropertyValue, getProductImageUrl, getAdditionalPropertyDisplayLabel, getCertificateUrl } from '@/utils/utils';
import { RouteMap } from '@/components/RouteMap';
import { parseRouteCoords } from '@/utils/routemap';

function decodeHex(s: unknown): string {
  if (s == null) return '';
  const str = String(s).trim();
  const hex = str.replace(/^0x/i, '');
  if (!hex || !/^[0-9a-fA-F]+$/.test(hex)) return str;
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16);
    }
    return new TextDecoder().decode(bytes) || str;
  } catch {
    return str;
  }
}

function shortenAddress(addr: string, head = 14, tail = 10): string {
  if (!addr || addr.length <= head + tail) return addr;
  return `${addr.slice(0, head)}…${addr.slice(-tail)}`;
}

const MAX_TOOLTIP_LINE = 42;

function wrapLocationText(text: string): string {
  if (!text || text.length <= MAX_TOOLTIP_LINE) return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const escaped = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const parts: string[] = [];
  let rest = escaped;
  while (rest.length > MAX_TOOLTIP_LINE) {
    let breakAt = MAX_TOOLTIP_LINE;
    const slice = rest.slice(0, MAX_TOOLTIP_LINE + 1);
    const lastSpace = slice.lastIndexOf(' ');
    if (lastSpace > MAX_TOOLTIP_LINE >> 1) breakAt = lastSpace;
    parts.push(rest.slice(0, breakAt));
    rest = rest.slice(breakAt).trim();
  }
  if (rest) parts.push(rest);
  return parts.join('<br/>');
}

export default function TraceResultPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const atTxHash = searchParams?.get('at')?.trim() || null;

  const [data, setData] = useState<TraceData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [historyItems, setHistoryItems] = useState<TraceHistoryItem[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const id = typeof params?.id === 'string' ? params.id : '';

  useEffect(() => {
    const parsed = decodeTraceId(id);
    if (!parsed?.policyId?.trim() || !parsed?.assetName?.trim()) {
      setLoading(false);
      setError('Invalid trace ID.');
      return;
    }
    fetchTrace(parsed.policyId, parsed.assetName, undefined, atTxHash ?? undefined)
      .then(setData)
      .catch((err) => setError((err as Error).message ?? 'Failed to load trace.'))
      .finally(() => setLoading(false));
  }, [id, atTxHash]);

  useEffect(() => {
    if (activeTab !== 'history' || !data?.policyId || !data?.assetName) return;
    setHistoryLoading(true);
    fetchTraceHistory(data.policyId, data.assetName)
      .then((r) => setHistoryItems(r.items))
      .catch(() => setHistoryItems([]))
      .finally(() => setHistoryLoading(false));
  }, [activeTab, data?.policyId, data?.assetName]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2]">
        <p className="text-gray-600">Loading trace data…</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#f2f2f2] px-4">
        <div className="bg-white border border-red-200 rounded-lg p-8 max-w-md text-center">
          <p className="text-red-800 font-medium mb-4">{error ?? 'Not found.'}</p>
          <Link href="/trace" className="text-[#c41e3a] hover:underline">
            ← Back to scan
          </Link>
        </div>
      </div>
    );
  }

  const revoked = data.revoked === true;
  const burned = data.burnStatus === 'burned';
  const burnedAtAddress = data.burnedAtAddress ?? null;
  const inChain =
    !revoked &&
    !burned &&
    ( (data.currentLocation != null &&
       (data.currentLocation.locationType === 'minter' ||
        data.currentLocation.locationType === 'receiver' ||
        data.currentLocation.locationType === 'script')) ||
      (Array.isArray(data.mapData) && data.mapData.some((p) => p.status === 'current')) );
  const currentHolderLabel =
    Array.isArray(data.mapData) && data.mapData.length > 0
      ? data.mapData.find((p) => p.status === 'current')?.label ?? null
      : null;

  if (revoked) {
    return (
      <div className="min-h-screen bg-[#f2f2f2]">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <Link href="/trace" className="inline-block mb-6 text-sm text-[#c41e3a] hover:underline">
            ← Back to scan
          </Link>
          <div className="bg-white border border-amber-200 rounded-lg shadow-sm overflow-hidden">
            <div className="p-6 border-b border-gray-200">
              <p className="text-xs font-medium text-amber-700 uppercase tracking-wide mb-2">Revoked</p>
              <h1 className="text-xl font-bold text-gray-900">Asset has been revoked</h1>
              <p className="text-sm text-gray-600 mt-2">
                Ref100 reference token was burned on chain. This asset is no longer active.
              </p>
            </div>
            <div className="p-6">
              <table className="w-full text-sm">
                <tbody>
                  <tr>
                    <td className="py-2 text-gray-600 w-36">Policy ID</td>
                    <td className="py-2 font-mono text-gray-900 break-all text-xs">{data.policyId}</td>
                  </tr>
                  <tr>
                    <td className="py-2 text-gray-600">Asset name</td>
                    <td className="py-2 font-mono text-gray-900 break-all">{data.assetName}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const meta = data.metadata || {};
  const name = (meta.name as string) ?? data.assetName ?? '—';
  const standard = (meta.standard as string) ?? '—';
  const imageUrl = getProductImageUrl({ image: meta.image as string });
  const minterLocation = decodeHex(meta.minter_location) || (meta.minter_location as string) || '';
  const minterCoordinates = decodeHex(meta.minter_coordinates) || (meta.minter_coordinates as string) || '';
  const receiverLocationsStr = decodeHex(meta.receiver_locations) || (meta.receiver_locations as string) || '';
  const receiverLocations = receiverLocationsStr.split(';').map((s) => s.trim()).filter(Boolean);
  const receiverCoordsStr = decodeHex(meta.receiver_coordinates) || (meta.receiver_coordinates as string) || '';
  const receiverCoordsList = receiverCoordsStr.split(';').map((s) => s.trim()).filter(Boolean);
  const receiverAddressesStr = decodeHex(meta.receiver_addresses) || (meta.receiver_addresses as string) || '';
  const receiverAddresses = receiverAddressesStr.split(';').map((s) => s.trim()).filter(Boolean);
  const roadmapStr = (meta.roadmap as string) ?? '';
  const roadmapList = roadmapStr ? roadmapStr.replace(/[\[\]]/g, '').split(',').map((s) => s.trim()).filter(Boolean) : receiverLocations.length ? receiverLocations : [];

  let propertiesFromMeta: Array<[string, unknown]> = [];
  const rawProperties = meta.properties;
  if (typeof rawProperties === 'string') {
    try {
      const parsed = JSON.parse(rawProperties) as Record<string, unknown>;
      propertiesFromMeta = Object.entries(parsed);
    } catch {
      propertiesFromMeta = [];
    }
  } else if (rawProperties && typeof rawProperties === 'object' && !Array.isArray(rawProperties)) {
    propertiesFromMeta = Object.entries(rawProperties as Record<string, unknown>);
  }

  const excludeKeys = new Set(['name', 'image', 'standard', '_pk', 'receivers_raw', 'receivers', 'receiver_addresses', 'receiver_locations', 'receiver_coordinates', 'minter_location', 'minter_coordinates', 'roadmap', 'properties', 'certificate']);
  const otherMeta = Object.entries(meta).filter(([k]) => !excludeKeys.has(k));

  const mapPoints: [number, number][] = [];
  const mapLabels: string[] = [];
  const mapPointTypes: Array<'origin' | 'receiver' | 'burned'> = [];
  const mapPassed: boolean[] = [];
  const mapFromBackend = Array.isArray(data.mapData) && data.mapData.length > 0;

  if (mapFromBackend && data.mapData) {
    data.mapData.forEach((p) => {
      if (typeof p.lat === 'number' && typeof p.lng === 'number') {
        mapPoints.push([p.lat, p.lng]);
        mapLabels.push(p.label ?? '');
        mapPointTypes.push((p.pointType === 'burned' ? 'burned' : p.pointType === 'origin' ? 'origin' : 'receiver') as 'origin' | 'receiver' | 'burned');
        mapPassed.push(p.status === 'completed' || p.status === 'burned');
      }
    });
  } else if (minterCoordinates) {
    const parsed = parseRouteCoords(minterCoordinates);
    if (parsed.length > 0) {
      mapPoints.push(parsed[0]);
      mapLabels.push(minterLocation ? `Origin: ${wrapLocationText(minterLocation)}` : 'Origin (Minter)');
      mapPointTypes.push('origin');
      mapPassed.push(data.routePassed?.[0] ?? false);
    }
  }
  if (!mapFromBackend) {
    receiverCoordsList.forEach((coord, i) => {
      const parsed = parseRouteCoords(coord);
      if (parsed.length > 0) {
        mapPoints.push(parsed[0]);
        const num = i + 1;
        const loc = receiverLocations[i] ?? `Receiver ${num}`;
        const addr = receiverAddresses[i];
        mapLabels.push(addr ? `${num}. ${wrapLocationText(loc)}<br/>· ${shortenAddress(addr)}` : `${num}. ${wrapLocationText(loc)}`);
        mapPointTypes.push('receiver');
        mapPassed.push(data.routePassed?.[i + 1] ?? false);
      }
    });
  }
  const routeCoordinatesForMap = mapPoints.map(([lat, lng]) => `${lat},${lng}`).join(';');
  const hasMap = mapPoints.length >= 1;

  const baseTraceUrl = `/trace/${id}`;
  const isSnapshot = !!data.snapshotAtTxHash;

  return (
    <div className="min-h-screen bg-[#f2f2f2]">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <Link href="/" className="inline-block mb-6 text-sm text-[#c41e3a] hover:underline">
          ← Back to home
        </Link>

        {isSnapshot && (
          <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
            <span className="font-medium">Viewing snapshot at tx:</span>{' '}
            <span className="font-mono text-xs break-all">{data.snapshotAtTxHash}</span>
            <br />
            <Link href={baseTraceUrl} className="text-[#c41e3a] hover:underline font-medium mt-1 inline-block">
              → View current data
            </Link>
          </div>
        )}

        <div className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Verified on Cardano</p>
            <h1 className="text-xl font-bold text-gray-900">{name}</h1>
            {standard && <p className="text-sm text-gray-600 mt-1">Standard: {standard}</p>}
            <div className="flex gap-2 mt-4 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setActiveTab('current')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'current' ? 'bg-[#c41e3a] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                Current
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('history')}
                className={`px-3 py-1.5 rounded text-sm font-medium ${activeTab === 'history' ? 'bg-[#c41e3a] text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
              >
                History
              </button>
            </div>
          </div>

          {activeTab === 'history' && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Ref100 update history</h2>
              {historyLoading ? (
                <p className="text-sm text-gray-500">Loading…</p>
              ) : historyItems.length === 0 ? (
                <p className="text-sm text-gray-500">No history records yet.</p>
              ) : (
                <ul className="space-y-2">
                  {historyItems.map((item) => (
                    <li key={item.txHash}>
                      <Link
                        href={`${baseTraceUrl}?at=${encodeURIComponent(item.txHash ?? '')}`}
                        className="block p-3 rounded-md border border-gray-200 hover:border-[#c41e3a] hover:bg-red-50/50 text-sm"
                      >
                        <span className="font-medium text-gray-900">{item.action}</span>
                        <span className="text-gray-500 ml-2 font-mono text-xs break-all">{item.txHash}</span>
                        {item.createdAt && (
                          <span className="block text-xs text-gray-400 mt-1">
                            {new Date(item.createdAt).toLocaleString()}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {activeTab === 'current' && (
          <>
          {imageUrl && (
            <div className="p-6 border-b border-gray-200">
              <img
                src={imageUrl}
                alt={name}
                className="w-full max-h-80 object-contain bg-gray-50 rounded"
                referrerPolicy="no-referrer"
              />
            </div>
          )}

          <div className="p-6 border-b border-gray-200">
            <h2 className="text-sm font-semibold text-gray-800 mb-3">Trace information</h2>
            <table className="w-full text-sm">
              <tbody>
                {burned && (
                  <>
                    <tr>
                      <td className="py-2 text-gray-600 w-36">Status</td>
                      <td className="py-2">
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800">
                          Burned
                        </span>
                      </td>
                    </tr>
                    {burnedAtAddress && (
                      <tr>
                        <td className="py-2 text-gray-600 w-36">Burned at</td>
                        <td className="py-2 font-mono text-gray-900 break-all text-xs">{burnedAtAddress}</td>
                      </tr>
                    )}
                  </>
                )}
                {!burned && !revoked && (
                  <tr>
                    <td className="py-2 text-gray-600 w-36">Chain status</td>
                    <td className="py-2">
                      {inChain ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          In chain
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                          Outside chain
                        </span>
                      )}
                    </td>
                  </tr>
                )}
                <tr>
                  <td className="py-2 text-gray-600 w-36">Policy ID</td>
                  <td className="py-2 font-mono text-gray-900 break-all text-xs">{data.policyId}</td>
                </tr>
                <tr>
                  <td className="py-2 text-gray-600">Asset name</td>
                  <td className="py-2 font-mono text-gray-900 break-all">{data.assetName}</td>
                </tr>
              </tbody>
            </table>
          </div>

          {meta.certificate && getCertificateUrl(meta.certificate as string) && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Certificate</h2>
              <p className="text-sm text-gray-600 mb-2">Certificate document stored on-chain (IPFS).</p>
              <a
                href={getCertificateUrl(meta.certificate as string)!}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-3 py-1.5 rounded text-sm font-medium bg-[#c41e3a] text-white hover:bg-red-700"
              >
                View certificate
              </a>
            </div>
          )}

          {hasMap && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Supply chain</h2>
              {data.currentLocation?.locationType === 'script' && (
                <p className="text-xs text-indigo-600 mb-2">Dashed line: NFT in transit (locked in script), not yet received.</p>
              )}
              {inChain && (
                <div className="mb-3 rounded-md bg-gray-50 px-3 py-2 text-xs text-gray-700">
                  <span className="font-medium">Map legend:</span>
                  <ul className="mt-1 list-inside list-disc space-y-0.5">
                    <li>Green check = passed (via script lock/unlock)</li>
                    <li>Red pin = current holder</li>
                    <li>Purple dashed = in transit (locked in script)</li>
                    <li>Red marker = burned at this point</li>
                  </ul>
                  {currentHolderLabel ? (
                    <p className="mt-2 font-medium text-gray-900">
                      Current holder: <span className="text-[#c41e3a]">{currentHolderLabel}</span>
                    </p>
                  ) : data.currentLocation?.locationType === 'script' ? (
                    <p className="mt-2 font-medium text-indigo-700">NFT is in transit (locked in script).</p>
                  ) : null}
                </div>
              )}
              {!inChain && !burned && !revoked && (
                <p className="mb-3 text-xs text-gray-600">NFT is outside the defined chain (current holder not in roadmap).</p>
              )}
              <RouteMap
                routeCoordinates={routeCoordinatesForMap}
                labels={mapLabels}
                pointTypes={mapPointTypes}
                routePassed={mapPassed.length > 0 ? mapPassed : data.routePassed}
                pointStatus={mapFromBackend && data.mapData ? data.mapData.map((p) => p.status ?? '') : undefined}
                height={320}
              />
            </div>
          )}

          {receiverAddresses.length > 0 && (
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Receiver addresses</h2>
              <ol className="list-decimal list-inside space-y-1 text-sm font-mono text-gray-900 break-all">
                {receiverAddresses.map((addr, i) => (
                  <li key={i} className="text-xs">{addr}</li>
                ))}
              </ol>
            </div>
          )}

          {((propertiesFromMeta.length > 0) || otherMeta.length > 0 || data.currentLocation?.address) && (
            <div className="p-6">
              <h2 className="text-sm font-semibold text-gray-800 mb-3">Properties</h2>
              <table className="w-full text-sm">
                <tbody>
                  {propertiesFromMeta.map(([key, val]) => {
                    const label = getAdditionalPropertyDisplayLabel(key);
                    const isCurrentHolder = label === 'Current holder';
                    const displayVal = isCurrentHolder && data.currentLocation?.address
                      ? data.currentLocation.address
                      : formatPropertyValue(val);
                    return (
                      <tr key={key}>
                        <td className="py-2 text-gray-600 w-40 align-top">{label}</td>
                        <td className="py-2 font-mono text-gray-900 break-all max-w-xs text-xs">{displayVal}</td>
                      </tr>
                    );
                  })}
                  {otherMeta.map(([key, val]) => {
                    const label = getAdditionalPropertyDisplayLabel(key);
                    const isCurrentHolder = label === 'Current holder';
                    const displayVal = isCurrentHolder && data.currentLocation?.address
                      ? data.currentLocation.address
                      : formatPropertyValue(val);
                    return (
                      <tr key={key}>
                        <td className="py-2 text-gray-600 w-40 align-top">{label}</td>
                        <td className="py-2 font-mono text-gray-900 break-all max-w-xs text-xs">{displayVal}</td>
                      </tr>
                    );
                  })}
                  {data.currentLocation?.address &&
                   !propertiesFromMeta.some(([k]) => getAdditionalPropertyDisplayLabel(k) === 'Current holder') &&
                   !otherMeta.some(([k]) => getAdditionalPropertyDisplayLabel(k) === 'Current holder') && (
                    <tr>
                      <td className="py-2 text-gray-600 w-40 align-top">Current holder</td>
                      <td className="py-2 font-mono text-gray-900 break-all max-w-xs text-xs">{data.currentLocation.address}</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
          </>
          )}
        </div>
      </div>
    </div>
  );
}
